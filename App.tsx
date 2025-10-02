import React, { useState, useEffect, useMemo, useCallback } from 'react';
// Fix: Import the shared Page type.
import { Artist, Investment, PortfolioItem, SpotifyArtist, NetWorthHistoryPoint, Page } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import TradePage from './components/TradePage';
import Portfolio from './components/Portfolio';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import ArtistDetailPage from './components/ArtistDetailPage';
import { getUser, saveUser, signOut } from './services/authService';
import FAQPage from './components/FAQPage';

// Fix: Removed local Page type to use the shared one from types.ts
// type Page = 'home' | 'trade' | 'portfolio' | 'leaderboard' | 'artistDetail';

interface ModalState {
  type: 'invest' | 'sell' | 'none';
  artist?: Artist;
  investments?: Investment[];
}

const App: React.FC = () => {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userCredits, setUserCredits] = useState(10000);
  const [netWorthHistory, setNetWorthHistory] = useState<NetWorthHistoryPoint[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: 'none' });

  // Authentication and Data Loading
  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser({ username: loggedInUser.username });
      setInvestments(loggedInUser.investments);
      setUserCredits(loggedInUser.userCredits);
      setNetWorthHistory(loggedInUser.netWorthHistory);
    }
  }, []);

  useEffect(() => {
    if (user) {
      saveUser(user.username, investments, userCredits, netWorthHistory);
    }
  }, [user, investments, userCredits, netWorthHistory]);

  const handleSignIn = (username: string) => {
    const existingUser = getUser(username);
    if (existingUser) {
      setUser({ username: existingUser.username });
      setInvestments(existingUser.investments);
      setUserCredits(existingUser.userCredits);
      setNetWorthHistory(existingUser.netWorthHistory);
    } else {
      const newUser = { username };
      setUser(newUser);
      setInvestments([]);
      setUserCredits(10000);
      const initialNetWorth: NetWorthHistoryPoint[] = [{ timestamp: Date.now(), netWorth: 10000 }];
      setNetWorthHistory(initialNetWorth);
      saveUser(username, [], 10000, initialNetWorth);
    }
  };

  const handleSignOut = () => {
    if (user) {
      signOut(); // This now safely ends the session without deleting data.
      setUser(null);
      // Reset to default state for the login screen
      setInvestments([]);
      setUserCredits(10000);
      setNetWorthHistory([]);
      setCurrentPage('home');
    }
  };

  const fetchArtists = useCallback(async (artistIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const spotifyArtists = await getMultipleArtistsByIds(artistIds);
      const marketArtists: Artist[] = spotifyArtists.map(sa => ({
        ...sa,
        followerHistory: generateRandomHistory(sa.followers),
      }));
      setArtists(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newArtists = marketArtists.filter(a => !existingIds.has(a.id));
        return [...prev, ...newArtists];
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load artist data. Check your Spotify API credentials.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    const allArtistIds = Array.from(new Set([...ARTIST_IDS_IN_MARKET, ...investments.map(i => i.artistId)]));
    if (allArtistIds.length > 0) {
      fetchArtists(allArtistIds);
    } else {
      setIsLoading(false);
    }
  }, [investments, fetchArtists]);

  // Calculations
  const portfolioItems = useMemo<PortfolioItem[]>(() => {
    const portfolioMap: { [artistId: string]: PortfolioItem } = {};

    investments.forEach(investment => {
      const artist = artists.find(a => a.id === investment.artistId);
      if (!artist) return;

      if (!portfolioMap[artist.id]) {
        portfolioMap[artist.id] = {
          artist,
          investments: [],
          totalInvestment: 0,
          currentValue: 0,
          profitOrLoss: 0,
          profitOrLossPercentage: 0,
        };
      }

      const portfolioItem = portfolioMap[artist.id];
      portfolioItem.investments.push(investment);
      portfolioItem.totalInvestment += investment.initialInvestment;

      const growth = investment.initialFollowers > 0 ? (artist.followers - investment.initialFollowers) / investment.initialFollowers : 0;
      const investmentCurrentValue = investment.initialInvestment * (1 + growth);
      portfolioItem.currentValue += investmentCurrentValue;
    });

    return Object.values(portfolioMap).map(item => {
      item.profitOrLoss = item.currentValue - item.totalInvestment;
      item.profitOrLossPercentage = item.totalInvestment > 0 ? (item.profitOrLoss / item.totalInvestment) * 100 : 0;
      return item;
    });
  }, [investments, artists]);

  const netWorth = useMemo(() => {
    const portfolioValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
    return userCredits + portfolioValue;
  }, [userCredits, portfolioItems]);

  // Update Net Worth History periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        setNetWorthHistory(prevHistory => {
          const newPoint = { timestamp: Date.now(), netWorth };
          // Keep history to ~30 days, assuming one point per day for this simulation
          const filteredHistory = prevHistory.filter(p => p.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000);
          // Only add a new point if it's different from the last, to avoid clutter
          if (filteredHistory.length === 0 || Math.abs(filteredHistory[filteredHistory.length - 1]?.netWorth - newPoint.netWorth) > 1) {
             return [...filteredHistory, newPoint];
          }
          return filteredHistory;
        });
      }
    }, 60 * 1000); // Update every minute
    return () => clearInterval(interval);
  }, [user, netWorth]);

  // Handlers
  const handleInvest = (artistId: string, amount: number) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist || amount > userCredits || amount <= 0) return;

    const newInvestment: Investment = {
      id: `inv_${Date.now()}_${Math.random()}`,
      artistId: artist.id,
      userId: user!.username,
      initialInvestment: amount,
      initialFollowers: artist.followers,
      timestamp: Date.now(),
    };

    setInvestments(prev => [...prev, newInvestment]);
    setUserCredits(prev => prev - amount);
    setModalState({ type: 'none' });
  };
  
  const handleSell = (artistId: string, sellValue: number) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist) return;

    // Remove all investments for this artist
    setInvestments(prev => prev.filter(inv => inv.artistId !== artistId));
    setUserCredits(prev => prev + sellValue);
    setModalState({ type: 'none' });
  };
  
  const handleAddArtist = async (spotifyArtist: SpotifyArtist): Promise<Artist> => {
      const newArtist: Artist = {
          ...spotifyArtist,
          followerHistory: generateRandomHistory(spotifyArtist.followers),
      };
      setArtists(prev => [...prev, newArtist]);
      return newArtist;
  };

  const handleNavigate = (page: Page) => {
    setSelectedArtist(null);
    setCurrentPage(page);
  };
  
  const handleViewDetail = (artist: Artist) => {
    setSelectedArtist(artist);
    setCurrentPage('artistDetail');
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-screen"><p className="text-white text-xl">Loading Market Data...</p></div>;
    if (error) return <div className="flex justify-center items-center h-screen"><p className="text-red-400 text-xl text-center p-4">{error}</p></div>;

    if (selectedArtist && currentPage === 'artistDetail') {
      return (
        <ArtistDetailPage
          artist={selectedArtist}
          investments={investments.filter(inv => inv.artistId === selectedArtist.id)}
          onBack={() => {
            setSelectedArtist(null);
            setCurrentPage('trade'); // Go back to the trade page by default
          }}
          onInvest={(artist) => setModalState({ type: 'invest', artist })}
          onSell={(artist, artistInvestments) => setModalState({ type: 'sell', artist, investments: artistInvestments })}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomePage 
            username={user!.username}
            netWorth={netWorth}
            portfolioItems={portfolioItems}
            onNavigate={handleNavigate}
        />;
      case 'trade':
        return <TradePage
          artistsInMarket={artists}
          onInvest={(artist) => setModalState({ type: 'invest', artist })}
          onViewDetail={handleViewDetail}
          onAddArtist={handleAddArtist}
        />;
      case 'portfolio':
        return <Portfolio
          portfolioItems={portfolioItems}
          netWorth={netWorth}
          netWorthHistory={netWorthHistory}
          onViewDetail={(artistId) => {
            const artist = artists.find(a => a.id === artistId);
            if (artist) handleViewDetail(artist);
          }}
        />;
      case 'faq':
        return <FAQPage />;
      default:
        return <HomePage 
            username={user!.username}
            netWorth={netWorth}
            portfolioItems={portfolioItems}
            onNavigate={handleNavigate}
        />;
    }
  };

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        userCredits={userCredits}
        netWorth={netWorth}
        username={user.username}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-12">
        {renderContent()}
      </main>

      {modalState.type === 'invest' && modalState.artist && (
        <InvestmentModal
          artist={modalState.artist}
          userCredits={userCredits}
          onInvest={handleInvest}
          onClose={() => setModalState({ type: 'none' })}
        />
      )}
      
      {modalState.type === 'sell' && modalState.artist && modalState.investments && (
        <SellModal
          artist={modalState.artist}
          investments={modalState.investments}
          onSell={handleSell}
          onClose={() => setModalState({ type: 'none' })}
        />
      )}
    </div>
  );
};

export default App;
import React, { useState, useEffect, useMemo } from 'react';
import { Artist, Investment, LocalUser, SpotifyArtist, FollowerHistoryPoint } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';

import Header from './components/Header';
import HomePage from './components/HomePage';
import TradePage from './components/TradePage';
import Portfolio from './components/Portfolio';
import ArtistDetailPage from './components/ArtistDetailPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import LoginPage from './components/LoginPage';

type Page = 'home' | 'trade' | 'portfolio';

const INITIAL_CREDITS = 10000;

function App() {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userCredits, setUserCredits] = useState<number>(INITIAL_CREDITS);
  const [netWorthHistory, setNetWorthHistory] = useState<{timestamp: number; count: number}[]>([]);
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [investingArtist, setInvestingArtist] = useState<Artist | null>(null);
  const [sellingInvestment, setSellingInvestment] = useState<{ investment: Investment, currentValue: number } | null>(null);
  const [viewingArtist, setViewingArtist] = useState<Artist | null>(null);

  // --- Data Loading and Persistence ---

  // Effect to load the current user session and data on startup
  useEffect(() => {
    const savedUserJson = localStorage.getItem('stockify_user');
    if (savedUserJson) {
      const savedUser: LocalUser = JSON.parse(savedUserJson);
      const userDataKey = `stockify_data_${savedUser.username}`;
      const savedData = localStorage.getItem(userDataKey);
      
      if (savedData) {
        const { investments, credits, netWorthHistory } = JSON.parse(savedData);
        setInvestments(investments);
        setUserCredits(credits);
        setNetWorthHistory(netWorthHistory);
      }
      setUser(savedUser);
    }
    setIsUserLoading(false);
  }, []);
  
  // Effect to load market data
  useEffect(() => {
    const initializeMarket = async () => {
      setIsMarketLoading(true);
      setError(null);
      try {
        const artistsFromApi = await getMultipleArtistsByIds(ARTIST_IDS_IN_MARKET);
        const artistsWithHistory: Artist[] = artistsFromApi.map(apiArtist => ({
          id: apiArtist.id,
          name: apiArtist.name,
          imageUrl: apiArtist.imageUrl,
          followers: apiArtist.followers,
          followerHistory: generateRandomHistory(apiArtist.followers)
        }));
        setArtists(artistsWithHistory);
      } catch (err: any) {
        console.error("Failed to initialize market", err);
        setError("Could not connect to Spotify to fetch artist data. Please check your connection or Spotify API credentials in `services/spotifyService.ts`.");
      } finally {
        setIsMarketLoading(false);
      }
    };
    initializeMarket();
  }, []);

  // Effect to persist data whenever it changes for the logged-in user
  useEffect(() => {
    if (user) {
      const userDataKey = `stockify_data_${user.username}`;
      const dataToSave = {
        investments,
        credits: userCredits,
        netWorthHistory,
      };
      localStorage.setItem(userDataKey, JSON.stringify(dataToSave));
    }
  }, [user, investments, userCredits, netWorthHistory]);

  const netWorth = useMemo(() => {
    const portfolioValue = investments.reduce((total, investment) => {
        const artist = artists.find(a => a.id === investment.artistId);
        if (!artist) return total;
        const growthPercentage = (artist.followers - investment.initialFollowers) / investment.initialFollowers;
        const currentValue = investment.initialInvestment * (1 + growthPercentage);
        return total + currentValue;
    }, 0);
    return userCredits + portfolioValue;
  }, [userCredits, investments, artists]);
  
   useEffect(() => {
        if (!user) return; // Don't record history if not logged in
        const interval = setInterval(() => {
            setNetWorthHistory(prevHistory => {
                const newPoint = { timestamp: Date.now(), count: netWorth };
                const filteredHistory = prevHistory.filter(p => (Date.now() - p.timestamp) < 30 * 24 * 60 * 60 * 1000); // Keep 30 days
                const lastPoint = filteredHistory[filteredHistory.length - 1];
                if (!lastPoint || (Date.now() - lastPoint.timestamp > 60000 && Math.abs(lastPoint.count - netWorth) > 1)) {
                    return [...filteredHistory, newPoint];
                }
                return filteredHistory;
            });
        }, 60 * 1000); // record every minute

        return () => clearInterval(interval);
    }, [netWorth, user]);

  // --- Handlers ---
  const handleSignIn = (username: string) => {
    const userDataKey = `stockify_data_${username}`;
    const savedData = localStorage.getItem(userDataKey);
    
    if (savedData) { // Existing user
      const { investments, credits, netWorthHistory } = JSON.parse(savedData);
      setInvestments(investments);
      setUserCredits(credits);
      setNetWorthHistory(netWorthHistory);
    } else { // New user
      setInvestments([]);
      setUserCredits(INITIAL_CREDITS);
      setNetWorthHistory([{ timestamp: Date.now(), count: INITIAL_CREDITS }]);
    }
    
    const newUser: LocalUser = { userId: `local_${username}`, username };
    setUser(newUser);
    localStorage.setItem('stockify_user', JSON.stringify(newUser));
    setCurrentPage('home');
  };

  const handleSignOut = () => {
    localStorage.removeItem('stockify_user');
    setUser(null);
    // Reset game state for the login screen view
    setInvestments([]);
    setUserCredits(INITIAL_CREDITS);
    setNetWorthHistory([]);
  };

  const handleNavigation = (page: Page) => {
    setViewingArtist(null); // Always close detail view on navigation
    setCurrentPage(page);
  };

  const handleInvest = (artistId: string, amount: number) => {
    const artist = artists.find(a => a.id === artistId);
    if (!artist || amount <= 0 || amount > userCredits) return;

    const newInvestment: Investment = {
      id: `inv_${Date.now()}`,
      artistId,
      initialInvestment: amount,
      initialFollowers: artist.followers,
      timestamp: Date.now(),
    };
    
    setInvestments(prev => [...prev, newInvestment]);
    setUserCredits(prev => prev - amount);
    setInvestingArtist(null); // Close modal
  };

  const handleSell = (investmentId: string, amountToSell: number) => {
    const investmentToSell = investments.find(inv => inv.id === investmentId);
    const artist = artists.find(a => a.id === investmentToSell?.artistId);

    if (!investmentToSell || !artist) return;

    // Calculate current total value of the investment
    const growthPercentage = (artist.followers - investmentToSell.initialFollowers) / investmentToSell.initialFollowers;
    const currentValue = investmentToSell.initialInvestment * (1 + growthPercentage);

    // Sanity check: cannot sell for more than it's worth
    if (amountToSell > currentValue + 0.01) { // Add tolerance for floating point issues
        console.error("Attempted to sell for more than current value");
        setSellingInvestment(null);
        return;
    }

    // If selling all or more (due to float rounding), treat as a full sale
    if (amountToSell >= currentValue - 0.01) {
        setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
        setUserCredits(prev => prev + currentValue); // Give them the full value to avoid rounding errors
    } else {
        // It's a partial sale
        const sellPercentage = amountToSell / currentValue;
        const remainingInitialInvestment = investmentToSell.initialInvestment * (1 - sellPercentage);
        
        setInvestments(prev => prev.map(inv => 
            inv.id === investmentId 
            ? { ...inv, initialInvestment: remainingInitialInvestment }
            : inv
        ));
        setUserCredits(prev => prev + amountToSell);
    }
    
    setSellingInvestment(null); // Close modal
  };
  
  const handleAddArtist = async (spotifyArtist: SpotifyArtist): Promise<Artist> => {
    const newArtist: Artist = {
        ...spotifyArtist,
        followerHistory: generateRandomHistory(spotifyArtist.followers)
    };
    setArtists(prev => {
        if (prev.some(a => a.id === newArtist.id)) return prev;
        return [...prev, newArtist];
    });
    return newArtist;
  };
  
  const handleUpdateArtists = (updatedArtists: SpotifyArtist[]) => {
    setArtists(prevArtists => {
        return prevArtists.map(existingArtist => {
            const updatedData = updatedArtists.find(ua => ua.id === existingArtist.id);
            if (updatedData && updatedData.followers !== existingArtist.followers) {
                const newHistoryPoint: FollowerHistoryPoint = {
                    timestamp: Date.now(),
                    count: updatedData.followers
                };
                const updatedHistory = [...existingArtist.followerHistory, newHistoryPoint].slice(-60);
                return { ...existingArtist, followers: updatedData.followers, followerHistory: updatedHistory };
            }
            return existingArtist;
        });
    });
  };

  // --- Render Logic ---
  if (isUserLoading) {
    return <div className="min-h-screen bg-gray-900" />; // Blank screen while checking session
  }

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }
  
  const renderPage = () => {
    if (viewingArtist) {
        return <ArtistDetailPage 
            artist={viewingArtist}
            investments={investments}
            onBack={() => setViewingArtist(null)}
            onInvest={() => setInvestingArtist(viewingArtist)}
        />;
    }

    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToTrade={() => handleNavigation('trade')} />;
      case 'trade':
        return <TradePage 
            artistsInMarket={artists}
            onInvest={setInvestingArtist}
            onViewDetail={setViewingArtist}
            onAddArtist={handleAddArtist}
        />;
      case 'portfolio':
        return <Portfolio 
            investments={investments}
            artists={artists}
            onOpenSellModal={(investment, currentValue) => setSellingInvestment({ investment, currentValue })}
            netWorthHistory={netWorthHistory}
            onViewDetail={setViewingArtist}
            onUpdateArtists={handleUpdateArtists}
        />;
      default:
        return <HomePage onNavigateToTrade={() => handleNavigation('trade')} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigation} 
        userCredits={userCredits}
        netWorth={netWorth}
        username={user.username}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-20 pb-10">
        {isMarketLoading ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-400">Loading Market Data...</p>
          </div>
        ) : error ? (
           <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
            <p className="text-md text-gray-300 bg-gray-800 p-4 rounded-lg">{error}</p>
          </div>
        ) : (
          renderPage()
        )}
      </main>

      {investingArtist && (
        <InvestmentModal
          artist={investingArtist}
          userCredits={userCredits}
          onInvest={handleInvest}
          onClose={() => setInvestingArtist(null)}
        />
      )}

      {sellingInvestment && (
        <SellModal
          investment={sellingInvestment.investment}
          artist={artists.find(a => a.id === sellingInvestment.investment.artistId)!}
          currentValue={sellingInvestment.currentValue}
          onSell={(amount) => handleSell(sellingInvestment.investment.id, amount)}
          onClose={() => setSellingInvestment(null)}
        />
      )}
    </div>
  );
}

export default App;
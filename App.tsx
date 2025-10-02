import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist, Investment, LocalUser, SpotifyArtist, FollowerHistoryPoint } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';
import { signInAnonymouslyIfNeeded } from './services/authService';
import { updateLeaderboardEntry } from './services/leaderboardService';
import { auth } from './firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

import Header from './components/Header';
import HomePage from './components/HomePage';
import TradePage from './components/TradePage';
import Portfolio from './components/Portfolio';
import ArtistDetailPage from './components/ArtistDetailPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import LoginPage from './components/LoginPage';
import LeaderboardPage from './components/LeaderboardPage';

type Page = 'home' | 'trade' | 'portfolio' | 'leaderboard';

const INITIAL_CREDITS = 10000;

function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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

  // Effect for Firebase auth state
  useEffect(() => {
    signInAnonymouslyIfNeeded();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

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

  // Debounced Leaderboard Update
  const debouncedUpdateLeaderboard = useCallback(
    debounce((fwUser: FirebaseUser, localUser: LocalUser, nw: number) => {
      updateLeaderboardEntry(fwUser.uid, localUser.username, nw);
    }, 2000),
    []
  );

  useEffect(() => {
    if (firebaseUser && user && netWorth > 0) {
      debouncedUpdateLeaderboard(firebaseUser, user, netWorth);
    }
  }, [netWorth, user, firebaseUser, debouncedUpdateLeaderboard]);


  // --- Handlers ---
  const handleSignIn = (username: string) => {
    if (!firebaseUser) {
      alert("Still connecting to services, please try again in a moment.");
      return;
    }
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
    
    const newUser: LocalUser = { userId: firebaseUser.uid, username };
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

    const growthPercentage = (artist.followers - investmentToSell.initialFollowers) / investmentToSell.initialFollowers;
    const currentValue = investmentToSell.initialInvestment * (1 + growthPercentage);

    if (amountToSell > currentValue + 0.01) {
        console.error("Attempted to sell for more than current value");
        setSellingInvestment(null);
        return;
    }

    if (amountToSell >= currentValue - 0.01) {
        setInvestments(prev => prev.filter(inv => inv.id !== investmentId));
        setUserCredits(prev => prev + currentValue);
    } else {
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
    return <div className="min-h-screen" />; // Blank screen while checking session
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
      case 'leaderboard':
        return <LeaderboardPage />;
      default:
        return <HomePage onNavigateToTrade={() => handleNavigation('trade')} />;
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigation} 
        userCredits={userCredits}
        netWorth={netWorth}
        username={user.username}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-20 pb-20 md:pb-10">
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

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}


export default App;
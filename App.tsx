import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist, Investment, SpotifyArtist, FollowerHistoryPoint, UserProfile } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';
import { onAuthStateListener, signOutUser } from './services/authService';
import { getUserProfile, updateUserProfile } from './services/firestoreService';
import { User as FirebaseUser } from 'firebase/auth';

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

function App() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [investingArtist, setInvestingArtist] = useState<Artist | null>(null);
  const [sellingInvestment, setSellingInvestment] = useState<{ investment: Investment, currentValue: number } | null>(null);
  const [viewingArtist, setViewingArtist] = useState<Artist | null>(null);

  // --- Data Loading and Persistence ---

  // Effect for Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateListener(async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      setFirebaseUser(user);
      setIsDataLoading(false);
    });
    return unsubscribe;
  }, []);
  
  // Effect to load market data
  useEffect(() => {
    const initializeMarket = async () => {
      setIsDataLoading(true);
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
        // This is part of the overall loading state managed by auth
      }
    };
    initializeMarket();
  }, []);

  const netWorth = useMemo(() => {
    if (!userProfile) return 0;
    const portfolioValue = userProfile.investments.reduce((total, investment) => {
        const artist = artists.find(a => a.id === investment.artistId);
        if (!artist) return total;
        const growthPercentage = investment.initialFollowers > 0 ? (artist.followers - investment.initialFollowers) / investment.initialFollowers : 0;
        const currentValue = investment.initialInvestment * (1 + growthPercentage);
        return total + currentValue;
    }, 0);
    return userProfile.credits + portfolioValue;
  }, [userProfile, artists]);

  // Debounced Firestore Update
  const debouncedUpdateFirestore = useCallback(
    debounce((uid: string, profile: UserProfile, nw: number) => {
      const updatedProfile = {
        ...profile,
        netWorth: nw,
      };
      // Keep net worth history tracking logic local but save it to firestore
       const newPoint = { timestamp: Date.now(), count: nw };
       const filteredHistory = (profile.netWorthHistory || []).filter(p => (Date.now() - p.timestamp) < 30 * 24 * 60 * 60 * 1000); // Keep 30 days
       const lastPoint = filteredHistory[filteredHistory.length - 1];
       if (!lastPoint || (Date.now() - lastPoint.timestamp > 60000 && Math.abs(lastPoint.count - nw) > 1)) {
           updatedProfile.netWorthHistory = [...filteredHistory, newPoint];
       } else {
           updatedProfile.netWorthHistory = filteredHistory;
       }

      updateUserProfile(uid, updatedProfile);
    }, 2000),
    []
  );

  useEffect(() => {
    if (firebaseUser && userProfile) {
      debouncedUpdateFirestore(firebaseUser.uid, userProfile, netWorth);
    }
  }, [userProfile, netWorth, firebaseUser, debouncedUpdateFirestore]);

  // --- Handlers ---
  const handleSignOut = async () => {
    await signOutUser();
    setUserProfile(null);
    setCurrentPage('home');
  };

  const handleNavigation = (page: Page) => {
    setViewingArtist(null); // Always close detail view on navigation
    setCurrentPage(page);
  };

  const handleInvest = (artistId: string, amount: number) => {
    if (!userProfile) return;
    const artist = artists.find(a => a.id === artistId);
    if (!artist || amount <= 0 || amount > userProfile.credits) return;

    const newInvestment: Investment = {
      id: `inv_${Date.now()}`,
      artistId,
      initialInvestment: amount,
      initialFollowers: artist.followers,
      timestamp: Date.now(),
    };
    
    setUserProfile(prev => prev ? {
      ...prev,
      investments: [...prev.investments, newInvestment],
      credits: prev.credits - amount
    } : null);
    setInvestingArtist(null); // Close modal
  };

  const handleSell = (investmentId: string, amountToSell: number) => {
    if (!userProfile) return;
    const investmentToSell = userProfile.investments.find(inv => inv.id === investmentId);
    const artist = artists.find(a => a.id === investmentToSell?.artistId);

    if (!investmentToSell || !artist) return;

    const growthPercentage = (artist.followers - investmentToSell.initialFollowers) / investmentToSell.initialFollowers;
    const currentValue = investmentToSell.initialInvestment * (1 + growthPercentage);

    if (amountToSell > currentValue + 0.01) {
        console.error("Attempted to sell for more than current value");
        setSellingInvestment(null);
        return;
    }
    
    let newCredits = userProfile.credits;
    let newInvestments = [...userProfile.investments];

    if (amountToSell >= currentValue - 0.01) {
        newInvestments = newInvestments.filter(inv => inv.id !== investmentId);
        newCredits += currentValue;
    } else {
        const sellPercentage = amountToSell / currentValue;
        const remainingInitialInvestment = investmentToSell.initialInvestment * (1 - sellPercentage);
        
        newInvestments = newInvestments.map(inv => 
            inv.id === investmentId 
            ? { ...inv, initialInvestment: remainingInitialInvestment }
            : inv
        );
        newCredits += amountToSell;
    }

    setUserProfile(prev => prev ? { ...prev, credits: newCredits, investments: newInvestments } : null);
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
  if (isDataLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading Session...</p></div>;
  }

  if (!firebaseUser || !userProfile) {
    return <LoginPage />;
  }
  
  const renderPage = () => {
    if (viewingArtist) {
        return <ArtistDetailPage 
            artist={viewingArtist}
            investments={userProfile.investments}
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
            investments={userProfile.investments}
            artists={artists}
            onOpenSellModal={(investment, currentValue) => setSellingInvestment({ investment, currentValue })}
            netWorthHistory={userProfile.netWorthHistory || []}
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
        userCredits={userProfile.credits}
        netWorth={netWorth}
        username={userProfile.displayName}
        onSignOut={handleSignOut}
      />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-20 pb-20 md:pb-10">
        {artists.length === 0 ? (
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
          userCredits={userProfile.credits}
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
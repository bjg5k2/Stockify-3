import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Portfolio from './components/Portfolio';
import TradePage from './components/TradePage';
import ArtistDetailPage from './components/ArtistDetailPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import { Artist, Investment, SpotifyArtist, FollowerHistoryPoint } from './types';

// Moved constant here to remove dependency on separate file
const INITIAL_USER_CREDITS = 10000;

type Page = 'home' | 'portfolio' | 'trade' | 'artistDetail';

const App: React.FC = () => {
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [userCredits, setUserCredits] = useState<number>(INITIAL_USER_CREDITS);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [artistsInMarket, setArtistsInMarket] = useState<Artist[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<{ timestamp: number; netWorth: number }[]>([]);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [viewingArtist, setViewingArtist] = useState<Artist | null>(null);

  const [investModalArtist, setInvestModalArtist] = useState<Artist | null>(null);
  const [sellModalInfo, setSellModalInfo] = useState<{ investment: Investment; artist: Artist; currentValue: number } | null>(null);

  // Load session from localStorage on initial render
  useEffect(() => {
    const savedSession = localStorage.getItem('stockify_sessionActive');
    if (savedSession === 'true') {
      const savedCredits = localStorage.getItem('stockify_userCredits');
      const savedInvestments = localStorage.getItem('stockify_investments');
      const savedArtists = localStorage.getItem('stockify_artistsInMarket');
      const savedHistory = localStorage.getItem('stockify_netWorthHistory');

      if (savedCredits) setUserCredits(JSON.parse(savedCredits));
      if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
      if (savedArtists) setArtistsInMarket(JSON.parse(savedArtists));
      if (savedHistory) setNetWorthHistory(JSON.parse(savedHistory));
      setSessionActive(true);
    }
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (sessionActive) {
      localStorage.setItem('stockify_sessionActive', 'true');
      localStorage.setItem('stockify_userCredits', JSON.stringify(userCredits));
      localStorage.setItem('stockify_investments', JSON.stringify(investments));
      localStorage.setItem('stockify_artistsInMarket', JSON.stringify(artistsInMarket));
      localStorage.setItem('stockify_netWorthHistory', JSON.stringify(netWorthHistory));
    } else {
      localStorage.removeItem('stockify_sessionActive');
    }
  }, [sessionActive, userCredits, investments, artistsInMarket, netWorthHistory]);


  const portfolioValue = useMemo(() => {
    return investments.reduce((total, investment) => {
      const artist = artistsInMarket.find(a => a.id === investment.artistId);
      if (!artist) return total;
      
      const followerChange = artist.followers - investment.initialFollowers;
      const growthPercentage = investment.initialFollowers > 0 ? followerChange / investment.initialFollowers : 0;
      const currentValue = investment.initialInvestment * (1 + growthPercentage);
      
      return total + currentValue;
    }, 0);
  }, [investments, artistsInMarket]);

  const netWorth = useMemo(() => userCredits + portfolioValue, [userCredits, portfolioValue]);
  
  useEffect(() => {
    if (sessionActive) {
      setNetWorthHistory(prev => {
        const now = Date.now();
        const lastEntry = prev[prev.length - 1];
        // To avoid too many updates, only add a new point if it's been a while or net worth changed significantly
        if (!lastEntry || now - lastEntry.timestamp > 5000 /* 5 seconds */) {
            const newHistory = [...prev, { timestamp: now, netWorth }];
            return newHistory.length > 100 ? newHistory.slice(newHistory.length - 100) : newHistory;
        }
        return prev;
      });
    }
  }, [netWorth, sessionActive]);

  const handleStartSession = () => {
    setSessionActive(true);
    setCurrentPage('home');
     if (!localStorage.getItem('stockify_userCredits')) {
        setUserCredits(INITIAL_USER_CREDITS);
        setNetWorthHistory([{ timestamp: Date.now(), netWorth: INITIAL_USER_CREDITS }]);
     }
  };

  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to reset your session? This will clear all your game data.")) {
        localStorage.clear();
        setSessionActive(false);
        setUserCredits(INITIAL_USER_CREDITS);
        setInvestments([]);
        setArtistsInMarket([]);
        setNetWorthHistory([]);
        setCurrentPage('home');
        setViewingArtist(null);
    }
  };

  const handleInvest = (artistId: string, amount: number) => {
    const artist = artistsInMarket.find(a => a.id === artistId);
    if (!artist || amount > userCredits || amount <= 0) return;

    setUserCredits(prev => prev - amount);
    setInvestments(prev => [
      ...prev,
      {
        id: `${artistId}-${Date.now()}`,
        artistId,
        initialInvestment: amount,
        initialFollowers: artist.followers,
        timestamp: Date.now(),
      },
    ]);
    setInvestModalArtist(null);
  };

  const handleSell = (investment: Investment, sellValue: number) => {
    const artist = artistsInMarket.find(a => a.id === investment.artistId);
    if (!artist) return;

    const followerChange = artist.followers - investment.initialFollowers;
    const growthPercentage = investment.initialFollowers > 0 ? followerChange / investment.initialFollowers : 0;
    const currentValue = investment.initialInvestment * (1 + growthPercentage);

    if(sellValue > currentValue) return;

    const sellProportion = currentValue > 0 ? sellValue / currentValue : 1;
    const investmentToLiquidate = investment.initialInvestment * sellProportion;

    setUserCredits(prev => prev + sellValue);

    const remainingInitialInvestment = investment.initialInvestment - investmentToLiquidate;
    if (remainingInitialInvestment < 1) {
      setInvestments(prev => prev.filter(inv => inv.id !== investment.id));
    } else {
      setInvestments(prev => prev.map(inv => inv.id === investment.id ? { ...inv, initialInvestment: remainingInitialInvestment } : inv ));
    }
    setSellModalInfo(null);
  };
  
  const handleAddArtist = useCallback(async (spotifyArtist: SpotifyArtist): Promise<Artist> => {
    const followerHistory: FollowerHistoryPoint[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (29 - i));
        const randomFactor = 1 - (Math.random() * 0.05);
        const followerCount = Math.round(spotifyArtist.followers * (randomFactor + (i/29 * 0.05)) );
        followerHistory.push({
            timestamp: date.getTime(),
            count: followerCount
        });
    }
    followerHistory[29] = { timestamp: today.getTime(), count: spotifyArtist.followers };

    const newArtist: Artist = {
      ...spotifyArtist,
      followerHistory: followerHistory,
    };
    setArtistsInMarket(prev => [...prev, newArtist]);
    return newArtist;
  }, []);

  const handleUpdateArtists = useCallback((updatedArtists: SpotifyArtist[]) => {
    setArtistsInMarket(prev => {
        return prev.map(marketArtist => {
            const updatedData = updatedArtists.find(ua => ua.id === marketArtist.id);
            if (updatedData && updatedData.followers !== marketArtist.followers) {
                const newHistory = [...marketArtist.followerHistory, { timestamp: Date.now(), count: updatedData.followers }];
                if (newHistory.length > 30) newHistory.shift();
                return { ...marketArtist, followers: updatedData.followers, followerHistory: newHistory };
            }
            return marketArtist;
        });
    });
  }, []);

  const handleUpdateBio = (artistId: string, bio: string) => {
    setArtistsInMarket(prev => prev.map(a => a.id === artistId ? { ...a, bio } : a));
    if (viewingArtist?.id === artistId) {
        setViewingArtist(prev => prev ? { ...prev, bio } : null);
    }
  }

  const handleNavigate = (page: Page) => {
      setViewingArtist(null);
      setCurrentPage(page);
  }

  if (!sessionActive) {
    return <LoginPage onLogin={handleStartSession} />;
  }

  const renderPage = () => {
    if (viewingArtist) {
      return <ArtistDetailPage 
        artist={viewingArtist} 
        investments={investments}
        onBack={() => setViewingArtist(null)}
        onInvest={() => setInvestModalArtist(viewingArtist)}
        onUpdateBio={handleUpdateBio}
      />;
    }

    switch (currentPage) {
      case 'portfolio':
        return <Portfolio 
          investments={investments} 
          artists={artistsInMarket}
          netWorthHistory={netWorthHistory.map(h => ({ timestamp: h.timestamp, count: h.netWorth }))}
          onOpenSellModal={(investment, currentValue) => {
            const artist = artistsInMarket.find(a => a.id === investment.artistId);
            if (artist) {
              setSellModalInfo({ investment, artist, currentValue });
            }
          }}
          onViewDetail={setViewingArtist}
          onUpdateArtists={handleUpdateArtists}
        />;
      case 'trade':
        return <TradePage 
          artistsInMarket={artistsInMarket}
          onInvest={setInvestModalArtist}
          onViewDetail={setViewingArtist}
          onAddArtist={handleAddArtist}
        />;
      case 'home':
      default:
        return <HomePage onNavigateToTrade={() => setCurrentPage('trade')} />;
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header
        userCredits={userCredits}
        currentPage={viewingArtist ? 'artistDetail' : currentPage}
        onNavigate={handleNavigate}
        onLogout={handleResetSession}
        netWorth={netWorth}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>

      {investModalArtist && (
        <InvestmentModal
          artist={investModalArtist}
          userCredits={userCredits}
          onInvest={handleInvest}
          onClose={() => setInvestModalArtist(null)}
        />
      )}

      {sellModalInfo && (
        <SellModal
          investment={sellModalInfo.investment}
          artist={sellModalInfo.artist}
          currentValue={sellModalInfo.currentValue}
          userCredits={userCredits}
          onSell={handleSell}
          onClose={() => setSellModalInfo(null)}
        />
      )}
    </div>
  );
};

export default App;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Artist,
  Investment,
  Page,
  PortfolioItem,
  Transaction,
  UserData,
  NetWorthHistoryPoint,
  MarketMover,
  MostTraded,
  FollowerHistoryPoint,
} from './types';
import {
  DAYS_PER_TICK,
  FOLLOWER_GROWTH_RATE_MAX,
  FOLLOWER_GROWTH_RATE_MIN,
  POPULARITY_INFLUENCE,
  SIMULATION_TICK_RATE_MS,
  STARTING_CREDITS,
} from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';

// Components
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import Portfolio from './components/Portfolio';
import TradePage from './components/TradePage';
import InvestmentModal from './components/InvestmentModal';
import ArtistDetailPage from './components/ArtistDetailPage';
import SellModal from './components/SellModal';
import WelcomeModal from './components/WelcomeModal';
import HomePage from './components/HomePage';
import LeaderboardPage from './components/LeaderboardPage';
import FAQPage from './components/FAQPage';

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [trackedArtists, setTrackedArtists] = useState<Artist[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [netWorth, setNetWorth] = useState(0);

  // Modals state
  const [investModalArtist, setInvestModalArtist] = useState<Artist | null>(null);
  const [sellModalItem, setSellModalItem] = useState<PortfolioItem | null>(null);
  const [detailArtistId, setDetailArtistId] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Simulation state
  const [simulatedDays, setSimulatedDays] = useState(0);

  // Home page state
  const [netWorthChange, setNetWorthChange] = useState(0);
  const [marketMovers, setMarketMovers] = useState<{gainers: MarketMover[], losers: MarketMover[]}>({gainers: [], losers: []});
  const [mostTraded, setMostTraded] = useState<MostTraded[]>([]);

  const detailArtist = useMemo(() => trackedArtists.find(a => a.id === detailArtistId), [trackedArtists, detailArtistId]);

  const updateAllArtistData = useCallback(async (currentArtists: Artist[], investments: Investment[]) => {
    const artistIds = [...new Set(investments.map(inv => inv.artistId))];
    if (artistIds.length === 0) {
      setTrackedArtists([]);
      return;
    }
    try {
      const updatedSpotifyArtists = await getMultipleArtistsByIds(artistIds);
      const updatedArtists = updatedSpotifyArtists.map(spotifyArtist => {
        const existingArtist = currentArtists.find(a => a.id === spotifyArtist.id);
        const followerHistory = existingArtist?.followerHistory || [{ date: Date.now(), count: spotifyArtist.followers }];
        return { ...spotifyArtist, followerHistory };
      });
      setTrackedArtists(updatedArtists);
    } catch (error) {
      console.error("Failed to update artist data:", error);
    }
  }, []);

  const handleSignIn = (username: string) => {
    const savedUserData = localStorage.getItem(`stockify_user_${username}`);
    const savedArtists = localStorage.getItem(`stockify_artists_${username}`);
    
    if (savedUserData && savedArtists) {
      const parsedUser = JSON.parse(savedUserData);
      setUser({ ...parsedUser, lastLogin: Date.now() });
      setTrackedArtists(JSON.parse(savedArtists));
    } else {
      const now = Date.now();
      const newUser: UserData = {
        username,
        credits: STARTING_CREDITS,
        investments: [],
        transactions: [],
        netWorthHistory: [{ date: now, netWorth: STARTING_CREDITS }],
        lastLogin: now,
        simulationStartDate: now,
      };
      setUser(newUser);
      setTrackedArtists([]);
      setShowWelcomeModal(true);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setTrackedArtists([]);
    setPortfolioItems([]);
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };
  
  const handleInvest = (artist: Artist, amount: number) => {
    if (!user || user.credits < amount) return;

    const newInvestment: Investment = {
      artistId: artist.id,
      initialInvestment: amount,
      initialFollowers: artist.followers,
      timestamp: Date.now(),
    };

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'invest',
      artistId: artist.id,
      artistName: artist.name,
      amount: amount,
      timestamp: Date.now(),
    };

    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = {
        ...prevUser,
        credits: prevUser.credits - amount,
        investments: [...prevUser.investments, newInvestment],
        transactions: [newTransaction, ...prevUser.transactions],
      };
      return updatedUser;
    });

    if (!trackedArtists.some(a => a.id === artist.id)) {
      setTrackedArtists(prevArtists => [...prevArtists, {
        ...artist,
        followerHistory: [{ date: Date.now(), count: artist.followers }]
      }]);
    }
    setInvestModalArtist(null);
  };

  const handleSell = (item: PortfolioItem, sellAmount: number) => {
    if (!user) return;
    
    const sellRatio = sellAmount / item.currentValue;
    const investmentToLiquidate = item.totalInvestment * sellRatio;
    
    const remainingInvestments = user.investments.filter(inv => inv.artistId !== item.artist.id);
    const investmentsInThisArtist = user.investments.filter(inv => inv.artistId === item.artist.id);

    // Reduce each investment proportionally
    const updatedInvestmentsForArtist = investmentsInThisArtist.map(inv => ({
      ...inv,
      initialInvestment: inv.initialInvestment * (1 - sellRatio)
    })).filter(inv => inv.initialInvestment > 1); // Remove if fully liquidated

    const newTransaction: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'sell',
      artistId: item.artist.id,
      artistName: item.artist.name,
      amount: sellAmount,
      timestamp: Date.now(),
    };

    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        credits: prevUser.credits + sellAmount,
        investments: [...remainingInvestments, ...updatedInvestmentsForArtist],
        transactions: [newTransaction, ...prevUser.transactions],
      }
    });

    setSellModalItem(null);
    setDetailArtistId(null);
  };

  const handleViewDetail = (artistId: string) => {
      const artist = trackedArtists.find(a => a.id === artistId);
      if(artist) {
          setDetailArtistId(artistId);
      }
  };

  // Load user from localStorage on initial render
  useEffect(() => {
    // This is just to demonstrate the login flow, actual loading is in handleSignIn
  }, []);

  // Persist user and artist data to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`stockify_user_${user.username}`, JSON.stringify(user));
      localStorage.setItem(`stockify_artists_${user.username}`, JSON.stringify(trackedArtists));
    }
  }, [user, trackedArtists]);

  // Main simulation loop
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(() => {
      setSimulatedDays(prevDays => prevDays + DAYS_PER_TICK);
      
      setTrackedArtists(prevArtists => {
        return prevArtists.map(artist => {
          const growthRate = (Math.random() * (FOLLOWER_GROWTH_RATE_MAX - FOLLOWER_GROWTH_RATE_MIN) + FOLLOWER_GROWTH_RATE_MIN) * (1 + (artist.popularity / 100) * POPULARITY_INFLUENCE);
          const newFollowers = Math.floor(artist.followers * growthRate * DAYS_PER_TICK);
          const updatedFollowers = artist.followers + newFollowers;
          
          const newHistoryPoint: FollowerHistoryPoint = {
            date: Date.now(),
            count: updatedFollowers
          };

          const updatedHistory = [...artist.followerHistory, newHistoryPoint].slice(-30); // Keep last 30 points

          return {
            ...artist,
            followers: updatedFollowers,
            followerHistory: updatedHistory,
          };
        });
      });
    }, SIMULATION_TICK_RATE_MS);

    return () => clearInterval(intervalId);
  }, [user]);

  // Recalculate portfolio and net worth when data changes
  useEffect(() => {
    if (!user) return;

    const calculatePortfolio = () => {
      const items: PortfolioItem[] = [];
      const artistIdToInvestments = user.investments.reduce((acc, inv) => {
        if (!acc[inv.artistId]) {
          acc[inv.artistId] = [];
        }
        acc[inv.artistId].push(inv);
        return acc;
      }, {} as Record<string, Investment[]>);

      for (const artistId in artistIdToInvestments) {
        const artist = trackedArtists.find(a => a.id === artistId);
        if (artist) {
          const investments = artistIdToInvestments[artistId];
          const totalInvestment = investments.reduce((sum, inv) => sum + inv.initialInvestment, 0);

          const currentValue = investments.reduce((sum, inv) => {
              if (inv.initialFollowers === 0) return sum + inv.initialInvestment;
              const growth = (artist.followers - inv.initialFollowers) / inv.initialFollowers;
              return sum + inv.initialInvestment * (1 + growth);
          }, 0);
          
          const profitOrLoss = currentValue - totalInvestment;
          const profitOrLossPercentage = totalInvestment > 0 ? (profitOrLoss / totalInvestment) * 100 : 0;

          items.push({
            artist,
            investments,
            totalInvestment,
            currentValue,
            profitOrLoss,
            profitOrLossPercentage,
          });
        }
      }
      return items;
    };

    const newPortfolioItems = calculatePortfolio();
    setPortfolioItems(newPortfolioItems);
    
    const portfolioValue = newPortfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
    const newNetWorth = user.credits + portfolioValue;
    setNetWorth(newNetWorth);
    
    setUser(prevUser => {
        if (!prevUser) return null;
        const newHistoryPoint = { date: Date.now(), netWorth: newNetWorth };
        // Avoid duplicate history points
        if (prevUser.netWorthHistory[prevUser.netWorthHistory.length-1]?.netWorth === newNetWorth) {
            return prevUser;
        }
        return {
            ...prevUser,
            netWorthHistory: [...prevUser.netWorthHistory, newHistoryPoint].slice(-30)
        }
    });

  }, [user?.credits, user?.investments, trackedArtists]);

  // Update artists from Spotify on login
  useEffect(() => {
    if (user && trackedArtists) {
      updateAllArtistData(trackedArtists, user.investments);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.lastLogin]);
  
  // Calculate home page stats
  useEffect(() => {
    if (!user || trackedArtists.length === 0) return;

    // Net worth change
    const lastLoginNetWorth = user.netWorthHistory.find(p => p.date >= user.lastLogin)?.netWorth ?? user.netWorthHistory[user.netWorthHistory.length - 2]?.netWorth ?? netWorth;
    setNetWorthChange(netWorth - lastLoginNetWorth);

    // Market movers
    const movers = trackedArtists.map(artist => {
        const history = artist.followerHistory;
        if (history.length < 2) return null;
        const start = history[0].count;
        const end = history[history.length - 1].count;
        const change = start > 0 ? ((end - start) / start) * 100 : 0;
        return { artist, change };
    }).filter((m): m is MarketMover => m !== null);

    const sortedMovers = movers.sort((a,b) => b.change - a.change);
    setMarketMovers({
        gainers: sortedMovers.filter(m => m.change > 0).slice(0, 5),
        losers: sortedMovers.filter(m => m.change < 0).reverse().slice(0, 5)
    });

    // Most traded
    const recentTransactions = user.transactions.filter(t => t.timestamp >= user.lastLogin);
    const tradeCounts = recentTransactions.reduce((acc, tx) => {
        if (!acc[tx.artistId]) {
            const artist = trackedArtists.find(a => a.id === tx.artistId);
            if (!artist) return acc;
            acc[tx.artistId] = { artist, buys: 0, sells: 0 };
        }
        if (tx.type === 'invest') acc[tx.artistId].buys += tx.amount;
        else acc[tx.artistId].sells += tx.amount;
        return acc;
    }, {} as Record<string, MostTraded>);
    
    setMostTraded(Object.values(tradeCounts).sort((a,b) => (b.buys + b.sells) - (a.buys + a.sells)).slice(0, 5));

  }, [netWorth, user, trackedArtists]);


  const renderPage = () => {
    if (!user) return null;
    switch (currentPage) {
      case 'home':
        return <HomePage 
            username={user.username}
            netWorthChange={netWorthChange}
            marketMovers={marketMovers}
            mostTraded={mostTraded}
            onViewDetail={handleViewDetail}
        />;
      case 'portfolio':
        return <Portfolio 
          portfolioItems={portfolioItems} 
          netWorth={netWorth}
          netWorthHistory={user.netWorthHistory}
          onViewDetail={handleViewDetail}
          onSellClick={setSellModalItem}
        />;
      case 'trade':
        return <TradePage 
          onInvest={setInvestModalArtist} 
          onViewDetail={handleViewDetail}
          trackedArtists={trackedArtists}
          transactions={user.transactions}
        />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'faq':
          return <FAQPage />;
      default:
        return <div>Page not found</div>;
    }
  };

  if (!user) {
    return <LoginPage onSignIn={handleSignIn} />;
  }

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-[0.03]" 
          style={{backgroundImage: "url('/background.png')"}}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-900"></div>

      <div className="relative z-10">
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          username={user.username}
          userCredits={user.credits}
          onSignOut={handleSignOut}
          simulationStartDate={user.simulationStartDate}
          simulatedDays={simulatedDays}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {renderPage()}
        </main>
        
        {investModalArtist && (
          <InvestmentModal
            artist={investModalArtist}
            userCredits={user.credits}
            onInvest={handleInvest}
            onClose={() => setInvestModalArtist(null)}
          />
        )}
        {sellModalItem && (
            <SellModal 
                portfolioItem={sellModalItem}
                onSell={handleSell}
                onClose={() => setSellModalItem(null)}
            />
        )}
        {detailArtist && (
          <ArtistDetailPage
            artist={detailArtist}
            investments={user.investments}
            onClose={() => setDetailArtistId(null)}
            onInvest={setInvestModalArtist}
            onSell={() => {
              const item = portfolioItems.find(p => p.artist.id === detailArtistId);
              if (item) setSellModalItem(item);
            }}
          />
        )}
        {showWelcomeModal && (
          <WelcomeModal 
            onClose={() => setShowWelcomeModal(false)}
            onNavigateToFaq={() => {
                setCurrentPage('faq');
                setShowWelcomeModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
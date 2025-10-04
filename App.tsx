import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Page, 
    UserData, 
    Artist, 
    Investment, 
    Transaction, 
    PortfolioItem, 
    SpotifyArtist,
    MarketMover,
    MostTraded
} from './types';
import { signIn, signOut, saveAllUserData, getAllUserData, loadUser } from './services/authService';
import { getMultipleArtistsByIds } from './services/spotifyService';
import LoginPage from './components/LoginPage';
import Header from './components/Header';
import HomePage from './components/HomePage';
import Portfolio from './components/Portfolio';
import TradePage from './components/TradePage';
import LeaderboardPage from './components/LeaderboardPage';
import FAQPage from './components/FAQPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import ArtistDetailPage from './components/ArtistDetailPage';
import WelcomeModal from './components/WelcomeModal';
import { 
    SIMULATION_TICK_RATE_MS, 
    DAYS_PER_TICK,
    FOLLOWER_GROWTH_RATE_MIN,
    FOLLOWER_GROWTH_RATE_MAX,
    POPULARITY_INFLUENCE
} from './constants';

const App: React.FC = () => {
    // State
    const [userData, setUserData] = useState<UserData | null>(null);
    const [artists, setArtists] = useState<Record<string, Artist>>({});
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [isLoading, setIsLoading] = useState(true);
    
    // Modals state
    const [investModalArtist, setInvestModalArtist] = useState<Artist | null>(null);
    const [sellModalItem, setSellModalItem] = useState<PortfolioItem | null>(null);
    const [detailArtist, setDetailArtist] = useState<Artist | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    const allUserData = useMemo(() => getAllUserData(), [userData]);

    // Handlers
    const handleSignIn = (username: string) => {
        const { userData: loadedUserData, isNewUser } = signIn(username);
        setUserData(loadedUserData);
        setCurrentPage('home');
        if (isNewUser && !loadedUserData.hasSeenWelcome) {
            setShowWelcomeModal(true);
        }
    };

    const handleSignOut = () => {
        signOut();
        setUserData(null);
    };

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
    };
    
    // Main simulation tick logic
    const runSimulationTick = useCallback(() => {
        let allUsers = getAllUserData();
        const allInvestedArtistIds = Array.from(new Set(Object.values(allUsers).flatMap(u => u.investments.map(i => i.artistId))));

        let updatedArtistsData: Record<string, Artist> = {};
        
        allInvestedArtistIds.forEach(artistId => {
            const artist = artists[artistId];
            if (artist) {
                const baseGrowth = FOLLOWER_GROWTH_RATE_MIN + (Math.random() * (FOLLOWER_GROWTH_RATE_MAX - FOLLOWER_GROWTH_RATE_MIN));
                const popularityBonus = (artist.popularity / 100) * POPULARITY_INFLUENCE;
                const dailyGrowthRate = baseGrowth + popularityBonus;
                const followerIncrease = Math.floor(artist.followers * dailyGrowthRate * DAYS_PER_TICK);
                
                const newFollowers = artist.followers + followerIncrease;

                updatedArtistsData[artistId] = {
                    ...artist,
                    followers: newFollowers,
                    followerHistory: [
                        ...artist.followerHistory.slice(-29), // keep last 30 points
                        { date: Date.now(), count: newFollowers }
                    ]
                };
            }
        });

        // Update artists state
        setArtists(prevArtists => ({ ...prevArtists, ...updatedArtistsData }));

        // Update all users data
        Object.keys(allUsers).forEach(username => {
            const user = allUsers[username];
            
            const calculateCurrentValue = (investment: Investment): number => {
                const artist = updatedArtistsData[investment.artistId] || artists[investment.artistId];
                if (!artist || investment.initialFollowers === 0) return investment.initialInvestment;
                return investment.initialInvestment * (artist.followers / investment.initialFollowers);
            };

            const portfolioValue = user.investments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);
            const newNetWorth = user.credits + portfolioValue;

            const updatedUser: UserData = {
                ...user,
                simulatedDays: user.simulatedDays + DAYS_PER_TICK,
                lastTickDate: Date.now(),
                netWorthHistory: [
                    ...user.netWorthHistory.slice(-29),
                    { date: Date.now(), netWorth: newNetWorth }
                ]
            };
            allUsers[username] = updatedUser;
        });
        
        saveAllUserData(allUsers);
        
        // Update current user's data if they are logged in
        if (userData && allUsers[userData.username]) {
            setUserData(allUsers[userData.username]);
        }
    }, [userData, artists]);

    // Effect for simulation tick
    useEffect(() => {
        const tickInterval = setInterval(runSimulationTick, SIMULATION_TICK_RATE_MS);
        return () => clearInterval(tickInterval);
    }, [runSimulationTick]);

    // Effect for initial load and fetching artist data
    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            const activeUser = loadUser();
            if (activeUser) {
                const { userData: loadedUserData } = signIn(activeUser.username);
                setUserData(loadedUserData);
            }

            const allUsers = getAllUserData();
            const allArtistIds = Array.from(new Set(Object.values(allUsers).flatMap(u => u.investments.map(i => i.artistId))));

            if (allArtistIds.length > 0) {
                try {
                    const fetchedArtists: SpotifyArtist[] = await getMultipleArtistsByIds(allArtistIds);
                    const artistsMap: Record<string, Artist> = fetchedArtists.reduce((acc, spotifyArtist) => {
                        const existingUserInvestments = Object.values(allUsers).flatMap(u => u.investments).filter(i => i.artistId === spotifyArtist.id);
                        // A simple way to get some history if none exists.
                        const history = existingUserInvestments.length > 0 ? [{date: existingUserInvestments[0].timestamp, count: existingUserInvestments[0].initialFollowers}, { date: Date.now(), count: spotifyArtist.followers }] : [{ date: Date.now(), count: spotifyArtist.followers }];
                        acc[spotifyArtist.id] = { ...spotifyArtist, followerHistory: history };
                        return acc;
                    }, {} as Record<string, Artist>);
                    
                    // We need to merge this with any artists already in state from a previous tick, just in case
                    setArtists(prev => ({...prev, ...artistsMap}));
                } catch (error) {
                    console.error("Failed to fetch initial artist data", error);
                }
            }
            setIsLoading(false);
        };
        initialLoad();
    }, []);

    const portfolioItems = useMemo((): PortfolioItem[] => {
        if (!userData) return [];

        const items: Record<string, PortfolioItem> = {};

        userData.investments.forEach(investment => {
            const artist = artists[investment.artistId];
            if (!artist) return;

            if (!items[artist.id]) {
                items[artist.id] = {
                    artist: artist,
                    investments: [],
                    totalInvestment: 0,
                    currentValue: 0,
                    profitOrLoss: 0,
                    profitOrLossPercentage: 0
                };
            }

            const investmentValue = (investment.initialFollowers > 0) 
                ? investment.initialInvestment * (artist.followers / investment.initialFollowers) 
                : investment.initialInvestment;
            
            const currentItem = items[artist.id];
            currentItem.investments.push(investment);
            currentItem.totalInvestment += investment.initialInvestment;
            currentItem.currentValue += investmentValue;
        });

        return Object.values(items).map(item => {
            item.profitOrLoss = item.currentValue - item.totalInvestment;
            item.profitOrLossPercentage = item.totalInvestment > 0 ? (item.profitOrLoss / item.totalInvestment) * 100 : 0;
            return item;
        });
    }, [userData, artists]);

    const netWorth = useMemo(() => {
        if (!userData) return 0;
        const portfolioValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        return userData.credits + portfolioValue;
    }, [userData, portfolioItems]);

    const handleInvest = (artist: Artist, amount: number) => {
        if (!userData || userData.credits < amount) return;

        const newInvestment: Investment = {
            id: `inv_${Date.now()}_${Math.random()}`,
            artistId: artist.id,
            initialInvestment: amount,
            initialFollowers: artist.followers,
            timestamp: Date.now()
        };
        
        const newTransaction: Transaction = {
            id: `txn_${Date.now()}_${Math.random()}`,
            type: 'invest',
            artistId: artist.id,
            artistName: artist.name,
            amount: amount,
            timestamp: Date.now()
        };

        const updatedUserData: UserData = {
            ...userData,
            credits: userData.credits - amount,
            investments: [...userData.investments, newInvestment],
            transactions: [newTransaction, ...userData.transactions],
        };

        setUserData(updatedUserData);

        if (!artists[artist.id]) {
            setArtists(prev => ({ ...prev, [artist.id]: { ...artist, followerHistory: [{date: Date.now(), count: artist.followers}] } }));
        }

        const allUsers = getAllUserData();
        saveAllUserData({ ...allUsers, [userData.username]: updatedUserData });
        
        setInvestModalArtist(null);
    };

    const handleSell = (item: PortfolioItem, sellAmount: number) => {
        if (!userData || item.currentValue < sellAmount || sellAmount <= 0) return;

        const sellRatio = sellAmount / item.currentValue;
        let remainingInvestments: Investment[] = [];
        
        item.investments.forEach(inv => {
            if (sellRatio < 1) { // Partial sell
                const remainingInitialInvestment = inv.initialInvestment * (1 - sellRatio);
                remainingInvestments.push({ ...inv, initialInvestment: remainingInitialInvestment });
            }
        });
        
        const newTransaction: Transaction = {
            id: `txn_${Date.now()}_${Math.random()}`,
            type: 'sell',
            artistId: item.artist.id,
            artistName: item.artist.name,
            amount: sellAmount,
            timestamp: Date.now()
        };
        
        const otherInvestments = userData.investments.filter(inv => inv.artistId !== item.artist.id);

        const updatedUserData: UserData = {
            ...userData,
            credits: userData.credits + sellAmount,
            investments: [...otherInvestments, ...remainingInvestments],
            transactions: [newTransaction, ...userData.transactions]
        };

        setUserData(updatedUserData);
        const allUsers = getAllUserData();
        saveAllUserData({ ...allUsers, [userData.username]: updatedUserData });
        
        setSellModalItem(null);
        setDetailArtist(null);
    };

    const trackedArtists = useMemo(() => {
        return portfolioItems.map(item => item.artist);
    }, [portfolioItems]);

    const handleViewDetail = (artistId: string) => {
        const artist = artists[artistId];
        if (artist) {
            setDetailArtist(artist);
        }
    };
    
    const handleInvestFromDetail = (artist: Artist) => {
        setDetailArtist(null);
        setInvestModalArtist(artist);
    };

    const handleSellFromDetail = () => {
        if (detailArtist) {
            const item = portfolioItems.find(p => p.artist.id === detailArtist.id);
            if(item) {
                setDetailArtist(null);
                setSellModalItem(item);
            }
        }
    };
    
    const homePageData = useMemo(() => {
        if (!userData) return { netWorthChange: 0, marketMovers: { gainers: [], losers: []}, mostTraded: [] };

        const lastKnownNetWorth = userData.netWorthHistory.length > 1 ? userData.netWorthHistory[userData.netWorthHistory.length - 2].netWorth : (userData.netWorthHistory[0]?.netWorth ?? 0);
        const netWorthChange = netWorth - lastKnownNetWorth;

        const allTrackedArtists = Object.values(artists).filter(a => a.followerHistory.length > 1);
        const movers: MarketMover[] = allTrackedArtists.map(a => {
            const start = a.followerHistory[0].count;
            const end = a.followers;
            const change = start > 0 ? ((end - start) / start) * 100 : 0;
            return { artist: a, change };
        }).sort((a,b) => Math.abs(b.change) - Math.abs(a.change));

        const marketMovers = {
            gainers: movers.filter(m => m.change > 0.01).slice(0, 5),
            losers: movers.filter(m => m.change < -0.01).slice(0, 5),
        };
        
        const lastLoginTimestamp = userData.lastTickDate ?? 0;
        const allTransactions = Object.values(allUserData).flatMap(u => u.transactions);
        const recentGlobalTransactions = allTransactions.filter(t => t.timestamp > lastLoginTimestamp);
        const tradeCounts: Record<string, { artistId: string, buys: number, sells: number }> = {};
        recentGlobalTransactions.forEach(tx => {
            if (!tradeCounts[tx.artistId]) tradeCounts[tx.artistId] = { artistId: tx.artistId, buys: 0, sells: 0 };
            if (tx.type === 'invest') tradeCounts[tx.artistId].buys += tx.amount;
            else if (tx.type === 'sell') tradeCounts[tx.artistId].sells += tx.amount;
        });

        const mostTraded: MostTraded[] = Object.values(tradeCounts).map(counts => ({
            artist: artists[counts.artistId],
            buys: counts.buys,
            sells: counts.sells,
        }))
        .filter(item => item.artist)
        .sort((a,b) => (b.buys + b.sells) - (a.buys + a.sells))
        .slice(0, 5);
        
        return { netWorthChange, marketMovers, mostTraded };

    }, [userData, netWorth, artists, allUserData]);

    // Component Rendering
    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading Stockify...</div>;
    }

    if (!userData) {
        return <LoginPage onSignIn={handleSignIn} />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans bg-grid">
            <Header
                currentPage={currentPage}
                onNavigate={handleNavigate}
                username={userData.username}
                userCredits={userData.credits}
                onSignOut={handleSignOut}
                simulationStartDate={userData.simulationStartDate}
                simulatedDays={userData.simulatedDays}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {currentPage === 'home' && (
                    <HomePage 
                        username={userData.username}
                        netWorthChange={homePageData.netWorthChange}
                        marketMovers={homePageData.marketMovers}
                        mostTraded={homePageData.mostTraded}
                        onViewDetail={handleViewDetail}
                    />
                )}
                {currentPage === 'portfolio' && (
                    <Portfolio 
                        portfolioItems={portfolioItems} 
                        netWorth={netWorth}
                        netWorthHistory={userData.netWorthHistory}
                        onViewDetail={handleViewDetail}
                        onSellClick={setSellModalItem}
                    />
                )}
                {currentPage === 'trade' && (
                    <TradePage 
                        onInvest={setInvestModalArtist}
                        onViewDetail={handleViewDetail}
                        trackedArtists={trackedArtists}
                        transactions={userData.transactions}
                    />
                )}
                {currentPage === 'leaderboard' && <LeaderboardPage />}
                {currentPage === 'faq' && <FAQPage />}
            </main>
            
            {investModalArtist && (
                <InvestmentModal 
                    artist={investModalArtist} 
                    userCredits={userData.credits}
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
                    investments={userData.investments.filter(i => i.artistId === detailArtist.id)}
                    onClose={() => setDetailArtist(null)}
                    onInvest={handleInvestFromDetail}
                    onSell={handleSellFromDetail}
                />
            )}

            {showWelcomeModal && (
                <WelcomeModal 
                    onClose={() => {
                        setShowWelcomeModal(false);
                        const updatedUser = { ...userData, hasSeenWelcome: true };
                        setUserData(updatedUser);
                        const allUsers = getAllUserData();
                        saveAllUserData({ ...allUsers, [userData.username]: updatedUser });
                    }}
                    onNavigateToFaq={() => {
                         setShowWelcomeModal(false);
                         setCurrentPage('faq');
                         const updatedUser = { ...userData, hasSeenWelcome: true };
                         setUserData(updatedUser);
                         const allUsers = getAllUserData();
                         saveAllUserData({ ...allUsers, [userData.username]: updatedUser });
                    }}
                />
            )}
        </div>
    );
};

export default App;

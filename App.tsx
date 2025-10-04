// Fix: Provide full implementation for the main App component.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Page,
  Artist,
  UserData,
  Investment,
  Transaction,
  PortfolioItem,
  FollowerHistoryPoint,
  MarketMover,
  MostTraded
} from './types';
import { signIn, signOut, loadUser, saveAllUserData, getAllUserData } from './services/authService';
import { getMultipleArtistsByIds } from './services/spotifyService';
import { SIMULATION_TICK_RATE_MS, DAYS_PER_TICK, FOLLOWER_GROWTH_RATE_MIN, FOLLOWER_GROWTH_RATE_MAX, POPULARITY_INFLUENCE } from './constants';

import Header from './components/Header';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import Portfolio from './components/Portfolio';
import TradePage from './components/TradePage';
import LeaderboardPage from './components/LeaderboardPage';
import FAQPage from './components/FAQPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import ArtistDetailPage from './components/ArtistDetailPage';
import WelcomeModal from './components/WelcomeModal';

// Main App Component
const App: React.FC = () => {
    // State management
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [artists, setArtists] = useState<Record<string, Artist>>({});
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal states
    const [investModalArtist, setInvestModalArtist] = useState<Artist | null>(null);
    const [sellModalItem, setSellModalItem] = useState<PortfolioItem | null>(null);
    const [detailArtist, setDetailArtist] = useState<Artist | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);

    // Market data state
    const [marketMovers, setMarketMovers] = useState<{ gainers: MarketMover[], losers: MarketMover[] }>({ gainers: [], losers: [] });
    const [mostTraded, setMostTraded] = useState<MostTraded[]>([]);
    const [netWorthChange, setNetWorthChange] = useState(0);


    // --- UTILITY & CALCULATION FUNCTIONS ---

    const calculateCurrentValue = useCallback((investment: Investment, currentFollowers: number): number => {
        if (investment.initialFollowers === 0) return investment.initialInvestment;
        const growth = (currentFollowers - investment.initialFollowers) / investment.initialFollowers;
        return investment.initialInvestment * (1 + growth);
    }, []);

    const portfolioItems = useMemo((): PortfolioItem[] => {
        if (!userData) return [];

        const items: Record<string, PortfolioItem> = {};
        userData.investments.forEach(investment => {
            const artist = artists[investment.artistId];
            if (!artist) return;

            const currentValue = calculateCurrentValue(investment, artist.followers);

            if (!items[artist.id]) {
                items[artist.id] = {
                    artist,
                    investments: [],
                    totalInvestment: 0,
                    currentValue: 0,
                    profitOrLoss: 0,
                    profitOrLossPercentage: 0,
                };
            }

            items[artist.id].investments.push(investment);
            items[artist.id].totalInvestment += investment.initialInvestment;
            items[artist.id].currentValue += currentValue;
        });

        return Object.values(items).map(item => {
            const profitOrLoss = item.currentValue - item.totalInvestment;
            const profitOrLossPercentage = item.totalInvestment > 0 ? (profitOrLoss / item.totalInvestment) * 100 : 0;
            return { ...item, profitOrLoss, profitOrLossPercentage };
        });
    }, [userData, artists, calculateCurrentValue]);

    const netWorth = useMemo(() => {
        if (!userData) return 0;
        const holdingsValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        return userData.credits + holdingsValue;
    }, [userData, portfolioItems]);

    // --- ACTION HANDLERS ---
    const handleViewDetail = useCallback(async (artistId: string) => {
        const existingArtist = artists[artistId];
        if (existingArtist) {
            setDetailArtist(existingArtist);
            return;
        }

        try {
            const spotifyArtists = await getMultipleArtistsByIds([artistId]);
            if (spotifyArtists.length > 0) {
                const newArtistData = spotifyArtists[0];
                const newArtist: Artist = {
                    ...newArtistData,
                    followerHistory: [{ date: Date.now(), count: newArtistData.followers }],
                };
                // Add to central state to avoid re-fetching and to make it available for simulation
                setArtists(prev => ({...prev, [newArtist.id]: newArtist}));
                setDetailArtist(newArtist);
            } else {
                setDetailArtist(null); // Artist not found by ID
            }
        } catch (error) {
            console.error("Failed to fetch artist details for detail view:", error);
            setDetailArtist(null);
        }
    }, [artists]);


    // --- DATA FETCHING & INITIALIZATION ---

    const fetchAndUpdateArtists = useCallback(async (artistIds: string[]) => {
        if (artistIds.length === 0) return;
        try {
            const spotifyArtists = await getMultipleArtistsByIds(artistIds);
            setArtists(prev => {
                const newArtists = { ...prev };
                spotifyArtists.forEach(sa => {
                    const existing = prev[sa.id] || { followerHistory: [] };
                    newArtists[sa.id] = { ...existing, ...sa };
                });
                return newArtists;
            });
        } catch (error) {
            console.error("Failed to fetch artist data:", error);
        }
    }, []);

    // Load user and initial data
    useEffect(() => {
        const activeUser = loadUser();
        if (activeUser) {
            const { userData: loadedUserData, isNewUser } = signIn(activeUser.username);
            setUser(activeUser);
            setUserData(loadedUserData);
            if (isNewUser && !loadedUserData.hasSeenWelcome) {
                setShowWelcomeModal(true);
            }
        }
        setIsLoading(false);
    }, []);
    
    // Fetch artist data when user data changes
    useEffect(() => {
        if (userData) {
            const artistIds = [...new Set(userData.investments.map(inv => inv.artistId))];
            fetchAndUpdateArtists(artistIds);
        }
    }, [userData, fetchAndUpdateArtists]);

    // --- GAME SIMULATION LOGIC ---

    useEffect(() => {
        if (!user || !userData) return;
        
        const tick = () => {
            const now = Date.now();
            // Simulate artist follower growth
            const updatedArtists = { ...artists };
            let artistsChanged = false;
            Object.values(updatedArtists).forEach(artist => {
                const growthFactor = (FOLLOWER_GROWTH_RATE_MIN + Math.random() * (FOLLOWER_GROWTH_RATE_MAX - FOLLOWER_GROWTH_RATE_MIN)) 
                                   + (artist.popularity / 100) * POPULARITY_INFLUENCE;
                
                const newFollowers = Math.floor(artist.followers * (1 + growthFactor * DAYS_PER_TICK));
                
                if (newFollowers > artist.followers) {
                    artistsChanged = true;
                    const newHistoryPoint: FollowerHistoryPoint = { date: now, count: newFollowers };
                    artist.followers = newFollowers;
                    artist.followerHistory = [...artist.followerHistory, newHistoryPoint].slice(-30); // Keep last 30 points
                }
            });

            if (artistsChanged) {
                setArtists(updatedArtists);
            }
            
            // Update user data for simulation days and net worth history
            setUserData(prev => {
                if (!prev) return null;
                const newSimulatedDays = prev.simulatedDays + DAYS_PER_TICK;
                const lastHistory = prev.netWorthHistory[prev.netWorthHistory.length - 1];
                const newNetWorthHistory = [...prev.netWorthHistory];

                // Add new history point if it's a new "day" in the history
                if (!lastHistory || new Date(lastHistory.date).toDateString() !== new Date(now).toDateString()) {
                     newNetWorthHistory.push({ date: now, netWorth });
                } else {
                     lastHistory.netWorth = netWorth; // Update today's net worth
                }

                return {
                    ...prev,
                    simulatedDays: newSimulatedDays,
                    netWorthHistory: newNetWorthHistory.slice(-30), // Keep last 30 points
                    lastTickDate: now,
                };
            });
        };

        const intervalId = setInterval(tick, SIMULATION_TICK_RATE_MS);
        return () => clearInterval(intervalId);
    }, [user, userData, artists, netWorth]);
    
    // Save all user data to local storage on change
    useEffect(() => {
        if (userData) {
            const allData = getAllUserData();
            saveAllUserData({ ...allData, [userData.username]: userData });
        }
    }, [userData]);


    // --- USER ACTIONS ---

    const handleSignIn = (username: string) => {
        const { userData: newUserData, isNewUser } = signIn(username);
        setUser({ username });
        setUserData(newUserData);
        if (isNewUser && !newUserData.hasSeenWelcome) {
            setShowWelcomeModal(true);
        }
    };
    
    const handleSignOut = () => {
        signOut();
        setUser(null);
        setUserData(null);
        setCurrentPage('home');
    };

    const handleInvest = (artist: Artist, amount: number) => {
        if (!userData || userData.credits < amount) return;

        const newInvestment: Investment = {
            id: `inv_${Date.now()}`,
            artistId: artist.id,
            initialInvestment: amount,
            initialFollowers: artist.followers,
            timestamp: Date.now(),
        };

        const newTransaction: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'invest',
            artistName: artist.name,
            artistId: artist.id,
            amount: amount,
            timestamp: Date.now(),
        };

        setUserData(prev => prev && ({
            ...prev,
            credits: prev.credits - amount,
            investments: [...prev.investments, newInvestment],
            transactions: [newTransaction, ...prev.transactions],
        }));

        // Add artist to tracked artists if not already there
        if (!artists[artist.id]) {
            setArtists(prev => ({ ...prev, [artist.id]: { ...artist, followerHistory: [{ date: Date.now(), count: artist.followers }] }}));
        }
        
        setInvestModalArtist(null);
    };

    const handleSell = (item: PortfolioItem, amountToSell: number) => {
        if (!userData) return;

        const percentageToSell = amountToSell / item.currentValue;
        if (percentageToSell > 1) return;

        let remainingInvestments: Investment[] = [];
        let totalRefundedInvestment = 0;

        // Reduce or remove investments proportionally
        userData.investments.forEach(inv => {
            if (inv.artistId !== item.artist.id) {
                remainingInvestments.push(inv);
            } else {
                totalRefundedInvestment += inv.initialInvestment * percentageToSell;
                const remainingInitialInvestment = inv.initialInvestment * (1 - percentageToSell);
                if (remainingInitialInvestment > 1) { // Threshold to avoid tiny dust investments
                    remainingInvestments.push({ ...inv, initialInvestment: remainingInitialInvestment });
                }
            }
        });

        const newTransaction: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'sell',
            artistName: item.artist.name,
            artistId: item.artist.id,
            amount: amountToSell,
            timestamp: Date.now(),
        };
        
        setUserData(prev => prev && ({
            ...prev,
            credits: prev.credits + amountToSell,
            investments: remainingInvestments,
            transactions: [newTransaction, ...prev.transactions],
        }));

        setSellModalItem(null);
        setDetailArtist(null); // Close detail modal if open
    };
    
    const handleCloseWelcome = () => {
        setShowWelcomeModal(false);
        if (userData) {
            setUserData(prev => prev && ({ ...prev, hasSeenWelcome: true }));
        }
    };


    // --- RENDER LOGIC ---

    if (isLoading) {
        return <div className="bg-gray-900 min-h-screen"></div>; // Or a proper loading spinner
    }

    if (!user || !userData) {
        return <LoginPage onSignIn={handleSignIn} />;
    }

    const trackedArtists = Object.values(artists).filter(artist => 
        userData.investments.some(inv => inv.artistId === artist.id)
    );

    const renderPage = () => {
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
                          netWorthHistory={userData.netWorthHistory}
                          onViewDetail={handleViewDetail}
                          onSellClick={setSellModalItem}
                        />;
            case 'trade':
                return <TradePage 
                          onInvest={setInvestModalArtist}
                          trackedArtists={trackedArtists}
                          transactions={userData.transactions}
                          onViewDetail={handleViewDetail}
                        />;
            case 'leaderboard':
                return <LeaderboardPage />;
            case 'faq':
                return <FAQPage />;
            default:
                return <div>Page not found</div>;
        }
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans bg-cover bg-fixed" style={{backgroundImage: "url('/background.svg')"}}>
            <Header
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                username={user.username}
                userCredits={userData.credits}
                onSignOut={handleSignOut}
                simulationStartDate={userData.simulationStartDate}
                simulatedDays={userData.simulatedDays}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {renderPage()}
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
                    investments={userData.investments}
                    onClose={() => setDetailArtist(null)}
                    onInvest={setInvestModalArtist}
                    onSell={() => {
                        const item = portfolioItems.find(p => p.artist.id === detailArtist.id);
                        if (item) setSellModalItem(item);
                    }}
                 />
            )}

            {showWelcomeModal && (
                <WelcomeModal onClose={handleCloseWelcome} onNavigateToFaq={() => setCurrentPage('faq')} />
            )}
        </div>
    );
};

export default App;
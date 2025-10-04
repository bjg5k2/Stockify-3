import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Page, User, Artist, PortfolioItem, Investment, Transaction, SpotifyArtist, MarketMover, MostTraded, NetWorthHistoryPoint } from './types';
import { STARTING_CREDITS, SIMULATION_TICK_RATE_MS, DAYS_PER_TICK } from './constants';
import { getUsername, saveUsername, signOut } from './services/authService';
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

const App: React.FC = () => {
    // === STATE ===
    const [user, setUser] = useState<User | null>(null);
    const [artists, setArtists] = useState<Record<string, Artist>>({});
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [isLoading, setIsLoading] = useState(true);
    const [simulationStartDate] = useState(() => Date.now());
    const [simulatedDays, setSimulatedDays] = useState(0);

    // Modal State
    const [investingArtist, setInvestingArtist] = useState<Artist | null>(null);
    const [sellingItem, setSellingItem] = useState<PortfolioItem | null>(null);
    const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    
    // === DERIVED STATE ===
    const portfolioItems: PortfolioItem[] = useMemo(() => {
        if (!user) return [];
        const items: Record<string, PortfolioItem> = {};
        for (const investment of user.investments) {
            const artist = artists[investment.artistId];
            if (!artist) continue;

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
            const item = items[artist.id];
            item.investments.push(investment);
            item.totalInvestment += investment.initialInvestment;
        }

        return Object.values(items).map(item => {
            item.currentValue = item.investments.reduce((sum, inv) => {
                const growth = inv.initialFollowers > 0 ? (item.artist.followers - inv.initialFollowers) / inv.initialFollowers : 0;
                return sum + inv.initialInvestment * (1 + growth);
            }, 0);
            item.profitOrLoss = item.currentValue - item.totalInvestment;
            item.profitOrLossPercentage = item.totalInvestment > 0 ? (item.profitOrLoss / item.totalInvestment) * 100 : 0;
            return item;
        });
    }, [user, artists]);
    
    const netWorth = useMemo(() => {
        if (!user) return 0;
        const portfolioValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
        return user.credits + portfolioValue;
    }, [user, portfolioItems]);
    
    const viewingArtist = useMemo(() => {
        if (!viewingArtistId || !artists[viewingArtistId]) return null;
        return artists[viewingArtistId];
    }, [viewingArtistId, artists]);

    const viewingArtistInvestments = useMemo(() => {
        if (!user || !viewingArtistId) return [];
        return user.investments.filter(inv => inv.artistId === viewingArtistId);
    }, [user, viewingArtistId]);

    // === DATA PERSISTENCE ===
    const saveData = useCallback((updatedUser: User, updatedArtists: Record<string, Artist>) => {
        localStorage.setItem('stockify_user_data', JSON.stringify(updatedUser));
        localStorage.setItem('stockify_artists_data', JSON.stringify(updatedArtists));
    }, []);

    // === HANDLERS ===
    const handleSignIn = (username: string) => {
        const storedUserData = localStorage.getItem('stockify_user_data');
        const storedArtists = localStorage.getItem('stockify_artists_data');

        if (storedUserData) {
            const loadedUser: User = JSON.parse(storedUserData);
            setUser({ ...loadedUser, isNewUser: false, lastLogin: Date.now() });
        } else {
            const newUser: User = {
                id: uuidv4(),
                username,
                credits: STARTING_CREDITS,
                investments: [],
                transactions: [],
                netWorthHistory: [{ date: Date.now(), netWorth: STARTING_CREDITS }],
                lastLogin: Date.now(),
                isNewUser: true,
            };
            setUser(newUser);
            setShowWelcomeModal(true);
        }

        if (storedArtists) {
            setArtists(JSON.parse(storedArtists));
        }

        saveUsername(username);
        setIsLoading(false);
    };

    const handleSignOut = () => {
        signOut();
        setUser(null);
        setArtists({});
        // Optionally clear all game data from localStorage
        localStorage.removeItem('stockify_user_data');
        localStorage.removeItem('stockify_artists_data');
    };

    const handleNavigate = (page: Page) => setCurrentPage(page);

    const handleUpsertArtists = useCallback((newArtists: SpotifyArtist[]) => {
        setArtists(prevArtists => {
            const updatedArtists = { ...prevArtists };
            let hasChanged = false;
            for (const spotifyArtist of newArtists) {
                if (!updatedArtists[spotifyArtist.id]) {
                    updatedArtists[spotifyArtist.id] = {
                        ...spotifyArtist,
                        followerHistory: [{ date: Date.now(), count: spotifyArtist.followers }]
                    };
                    hasChanged = true;
                }
            }
            if (hasChanged && user) {
                saveData(user, updatedArtists);
            }
            return updatedArtists;
        });
    }, [user, saveData]);

    const handleInvest = (artist: Artist, amount: number) => {
        if (!user || user.credits < amount) return;

        const newInvestment: Investment = {
            id: uuidv4(),
            artistId: artist.id,
            initialInvestment: amount,
            initialFollowers: artist.followers,
            timestamp: Date.now(),
        };

        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'invest',
            artistId: artist.id,
            artistName: artist.name,
            amount: amount,
            timestamp: Date.now(),
        };

        const updatedUser: User = {
            ...user,
            credits: user.credits - amount,
            investments: [...user.investments, newInvestment],
            transactions: [newTransaction, ...user.transactions],
        };

        setUser(updatedUser);
        saveData(updatedUser, artists);
        setInvestingArtist(null);
    };
    
    const handleSell = (item: PortfolioItem, amountToSell: number) => {
        if (!user || item.currentValue < amountToSell) return;

        const sellRatio = amountToSell / item.currentValue;
        const remainingInvestments: Investment[] = [];
        const investmentsToKeep = item.investments.map(inv => {
            const remainingInvestmentValue = inv.initialInvestment * (1 - sellRatio);
            if (remainingInvestmentValue > 1) { // Keep investment if value is not negligible
                return { ...inv, initialInvestment: remainingInvestmentValue };
            }
            return null;
        }).filter((inv): inv is Investment => inv !== null);

        const otherInvestments = user.investments.filter(inv => inv.artistId !== item.artist.id);

        const newTransaction: Transaction = {
            id: uuidv4(),
            type: 'sell',
            artistId: item.artist.id,
            artistName: item.artist.name,
            amount: amountToSell,
            timestamp: Date.now(),
        };

        const updatedUser: User = {
            ...user,
            credits: user.credits + amountToSell,
            investments: [...otherInvestments, ...investmentsToKeep],
            transactions: [newTransaction, ...user.transactions],
        };
        setUser(updatedUser);
        saveData(updatedUser, artists);
        setSellingItem(null);
    };

    // === SIMULATION LOOP ===
    useEffect(() => {
        if (!user) return;

        const gameLoop = setInterval(async () => {
            const artistIds = Object.keys(artists);
            if (artistIds.length === 0) return;

            try {
                const updatedSpotifyArtists = await getMultipleArtistsByIds(artistIds);
                setArtists(prev => {
                    const newArtistsState = { ...prev };
                    let changed = false;
                    for (const spotifyArtist of updatedSpotifyArtists) {
                        const existingArtist = newArtistsState[spotifyArtist.id];
                        if (existingArtist && existingArtist.followers !== spotifyArtist.followers) {
                            newArtistsState[spotifyArtist.id] = {
                                ...existingArtist,
                                followers: spotifyArtist.followers,
                                popularity: spotifyArtist.popularity,
                                followerHistory: [
                                    ...existingArtist.followerHistory,
                                    { date: Date.now(), count: spotifyArtist.followers }
                                ].slice(-30) // Keep last 30 points
                            };
                            changed = true;
                        }
                    }
                    if (changed) {
                        saveData(user, newArtistsState);
                    }
                    return newArtistsState;
                });

                setSimulatedDays(prev => prev + DAYS_PER_TICK);

                // Update Net Worth History
                setUser(currentUser => {
                    if (!currentUser) return null;
                    const newNetWorthPoint: NetWorthHistoryPoint = { date: Date.now(), netWorth };
                    const updatedHistory = [...currentUser.netWorthHistory, newNetWorthPoint].slice(-30); // Keep last 30 days
                    const updatedUser = { ...currentUser, netWorthHistory: updatedHistory };
                    saveData(updatedUser, artists);
                    return updatedUser;
                });


            } catch (error) {
                console.error("Error during simulation tick:", error);
            }
        }, SIMULATION_TICK_RATE_MS);

        return () => clearInterval(gameLoop);
    }, [user, artists, netWorth, saveData]);
    
    // === INITIAL LOAD ===
    useEffect(() => {
        const loggedInUsername = getUsername();
        if (loggedInUsername) {
            handleSignIn(loggedInUsername);
        } else {
            setIsLoading(false);
        }
    }, []);

    // Placeholder data for home page until real data logic is implemented
    const marketMovers: { gainers: MarketMover[], losers: MarketMover[] } = { gainers: [], losers: [] };
    const mostTraded: MostTraded[] = [];


    // === RENDER LOGIC ===
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>;
    }

    if (!user) {
        return <LoginPage onSignIn={handleSignIn} />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.3),rgba(255,255,255,0))]">
            <Header
                currentPage={currentPage}
                onNavigate={handleNavigate}
                username={user.username}
                userCredits={user.credits}
                onSignOut={handleSignOut}
                simulationStartDate={simulationStartDate}
                simulatedDays={simulatedDays}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {currentPage === 'home' && <HomePage username={user.username} netWorthChange={0} marketMovers={marketMovers} mostTraded={mostTraded} onViewDetail={setViewingArtistId} />}
                {currentPage === 'portfolio' && <Portfolio portfolioItems={portfolioItems} netWorth={netWorth} netWorthHistory={user.netWorthHistory} onViewDetail={setViewingArtistId} onSellClick={setSellingItem} />}
                {currentPage === 'trade' && <TradePage onInvest={setInvestingArtist} onViewDetail={setViewingArtistId} marketArtists={Object.values(artists)} transactions={user.transactions} onUpsertArtist={handleUpsertArtists} />}
                {currentPage === 'leaderboard' && <LeaderboardPage />}
                {currentPage === 'faq' && <FAQPage />}
            </main>
            
            {/* Modals */}
            {investingArtist && (
                <InvestmentModal
                    artist={investingArtist}
                    userCredits={user.credits}
                    onInvest={handleInvest}
                    onClose={() => setInvestingArtist(null)}
                />
            )}
            {sellingItem && (
                 <SellModal
                    portfolioItem={sellingItem}
                    onSell={handleSell}
                    onClose={() => setSellingItem(null)}
                />
            )}
            {viewingArtist && (
                <ArtistDetailPage
                    artist={viewingArtist}
                    investments={viewingArtistInvestments}
                    onClose={() => setViewingArtistId(null)}
                    onInvest={setInvestingArtist}
                    onSell={() => {
                        const item = portfolioItems.find(p => p.artist.id === viewingArtistId);
                        if (item) setSellingItem(item);
                    }}
                />
            )}
            {showWelcomeModal && (
                <WelcomeModal onClose={() => setShowWelcomeModal(false)} onNavigateToFaq={() => { setShowWelcomeModal(false); setCurrentPage('faq'); }} />
            )}
        </div>
    );
};

export default App;

// App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Artist, Investment, SpotifyArtist, LocalUser } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';

import Header from './components/Header';
import HomePage from './components/HomePage';
import TradePage from './components/TradePage';
import Portfolio from './components/Portfolio';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';
import ArtistDetailPage from './components/ArtistDetailPage';
import LoginPage from './components/LoginPage';

type Page = 'home' | 'trade' | 'portfolio';

const INITIAL_CREDITS = 10000;
const LOCAL_STORAGE_KEY = 'stockify_save_data';

interface GameState {
    user: LocalUser;
    credits: number;
    investments: Investment[];
    netWorthHistory: { timestamp: number; count: number }[];
    lastUpdated: string;
}

const App: React.FC = () => {
    const [localUser, setLocalUser] = useState<LocalUser | null>(null);
    const [credits, setCredits] = useState<number>(INITIAL_CREDITS);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [netWorthHistory, setNetWorthHistory] = useState<{ timestamp: number; count: number }[]>([]);
    const [artistsInMarket, setArtistsInMarket] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [artistToInvest, setArtistToInvest] = useState<Artist | null>(null);
    const [investmentToSell, setInvestmentToSell] = useState<{ investment: Investment, artist: Artist, currentValue: number } | null>(null);
    const [artistToView, setArtistToView] = useState<Artist | null>(null);

    // Initial load from localStorage and fetch market data
    useEffect(() => {
        const loadGame = async () => {
            // Load saved data from local storage
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                try {
                    const parsedData: GameState = JSON.parse(savedData);
                    setLocalUser(parsedData.user);
                    setCredits(parsedData.credits);
                    setInvestments(parsedData.investments);
                    setNetWorthHistory(parsedData.netWorthHistory);
                } catch {
                    console.error("Failed to parse saved data. Starting fresh.");
                }
            }

            // Fetch initial artist data
            try {
                const spotifyArtists = await getMultipleArtistsByIds(ARTIST_IDS_IN_MARKET);
                const artistsWithHistory = spotifyArtists.map(sa => ({
                    ...sa,
                    followerHistory: generateRandomHistory(sa.followers),
                }));
                setArtistsInMarket(artistsWithHistory);
            } catch (error) {
                console.error("Failed to fetch initial artist data", error);
            } finally {
                setLoading(false);
            }
        };
        loadGame();
    }, []);

    // Save game state to localStorage whenever it changes
    useEffect(() => {
        if (!loading && localUser) {
            const gameState: GameState = {
                user: localUser,
                credits,
                investments,
                netWorthHistory,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
        }
    }, [localUser, credits, investments, netWorthHistory, loading]);

    const netWorth = useMemo(() => {
        return investments.reduce((total, inv) => {
            const artist = artistsInMarket.find(a => a.id === inv.artistId);
            if (!artist) return total;
            const growth = inv.initialFollowers > 0 ? (artist.followers - inv.initialFollowers) / inv.initialFollowers : 0;
            return total + inv.initialInvestment * (1 + growth);
        }, credits);
    }, [investments, credits, artistsInMarket]);
    
    // Update net worth history periodically
     useEffect(() => {
        const interval = setInterval(() => {
            if (localUser) {
                setNetWorthHistory(prev => {
                    const newHistory = [...prev, { timestamp: Date.now(), count: netWorth }];
                    if (newHistory.length > 30) newHistory.shift(); // Keep history to 30 points
                    return newHistory;
                });
            }
        }, 60 * 1000); // every minute
        return () => clearInterval(interval);
    }, [netWorth, localUser]);


    const handleLogin = (username: string) => {
        const newUser: LocalUser = {
            userId: `user_${Date.now()}`,
            username: username
        };
        setLocalUser(newUser);
        setCredits(INITIAL_CREDITS);
        setInvestments([]);
        setNetWorthHistory([{ timestamp: Date.now(), count: INITIAL_CREDITS }]);
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your game? All progress will be lost.")) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            setLocalUser(null);
            setCredits(INITIAL_CREDITS);
            setInvestments([]);
            setNetWorthHistory([]);
            setCurrentPage('home');
        }
    };

    const handleInvest = (artistId: string, amount: number) => {
        const artist = artistsInMarket.find(a => a.id === artistId);
        if (!artist || amount > credits || amount <= 0) {
            return;
        }

        const newInvestment: Investment = {
            id: `inv_${artist.id}_${Date.now()}`,
            artistId: artist.id,
            initialInvestment: amount,
            initialFollowers: artist.followers,
            timestamp: Date.now(),
        };

        setCredits(prev => prev - amount);
        setInvestments(prev => [...prev, newInvestment]);
        setArtistToInvest(null);
    };

    const handleSell = (investmentToSell: Investment, sellValue: number) => {
        setCredits(prev => prev + sellValue);
        setInvestments(prev => prev.filter(inv => inv.id !== investmentToSell.id));
        setInvestmentToSell(null);
    };

    const handleAddArtist = async (spotifyArtist: SpotifyArtist): Promise<Artist> => {
        const newArtist: Artist = {
            ...spotifyArtist,
            followerHistory: generateRandomHistory(spotifyArtist.followers),
        };
        setArtistsInMarket(prev => {
            if (prev.find(a => a.id === newArtist.id)) {
                return prev;
            }
            return [...prev, newArtist];
        });
        return newArtist;
    };
    
    const handleUpdateArtists = (updatedArtists: SpotifyArtist[]) => {
        setArtistsInMarket(prevMarket => {
            return prevMarket.map(marketArtist => {
                const updated = updatedArtists.find(ua => ua.id === marketArtist.id);
                if (updated && updated.followers !== marketArtist.followers) {
                    const newHistory = [...marketArtist.followerHistory, { timestamp: Date.now(), count: updated.followers }];
                    if (newHistory.length > 30) newHistory.shift();
                    return { ...marketArtist, followers: updated.followers, followerHistory: newHistory };
                }
                return marketArtist;
            });
        });
    };

    if (loading) {
        return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!localUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const renderPage = () => {
        if (artistToView) {
            return <ArtistDetailPage
                artist={artistToView}
                investments={investments}
                onBack={() => setArtistToView(null)}
                onInvest={setArtistToInvest}
            />;
        }

        switch (currentPage) {
            case 'home':
                return <HomePage onNavigateToTrade={() => setCurrentPage('trade')} />;
            case 'trade':
                return <TradePage
                    artistsInMarket={artistsInMarket}
                    onInvest={setArtistToInvest}
                    onViewDetail={setArtistToView}
                    onAddArtist={handleAddArtist}
                />;
            case 'portfolio':
                return <Portfolio
                    investments={investments}
                    artists={artistsInMarket}
                    onOpenSellModal={(investment, currentValue) => {
                        const artist = artistsInMarket.find(a => a.id === investment.artistId);
                        if (artist) {
                            setInvestmentToSell({ investment, artist, currentValue });
                        }
                    }}
                    netWorthHistory={netWorthHistory}
                    onViewDetail={setArtistToView}
                    onUpdateArtists={handleUpdateArtists}
                />;
            default:
                return <HomePage onNavigateToTrade={() => setCurrentPage('trade')} />;
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header
                currentPage={currentPage}
                onNavigate={setCurrentPage}
                userCredits={credits}
                netWorth={netWorth}
                username={localUser.username}
                onReset={handleReset}
            />
            <main className="container mx-auto px-4 py-8 pt-24">
                {renderPage()}
            </main>

            {artistToInvest && (
                <InvestmentModal
                    artist={artistToInvest}
                    userCredits={credits}
                    onInvest={handleInvest}
                    onClose={() => setArtistToInvest(null)}
                />
            )}

            {investmentToSell && (
                <SellModal
                    investment={investmentToSell.investment}
                    artist={investmentToSell.artist}
                    currentValue={investmentToSell.currentValue}
                    onSell={() => handleSell(investmentToSell.investment, investmentToSell.currentValue)}
                    onClose={() => setInvestmentToSell(null)}
                />
            )}
        </div>
    );
};

export default App;

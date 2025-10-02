import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Artist, SpotifyArtist, Investment } from './types';
import { ARTIST_IDS_IN_MARKET, generateRandomHistory } from './constants';
import { getMultipleArtistsByIds } from './services/spotifyService';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import TradePage from './components/TradePage';
import Portfolio from './components/Portfolio';
import ArtistDetailPage from './components/ArtistDetailPage';
import InvestmentModal from './components/InvestmentModal';
import SellModal from './components/SellModal';

const INITIAL_CREDITS = 10000;
const LOCAL_STORAGE_PREFIX = 'stockify_';

const App: React.FC = () => {
    const [user, setUser] = useState<{ username: string } | null>(null);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [userCredits, setUserCredits] = useState<number>(INITIAL_CREDITS);
    const [currentPage, setCurrentPage] = useState<'home' | 'trade' | 'portfolio' | 'leaderboard'>('home');
    const [selectedArtistForDetail, setSelectedArtistForDetail] = useState<Artist | null>(null);
    const [modal, setModal] = useState<{ type: 'invest' | 'sell'; artist: Artist; investments?: Investment[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const netWorth = useMemo(() => {
        const holdingsValue = investments.reduce((sum, inv) => {
            const artist = artists.find(a => a.id === inv.artistId);
            if (!artist) return sum;
            const growth = inv.initialFollowers > 0 ? (artist.followers - inv.initialFollowers) / inv.initialFollowers : 0;
            return sum + inv.initialInvestment * (1 + growth);
        }, 0);
        return userCredits + holdingsValue;
    }, [userCredits, investments, artists]);
    
    // --- Data Persistence ---
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}user`);
            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                const savedCredits = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${parsedUser.username}_credits`);
                const savedInvestments = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${parsedUser.username}_investments`);
                if (savedCredits) setUserCredits(JSON.parse(savedCredits));
                if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    useEffect(() => {
        if (user) {
            try {
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}user`, JSON.stringify(user));
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${user.username}_credits`, JSON.stringify(userCredits));
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${user.username}_investments`, JSON.stringify(investments));
            } catch (e) {
                console.error("Failed to save data to localStorage", e);
            }
        }
    }, [user, userCredits, investments]);


    // --- Data Fetching ---
    const fetchMarketArtists = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const spotifyArtists = await getMultipleArtistsByIds(ARTIST_IDS_IN_MARKET);
            const marketArtists = spotifyArtists.map(sa => ({
                ...sa,
                followerHistory: generateRandomHistory(sa.followers),
            }));
            setArtists(marketArtists);
        } catch (err: any) {
            setError(err.message || 'Failed to load artist data. Please check your Spotify credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchMarketArtists();
        } else {
            setIsLoading(false);
        }
    }, [user, fetchMarketArtists]);

    // --- Handlers ---
    const handleSignIn = (username: string) => {
        const userData = { username };
        setUser(userData);
        // Load or initialize user-specific data
        const savedCredits = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${username}_credits`);
        const savedInvestments = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${username}_investments`);
        setUserCredits(savedCredits ? JSON.parse(savedCredits) : INITIAL_CREDITS);
        setInvestments(savedInvestments ? JSON.parse(savedInvestments) : []);
        setCurrentPage('home');
    };

    const handleSignOut = () => {
        localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}user`);
        setUser(null);
        setArtists([]);
        setInvestments([]);
        setUserCredits(INITIAL_CREDITS);
    };

    const handleInvest = (artistId: string, amount: number) => {
        const artist = artists.find(a => a.id === artistId);
        if (!artist || amount <= 0 || amount > userCredits) return;

        const newInvestment: Investment = {
            id: `inv_${Date.now()}_${Math.random()}`,
            artistId,
            initialInvestment: amount,
            initialFollowers: artist.followers,
            timestamp: Date.now(),
        };
        
        setUserCredits(prev => prev - amount);
        setInvestments(prev => [...prev, newInvestment]);
        setModal(null);
    };

    const handleSell = (artistId: string, sellValue: number) => {
        setUserCredits(prev => prev + sellValue);
        setInvestments(prev => prev.filter(inv => inv.artistId !== artistId));
        setModal(null);
    };

    const handleAddArtist = async (spotifyArtist: SpotifyArtist): Promise<Artist> => {
        const newArtist: Artist = {
            ...spotifyArtist,
            followerHistory: generateRandomHistory(spotifyArtist.followers),
        };
        setArtists(prev => [...prev, newArtist]);
        return newArtist;
    };
    
    const handleViewDetail = (artistId: string) => {
        const artist = artists.find(a => a.id === artistId);
        if(artist) {
            setSelectedArtistForDetail(artist);
        }
    };
    
    const handleNavigate = (page: 'home' | 'trade' | 'portfolio' | 'leaderboard') => {
        setSelectedArtistForDetail(null);
        setCurrentPage(page);
    };
    
    // --- Render Logic ---
    if (!user) {
        return <LoginPage onSignIn={handleSignIn} />;
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading Artist Data...</div>;
    }

    const renderContent = () => {
        if (selectedArtistForDetail) {
            return (
                <ArtistDetailPage
                    artist={selectedArtistForDetail}
                    investments={investments}
                    onBack={() => setSelectedArtistForDetail(null)}
                    onInvest={(artist) => setModal({ type: 'invest', artist })}
                    onSell={(artist, artistInvestments) => setModal({ type: 'sell', artist, investments: artistInvestments })}
                />
            );
        }

        switch (currentPage) {
            case 'trade':
                return <TradePage
                    artistsInMarket={artists}
                    onInvest={(artist) => setModal({ type: 'invest', artist })}
                    onViewDetail={handleViewDetail}
                    onAddArtist={handleAddArtist}
                />;
            case 'portfolio':
                return <Portfolio 
                    investments={investments} 
                    artists={artists} 
                    onViewDetail={handleViewDetail} 
                />;
            case 'home':
            default:
                return <HomePage onNavigateToTrade={() => handleNavigate('trade')} />;
        }
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/40">
            <Header
                currentPage={selectedArtistForDetail ? 'trade' : currentPage}
                onNavigate={handleNavigate}
                userCredits={userCredits}
                netWorth={netWorth}
                username={user.username}
                onSignOut={handleSignOut}
            />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-8">
                 {error ? <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div> : renderContent()}
            </main>

            {modal?.type === 'invest' && (
                <InvestmentModal
                    artist={modal.artist}
                    userCredits={userCredits}
                    onInvest={handleInvest}
                    onClose={() => setModal(null)}
                />
            )}
            {modal?.type === 'sell' && modal.investments && (
                 <SellModal
                    artist={modal.artist}
                    investments={modal.investments}
                    onSell={handleSell}
                    onClose={() => setModal(null)}
                />
            )}
        </div>
    );
}

export default App;

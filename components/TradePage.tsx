import React, { useState, useEffect } from 'react';
import { Artist, SpotifyArtist } from '../types';
import ArtistList from './ArtistList';
import { SearchIcon } from './icons';
import { searchArtists } from '../services/spotifyService';

interface SearchResultCardProps {
    spotifyArtist: SpotifyArtist;
    isInMarket: boolean;
    onTrade: () => void;
    onViewDetail: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ spotifyArtist, isInMarket, onTrade, onViewDetail }) => (
    <div 
        onClick={onViewDetail}
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-3 flex items-center space-x-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl hover:scale-[1.03] cursor-pointer group border border-gray-700/80"
    >
        <img src={spotifyArtist.imageUrl} alt={spotifyArtist.name} className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-gray-700/50" />
        <div className="flex-1 min-w-0">
            <h3 className="text-md font-bold text-white truncate">{spotifyArtist.name}</h3>
            <p className="text-xs text-gray-300">{spotifyArtist.followers.toLocaleString()} Followers</p>
        </div>
        <button
            onClick={(e) => {
                e.stopPropagation();
                onTrade();
            }}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-emerald-500/30 whitespace-nowrap z-10 relative"
        >
            {isInMarket ? 'Invest' : 'Add & Invest'}
        </button>
    </div>
);

// Fix: Defined props interface for the TradePage component.
interface TradePageProps {
    artistsInMarket: Artist[];
    onInvest: (artist: Artist) => void;
    onViewDetail: (artist: Artist) => void;
    onAddArtist: (spotifyArtist: SpotifyArtist) => Promise<Artist>;
}

const TradePage: React.FC<TradePageProps> = ({ artistsInMarket, onInvest, onViewDetail, onAddArtist }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        const debounceSearch = setTimeout(() => {
            const performSearch = async () => {
                setIsSearching(true);
                setError(null);
                try {
                    const results = await searchArtists(searchTerm);
                    setSearchResults(results);
                } catch (err: any) {
                    setError(err.message || 'Failed to fetch artists. Please try again.');
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            };
            performSearch();
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceSearch);
    }, [searchTerm]);

    const handleTradeClick = async (spotifyArtist: SpotifyArtist) => {
        const existingArtist = artistsInMarket.find(a => a.id === spotifyArtist.id);
        if (existingArtist) {
            onInvest(existingArtist);
        } else {
            // Add the artist to the market, then trigger investment
            const newMarketArtist = await onAddArtist(spotifyArtist);
            onInvest(newMarketArtist);
        }
    };
    
    const handleViewSearchDetail = async (spotifyArtist: SpotifyArtist) => {
        const existingArtist = artistsInMarket.find(a => a.id === spotifyArtist.id);
        if (existingArtist) {
            onViewDetail(existingArtist);
        } else {
            // Add the artist to the market to generate history, then view details
            const newMarketArtist = await onAddArtist(spotifyArtist);
            onViewDetail(newMarketArtist);
        }
    };

    const showSearchResults = searchTerm.trim().length > 0;

    return (
        <div className="animate-fade-in-up">
            <div className="mb-8 sticky top-[80px] z-30 bg-gray-900/50 backdrop-blur-lg border border-gray-700/50 p-4 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-gray-100">Trade Artists</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Spotify for an artist..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-full py-3 pl-12 pr-4 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-colors"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                </div>
            </div>

            {showSearchResults ? (
                <div>
                    <h3 className="text-xl font-semibold mb-4 px-2">Search Results</h3>
                    {isSearching && <p className="text-center text-gray-400 py-8">Searching...</p>}
                    {error && <p className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</p>}
                    {!isSearching && searchResults.length === 0 && !error && (
                        <p className="text-center text-gray-400 py-8">No artists found for "{searchTerm}".</p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(spotifyArtist => {
                            const isInMarket = artistsInMarket.some(a => a.id === spotifyArtist.id);
                            return (
                                <SearchResultCard
                                    key={spotifyArtist.id}
                                    spotifyArtist={spotifyArtist}
                                    isInMarket={isInMarket}
                                    onTrade={() => handleTradeClick(spotifyArtist)}
                                    onViewDetail={() => handleViewSearchDetail(spotifyArtist)}
                                />
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div>
                    <h3 className="text-xl font-semibold mb-4 px-2">Artists In Market</h3>
                    <ArtistList
                        artists={artistsInMarket}
                        onInvest={onInvest}
                        onViewDetail={onViewDetail}
                    />
                </div>
            )}
        </div>
    );
};

export default TradePage;
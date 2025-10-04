
import React, { useState, useEffect } from 'react';
// Fix: Import SpotifyArtist to use in props
import { Artist, Transaction, SpotifyArtist } from '../types';
import { searchArtists } from '../services/spotifyService';
import ArtistList from './ArtistList';
import TransactionItem from './TransactionItem';
import { SearchIcon } from './icons';

interface TradePageProps {
  onInvest: (artist: Artist) => void;
  onViewDetail: (artistId: string) => void;
  // Fix: Renamed prop to marketArtists and added onUpsertArtist
  marketArtists: Artist[];
  transactions: Transaction[];
  onUpsertArtist: (newArtists: SpotifyArtist[]) => void;
}

const TradePage: React.FC<TradePageProps> = ({ onInvest, onViewDetail, marketArtists, transactions, onUpsertArtist }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setSearchResults([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const results = await searchArtists(debouncedQuery);
        // Fix: Call onUpsertArtist to add new artists to the simulation
        onUpsertArtist(results);
        // Spotify API returns SpotifyArtist, we map to Artist for our app components
        const artists: Artist[] = results.map(spotifyArtist => ({
            ...spotifyArtist,
            followerHistory: []
        }));
        setSearchResults(artists);
      } catch (err) {
        console.error("Search failed:", err);
        setError("Failed to fetch artists. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery, onUpsertArtist]);

  const recentTransactions = transactions.slice(0, 10);
  // If user is searching, show search results. Otherwise, show their tracked artists.
  const displayArtists = searchQuery ? searchResults : marketArtists;
  
  return (
    <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-bold mb-2 text-gray-100">Trade & Discover</h2>
        <p className="text-gray-400 mb-6">Search for artists to invest in or view your currently tracked artists.</p>

        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for an artist (e.g., Taylor Swift, Drake)..."
            className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading artists...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-400">{error}</div>
        ) : displayArtists.length > 0 ? (
          <ArtistList artists={displayArtists} onInvest={onInvest} onViewDetail={onViewDetail} />
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
            <h4 className="text-xl font-semibold text-white">
              {searchQuery ? 'No artists found' : 'You are not tracking any artists'}
            </h4>
            <p className="text-gray-400 mt-2">
              {searchQuery ? `Try a different search term.` : `Use the search bar above to find and invest in new artists.`}
            </p>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-6 sticky top-24">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Recent Transactions</h3>
            {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                    {recentTransactions.map(tx => (
                        <TransactionItem key={tx.id} transaction={tx} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-400 text-center py-4">You haven't made any transactions yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TradePage;

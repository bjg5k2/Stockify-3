import React, { useState, useMemo, useEffect } from 'react';
import { Investment, Artist, SpotifyArtist } from '../types';
import PortfolioItem from './PortfolioItem';
import Chart from './Chart';
import { getMultipleArtistsByIds } from '../services/spotifyService';

interface PortfolioProps {
  investments: Investment[];
  artists: Artist[];
  onOpenSellModal: (investment: Investment, currentValue: number) => void;
  netWorthHistory: { timestamp: number; count: number }[];
  onViewDetail: (artist: Artist) => void;
  onUpdateArtists: (updatedArtists: SpotifyArtist[]) => void;
}

type SortOption = 'newest' | 'oldest' | 'largest_investment' | 'highest_return' | 'lowest_return' | 'highest_value';

const UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const Portfolio: React.FC<PortfolioProps> = ({ investments, artists, onOpenSellModal, netWorthHistory, onViewDetail, onUpdateArtists }) => {
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      if (investments.length === 0) {
        return;
      }

      // Check if enough time has passed since the last update
      if (lastUpdated && (new Date().getTime() - lastUpdated.getTime()) < UPDATE_INTERVAL_MS) {
        return;
      }

      setIsUpdating(true);
      const artistIdsInPortfolio = [...new Set(investments.map(inv => inv.artistId))];
      
      if (artistIdsInPortfolio.length > 0) {
        try {
          const updatedArtistsData = await getMultipleArtistsByIds(artistIdsInPortfolio);
          if (updatedArtistsData) {
            onUpdateArtists(updatedArtistsData);
          }
        } catch (error) {
          console.error("Failed to fetch portfolio artist updates:", error);
        } finally {
          setIsUpdating(false);
          setLastUpdated(new Date());
        }
      } else {
        setIsUpdating(false);
      }
    };

    fetchUpdates();
    // This effect should run when the component mounts or when the list of investments changes.
    // We intentionally don't include `lastUpdated` in the dependency array to avoid re-triggering.
  }, [investments, onUpdateArtists]);
  

  const portfolioItemsWithStats = useMemo(() => {
    return investments.map(investment => {
      const artist = artists.find(a => a.id === investment.artistId);
      if (!artist) return null;

      const followerChange = artist.followers - investment.initialFollowers;
      const growthPercentage = investment.initialFollowers > 0 ? followerChange / investment.initialFollowers : 0;
      const currentValue = investment.initialInvestment * (1 + growthPercentage);
      const roi = growthPercentage * 100;

      return { investment, artist, currentValue, roi };
    }).filter((item): item is { investment: Investment; artist: Artist; currentValue: number, roi: number } => item !== null);
  }, [investments, artists]);

  const sortedPortfolioItems = useMemo(() => {
    const sorted = [...portfolioItemsWithStats]; // Create a mutable copy
    switch (sortOption) {
        case 'newest':
            sorted.sort((a, b) => b.investment.timestamp - a.investment.timestamp);
            break;
        case 'oldest':
            sorted.sort((a, b) => a.investment.timestamp - b.investment.timestamp);
            break;
        case 'largest_investment':
            sorted.sort((a, b) => b.investment.initialInvestment - a.investment.initialInvestment);
            break;
        case 'highest_return':
            sorted.sort((a, b) => b.roi - a.roi);
            break;
        case 'lowest_return':
            sorted.sort((a, b) => a.roi - b.roi);
            break;
        case 'highest_value':
            sorted.sort((a, b) => b.currentValue - a.currentValue);
            break;
    }
    return sorted;
  }, [portfolioItemsWithStats, sortOption]);

  const chartColor = useMemo(() => {
    if (netWorthHistory.length < 2) return '#4ade80'; // emerald-400
    const start = netWorthHistory[0].count;
    const end = netWorthHistory[netWorthHistory.length-1].count;
    return end >= start ? '#4ade80' : '#f87171'; // red-400
  }, [netWorthHistory]);

  return (
      <div className="animate-fade-in-up">
          {/* Portfolio Summary and Chart */}
          <div className="mb-8 p-4 sm:p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-4">Portfolio Value History</h2>
              <Chart 
                data={netWorthHistory} 
                strokeColor={chartColor}
                gradientColor={chartColor}
              />
          </div>

          {/* Investments Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 px-2">
              <h2 className="text-2xl font-bold text-white">Your Investments</h2>
              <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                  <div className="text-right text-xs text-gray-400">
                      <span className={`font-semibold ${isUpdating ? 'text-yellow-400' : 'text-emerald-400'}`}>{isUpdating ? 'Syncing...' : 'Live'}</span>
                      <span className="block">
                          {lastUpdated ? `Last: ${lastUpdated.toLocaleTimeString()}` : 'Ready...'}
                      </span>
                  </div>
                  <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                      className="bg-gray-800/60 border border-gray-700 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                      <option value="newest">Sort by: Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="largest_investment">Largest Investment</option>
                      <option value="highest_return">Highest Return %</option>
                      <option value="lowest_return">Lowest Return %</option>
                      <option value="highest_value">Highest Value</option>
                  </select>
              </div>
          </div>
          
          {sortedPortfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedPortfolioItems.map(item => (
                      <PortfolioItem
                          key={item.investment.id}
                          investment={item.investment}
                          currentArtistData={item.artist}
                          onSell={() => onOpenSellModal(item.investment, item.currentValue)}
                          onViewDetail={() => onViewDetail(item.artist)}
                      />
                  ))}
              </div>
          ) : (
              <div className="text-center py-10 bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl">
                  <h3 className="text-xl font-semibold text-white">Your portfolio is empty.</h3>
                  <p className="text-gray-400 mt-2">Go to the 'Trade' page to start investing in artists!</p>
              </div>
          )}
      </div>
  );
};

export default Portfolio;
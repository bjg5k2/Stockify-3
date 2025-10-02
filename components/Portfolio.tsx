import React, { useMemo, useState, useCallback } from 'react';
import { Investment, Artist, FollowerHistoryPoint, SpotifyArtist } from '../types';
import PortfolioItem from './PortfolioItem';
import Chart from './Chart';
import { getMultipleArtistsByIds } from '../services/spotifyService';

interface PortfolioProps {
  investments: Investment[];
  artists: Artist[];
  onOpenSellModal: (investment: Investment, currentValue: number) => void;
  netWorthHistory: FollowerHistoryPoint[];
  onViewDetail: (artist: Artist) => void;
  onUpdateArtists: (updatedArtists: SpotifyArtist[]) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ investments, artists, onOpenSellModal, netWorthHistory, onViewDetail, onUpdateArtists }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const aggregatedPortfolio = useMemo(() => {
    // 1. Group investments by artistId
    const groupedByArtist = investments.reduce((acc, investment) => {
        const artist = artists.find(a => a.id === investment.artistId);
        if (!artist) return acc;

        if (!acc[investment.artistId]) {
            acc[investment.artistId] = {
                artist: artist,
                investments: [],
            };
        }
        acc[investment.artistId].investments.push(investment);
        return acc;
    }, {} as Record<string, { artist: Artist; investments: Investment[] }>);

    // 2. Calculate aggregated data for each group
    const aggregatedItems = Object.values(groupedByArtist).map(group => {
        const { artist, investments: artistInvestments } = group;

        const totalInvested = artistInvestments.reduce((sum, inv) => sum + inv.initialInvestment, 0);
        
        const currentValue = artistInvestments.reduce((sum, inv) => {
            const growth = inv.initialFollowers > 0 
                ? (artist.followers - inv.initialFollowers) / inv.initialFollowers 
                : 0;
            return sum + (inv.initialInvestment * (1 + growth));
        }, 0);

        const firstInvestmentTimestamp = Math.min(...artistInvestments.map(inv => inv.timestamp));
        
        const profit = currentValue - totalInvested;
        const profitPercentage = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
        
        return {
            artist,
            totalInvested,
            currentValue,
            profit,
            profitPercentage,
            investedSince: firstInvestmentTimestamp
        };
    }).sort((a, b) => b.currentValue - a.currentValue);

    // Calculate overall totals
    const totalInitialInvestment = aggregatedItems.reduce((sum, item) => sum + item.totalInvested, 0);
    const currentTotalValue = aggregatedItems.reduce((sum, item) => sum + item.currentValue, 0);
    const totalProfit = currentTotalValue - totalInitialInvestment;
    const totalProfitPercentage = totalInitialInvestment > 0 ? (totalProfit / totalInitialInvestment) * 100 : 0;

    return {
        aggregatedItems,
        totalInitialInvestment,
        currentTotalValue,
        totalProfit,
        totalProfitPercentage,
    };
  }, [investments, artists]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    const artistIds = [...new Set(investments.map(inv => inv.artistId))];
    if (artistIds.length > 0) {
      try {
        const updatedArtists = await getMultipleArtistsByIds(artistIds);
        onUpdateArtists(updatedArtists);
      } catch (error) {
        console.error("Failed to refresh portfolio data", error);
        // Optionally, show an error to the user
      }
    }
    setIsRefreshing(false);
  }, [investments, onUpdateArtists]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-gray-100">Your Portfolio</h2>
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-6">
            <h3 className="text-xl font-semibold text-gray-200 mb-2">Net Worth History (30 Days)</h3>
            <Chart data={netWorthHistory} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80">
              <p className="text-sm text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(aggregatedPortfolio.currentTotalValue)}</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80">
              <p className="text-sm text-gray-400">Total Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(aggregatedPortfolio.totalInitialInvestment)}</p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur-sm p-4 rounded-xl border border-gray-700/80">
              <p className="text-sm text-gray-400">Overall P/L</p>
              <p className={`text-2xl font-bold ${aggregatedPortfolio.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(aggregatedPortfolio.totalProfit)} ({aggregatedPortfolio.totalProfitPercentage.toFixed(2)}%)
              </p>
          </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-100">Your Holdings</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gray-700/80 hover:bg-gray-700 text-white text-sm py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center"
        >
          {isRefreshing ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null}
          {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>
      
      {investments.length > 0 ? (
        <div className="space-y-4">
          {aggregatedPortfolio.aggregatedItems.map((item) => (
            <PortfolioItem
              key={item.artist.id}
              artist={item.artist}
              totalInvested={item.totalInvested}
              currentValue={item.currentValue}
              profit={item.profit}
              profitPercentage={item.profitPercentage}
              investedSince={item.investedSince}
              onViewDetail={() => onViewDetail(item.artist)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-800/40 rounded-xl border border-gray-700/80">
          <h3 className="text-xl font-semibold text-white">No Investments Yet</h3>
          <p className="text-gray-400 mt-2">Head over to the Trade page to start building your portfolio.</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
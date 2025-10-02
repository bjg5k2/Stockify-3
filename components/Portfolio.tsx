import React from 'react';
import { PortfolioItem as PortfolioItemType, Artist, Investment } from '../types';
import PortfolioItem from './PortfolioItem';

interface PortfolioProps {
  investments: Investment[];
  artists: Artist[];
  onViewDetail: (artistId: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ investments, artists, onViewDetail }) => {
  const portfolioItems = React.useMemo<PortfolioItemType[]>(() => {
    const artistMap = new Map<string, Artist>(artists.map(a => [a.id, a]));
    const groupedInvestments = investments.reduce((acc, inv) => {
      if (!acc[inv.artistId]) {
        acc[inv.artistId] = [];
      }
      acc[inv.artistId].push(inv);
      return acc;
    }, {} as Record<string, Investment[]>);

    return Object.keys(groupedInvestments).map(artistId => {
      const artist = artistMap.get(artistId);
      if (!artist) return null;

      const artistInvestments = groupedInvestments[artistId];
      const totalInvestment = artistInvestments.reduce((sum, inv) => sum + inv.initialInvestment, 0);
      
      const currentValue = artistInvestments.reduce((sum, inv) => {
          const growth = inv.initialFollowers > 0 ? (artist.followers - inv.initialFollowers) / inv.initialFollowers : 0;
          return sum + inv.initialInvestment * (1 + growth);
      }, 0);
      
      const profitOrLoss = currentValue - totalInvestment;
      const profitOrLossPercentage = totalInvestment > 0 ? (profitOrLoss / totalInvestment) * 100 : 0;
      
      return {
        artist,
        totalInvestment,
        currentValue,
        profitOrLoss,
        profitOrLossPercentage,
        investments: artistInvestments,
      };
    }).filter((item): item is PortfolioItemType => item !== null)
      .sort((a, b) => b.currentValue - a.currentValue);
  }, [investments, artists]);

  const totalPortfolioValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-6 text-gray-100">Your Portfolio</h2>
      <div className="mb-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-lg p-4 text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider">Total Portfolio Value</p>
        <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
            {totalPortfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ')}
        </p>
      </div>

      {portfolioItems.length > 0 ? (
        <div className="space-y-4">
          {portfolioItems.map(item => (
            <PortfolioItem key={item.artist.id} item={item} onViewDetail={() => onViewDetail(item.artist.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-gray-900/50 rounded-lg">
            <h3 className="text-xl font-semibold">Your portfolio is empty.</h3>
            <p>Go to the Trade page to start investing in artists!</p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;

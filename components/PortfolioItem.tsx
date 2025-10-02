import React from 'react';
import { Artist } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface PortfolioItemProps {
  artist: Artist;
  totalInvested: number;
  currentValue: number;
  profit: number;
  profitPercentage: number;
  investedSince: number;
  onViewDetail: () => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ artist, totalInvested, currentValue, profit, profitPercentage, investedSince, onViewDetail }) => {
  const isProfit = profit >= 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('$', 'C ');
  }
  
  return (
    <div
      onClick={onViewDetail} 
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-center sm:space-x-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group border border-gray-700/80"
    >
      {/* Artist Info */}
      <div className="flex-shrink-0 flex items-center w-full sm:w-1/3 mb-4 sm:mb-0">
        <img src={artist.imageUrl} alt={artist.name} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-700/50" />
        <div className="ml-4 flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{artist.name}</h3>
            <p className="text-sm text-gray-300">{artist.followers.toLocaleString()} Followers</p>
            <p className="text-xs text-gray-400 mt-1">Invested Since: {new Date(investedSince).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4 w-full text-center sm:text-left">
          <div>
              <p className="text-xs text-gray-400 uppercase">Total Invested</p>
              <p className="font-semibold text-white">{formatCurrency(totalInvested)}</p>
          </div>
          <div>
              <p className="text-xs text-gray-400 uppercase">Current Value</p>
              <p className="font-semibold text-white">{formatCurrency(currentValue)}</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
              <p className="text-xs text-gray-400 uppercase">Overall P/L</p>
              <div className={`flex items-center justify-center sm:justify-start font-semibold ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isProfit ? <TrendUpIcon className="w-4 h-4 mr-1" /> : <TrendDownIcon className="w-4 h-4 mr-1" />}
                  {formatCurrency(profit)} ({profitPercentage.toFixed(2)}%)
              </div>
          </div>
      </div>
    </div>
  );
};

export default PortfolioItem;
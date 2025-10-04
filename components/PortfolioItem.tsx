import React from 'react';
import { PortfolioItem as PortfolioItemType } from '../types';
import { TrendUpIcon, TrendDownIcon, StarIcon } from './icons';

interface PortfolioItemProps {
  item: PortfolioItemType;
  onViewDetail: (artistId: string) => void;
  onSellClick: (item: PortfolioItemType) => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ item, onViewDetail, onSellClick }) => {
  const isGrowth = item.profitOrLoss >= 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  };

  return (
    <div 
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl group border border-gray-700/80"
    >
      <div 
        onClick={() => onViewDetail(item.artist.id)}
        className="cursor-pointer"
      >
        <div className="flex items-center space-x-4 mb-3">
          <img src={item.artist.imageUrl} alt={item.artist.name} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-700/50 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.artist.name}</h3>
            <div className="text-sm text-gray-400 flex items-center justify-between">
              <span>{item.artist.followers.toLocaleString()} Followers</span>
              <span className="flex items-center font-semibold text-gray-400">
                  <StarIcon className="w-4 h-4 mr-1 text-gray-400" />
                  {item.artist.popularity}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase">Invested</p>
            <p className="font-semibold text-white">{formatCurrency(item.totalInvestment)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Value</p>
            <p className="font-semibold text-white">{formatCurrency(item.currentValue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">ROI</p>
            <p className={`font-semibold flex items-center justify-center ${isGrowth ? 'text-emerald-400' : 'text-red-400'}`}>
                {isGrowth ? <TrendUpIcon className="w-4 h-4 mr-1"/> : <TrendDownIcon className="w-4 h-4 mr-1"/>}
                {item.profitOrLossPercentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSellClick(item);
          }}
          className="w-full bg-red-500/20 hover:bg-red-500/40 text-red-300 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
        >
          Sell
        </button>
      </div>
    </div>
  );
};

export default PortfolioItem;
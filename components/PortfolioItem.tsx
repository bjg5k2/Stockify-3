import React from 'react';
import { PortfolioItem as PortfolioItemType } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface PortfolioItemProps {
  item: PortfolioItemType;
  onViewDetail: (artistId: string) => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ item, onViewDetail }) => {
  const isGrowth = item.profitOrLoss >= 0;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  };

  return (
    <div 
        onClick={() => onViewDetail(item.artist.id)}
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl hover:scale-[1.03] cursor-pointer group border border-gray-700/80"
    >
      <img src={item.artist.imageUrl} alt={item.artist.name} className="w-16 h-16 rounded-full object-cover shadow-lg border-2 border-gray-700/50 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{item.artist.name}</h3>
        <p className="text-sm text-gray-400">
          Holdings: <span className="font-semibold text-white">{formatCurrency(item.currentValue)}</span>
        </p>
      </div>
      <div className="text-right flex-shrink-0">
         <p className={`text-lg font-bold flex items-center justify-end ${isGrowth ? 'text-emerald-400' : 'text-red-400'}`}>
            {isGrowth ? <TrendUpIcon className="w-5 h-5 mr-1"/> : <TrendDownIcon className="w-5 h-5 mr-1"/>}
            {formatCurrency(item.profitOrLoss)}
         </p>
         <p className={`text-xs ${isGrowth ? 'text-emerald-500' : 'text-red-500'}`}>
            ({isGrowth ? '+' : ''}{item.profitOrLossPercentage.toFixed(2)}%)
         </p>
      </div>
    </div>
  );
};

export default PortfolioItem;

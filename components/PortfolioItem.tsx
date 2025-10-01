import React from 'react';
import { Investment, Artist } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface PortfolioItemProps {
  investment: Investment;
  currentArtistData: Artist;
  onSell: () => void;
  onViewDetail: () => void;
}

const PortfolioItem: React.FC<PortfolioItemProps> = ({ investment, currentArtistData, onSell, onViewDetail }) => {
  const followerChange = currentArtistData.followers - investment.initialFollowers;
  const growthPercentage = investment.initialFollowers > 0 ? followerChange / investment.initialFollowers : 0;
  const currentValue = investment.initialInvestment * (1 + growthPercentage);
  const roi = growthPercentage * 100;

  const isProfitable = currentValue >= investment.initialInvestment;
  const roiColor = isProfitable ? 'text-emerald-400' : 'text-red-400';

  return (
    <div 
        className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 flex flex-col space-y-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl hover:scale-[1.03] cursor-pointer group border border-gray-700/80"
        onClick={onViewDetail}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 min-w-0">
            <img src={currentArtistData.imageUrl} alt={currentArtistData.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
            <div className="min-w-0">
                 <h4 className="font-bold text-white truncate">{currentArtistData.name}</h4>
                 <p className="text-xs text-gray-400">{currentArtistData.followers.toLocaleString()} Followers</p>
            </div>
        </div>
        <button 
            onClick={(e) => {
                e.stopPropagation();
                onSell();
            }} 
            className="bg-red-500/80 text-white px-3 py-1 text-xs font-bold rounded-lg hover:bg-red-600 transition-colors z-10 relative transform hover:scale-105"
        >
          SELL
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 items-center text-sm bg-gray-900/50 p-2 rounded-lg text-center">
        <div>
          <span className="text-gray-400 text-xs block">Invested</span>
          <span className="font-semibold text-base">{investment.initialInvestment.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ')}</span>
        </div>
        <div>
          <span className="text-gray-400 text-xs block">Current Value</span>
          <span className="font-semibold text-base">{currentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ')}</span>
        </div>
        <div className={`flex items-center justify-center font-bold ${roiColor}`}>
          {isProfitable ? <TrendUpIcon className="w-4 h-4 mr-1" /> : <TrendDownIcon className="w-4 h-4 mr-1" />}
          <span className="text-base">{roi.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioItem;
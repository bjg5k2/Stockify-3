import React, { useState, useMemo } from 'react';
import { PortfolioItem as PortfolioItemType, NetWorthHistoryPoint } from '../types';
import PortfolioItem from './PortfolioItem';
import NetWorthChart from './NetWorthChart';

type SortKey = 'alphabetical' | 'totalInvestment' | 'currentValue' | 'roi' | 'dateInvested';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const SortButton: React.FC<{
  sortKey: SortKey;
  currentSort: SortConfig;
  onClick: (key: SortKey) => void;
  children: React.ReactNode;
}> = ({ sortKey, currentSort, onClick, children }) => {
  const isActive = currentSort.key === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
        isActive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {children}
      {isActive && (currentSort.direction === 'asc' ? ' ▲' : ' ▼')}
    </button>
  );
};

interface PortfolioProps {
  portfolioItems: PortfolioItemType[];
  netWorth: number;
  netWorthHistory: NetWorthHistoryPoint[];
  onViewDetail: (artistId: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolioItems, netWorth, netWorthHistory, onViewDetail }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'currentValue', direction: 'desc' });

  const totalInvestment = portfolioItems.reduce((sum, item) => sum + item.totalInvestment, 0);
  const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
  const overallProfitLoss = totalValue - totalInvestment;
  const overallProfitLossPercentage = totalInvestment > 0 ? (overallProfitLoss / totalInvestment) * 100 : 0;
  const isOverallGrowth = overallProfitLoss >= 0;

  const handleSort = (key: SortKey) => {
    const isAscendingFirst = key === 'alphabetical' || key === 'dateInvested';
    let direction: SortDirection = isAscendingFirst ? 'asc' : 'desc';
  
    if (sortConfig.key === key) {
      // Toggle direction if same key is clicked
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    setSortConfig({ key, direction });
  };
  
  const sortedPortfolioItems = useMemo(() => {
    const sortableItems = [...portfolioItems];
    sortableItems.sort((a, b) => {
      switch (sortConfig.key) {
        case 'alphabetical':
          return a.artist.name.localeCompare(b.artist.name);
        case 'totalInvestment':
          return a.totalInvestment - b.totalInvestment;
        case 'currentValue':
          return a.currentValue - b.currentValue;
        case 'roi':
          return a.profitOrLossPercentage - b.profitOrLossPercentage;
        case 'dateInvested':
          const firstInvestmentA = Math.min(...a.investments.map(inv => inv.timestamp));
          const firstInvestmentB = Math.min(...b.investments.map(inv => inv.timestamp));
          return firstInvestmentA - firstInvestmentB;
        default:
          return 0;
      }
    });
  
    if (sortConfig.direction === 'desc') {
      sortableItems.reverse();
    }
  
    return sortableItems;
  }, [portfolioItems, sortConfig]);


  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-3xl font-bold mb-6 text-gray-100">Your Portfolio</h2>

      <div className="mb-8 p-6 bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
                <p className="text-sm text-gray-400 uppercase">Net Worth</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(netWorth)}</p>
            </div>
             <div>
                <p className="text-sm text-gray-400 uppercase">Total Invested</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalInvestment)}</p>
            </div>
            <div>
                <p className="text-sm text-gray-400 uppercase">Overall P/L</p>
                 <p className={`text-3xl font-bold ${isOverallGrowth ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isOverallGrowth ? '+' : ''}{formatCurrency(overallProfitLoss)} ({overallProfitLossPercentage.toFixed(2)}%)
                </p>
            </div>
        </div>
        <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-300 mb-2 text-center">Net Worth History (30d)</h4>
            <NetWorthChart data={netWorthHistory} />
        </div>
      </div>

      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-200 mb-2 md:mb-0">Your Holdings</h3>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-400 mr-2">Sort by:</span>
                <SortButton sortKey="alphabetical" currentSort={sortConfig} onClick={handleSort}>Alphabetical</SortButton>
                <SortButton sortKey="totalInvestment" currentSort={sortConfig} onClick={handleSort}>Invested</SortButton>
                <SortButton sortKey="currentValue" currentSort={sortConfig} onClick={handleSort}>Value</SortButton>
                <SortButton sortKey="roi" currentSort={sortConfig} onClick={handleSort}>ROI</SortButton>
                <SortButton sortKey="dateInvested" currentSort={sortConfig} onClick={handleSort}>Date</SortButton>
            </div>
        </div>

        {sortedPortfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPortfolioItems.map(item => (
              <PortfolioItem key={item.artist.id} item={item} onViewDetail={onViewDetail} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
            <h4 className="text-xl font-semibold text-white">Your portfolio is empty.</h4>
            <p className="text-gray-400 mt-2">Head to the 'Trade' page to start investing in artists!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
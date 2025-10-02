import React from 'react';
import { Page, PortfolioItem as PortfolioItemType } from '../types';
import PortfolioItem from './PortfolioItem';

interface HomePageProps {
    username: string;
    netWorth: number;
    portfolioItems: PortfolioItemType[];
    onNavigate: (page: Page) => void;
}

const StatCard: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/80 text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-3xl font-bold text-white mt-1 ${className}`}>{value}</p>
    </div>
);


const HomePage: React.FC<HomePageProps> = ({ username, netWorth, portfolioItems, onNavigate }) => {
    
    const totalInvestment = portfolioItems.reduce((sum, item) => sum + item.totalInvestment, 0);
    const totalValue = portfolioItems.reduce((sum, item) => sum + item.currentValue, 0);
    const overallProfitLoss = totalValue - totalInvestment;
    const isOverallGrowth = overallProfitLoss >= 0;

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    };

    const topHoldings = [...portfolioItems].sort((a, b) => b.currentValue - a.currentValue).slice(0, 3);

    return (
        <div className="animate-fade-in-up space-y-12">
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">{username}</span>!
                </h1>
                <p className="mt-2 text-lg text-gray-300">Here's a snapshot of your portfolio performance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Net Worth" value={formatCurrency(netWorth)} />
                <StatCard label="Total Invested" value={formatCurrency(totalInvestment)} />
                <StatCard 
                    label="Overall P/L" 
                    value={`${isOverallGrowth ? '+' : ''}${formatCurrency(overallProfitLoss)}`}
                    className={isOverallGrowth ? 'text-emerald-400' : 'text-red-400'}
                />
            </div>
            
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Top Holdings</h2>
                    <button 
                        onClick={() => onNavigate('portfolio')}
                        className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                        View Full Portfolio &rarr;
                    </button>
                </div>
                {topHoldings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {topHoldings.map(item => (
                            <PortfolioItem 
                                key={item.artist.id} 
                                item={item} 
                                onViewDetail={() => onNavigate('artistDetail')} // Simplified for dashboard view
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-800/30 rounded-lg border border-dashed border-gray-700">
                        <h4 className="text-xl font-semibold text-white">Your portfolio is empty.</h4>
                        <p className="text-gray-400 mt-2">
                            <button onClick={() => onNavigate('trade')} className="text-emerald-400 font-semibold hover:underline">
                                Start trading
                            </button>
                            {' '}to build your holdings!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
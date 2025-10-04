// Fix: Provide content for the components/HomePage.tsx file.
import React from 'react';
import { Artist, MarketMover, MostTraded } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';

interface HomePageProps {
    username: string;
    netWorthChange: number;
    marketMovers: {
        gainers: MarketMover[];
        losers: MarketMover[];
    };
    mostTraded: MostTraded[];
    onViewDetail: (artistId: string) => void;
}

const formatCurrency = (amount: number, showSign = true) => {
    const sign = amount >= 0 ? '+' : '-';
    const formatted = Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    return showSign ? `${sign} ${formatted}` : formatted;
};

const HomePage: React.FC<HomePageProps> = ({
    username,
    netWorthChange,
    marketMovers,
    mostTraded,
    onViewDetail,
}) => {
    return (
        <div className="animate-fade-in-up space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-white">Welcome Back, {username}!</h1>
                <p className="text-lg text-gray-400">Here's what you missed in the market.</p>
            </div>

            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-6">
                 <h2 className="text-xl font-bold text-white mb-4">Since You've Been Gone...</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
                    <div>
                        <p className="text-sm text-gray-400 uppercase">Net Worth Change</p>
                        <p className={`text-3xl font-bold ${netWorthChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(netWorthChange)}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-400 uppercase">New Transactions (All Players)</p>
                        <p className="text-3xl font-bold text-white">
                            {mostTraded.reduce((acc, curr) => acc + curr.buys + curr.sells, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Market Movers (Last 24h)</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-emerald-400 mb-2 text-center">Top Gainers</h3>
                            <div className="space-y-3">
                                {marketMovers.gainers.length > 0 ? marketMovers.gainers.map(({artist, change}) => (
                                    <div key={artist.id} onClick={() => onViewDetail(artist.id)} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-white truncate">{artist.name}</p>
                                                <p className="text-xs text-gray-400">{artist.followers.toLocaleString()} followers</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-emerald-400 flex items-center text-sm">
                                            <TrendUpIcon className="w-4 h-4 mr-1"/> +{change.toFixed(2)}%
                                        </p>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 py-4">No significant gainers.</p>}
                            </div>
                        </div>
                         <div>
                            <h3 className="font-semibold text-red-400 mb-2 text-center">Top Losers</h3>
                             <div className="space-y-3">
                                {marketMovers.losers.length > 0 ? marketMovers.losers.map(({artist, change}) => (
                                    <div key={artist.id} onClick={() => onViewDetail(artist.id)} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <p className="font-semibold text-white truncate">{artist.name}</p>
                                                <p className="text-xs text-gray-400">{artist.followers.toLocaleString()} followers</p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-red-400 flex items-center text-sm">
                                            <TrendDownIcon className="w-4 h-4 mr-1"/> {change.toFixed(2)}%
                                        </p>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 py-4">No significant losers.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Most Traded (Since Last Login)</h2>
                     <div className="space-y-3">
                        {mostTraded.length > 0 ? mostTraded.map(({artist, buys, sells}) => (
                           <div key={artist.id} onClick={() => onViewDetail(artist.id)} className="p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors">
                               <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img src={artist.imageUrl} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold text-white truncate">{artist.name}</p>
                                            <p className="text-xs text-gray-400">{artist.followers.toLocaleString()} followers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-emerald-400">+{formatCurrency(buys, false)}</p>
                                        <p className="text-xs font-bold text-red-400">-{formatCurrency(sells, false)}</p>
                                    </div>
                               </div>
                           </div>
                        )) : <p className="text-sm text-center text-gray-500 py-4">No trading activity since your last session.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
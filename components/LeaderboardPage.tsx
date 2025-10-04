// Fix: Implemented the LeaderboardPage component.
import React, { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';
import { TrendUpIcon, TrendDownIcon } from './icons';

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    
    useEffect(() => {
        setLeaderboard(getLeaderboard());
    }, []);

    const formatCurrency = (amount: number, showSign: boolean = false) => {
        const sign = amount >= 0 ? '+' : '-';
        const formatted = Math.abs(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
        return showSign ? `${sign} ${formatted}` : formatted;
    };

    return (
        <div className="animate-fade-in-up max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2 text-center text-white">Leaderboard</h1>
            <p className="text-gray-400 text-center mb-8">See who's at the top of the music market.</p>

            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50">
                        <tr>
                            <th className="p-4 w-16 text-center font-semibold text-gray-300 text-sm">Rank</th>
                            <th className="p-4 font-semibold text-gray-300 text-sm">Player</th>
                            <th className="p-4 text-right font-semibold text-gray-300 text-sm">Net Worth</th>
                            <th className="p-4 text-right font-semibold text-gray-300 text-sm">Overall P/L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {leaderboard.length > 0 ? leaderboard.map((entry, index) => {
                             const isGrowth = entry.change >= 0;
                             const rank = index + 1;
                             let rankColor = 'text-gray-300';
                             if (rank === 1) rankColor = 'text-yellow-400';
                             if (rank === 2) rankColor = 'text-gray-300';
                             if (rank === 3) rankColor = 'text-yellow-600';

                            return (
                                <tr key={entry.username} className="hover:bg-gray-800/40 transition-colors">
                                    <td className={`p-4 text-center font-bold text-lg ${rankColor}`}>
                                        {rank}
                                    </td>
                                    <td className="p-4 font-semibold text-white">
                                        {entry.username}
                                    </td>
                                    <td className="p-4 text-right font-bold text-lg text-emerald-400">
                                        {formatCurrency(entry.netWorth)}
                                    </td>
                                    <td className={`p-4 text-right font-semibold text-sm flex items-center justify-end ${isGrowth ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {isGrowth ? <TrendUpIcon className="w-4 h-4 mr-1"/> : <TrendDownIcon className="w-4 h-4 mr-1"/>}
                                        {formatCurrency(entry.change, true)}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-500">
                                    No players on the leaderboard yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPage;


// Fix: Provide content for components/LeaderboardPage.tsx file.
import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../services/leaderboardService';
import { getLeaderboard } from '../services/leaderboardService';

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            const data = await getLeaderboard();
            setLeaderboard(data);
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, []);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    };

    if (isLoading) {
        return <div className="text-center py-10">Loading Leaderboard...</div>;
    }

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">Leaderboard</h2>
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-900/50">
                        <tr>
                            <th className="p-4 text-sm font-semibold text-gray-300 uppercase w-16 text-center">Rank</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 uppercase">Player</th>
                            <th className="p-4 text-sm font-semibold text-gray-300 uppercase text-right">Net Worth</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, index) => (
                            <tr key={entry.userId} className="border-t border-gray-700/80 hover:bg-gray-700/40 transition-colors">
                                <td className="p-4 text-lg font-bold text-center">{index + 1}</td>
                                <td className="p-4 font-medium text-white">{entry.username}</td>
                                <td className="p-4 font-semibold text-emerald-400 text-right">{formatCurrency(entry.netWorth)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeaderboardPage;

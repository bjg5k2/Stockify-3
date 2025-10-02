import React, { useState, useEffect } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../services/leaderboardService';

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getLeaderboard();
                setLeaderboard(data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                setError("Could not load the leaderboard. The database might be offline or not configured correctly.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);
    
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
    }

    return (
        <div className="animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-6 text-gray-100">Global Leaderboard</h2>

            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden">
                {isLoading ? (
                    <div className="text-center p-10 text-gray-400">Loading...</div>
                ) : error ? (
                    <div className="text-center p-10 text-red-400">{error}</div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider w-16 text-center">Rank</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Player</th>
                                <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Net Worth</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={entry.userId} className="border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-bold text-lg text-gray-200 text-center">{index + 1}</td>
                                    <td className="p-4 font-semibold text-white">{entry.username}</td>
                                    <td className="p-4 font-bold text-emerald-400 text-right">{formatCurrency(entry.netWorth)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {(!isLoading && !error && leaderboard.length === 0) && (
                    <div className="text-center p-10 text-gray-400">The leaderboard is currently empty.</div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;
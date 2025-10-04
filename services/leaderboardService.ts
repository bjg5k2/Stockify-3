// Fix: Implemented the leaderboard service.
import { UserData } from '../types';
import { getAllUserData } from './authService';

export interface LeaderboardEntry {
    username: string;
    netWorth: number;
    change: number; // Change since last check, or from start. For simplicity, we'll calculate from start.
}

// Calculates the current net worth for a user.
// This is already stored in history, but a manual calc might be useful.
// For now, we'll use the last history entry.
const calculateNetWorth = (userData: UserData): number => {
    if (userData.netWorthHistory.length > 0) {
        return userData.netWorthHistory[userData.netWorthHistory.length - 1].netWorth;
    }
    return userData.credits; // Fallback
};

export const getLeaderboard = (): LeaderboardEntry[] => {
    try {
        const allUsers = getAllUserData();
        const leaderboard: LeaderboardEntry[] = Object.values(allUsers)
            .map(user => {
                const netWorth = calculateNetWorth(user);
                const startingNetWorth = user.netWorthHistory[0]?.netWorth || user.credits;
                const change = netWorth - startingNetWorth;
                return {
                    username: user.username,
                    netWorth: netWorth,
                    change: change
                };
            })
            .sort((a, b) => b.netWorth - a.netWorth); // Sort by net worth descending

        return leaderboard;

    } catch (error) {
        console.error("Failed to generate leaderboard:", error);
        return [];
    }
};

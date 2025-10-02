import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

export interface LeaderboardEntry {
    userId: string;
    username: string;
    netWorth: number;
}

/**
 * Fetches the top 100 players from the leaderboard, sorted by net worth.
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('netWorth', 'desc'), limit(100));

    const querySnapshot = await getDocs(q);
    
    const leaderboard: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data() as UserProfile;
        leaderboard.push({
            userId: doc.id,
            username: data.displayName,
            netWorth: data.netWorth,
        });
    });

    return leaderboard;
};
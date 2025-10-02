import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export interface LeaderboardEntry {
    userId: string;
    username: string;
    netWorth: number;
}

/**
 * Fetches the top 100 players from the leaderboard, sorted by net worth.
 */
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    const leaderboardCol = collection(db, 'leaderboard');
    const q = query(leaderboardCol, orderBy('netWorth', 'desc'), limit(100));

    const querySnapshot = await getDocs(q);
    
    const leaderboard: LeaderboardEntry[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
            userId: doc.id,
            username: data.username,
            netWorth: data.netWorth,
        });
    });

    return leaderboard;
};

/**
 * Creates or updates a user's entry in the leaderboard.
 * @param userId The user's unique ID (from anonymous auth).
 * @param username The user's chosen display name.
 * @param netWorth The user's current net worth.
 */
export const updateLeaderboardEntry = async (userId: string, username: string, netWorth: number) => {
    if (!userId || !username) return;

    const userDocRef = doc(db, 'leaderboard', userId);
    try {
        await setDoc(userDocRef, {
            username,
            netWorth,
            lastUpdated: serverTimestamp()
        }, { merge: true }); // Use merge to avoid overwriting other fields if they exist
    } catch (error) {
        console.error("Failed to update leaderboard:", error);
        // In a real app, you might want to handle this more gracefully
    }
};
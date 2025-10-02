// Fix: Provide content for the services/authService.ts file.
import { Investment, NetWorthHistoryPoint } from '../types';

const getStorageKey = (username: string) => `stockify_user_${username.toLowerCase()}`;

interface StoredUser {
    username: string;
    investments: Investment[];
    userCredits: number;
    netWorthHistory: NetWorthHistoryPoint[];
    lastLogin: number;
}

export const saveUser = (username: string, investments: Investment[], userCredits: number, netWorthHistory: NetWorthHistoryPoint[]): void => {
    try {
        const userData: StoredUser = {
            username,
            investments,
            userCredits,
            netWorthHistory,
            lastLogin: Date.now()
        };
        localStorage.setItem(getStorageKey(username), JSON.stringify(userData));
        localStorage.setItem('stockify_lastUser', username);
    } catch (error) {
        console.error("Failed to save user data to local storage", error);
    }
};

export const getUser = (username?: string): StoredUser | null => {
    try {
        const userToGet = username || localStorage.getItem('stockify_lastUser');
        if (!userToGet) return null;

        const userDataString = localStorage.getItem(getStorageKey(userToGet));
        if (userDataString) {
            return JSON.parse(userDataString);
        }
        return null;
    } catch (error) {
        console.error("Failed to retrieve user data from local storage", error);
        return null;
    }
};

export const signOut = (): void => {
     try {
        // This is the correct behavior for signing out.
        // It forgets who was logged in, but does not delete their data.
        localStorage.removeItem('stockify_lastUser');
    } catch (error) {
        console.error("Failed to sign out user from local storage", error);
    }
}
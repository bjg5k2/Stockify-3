// Fix: Provide content for the services/authService.ts file.

import { UserData } from "../types";
import { STARTING_CREDITS } from "../constants";

const ACTIVE_USER_KEY = 'stockify_active_user';
const ALL_USERS_KEY = 'stockify_all_users';

export const saveUser = (username: string): void => {
    try {
        localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify({ username }));
    } catch (error) {
        console.error("Failed to save active user to local storage", error);
    }
};

export const loadUser = (): { username: string } | null => {
    try {
        const userJson = localStorage.getItem(ACTIVE_USER_KEY);
        if (userJson) {
            return JSON.parse(userJson);
        }
        return null;
    } catch (error) {
        console.error("Failed to load active user from local storage", error);
        return null;
    }
};

export const signOut = (): void => {
    try {
        localStorage.removeItem(ACTIVE_USER_KEY);
    } catch (error) {
        console.error("Failed to remove active user from local storage", error);
    }
};

export const getAllUserData = (): Record<string, UserData> => {
    try {
        const allUsersJson = localStorage.getItem(ALL_USERS_KEY);
        return allUsersJson ? JSON.parse(allUsersJson) : {};
    } catch (error) {
        console.error("Failed to load all user data", error);
        return {};
    }
};

export const saveAllUserData = (allData: Record<string, UserData>): void => {
    try {
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allData));
    } catch (error) {
        console.error("Failed to save all user data", error);
    }
}


export const signIn = (username: string): { userData: UserData, isNewUser: boolean } => {
    const allData = getAllUserData();
    let userData = allData[username];
    let isNewUser = false;
    
    if (!userData) {
      isNewUser = true;
      userData = {
        username: username,
        credits: STARTING_CREDITS,
        investments: [],
        transactions: [],
        netWorthHistory: [{ date: Date.now(), netWorth: STARTING_CREDITS }],
        simulationStartDate: Date.now(),
        simulatedDays: 0,
        hasSeenWelcome: false,
        lastTickDate: Date.now(), // Ensure new users have a tick date
      };
    }
    
    saveUser(username);
    saveAllUserData({ ...allData, [username]: userData });
    
    return { userData, isNewUser };
};
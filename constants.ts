// constants.ts
import { FollowerHistoryPoint } from './types';

// A static list of artist IDs to populate the market initially.
// In a real app, this might come from a database or a curated API endpoint.
// These are example Spotify Artist IDs.
export const ARTIST_IDS_IN_MARKET: string[] = [
    '246dkjvS1zLTtiykXe5h60', // Post Malone
    '06HL4z0CvFAxyc27GXpf02', // Taylor Swift
    '3TVXtAsR1Inumwj472S9r4', // Drake
    '1Xyo4u8uXC1ZmMiI5vAnv9', // The Weeknd
    '6eUKZXaKkcviH0Ku9w2n3V', // Ed Sheeran
    '6qqNVTkY8uBg9cP3Jd7DAH', // Billie Eilish
    '6M2wZ9GZgrQXHCFfjv46we', // Dua Lipa
    '1uNFoZAHBGtllmzznpCI3s', // Justin Bieber
    '66CXWjxzNUsdJxJ2JdwvnR', // Ariana Grande
    '1McMsnEElThX1knmY4oliG', // Olivia Rodrigo
    '6KImCVD70vtIoJWnq6nGn3', // Harry Styles
    '4q3ewBCX7sLwd24euuV69X', // Bad Bunny
];

// This is used for generating mock history data in App.tsx
// It's a placeholder for what would be a more robust historical data system.
export const generateRandomHistory = (currentFollowers: number): FollowerHistoryPoint[] => {
    const history: FollowerHistoryPoint[] = [];
    let lastFollowers = currentFollowers * (1 - (Math.random() * 0.1)); // Start 0-10% lower
    const days = 30;
    for (let i = 0; i < days; i++) {
        // Create a trend + some noise
        const trend = (currentFollowers - lastFollowers) / (days - i);
        const noise = (Math.random() - 0.48) * 0.01 * lastFollowers;
        lastFollowers += trend + noise;
        history.push({ timestamp: Date.now() - (days - i) * 24 * 60 * 60 * 1000, count: Math.round(lastFollowers) });
    }
    history[history.length -1] = { timestamp: Date.now(), count: currentFollowers }; // Ensure last point is accurate
    return history;
};

// Fix: Provide content for the types.ts file to define the application's data structures.
export type Page = 'home' | 'portfolio' | 'trade' | 'leaderboard' | 'faq';

export interface FollowerHistoryPoint {
  date: number; // timestamp
  count: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
  popularity: number;
}

export interface Artist extends SpotifyArtist {
  followerHistory: FollowerHistoryPoint[];
}

export interface Investment {
  id: string;
  artistId: string;
  initialInvestment: number;
  initialFollowers: number;
  timestamp: number;
}

export interface PortfolioItem {
  artist: Artist;
  investments: Investment[];
  totalInvestment: number;
  currentValue: number;
  profitOrLoss: number;
  profitOrLossPercentage: number;
}

export interface Transaction {
  id: string;
  type: 'invest' | 'sell';
  artistName: string;
  artistId: string;
  amount: number;
  timestamp: number;
}

export interface NetWorthHistoryPoint {
    date: number; // timestamp
    netWorth: number;
}

export interface UserData {
    username: string;
    credits: number;
    investments: Investment[];
    transactions: Transaction[];
    netWorthHistory: NetWorthHistoryPoint[];
    simulationStartDate: number;
    simulatedDays: number;
    hasSeenWelcome: boolean;
    lastTickDate?: number; // Added for tracking session changes
}

export interface MarketMover {
    artist: Artist;
    change: number;
}

export interface MostTraded {
    artist: Artist;
    buys: number;
    sells: number;
}
export type Page = 'home' | 'portfolio' | 'trade' | 'leaderboard' | 'faq';

// Data from Spotify API
export interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
  popularity: number;
}

export interface FollowerHistoryPoint {
  date: number; // timestamp
  count: number;
}

// Artist object used within the simulation
export interface Artist extends SpotifyArtist {
  followerHistory: FollowerHistoryPoint[];
}

export interface Investment {
  id: string; // unique id for the investment
  artistId: string;
  initialInvestment: number;
  initialFollowers: number;
  timestamp: number;
}

// An item in the user's portfolio, aggregating all investments for a single artist
export interface PortfolioItem {
  artist: Artist;
  investments: Investment[];
  totalInvestment: number;
  currentValue: number;
  profitOrLoss: number;
  profitOrLossPercentage: number;
}

export type TransactionType = 'invest' | 'sell';

export interface Transaction {
  id: string;
  type: TransactionType;
  artistId: string;
  artistName: string;
  amount: number;
  timestamp: number;
}

export interface NetWorthHistoryPoint {
  date: number; // timestamp
  netWorth: number;
}

export interface User {
  id: string;
  username: string;
  credits: number;
  investments: Investment[];
  transactions: Transaction[];
  netWorthHistory: NetWorthHistoryPoint[];
  lastLogin: number; // timestamp
  isNewUser: boolean;
}

// For homepage market movers
export interface MarketMover {
    artist: Artist;
    change: number; // Percentage change
}

// For homepage most traded
export interface MostTraded {
    artist: Artist;
    buys: number;
    sells: number;
}

// For leaderboard
export interface LeaderboardEntry {
  userId: string;
  username: string;
  netWorth: number;
}

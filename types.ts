
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
  popularity: number; // 0-100
}

export interface Artist extends SpotifyArtist {
  followerHistory: FollowerHistoryPoint[];
}

export interface Investment {
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
  artistId: string;
  artistName: string;
  amount: number;
  timestamp: number;
}

export interface UserData {
  username: string;
  credits: number;
  investments: Investment[];
  transactions: Transaction[];
  netWorthHistory: NetWorthHistoryPoint[];
  lastLogin: number;
  simulationStartDate: number;
}

export interface NetWorthHistoryPoint {
    date: number; // timestamp
    netWorth: number;
}

export interface MarketMover {
    artist: Artist;
    change: number; // percentage change
}

export interface MostTraded {
    artist: Artist;
    buys: number;
    sells: number;
}

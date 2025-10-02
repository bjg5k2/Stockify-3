// types.ts

// Represents a point in time for an artist's follower count.
export interface FollowerHistoryPoint {
  timestamp: number;
  count: number;
}

// Represents an artist within the Stockify market.
export interface Artist {
  id: string; // Spotify Artist ID
  name: string;
  imageUrl: string;
  followers: number;
  followerHistory: FollowerHistoryPoint[];
}

// Represents a single investment made by a user in an artist.
export interface Investment {
  id: string; // Unique ID for the investment
  artistId: string;
  userId: string;
  initialInvestment: number; // The amount of credits invested
  initialFollowers: number; // The follower count at the time of investment
  timestamp: number; // When the investment was made
}

// A processed object representing a user's total holdings in a single artist.
export interface PortfolioItem {
  artist: Artist;
  investments: Investment[];
  totalInvestment: number;
  currentValue: number;
  profitOrLoss: number;
  profitOrLossPercentage: number;
}

// Represents an artist as returned from the Spotify API search.
export interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
}

// Represents a point in time for a user's net worth.
export interface NetWorthHistoryPoint {
  timestamp: number;
  netWorth: number;
}

// Fix: Add a shared Page type for navigation.
export type Page = 'home' | 'trade' | 'portfolio' | 'leaderboard' | 'artistDetail' | 'faq';
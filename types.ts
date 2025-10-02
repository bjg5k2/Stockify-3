// types.ts

export interface FollowerHistoryPoint {
  timestamp: number;
  count: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl: string;
  followers: number;
}

export interface Artist extends SpotifyArtist {
  followerHistory: FollowerHistoryPoint[];
}

export interface Investment {
  id: string; // unique ID for the investment instance
  artistId: string;
  initialInvestment: number;
  initialFollowers: number;
  timestamp: number;
}

// This will represent the user's consolidated holdings in a single artist for portfolio display
export interface PortfolioItem {
    artist: Artist;
    totalInvestment: number;
    currentValue: number;
    profitOrLoss: number;
    profitOrLossPercentage: number;
    investments: Investment[];
}

// types.ts

export interface FollowerHistoryPoint {
  timestamp: number;
  count: number;
}

export interface Artist {
  id: string; // Spotify Artist ID
  name: string;
  imageUrl: string;
  followers: number;
  followerHistory: FollowerHistoryPoint[];
}

export interface SpotifyArtist {
  id: string;
  name:string;
  imageUrl: string;
  followers: number;
}

export interface Investment {
  id: string; // Unique ID for the investment
  artistId: string;
  initialInvestment: number; // in credits
  initialFollowers: number;
  timestamp: number; // when investment was made
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string;
    credits: number;
    investments: Investment[];
    netWorth: number;
    netWorthHistory: FollowerHistoryPoint[];
}
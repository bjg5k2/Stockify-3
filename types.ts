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
  bio?: string; // Biography from Gemini
}

export interface SpotifyArtist {
  id:string;
  name: string;
  imageUrl: string;
  followers: number;
}

export interface Investment {
  id: string; // Unique ID for the investment, e.g., `${artistId}-${timestamp}`
  artistId: string;
  initialInvestment: number; // in credits
  initialFollowers: number;
  timestamp: number; // unix timestamp
}
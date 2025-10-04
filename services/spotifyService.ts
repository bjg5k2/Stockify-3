import { SpotifyArtist } from '../types';

const API_BASE = 'https://api.spotify.com/v1';
const MAX_ARTISTS_PER_SEARCH = 10;

let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Function to get an access token from our secure Netlify serverless function
const getAccessToken = async (): Promise<string> => {
    if (accessToken && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    try {
        // This endpoint points to our Netlify function
        const response = await fetch('/.netlify/functions/spotify-token');

        if (!response.ok) {
             const errorBody = await response.json();
             console.error("Spotify token function error:", errorBody);
             throw new Error(`Token request failed: ${errorBody.error || response.statusText}. Ensure the Netlify dev server is running and configured.`);
        }
        
        const data = await response.json();
        accessToken = data.access_token;
        // Set expiry time to 5 minutes before the actual expiry to be safe
        tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;
        return accessToken!;

    } catch (error) {
        console.error('Error fetching Spotify token:', error);
        throw new Error('Could not authenticate with Spotify via the backend service. It might be down or misconfigured.');
    }
};

const mapToSpotifyArtist = (item: any): SpotifyArtist | null => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=222&color=fff`,
        followers: item.followers.total,
        popularity: item.popularity,
    }
};


export const searchArtists = async (query: string): Promise<SpotifyArtist[]> => {
    if (!query) return [];
    const token = await getAccessToken();

    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=artist&limit=${MAX_ARTISTS_PER_SEARCH}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to search for artists on Spotify.');
    }

    const data = await response.json();
    return data.artists.items.map(mapToSpotifyArtist).filter((a): a is SpotifyArtist => a !== null);
};


export const getMultipleArtistsByIds = async (artistIds: string[]): Promise<SpotifyArtist[]> => {
    if (artistIds.length === 0) return [];
    // Spotify API has a limit of 50 artists per request
    if (artistIds.length > 50) {
        console.warn("Attempted to fetch more than 50 artists at once. Truncating to 50.");
        artistIds = artistIds.slice(0, 50);
    }
    const token = await getAccessToken();

    const response = await fetch(`${API_BASE}/artists?ids=${artistIds.join(',')}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch multiple artists from Spotify.');
    }

    const data = await response.json();
    return data.artists.filter(Boolean).map(mapToSpotifyArtist).filter((a): a is SpotifyArtist => a !== null);
};

import { SpotifyArtist } from '../types';

const API_BASE = 'https://api.spotify.com/v1';
const MAX_ARTISTS_PER_SEARCH = 10;
// This is the new, relative URL for the Netlify function. It works automatically.
const TOKEN_PROXY_URL = '/.netlify/functions/spotify-token';

let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Function to get an access token from our secure Netlify proxy
const getAccessToken = async (): Promise<string> => {
    if (accessToken && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    try {
        const response = await fetch(TOKEN_PROXY_URL);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Token proxy error response:", errorBody);
            throw new Error(`Token proxy request failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.access_token) {
            console.error("Invalid token response from proxy:", data);
            throw new Error("Proxy did not return a valid access token.");
        }
        accessToken = data.access_token;
        // Set expiry time to 5 minutes before the actual token expiry to be safe
        tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;
        return accessToken!;
    } catch (error) {
        console.error('Error fetching Spotify access token from proxy:', error);
        throw new Error('Could not authenticate with Spotify via the secure proxy. The backend service may be down.');
    }
};

const mapToSpotifyArtist = (item: any): SpotifyArtist | null => {
    if (!item) return null;
    return {
        id: item.id,
        name: item.name,
        imageUrl: item.images?.[0]?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=222&color=fff`,
        followers: item.followers.total,
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
    if (artistIds.length > 50) {
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

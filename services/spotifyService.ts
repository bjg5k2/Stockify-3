import { SpotifyArtist } from '../types';

const API_BASE = 'https://api.spotify.com/v1';
const MAX_ARTISTS_PER_SEARCH = 10;

// --- FOR BROWSER PREVIEW ONLY ---
// Replace these placeholder strings with your actual Spotify credentials.
// WARNING: DO NOT COMMIT THESE KEYS TO A PUBLIC GITHUB REPOSITORY.
const DEV_CLIENT_ID = "6779002148504051a70094608246c2ce";
const DEV_CLIENT_SECRET = "37858ad8a21b48bc99fad3845826ba1a";


let accessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Function to get an access token
const getAccessToken = async (): Promise<string> => {
    if (accessToken && Date.now() < tokenExpiryTime) {
        return accessToken;
    }

    if (!DEV_CLIENT_ID || !DEV_CLIENT_SECRET) {
        throw new Error("Spotify credentials are not set in services/spotifyService.ts. Please add your client ID and secret.");
    }

    try {
        // btoa is a browser-native function for Base64 encoding
        const authString = btoa(`${DEV_CLIENT_ID}:${DEV_CLIENT_SECRET}`);

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${authString}`,
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
             const errorBody = await response.text();
             console.error("Direct Spotify API error:", errorBody);
             throw new Error(`Direct token request failed with status: ${response.status}. Check credentials in spotifyService.ts.`);
        }
        
        const data = await response.json();
        accessToken = data.access_token;
        tokenExpiryTime = Date.now() + (data.expires_in - 300) * 1000;
        return accessToken!;

    } catch (error) {
        console.error('Error fetching Spotify token directly:', error);
        throw new Error('Could not authenticate with Spotify using the provided credentials. Please ensure they are correct in services/spotifyService.ts.');
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
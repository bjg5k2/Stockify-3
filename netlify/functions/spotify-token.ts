
// Fix: Provide content for netlify/functions/spotify-token.ts
import { Handler } from '@netlify/functions';

// In a real deployment, these would be set as environment variables in the Netlify dashboard
// for security, rather than being hardcoded.
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

const handler: Handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Spotify credentials not configured on the server.' }),
        };
    }

    const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
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
            console.error("Spotify API error:", errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: 'Failed to fetch token from Spotify.' }),
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        };
    } catch (error: any) {
        console.error('Error in spotify-token function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'An internal server error occurred.' }),
        };
    }
};

export { handler };

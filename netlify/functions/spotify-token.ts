// This file lives in netlify/functions/spotify-token.ts
// It's your new, secure backend proxy that runs on Netlify's servers.

import { Handler } from '@netlify/functions';

// This is the main function handler
const handler: Handler = async (event, context) => {
  // Get the secret credentials from the environment variables you set on the Netlify website
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Spotify credentials are not set in the server environment.' }),
    };
  }

  // Fix: Replaced Node.js-specific `Buffer` with `btoa` for Base64 encoding to resolve TypeScript type errors.
  const authString = btoa(`${clientId}:${clientSecret}`);

  try {
    // We need to use a dynamic import for node-fetch because this is a modern JS module
    const fetch = (await import('node-fetch')).default;
    
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
        console.error("Spotify API Error:", errorBody);
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: 'Failed to fetch token from Spotify.' }),
        };
    }
    
    const data = await response.json();

    return {
      statusCode: 200,
      // The CORS header is not needed here because the function is on the same domain as the site.
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Internal Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'An internal error occurred.' }),
    };
  }
};

export { handler };

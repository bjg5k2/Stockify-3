
// Fix: Provide content for the components/SpotifyLoginPage.tsx file.
import React from 'react';

// Note: This component is a placeholder for a potential future implementation
// that uses Spotify's OAuth for authentication. The current application
// uses a simpler username-based login system (LoginPage.tsx).

interface SpotifyLoginPageProps {
  onLogin: () => void;
}

const SpotifyLoginPage: React.FC<SpotifyLoginPageProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold mb-4">Stockify</h1>
        <p className="text-gray-400 mb-8">Connect with Spotify to continue.</p>
        <button
          onClick={onLogin}
          className="bg-[#1DB954] text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-[#1ED760] transition-transform transform hover:scale-105"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default SpotifyLoginPage;

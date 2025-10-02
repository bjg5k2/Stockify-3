
// Fix: Provide content for the components/CredentialsModal.tsx file.
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface CredentialsModalProps {
  onSave: (clientId: string, clientSecret: string) => void;
  onClose: () => void;
}

const CredentialsModal: React.FC<CredentialsModalProps> = ({ onSave, onClose }) => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  const handleSave = () => {
    if (clientId.trim() && clientSecret.trim()) {
      onSave(clientId, clientSecret);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-2">Spotify API Credentials</h2>
        <p className="text-sm text-gray-400 mb-4">
          This app requires Spotify API credentials to fetch artist data. Please get them from the{' '}
          <a href="https://developer.spotify.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
            Spotify Developer Dashboard
          </a>. These will be saved in your browser's local storage.
        </p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="client-id" className="block text-sm font-medium text-gray-300 mb-2">Client ID</label>
            <input
              type="text"
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your Spotify Client ID"
            />
          </div>
          <div>
            <label htmlFor="client-secret" className="block text-sm font-medium text-gray-300 mb-2">Client Secret</label>
            <input
              type="password"
              id="client-secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Enter your Spotify Client Secret"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!clientId.trim() || !clientSecret.trim()}
          className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default CredentialsModal;

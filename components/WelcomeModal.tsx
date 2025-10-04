import React from 'react';
import { CloseIcon } from './icons';

interface WelcomeModalProps {
  onClose: () => void;
  // Fix: Added missing onNavigateToFaq prop to resolve type error in App.tsx.
  onNavigateToFaq: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose, onNavigateToFaq }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in-up text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400 pb-2 mb-4">
            Welcome to Stockify!
        </h1>
        <p className="text-lg text-gray-300 mb-6">
            The fantasy stock market for music. Invest in your favorite artists and watch your portfolio grow as their popularity rises.
        </p>
        <div className="text-left bg-gray-800/50 p-6 rounded-lg space-y-3 mb-6">
            <h2 className="text-xl font-bold text-white mb-3 text-center">How it Works</h2>
            <p className="text-gray-300">
                <strong className="text-emerald-400">1. Invest:</strong> Use your starting credits to "invest" in artists.
            </p>
            <p className="text-gray-300">
                <strong className="text-emerald-400">2. Grow:</strong> An artist's value is tied to their Spotify follower count. As they gain followers, your investment grows.
            </p>
             <p className="text-gray-300">
                <strong className="text-emerald-400">3. Trade:</strong> Sell your holdings to cash in your profits, or discover new artists to add to your portfolio.
            </p>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20"
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
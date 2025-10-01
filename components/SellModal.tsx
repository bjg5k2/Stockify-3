import React, { useState } from 'react';
import { Investment, Artist } from '../types';
import { CloseIcon } from './icons';

interface SellModalProps {
  investment: Investment;
  artist: Artist;
  currentValue: number;
  onSell: (investment: Investment, currentValue: number) => void;
  onClose: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ investment, artist, currentValue, onSell, onClose }) => {
  
  const formatCredits = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4 mb-4">
            <img src={artist.imageUrl} alt={artist.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />
            <div>
                <h2 className="text-2xl font-bold">Sell Investment</h2>
                <p className="text-lg text-gray-300">{artist.name}</p>
            </div>
        </div>
        
        <div className="bg-gray-900/50 p-3 rounded-lg mb-4 text-center">
            <span className="text-sm text-gray-400 block">Sell for Current Value</span>
            <span className="text-2xl font-bold text-emerald-400">{formatCredits(currentValue)}</span>
        </div>

        <p className="text-center text-gray-400 text-sm my-4">
            Selling this investment will remove it from your portfolio and add its current value to your credits.
        </p>
        
        <button
          onClick={() => onSell(investment, currentValue)}
          className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/20"
        >
          Confirm Sale
        </button>
      </div>
    </div>
  );
};

export default SellModal;
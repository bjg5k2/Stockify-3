import React, { useState } from 'react';
import { Investment, Artist } from '../types';
import { CloseIcon } from './icons';

interface SellModalProps {
  investment: Investment;
  artist: Artist;
  currentValue: number;
  onSell: (amount: number) => void;
  onClose: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ investment, artist, currentValue, onSell, onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow numbers and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const handleSellClick = () => {
    const sellAmount = parseFloat(amount);
    if (isNaN(sellAmount) || sellAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (sellAmount > currentValue) {
      setError('You cannot sell for more than the current value.');
      return;
    }
    onSell(sellAmount);
  };

  const setSellPercentage = (percentage: number) => {
    const value = currentValue * percentage;
    setAmount(value.toFixed(2).toString()); // Use toFixed(2) for currency
    setError('');
  };
  
  const formatCredits = (amount: number) => {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace('$', 'C ');
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-4 mb-5">
            <img src={artist.imageUrl} alt={artist.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-700" />
            <div>
                <h2 className="text-2xl font-bold">Sell {artist.name}</h2>
                <p className="text-sm text-gray-400">Current Value: <span className="text-emerald-400 font-semibold">{formatCredits(currentValue)}</span></p>
            </div>
        </div>
        
        <div className="my-4">
            <label htmlFor="sell-amount" className="block text-sm font-medium text-gray-300 mb-2">Amount to Sell</label>
            <input
                type="text"
                id="sell-amount"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="e.g., 500"
            />
            <div className="flex justify-between mt-2 space-x-2">
                <button onClick={() => setSellPercentage(0.10)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">10%</button>
                <button onClick={() => setSellPercentage(0.25)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">25%</button>
                <button onClick={() => setSellPercentage(0.50)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">50%</button>
                <button onClick={() => setSellPercentage(1)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">MAX</button>
            </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        
        <button
          onClick={handleSellClick}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > currentValue}
          className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
        >
          Confirm Sale
        </button>
      </div>
    </div>
  );
};

export default SellModal;
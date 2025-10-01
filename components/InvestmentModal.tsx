import React, { useState } from 'react';
import { Artist } from '../types';
import { CloseIcon } from './icons';

interface InvestmentModalProps {
  artist: Artist;
  userCredits: number;
  onInvest: (artistId: string, amount: number) => void;
  onClose: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ artist, userCredits, onInvest, onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // only allow numbers
      setAmount(value);
      setError('');
    }
  };

  const handleInvestClick = () => {
    const investmentAmount = parseInt(amount, 10);
    if (isNaN(investmentAmount) || investmentAmount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    if (investmentAmount > userCredits) {
      setError('You do not have enough credits.');
      return;
    }
    onInvest(artist.id, investmentAmount);
  };

  const setInvestmentPercentage = (percentage: number) => {
    const value = Math.floor(userCredits * percentage);
    setAmount(value.toString());
    setError('');
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
                <h2 className="text-2xl font-bold">Invest in {artist.name}</h2>
                <p className="text-sm text-gray-400">You have <span className="text-emerald-400 font-semibold">{userCredits.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ')}</span> credits</p>
            </div>
        </div>
        
        <div className="my-4">
            <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-300 mb-2">Investment Amount</label>
            <input
                type="text"
                id="investment-amount"
                value={amount}
                onChange={handleAmountChange}
                className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="e.g., 500"
            />
            <div className="flex justify-between mt-2 space-x-2">
                <button onClick={() => setInvestmentPercentage(0.10)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">10%</button>
                <button onClick={() => setInvestmentPercentage(0.25)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">25%</button>
                <button onClick={() => setInvestmentPercentage(0.50)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">50%</button>
                <button onClick={() => setInvestmentPercentage(1)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">MAX</button>
            </div>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
        
        <button
          onClick={handleInvestClick}
          disabled={!amount || parseInt(amount) <= 0}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
        >
          Confirm Investment
        </button>
      </div>
    </div>
  );
};

export default InvestmentModal;
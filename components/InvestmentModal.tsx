import React, { useState, useEffect } from 'react';
import { Artist } from '../types';
import { CloseIcon } from './icons';

interface InvestmentModalProps {
  artist: Artist | null;
  userCredits: number;
  onInvest: (artist: Artist, amount: number) => void;
  onClose: () => void;
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ artist, userCredits, onInvest, onClose }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset on artist change
    setAmount('');
    setError('');
  }, [artist]);

  if (!artist) return null;

  const handleInvest = () => {
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (numericAmount > userCredits) {
      setError('You do not have enough credits.');
      return;
    }
    setError('');
    onInvest(artist, numericAmount);
  };

  const handleQuickSetAmount = (value: number | 'percentage', percentage?: number) => {
    let finalAmount = 0;
    if (value === 'percentage' && percentage) {
      finalAmount = Math.floor(userCredits * percentage);
    } else if (typeof value === 'number') {
      finalAmount = value;
    }
    setAmount(finalAmount.toString());
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
  };
  
  const fixedAmounts = [500, 1000, 2000, 5000];
  const percentageAmounts = [0.1, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">Invest in {artist.name}</h2>
            <p className="text-sm text-gray-400">Your investment value will track their Spotify follower count.</p>
        </div>

        <div className="mb-4 bg-gray-800/50 p-4 rounded-lg">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Available Credits</span>
                <span className="font-bold text-emerald-400">{formatCurrency(userCredits)}</span>
            </div>
        </div>

        <div>
          <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-300 mb-2">Investment Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">C</span>
            <input
              type="number"
              id="investment-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg pr-4 pl-6 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="0"
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-4 space-y-3">
            <div>
                <p className="text-xs text-gray-400 mb-2">Quick Invest (Amount)</p>
                <div className="grid grid-cols-4 gap-2">
                    {fixedAmounts.map(fixedAmount => (
                        <button key={fixedAmount} onClick={() => handleQuickSetAmount(fixedAmount)} disabled={fixedAmount > userCredits} className="bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                            {formatCurrency(fixedAmount)}
                        </button>
                    ))}
                </div>
            </div>
             <div>
                <p className="text-xs text-gray-400 mb-2">Quick Invest (Percentage)</p>
                <div className="grid grid-cols-5 gap-2">
                    {percentageAmounts.map(pct => (
                        <button key={pct} onClick={() => handleQuickSetAmount('percentage', pct)} disabled={userCredits === 0} className="bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                           {pct * 100}%
                        </button>
                    ))}
                </div>
            </div>
        </div>


        <button
          onClick={handleInvest}
          disabled={!amount || parseInt(amount, 10) <= 0 || parseInt(amount, 10) > userCredits}
          className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
        >
          Confirm Investment of {formatCurrency(parseInt(amount, 10) || 0)}
        </button>
      </div>
    </div>
  );
};

export default InvestmentModal;
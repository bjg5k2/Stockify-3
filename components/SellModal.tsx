import React, { useState, useMemo } from 'react';
import { Artist, Investment } from '../types';
import { CloseIcon } from './icons';

interface SellModalProps {
  artist: Artist;
  investments: Investment[];
  onSell: (artistId: string, sellValue: number) => void;
  onClose: () => void;
}

const SellModal: React.FC<SellModalProps> = ({ artist, investments, onSell, onClose }) => {
    const [sellAmount, setSellAmount] = useState('');
    const [error, setError] = useState('');

    const totalCurrentValue = useMemo(() => {
        return investments.reduce((sum, inv) => {
            const growth = inv.initialFollowers > 0 ? (artist.followers - inv.initialFollowers) / inv.initialFollowers : 0;
            return sum + inv.initialInvestment * (1 + growth);
        }, 0);
    }, [artist, investments]);
    
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) { // allow numbers and decimal
            setSellAmount(value);
            setError('');
        }
    };

    const handleSellClick = () => {
        const sellValue = parseFloat(sellAmount);
        if (isNaN(sellValue) || sellValue <= 0) {
            setError('Please enter a valid amount to sell.');
            return;
        }
        if (sellValue > totalCurrentValue) {
            setError('You cannot sell more than your current holdings.');
            return;
        }
        onSell(artist.id, sellValue);
    };

    const setSellPercentage = (percentage: number) => {
        const value = totalCurrentValue * percentage;
        setSellAmount(value.toFixed(0));
        setError('');
    }

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ');
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
                        <p className="text-sm text-gray-400">Total Holdings Value: <span className="text-emerald-400 font-semibold">{formatCurrency(totalCurrentValue)}</span></p>
                    </div>
                </div>
                
                <div className="my-4">
                    <label htmlFor="sell-amount" className="block text-sm font-medium text-gray-300 mb-2">Sell Amount (in Credits)</label>
                    <input
                        type="text"
                        id="sell-amount"
                        value={sellAmount}
                        onChange={handleAmountChange}
                        className="w-full bg-gray-800/60 border-2 border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder={`e.g., ${Math.round(totalCurrentValue / 2)}`}
                    />
                    <div className="flex justify-between mt-2 space-x-2">
                        <button onClick={() => setSellPercentage(0.25)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">25%</button>
                        <button onClick={() => setSellPercentage(0.50)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">50%</button>
                        <button onClick={() => setSellPercentage(0.75)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">75%</button>
                        <button onClick={() => setSellPercentage(1)} className="flex-1 text-xs bg-gray-700/80 hover:bg-gray-700 text-white py-1.5 px-2 rounded-md transition-colors">MAX</button>
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
                
                <button
                    onClick={handleSellClick}
                    disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > totalCurrentValue}
                    className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                >
                    Confirm Sale
                </button>
            </div>
        </div>
    );
};

export default SellModal;

import React from 'react';
import { Artist, Investment } from '../types';
import { CloseIcon, TrendUpIcon, TrendDownIcon, StarIcon } from './icons';
import Chart from './Chart';

interface ArtistDetailPageProps {
  artist: Artist;
  investments: Investment[];
  onClose: () => void;
  onInvest: (artist: Artist) => void;
  onSell: () => void;
}

const ArtistDetailPage: React.FC<ArtistDetailPageProps> = ({ artist, investments, onClose, onInvest, onSell }) => {
    const history = artist.followerHistory;
    const followerChange = history.length > 1 ? history[history.length - 1].count - history[0].count : 0;
    const isGrowth = followerChange >= 0;

    const artistInvestments = investments.filter(inv => inv.artistId === artist.id);
    
    const calculateCurrentValue = (investment: Investment) => {
        if (investment.initialFollowers === 0) return investment.initialInvestment;
        const growth = (artist.followers - investment.initialFollowers) / investment.initialFollowers;
        return investment.initialInvestment * (1 + growth);
    };
    
    const totalHoldingsValue = artistInvestments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);
    const totalInvestment = artistInvestments.reduce((sum, inv) => sum + inv.initialInvestment, 0);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ')
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
              <CloseIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <img src={artist.imageUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover shadow-lg flex-shrink-0 border-4 border-gray-700/50" />
                <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                    <div className="flex items-center justify-center sm:justify-start space-x-4 text-gray-300 mt-1">
                        <p className="text-lg font-semibold">{artist.followers.toLocaleString()} Followers</p>
                        <span className="flex items-center font-semibold text-lg">
                            <StarIcon className="w-5 h-5 mr-1 text-gray-300" />
                            {artist.popularity}
                        </span>
                    </div>
                    <div className={`flex items-center mt-1 text-sm ${isGrowth ? 'text-emerald-400' : 'text-red-400'} justify-center sm:justify-start`}>
                        {isGrowth ? <TrendUpIcon className="w-4 h-4 mr-1"/> : <TrendDownIcon className="w-4 h-4 mr-1"/>}
                        {followerChange > 0 ? '+' : ''}{followerChange.toLocaleString()} (Total)
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Follower History</h3>
                    <Chart data={artist.followerHistory} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Your Position</h3>
                     {artistInvestments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 text-center bg-gray-800/50 p-4 rounded-lg">
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Total Invested</p>
                                <p className="font-semibold text-white text-xl">{formatCurrency(totalInvestment)}</p>
                            </div>
                             <div>
                                <p className="text-xs text-gray-400 uppercase">Current Value</p>
                                <p className="font-semibold text-white text-xl">{formatCurrency(totalHoldingsValue)}</p>
                            </div>
                        </div>
                     ) : (
                         <p className="text-gray-400 text-center py-4 bg-gray-800/50 rounded-lg">You have no holdings in this artist.</p>
                     )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-700/50">
                    <button
                        onClick={() => onInvest(artist)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20"
                    >
                        Invest
                    </button>
                     <button
                        onClick={onSell}
                        disabled={artistInvestments.length === 0}
                        className="w-full bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold py-3 px-4 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-red-500/20 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                    >
                        Sell Holdings
                    </button>
                </div>
            </div>
          </div>
        </div>
    );
};

export default ArtistDetailPage;
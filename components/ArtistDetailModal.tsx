
// Fix: Provide content for the ArtistDetailModal.tsx file.
import React, { useState, useEffect } from 'react';
import { Artist } from '../types';
import { CloseIcon, TrendUpIcon, TrendDownIcon } from './icons';
import Chart from './Chart';
import { generateArtistInsight } from '../services/geminiService';

interface ArtistDetailModalProps {
  artist: Artist;
  onClose: () => void;
  onInvest: (artist: Artist) => void;
}

const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({ artist, onClose, onInvest }) => {
    const [insight, setInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoadingInsight(true);
            const result = await generateArtistInsight(artist);
            setInsight(result);
            setIsLoadingInsight(false);
        };
        fetchInsight();
    }, [artist]);
    
    const history = artist.followerHistory;
    const followerChange = history.length > 1 ? history[history.length - 1].count - history[0].count : 0;
    const isGrowth = followerChange >= 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-2xl relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <CloseIcon className="w-6 h-6" />
                </button>
                
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                    <img src={artist.imageUrl} alt={artist.name} className="w-28 h-28 rounded-full object-cover shadow-lg flex-shrink-0 border-4 border-gray-700/50" />
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
                        <p className="text-lg text-gray-300 font-semibold">{artist.followers.toLocaleString()} Followers</p>
                        <div className={`flex items-center mt-1 text-sm ${isGrowth ? 'text-emerald-400' : 'text-red-400'} justify-center sm:justify-start`}>
                            {isGrowth ? <TrendUpIcon className="w-4 h-4 mr-1"/> : <TrendDownIcon className="w-4 h-4 mr-1"/>}
                            {followerChange >= 0 ? '+' : ''}{followerChange.toLocaleString()} (30d)
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">AI-Powered Insight</h3>
                        <div className="bg-gray-800/50 p-4 rounded-lg text-gray-300 text-sm min-h-[6rem]">
                            {isLoadingInsight ? (
                               <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-400"></div>
                                    <span className="ml-3">Generating analysis...</span>
                               </div>
                            ) : (
                                <p className="italic">{insight}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-200 mb-2">Follower History (30 Days)</h3>
                        <Chart data={artist.followerHistory} />
                    </div>

                    <button
                        onClick={() => {
                            onInvest(artist);
                            onClose();
                        }}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20"
                    >
                        Invest in {artist.name}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtistDetailModal;

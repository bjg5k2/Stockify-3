import React, { useState, useEffect } from 'react';
import { Artist, Investment } from '../types';
import { TrendUpIcon, TrendDownIcon } from './icons';
import Chart from './Chart';
import { getArtistBio } from '../services/geminiService';

interface ArtistDetailPageProps {
  artist: Artist;
  investments: Investment[];
  onBack: () => void;
  onInvest: (artist: Artist) => void;
  onUpdateBio: (artistId: string, bio: string) => void;
}

const ArtistDetailPage: React.FC<ArtistDetailPageProps> = ({ artist, investments, onBack, onInvest, onUpdateBio }) => {
    const history = artist.followerHistory;
    const followerChange = history.length > 1 ? history[history.length - 1].count - history[0].count : 0;
    const isGrowth = followerChange >= 0;

    const artistInvestments = investments.filter(inv => inv.artistId === artist.id);
    const totalInvested = artistInvestments.reduce((sum, inv) => sum + inv.initialInvestment, 0);

    // Fix: Add state and effect to fetch and display artist biography.
    const [bio, setBio] = useState(artist.bio || 'Fetching bio...');

    useEffect(() => {
        if (!artist.bio && artist.name) {
            getArtistBio(artist.name).then(fetchedBio => {
                setBio(fetchedBio);
                onUpdateBio(artist.id, fetchedBio);
            });
        } else if (artist.bio) {
            setBio(artist.bio);
        }
    }, [artist.bio, artist.name, artist.id, onUpdateBio]);

    const StatCard: React.FC<{ label: string; value: string | number; }> = ({ label, value }) => (
        <div className="bg-gray-900/50 p-4 rounded-lg text-center shadow-md">
            <span className="text-sm text-gray-400 block uppercase tracking-wider">{label}</span>
            <span className="text-2xl font-bold text-white">{value}</span>
        </div>
    );

    return (
        <div className="animate-fade-in-up">
            <button onClick={onBack} className="mb-4 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Portfolio
            </button>

            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/80 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                        <img src={artist.imageUrl} alt={artist.name} className="w-32 h-32 rounded-full object-cover shadow-lg flex-shrink-0 border-4 border-gray-700/50" />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-4xl font-bold text-white">{artist.name}</h1>
                            <p className="text-xl text-gray-300 font-semibold">{artist.followers.toLocaleString()} Followers</p>
                            <div className={`flex items-center mt-1 text-sm ${isGrowth ? 'text-emerald-400' : 'text-red-400'} justify-center sm:justify-start`}>
                                {isGrowth ? <TrendUpIcon className="w-4 h-4 mr-1"/> : <TrendDownIcon className="w-4 h-4 mr-1"/>}
                                {followerChange > 0 ? '+' : ''}{followerChange.toLocaleString()} (30d)
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                         <StatCard label="Followers" value={artist.followers.toLocaleString()} />
                         <StatCard label="Total Invested (You)" value={totalInvested > 0 ? totalInvested.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace('$', 'C ') : 'N/A'} />
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Follower History</h3>
                            <Chart data={artist.followerHistory} />
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-200 mb-2">Biography</h3>
                            <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg text-sm leading-relaxed">
                                {bio}
                            </p>
                        </div>
                        
                        <button
                            onClick={() => onInvest(artist)}
                            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-emerald-500/20"
                        >
                            Invest More in {artist.name}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistDetailPage;

import React from 'react';
import { Artist } from '../types';

interface ArtistCardProps {
  artist: Artist;
  onInvestClick: () => void;
  onViewDetailClick: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onInvestClick, onViewDetailClick }) => {
  return (
    <div 
      onClick={onViewDetailClick}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 flex items-center space-x-4 transition-all duration-300 hover:bg-gray-700/60 hover:shadow-2xl hover:scale-[1.03] cursor-pointer group border border-gray-700/80 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <img src={artist.imageUrl} alt={artist.name} className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-gray-700/50 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{artist.name}</h3>
        <p className="text-sm text-gray-300">
          {artist.followers.toLocaleString()} Followers
        </p>
      </div>
      <div className="flex-shrink-0 z-10">
        <button
          onClick={(e) => {
              e.stopPropagation();
              onInvestClick();
          }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-emerald-500/30"
        >
          Invest
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
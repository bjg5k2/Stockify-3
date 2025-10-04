import React from 'react';
import { Artist } from '../types';
import { StarIcon } from './icons';

interface ArtistCardProps {
  artist: Artist;
  onInvest: (artist: Artist) => void;
  onViewDetail: (artistId: string) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onInvest, onViewDetail }) => {

  return (
    <div 
      onClick={() => onViewDetail(artist.id)}
      className="bg-gray-800/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-emerald-500/10 hover:ring-2 hover:ring-emerald-500/50 flex flex-col group cursor-pointer"
    >
      <div className="relative">
        <img src={artist.imageUrl} alt={artist.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-xl font-bold text-white truncate">{artist.name}</h3>
          <div className="flex justify-between items-baseline text-sm text-gray-300 mt-1">
              <span>{artist.followers.toLocaleString()} Followers</span>
              <span className="flex items-center font-semibold text-gray-300">
                  <StarIcon className="w-4 h-4 mr-1 text-gray-300" />
                  {artist.popularity}
              </span>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent card's onClick from firing
            onInvest(artist);
          }}
          className="w-full bg-emerald-500/80 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Invest
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
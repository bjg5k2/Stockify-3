import React from 'react';
import { Artist } from '../types';
import ArtistCard from './ArtistCard';

interface ArtistListProps {
  artists: Artist[];
  onInvest: (artist: Artist) => void;
  onViewDetail: (artist: Artist) => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ artists, onInvest, onViewDetail }) => {
  return (
    <div>
      {artists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artists.map(artist => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onInvestClick={() => onInvest(artist)}
              onViewDetailClick={() => onViewDetail(artist)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
            <p>No artists found.</p>
        </div>
      )}
    </div>
  );
};

export default ArtistList;
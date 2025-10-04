// Fix: Implemented the ArtistList component.
import React from 'react';
import { Artist } from '../types';
import ArtistCard from './ArtistCard';

interface ArtistListProps {
  artists: Artist[];
  onInvest: (artist: Artist) => void;
  onViewDetail: (artistId: string) => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ artists, onInvest, onViewDetail }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artists.map(artist => (
        <ArtistCard 
          key={artist.id} 
          artist={artist} 
          onInvest={onInvest}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
};

export default ArtistList;

// Fix: Provide content for the ArtistProfileModal.tsx file.
import React from 'react';
import { Artist } from '../types';
import { CloseIcon } from './icons';

interface ArtistProfileModalProps {
  artist: Artist;
  onClose: () => void;
}

const ArtistProfileModal: React.FC<ArtistProfileModalProps> = ({ artist, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/70 backdrop-blur-xl border border-gray-700/80 rounded-xl shadow-2xl p-6 w-full max-w-sm relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <img src={artist.imageUrl} alt={artist.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 mb-4" />
            <h2 className="text-2xl font-bold text-white">{artist.name}</h2>
            <p className="text-md text-gray-300">{artist.followers.toLocaleString()} Followers</p>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileModal;

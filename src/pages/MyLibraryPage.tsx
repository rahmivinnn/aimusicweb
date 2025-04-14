
import { FC, useState, useEffect } from 'react';
import { remixService } from '@/services/remixService';
import { RemixResult } from '@/services/spotifyApiService';
import { useNavigate } from 'react-router-dom';
import RemixCard from '@/components/RemixCard';

const MyLibraryPage: FC = () => {
  const [remixes, setRemixes] = useState<RemixResult[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRemixes = async () => {
      try {
        const savedRemixes = await remixService.getSavedRemixes();
        setRemixes(savedRemixes);
      } catch (error) {
        console.error('Error fetching saved remixes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRemixes();
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlayRemix = (remixId: string) => {
    navigate(`/remix-result/${remixId}`);
  };
  
  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Library</h1>
        <p className="text-gray-400">All your saved remixes in one place</p>
      </div>
      
      {loading ? (
        <p className="text-gray-400">Loading your library...</p>
      ) : remixes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-4">Your library is empty</h2>
          <p className="text-gray-400 mb-6">Save remixes to access them later</p>
          <button 
            className="bg-studio-neon text-black px-4 py-2 rounded-md hover:bg-studio-neon/90"
            onClick={() => navigate('/')}
          >
            Create a remix
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {remixes.map(remix => (
            <RemixCard
              key={remix.id}
              id={remix.id}
              title={remix.title}
              originalTitle={remix.originalTrack.name}
              originalArtist={remix.originalTrack.artist}
              date={formatDate(remix.createdAt)}
              duration={formatDuration(remix.duration)}
              imageUrl={remix.imageUrl}
              onPlay={() => handlePlayRemix(remix.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLibraryPage;

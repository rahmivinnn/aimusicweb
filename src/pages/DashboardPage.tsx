import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MoreVertical, Music, Share2, Wand2, Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AudioVisualizer from '@/components/AudioVisualizer';

interface RemixCardProps {
  id: string;
  title: string;
  genre: string;
  image: string;
  author: string;
  authorImage: string;
  audioUrl: string;
}

interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: RemixCardProps | null;
  progress: number;
  volume: number;
}

const RemixCard: FC<RemixCardProps & { onPlay: (remix: RemixCardProps) => void }> = ({ 
  id, title, genre, image, author, authorImage, audioUrl, onPlay 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { toast } = useToast();
  
  const handlePlay = () => {
    onPlay({ id, title, genre, image, author, authorImage, audioUrl });
  };
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from favorites" : "Added to favorites",
      description: isLiked ? `Removed ${title} from favorites` : `Added ${title} to favorites`,
    });
  };
  
  const handleMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "More options",
      description: "Options menu would appear here",
    });
  };

  return (
    <div 
      className="relative group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      <div className="rounded-lg overflow-hidden aspect-square relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button 
            className="bg-studio-neon hover:bg-studio-neon/90 text-black rounded-full w-12 h-12 flex items-center justify-center"
            size="icon"
          >
            <Music className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Heart icon for like/unlike */}
        <button 
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleLike}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
        </button>
      </div>
      
      <div className="mt-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-white">{title}</h3>
            <p className="text-sm text-gray-400">{genre}</p>
          </div>
          <button onClick={handleMore} className="text-gray-400 hover:text-white p-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center mt-2">
          <img src={authorImage} alt={author} className="w-6 h-6 rounded-full mr-2 border border-gray-700" />
          <span className="text-xs text-gray-400">{author}</span>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer: FC<{ audioState: AudioPlayerState; onPlayPause: () => void; onNext: () => void; onPrev: () => void; onVolumeChange: (value: number) => void }> = ({
  audioState,
  onPlayPause,
  onNext,
  onPrev,
  onVolumeChange
}) => {
  if (!audioState.currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0C1015] border-t border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src={audioState.currentTrack.image} 
            alt={audioState.currentTrack.title} 
            className="w-12 h-12 rounded-lg"
          />
          <div>
            <h4 className="text-white font-medium">{audioState.currentTrack.title}</h4>
            <p className="text-gray-400 text-sm">{audioState.currentTrack.author}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button onClick={onPrev} className="text-gray-400 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </button>
          <button 
            onClick={onPlayPause}
            className="bg-studio-neon hover:bg-studio-neon/90 text-black rounded-full w-10 h-10 flex items-center justify-center"
          >
            {audioState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button onClick={onNext} className="text-gray-400 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Volume2 className="text-gray-400 w-5 h-5" />
          <input
            type="range"
            min="0"
            max="100"
            value={audioState.volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="w-24 accent-studio-neon"
          />
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <div 
          className="h-full bg-studio-neon"
          style={{ width: `${audioState.progress}%` }}
        />
      </div>
    </div>
  );
};

const DashboardPage: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [audioState, setAudioState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTrack: null,
    progress: 0,
    volume: 80
  });
  
  const [remixes] = useState<RemixCardProps[]>([
    {
      id: '1',
      title: "Blinding Lights",
      genre: "Pop/Synthwave",
      image: "https://i.scdn.co/image/ab67616d0000b273a1c40ac6d1c350fd0a89b0a3",
      author: "Wade Warren",
      authorImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/4f9b4b68d4d5dc1e15efb1671e6bcccb4d8aab14"
    },
    {
      id: '2',
      title: "Dance The Night",
      genre: "Pop/Dance",
      image: "https://i.scdn.co/image/ab67616d0000b273ec96e006b8bdfc582610ec13",
      author: "Jenny Wilson",
      authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/8d56bbe335761e0a47977fbf4ebdc4bea46dd108"
    },
    {
      id: '3',
      title: "As It Was",
      genre: "Pop/Rock",
      image: "https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14",
      author: "Robert Fox",
      authorImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/c43dd07043b29e800c1a65b3a0102861fa3cf418"
    },
    {
      id: '4',
      title: "Flowers",
      genre: "Pop",
      image: "https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d",
      author: "Leslie Alexander",
      authorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/4a0253f2ff26ca675846d70fd3332c7b0b5c6d76"
    },
    {
      id: '5',
      title: "Anti-Hero",
      genre: "Pop/Indie",
      image: "https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5",
      author: "Dianne Russell",
      authorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/d45e3f0b26136f27c11d9819a8e5da9ea4f2b624"
    },
    {
      id: '6',
      title: "Cruel Summer",
      genre: "Pop",
      image: "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647",
      author: "Guy Hawkins",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
      audioUrl: "https://p.scdn.co/mp3-preview/768cc02a4a8beb436b830944f4be228994693528"
    },
  ]);

  const [audio] = useState(new Audio());

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }

    // Add error handling for audio
    audio.addEventListener('error', (e) => {
      toast({
        title: "Playback Error",
        description: "Unable to play this track. Please try another one.",
        variant: "destructive"
      });
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    });

    // Add ended event handler
    audio.addEventListener('ended', () => {
      handleNext();
    });

    // Cleanup audio on unmount
    return () => {
      audio.pause();
      audio.removeEventListener('error', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [navigate]);

  const handlePlayRemix = (remix: RemixCardProps) => {
    if (audioState.currentTrack?.id === remix.id) {
      // Toggle play/pause for current track
      if (audioState.isPlaying) {
        audio.pause();
        toast({
          title: "Paused",
          description: `Paused: ${remix.title}`,
        });
      } else {
        audio.play().catch(() => {
          toast({
            title: "Playback Error",
            description: "Unable to play this track. Please try another one.",
            variant: "destructive"
          });
        });
        toast({
          title: "Now Playing",
          description: `Playing: ${remix.title}`,
        });
      }
      setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    } else {
      // Play new track
      audio.src = remix.audioUrl;
      audio.volume = audioState.volume / 100;
      audio.play().catch(() => {
        toast({
          title: "Playback Error",
          description: "Unable to play this track. Please try another one.",
          variant: "destructive"
        });
      });
      toast({
        title: "Now Playing",
        description: `Playing: ${remix.title}`,
      });
      setAudioState(prev => ({
        ...prev,
        currentTrack: remix,
        isPlaying: true,
        progress: 0
      }));
    }
  };

  const handleNext = () => {
    if (!audioState.currentTrack) return;
    const currentIndex = remixes.findIndex(r => r.id === audioState.currentTrack?.id);
    const nextTrack = remixes[(currentIndex + 1) % remixes.length];
    handlePlayRemix(nextTrack);
  };

  const handlePrev = () => {
    if (!audioState.currentTrack) return;
    const currentIndex = remixes.findIndex(r => r.id === audioState.currentTrack?.id);
    const prevTrack = remixes[(currentIndex - 1 + remixes.length) % remixes.length];
    handlePlayRemix(prevTrack);
  };

  const handleVolumeChange = (value: number) => {
    audio.volume = value / 100;
    setAudioState(prev => ({ ...prev, volume: value }));
  };

  // Update progress bar
  useEffect(() => {
    const updateProgress = () => {
      if (audio.duration) {
        setAudioState(prev => ({
          ...prev,
          progress: (audio.currentTime / audio.duration) * 100
        }));
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [audio]);

  const handleCreateRemix = () => {
    navigate('/remix-studio');
  };
  
  const handleGenerateAudio = () => {
    navigate('/generate-audio');
  };

  return (
    <div className="py-8 px-6 max-w-7xl mx-auto transition-all animation-fade-in pb-24">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">AI-Powered Music Creation</h1>
        <p className="text-gray-400">Remix songs into EDM beats or generate unique audio from text using Composition converter.</p>
      </div>
      
      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-gradient-to-br from-blue-900/30 to-teal-900/30 rounded-lg p-8 border border-blue-800/30 hover:shadow-lg hover:shadow-blue-900/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-studio-neon mb-3">Remix Song AI</h2>
              <p className="text-gray-300 mb-6 max-w-md">
                Transform any song into an EDM remix with AI-powered creativity. Upload, remix, and enjoy!
              </p>
              <Button 
                onClick={handleCreateRemix}
                className="bg-studio-neon hover:bg-studio-neon/90 text-black"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Create remix
              </Button>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1571330735066-03aaa9429d89?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Mixer" 
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-8 border border-purple-800/30 hover:shadow-lg hover:shadow-purple-900/20 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-studio-neon mb-3">Text-to-Audio</h2>
              <p className="text-gray-300 mb-6 max-w-md">
                Convert your text into AI-generated music or vocals. Simply enter text and let AI create the sound!
              </p>
              <Button 
                onClick={handleGenerateAudio}
                className="bg-studio-neon hover:bg-studio-neon/90 text-black"
              >
                <Music className="mr-2 h-4 w-4" />
                Generate Audio
              </Button>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=150&h=150" 
                alt="Sound Waves" 
                className="w-24 h-24 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Remixes */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Recent Remixes</h2>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            View all
          </Button>
        </div>
        <p className="text-gray-400 mb-6">Here is the list of your recent remixes</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {remixes.map((remix) => (
            <RemixCard 
              key={remix.id} 
              {...remix} 
              onPlay={handlePlayRemix}
            />
          ))}
        </div>
      </div>
      
      {/* Trending Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            Explore
          </Button>
        </div>
        <p className="text-gray-400 mb-6">Discover popular tracks remixed by our community</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...remixes].reverse().map((remix) => (
            <RemixCard 
              key={remix.id} 
              {...remix} 
              onPlay={handlePlayRemix}
            />
          ))}
        </div>
      </div>

      {/* Audio Player */}
      <AudioPlayer 
        audioState={audioState}
        onPlayPause={() => handlePlayRemix(audioState.currentTrack!)}
        onNext={handleNext}
        onPrev={handlePrev}
        onVolumeChange={handleVolumeChange}
      />
    </div>
  );
};

export default DashboardPage;

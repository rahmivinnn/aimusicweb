import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Share2, Music, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedAudioVisualizer from './EnhancedAudioVisualizer';
import { useToast } from "@/hooks/use-toast";

interface RemixTrackPlayerProps {
  audioUrl: string;
  title: string;
  artist?: string;
  coverImage?: string;
  bpm?: number;
  genre?: string;
  onApplyEffects?: () => void;
  onSaveToLibrary?: () => void;
}

const RemixTrackPlayer: FC<RemixTrackPlayerProps> = ({
  audioUrl,
  title,
  artist,
  coverImage,
  bpm,
  genre,
  onApplyEffects,
  onSaveToLibrary
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLoading, setIsLoading] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  // Initialize audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    // Preload the audio
    audio.load();
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);
  
  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast({
          title: "Playback error",
          description: "There was a problem playing this audio file.",
          variant: "destructive"
        });
      });
    }
    setIsPlaying(!isPlaying);
  };
  
  // Skip backward
  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };
  
  // Skip forward
  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 10
      );
    }
  };
  
  // Seek to position
  const handleSeek = (values: number[]) => {
    if (audioRef.current && values.length > 0) {
      audioRef.current.currentTime = values[0];
      setCurrentTime(values[0]);
    }
  };
  
  // Change volume
  const handleVolumeChange = (values: number[]) => {
    if (audioRef.current && values.length > 0) {
      const newVolume = values[0];
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };
  
  // Format time (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle download
  const handleDownload = () => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${title.replace(/\s+/g, '_')}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download started",
      description: `${title} is being downloaded.`,
    });
  };
  
  // Handle share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `Check out this remix: ${title}`,
        url: window.location.href,
      })
      .catch(error => {
        toast({
          title: "Sharing failed",
          description: "There was a problem sharing this content.",
          variant: "destructive"
        });
      });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    }
  };
  
  // Handle save to library
  const handleSaveToLibrary = () => {
    if (onSaveToLibrary) {
      onSaveToLibrary();
    } else {
      toast({
        title: "Saved to library",
        description: `${title} has been added to your library`,
      });
    }
  };
  
  return (
    <motion.div
      className="bg-gradient-to-br from-[#1A1F26] to-[#0C1015] rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover Image */}
        <div className="relative w-full md:w-1/3 aspect-square rounded-lg overflow-hidden">
          <img 
            src={coverImage || "/images/default-cover.jpg"} 
            alt={title}
            className="w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white text-black hover:bg-white/90 hover:scale-110 transition rounded-full h-16 w-16"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
            </Button>
          </div>
        </div>
        
        {/* Track Info and Controls */}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              {artist && <p className="text-gray-400">{artist}</p>}
              
              <div className="flex items-center mt-2 space-x-3">
                {bpm && (
                  <span className="text-xs bg-[#2A2F36] text-gray-300 px-2 py-1 rounded">
                    {bpm} BPM
                  </span>
                )}
                {genre && (
                  <span className="text-xs bg-[#2A2F36] text-gray-300 px-2 py-1 rounded">
                    {genre}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-colors"
                onClick={handleDownload}
              >
                <Download size={20} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-[#00FFD1] hover:bg-[#00FFD1]/10 transition-colors"
                onClick={handleShare}
              >
                <Share2 size={20} />
              </Button>
            </div>
          </div>
          
          {/* Visualizer */}
          <div className="h-32 mb-4 bg-[#0C1015] rounded-lg overflow-hidden">
            <EnhancedAudioVisualizer
              isActive={true}
              type="complete"
              audioUrl={audioUrl}
              isPlaying={isPlaying}
              height={128}
            />
          </div>
          
          {/* Playback Controls */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#00FFD1] transition-colors"
              onClick={handleSkipBack}
            >
              <SkipBack size={24} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full p-6 ${isPlaying ? 'bg-[#00FFD1] text-black' : 'bg-white text-black'} hover:scale-105 transition`}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#00FFD1] transition-colors"
              onClick={handleSkipForward}
            >
              <SkipForward size={24} />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center mb-4">
            <span className="text-gray-400 text-sm w-12">{formatTime(currentTime)}</span>
            <Slider
              className="mx-2 flex-1"
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
            />
            <span className="text-gray-400 text-sm w-12">{formatTime(duration)}</span>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center mb-6">
            <Volume2 size={18} className="text-gray-400 mr-2" />
            <Slider
              className="w-32"
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
            />
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {onApplyEffects && (
              <Button
                variant="outline"
                className="border-gray-700 hover:border-[#00FFD1] hover:bg-[#00FFD1]/10 text-white transition-all"
                onClick={onApplyEffects}
              >
                <Wand2 className="mr-2 h-4 w-4" />
                Apply Effects
              </Button>
            )}
            
            <Button
              className="bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black transition-all"
              onClick={handleSaveToLibrary}
            >
              <Music className="mr-2 h-4 w-4" />
              Save to Library
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RemixTrackPlayer;

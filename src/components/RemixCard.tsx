import { FC, useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Heart, MoreVertical, Share2, Download } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

interface RemixCardProps {
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  likes: number;
  onLike: () => void;
  onShare: () => void;
  onDownload: () => void;
}

const RemixCard: FC<RemixCardProps> = ({
  title,
  artist,
  coverUrl,
  audioUrl,
  likes,
  onLike,
  onShare,
  onDownload
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [visualizerTheme, setVisualizerTheme] = useState<'default' | 'neon' | 'spectrum' | 'circular'>('default');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioUrl);
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current?.duration || 0);
    });

    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
    });

    audioRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
    audioSourceRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cycle through visualizer themes
  const cycleVisualizerTheme = () => {
    const themes: Array<'default' | 'neon' | 'spectrum' | 'circular'> = ['default', 'neon', 'spectrum', 'circular'];
    const currentIndex = themes.indexOf(visualizerTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setVisualizerTheme(themes[nextIndex]);
  };

  return (
    <Card className="w-full bg-[#1A1F26] border-none overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-0 m-auto bg-black/50 hover:bg-black/70 text-white w-12 h-12 rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-1" />
              )}
            </Button>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{artist}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={onLike}>
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onDownload}>
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cycleVisualizerTheme}>
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div 
              className="space-y-2 cursor-pointer" 
              onClick={cycleVisualizerTheme}
              title="Click to change visualization style"
            >
              {audioContextRef.current && audioSourceRef.current && (
                <AudioVisualizer
                  audioContext={audioContextRef.current}
                  audioSource={audioSourceRef.current}
                  isPlaying={isPlaying}
                  theme={visualizerTheme}
                />
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Heart className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">{likes} likes</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RemixCard;

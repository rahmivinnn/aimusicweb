import { FC, useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Download, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/hooks/use-toast";
import AudioVisualizer from './AudioVisualizer';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  subtitle?: string;
  onSaveToLibrary?: () => void;
  onGenerateNew?: () => void;
  audioSettings?: {
    reverb: number;
    delay: number;
    compression: number;
    eq: {
      low: number;
      mid: number;
      high: number;
    };
  };
  isPlaying?: boolean;
  onPlayPause?: () => void;
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  duration?: number;
  onDurationChange?: (duration: number) => void;
  showControls?: boolean;
}

const AudioPlayer: FC<AudioPlayerProps> = ({ 
  audioUrl, 
  title, 
  subtitle,
  onSaveToLibrary,
  onGenerateNew,
  audioSettings,
  isPlaying,
  onPlayPause,
  currentTime,
  onTimeUpdate,
  duration,
  onDurationChange,
  showControls
}) => {
  const [isPlayingState, setIsPlaying] = useState(isPlaying || false);
  const [currentTimeState, setCurrentTime] = useState(currentTime || 0);
  const [durationState, setDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(0.8);
  const [visualizerActive, setVisualizerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
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

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingState) {
      audio.pause();
      setVisualizerActive(false);
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast({
          title: "Playback error",
          description: "There was a problem playing this audio file.",
          variant: "destructive"
        });
      });
      setVisualizerActive(true);
    }
    setIsPlaying(!isPlayingState);
  };

  const handleSkipBack = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const handleSkipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 15
      );
    }
  };

  const handleSeek = (values: number[]) => {
    if (audioRef.current && values.length > 0) {
      audioRef.current.currentTime = values[0];
      setCurrentTime(values[0]);
    }
  };

  const handleVolumeChange = (values: number[]) => {
    if (audioRef.current && values.length > 0) {
      const newVolume = values[0];
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleSave = () => {
    if (onSaveToLibrary) {
      onSaveToLibrary();
    } else {
      toast({
        title: "Saved to library",
        description: `${title} has been added to your library`,
      });
    }
  };
  
  const handleDownload = async () => {
    if (!audioRef.current?.src) {
      console.error('No audio source available');
      return;
    }

    try {
      // Show loading state
      setIsLoading(true);

      // Fetch the audio data
      const response = await fetch(audioRef.current.src);
      const arrayBuffer = await response.arrayBuffer();
      
      // Create audio context and decode audio data
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Process the audio with effects
      const processedBuffer = await processAudioBuffer(audioBuffer);
      
      // Convert to WAV format
      const wavData = audioBufferToWav(processedBuffer);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
      link.href = url;
      link.download = 'processed_audio.wav';
      
      // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
      // Cleanup
      URL.revokeObjectURL(url);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsLoading(false);
    }
  };

  // Audio processing functions
  const applyReverb = async (audioContext: BaseAudioContext, buffer: AudioBuffer, reverbLevel: number) => {
    const convolver = audioContext.createConvolver();
    // Create a simple impulse response for reverb
    const impulseLength = 0.5;
    const sampleRate = audioContext.sampleRate;
    const impulseBuffer = audioContext.createBuffer(2, sampleRate * impulseLength, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulseBuffer.getChannelData(channel);
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * reverbLevel));
      }
    }
    
    convolver.buffer = impulseBuffer;
    return convolver;
  };
  
  const applyDelay = (audioContext: BaseAudioContext, delayTime: number) => {
    const delay = audioContext.createDelay();
    delay.delayTime.value = delayTime;
    const feedback = audioContext.createGain();
    feedback.gain.value = 0.3;
    
    delay.connect(feedback);
    feedback.connect(delay);
    
    return delay;
  };
  
  const applyCompression = (audioContext: BaseAudioContext, threshold: number) => {
    const compressor = audioContext.createDynamicsCompressor();
    compressor.threshold.value = threshold;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;
    return compressor;
  };
  
  const applyEQ = (audioContext: BaseAudioContext, eqSettings: typeof audioSettings.eq) => {
    const low = audioContext.createBiquadFilter();
    const mid = audioContext.createBiquadFilter();
    const high = audioContext.createBiquadFilter();
    
    low.type = 'lowshelf';
    low.frequency.value = 200;
    low.gain.value = eqSettings.low;
    
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.gain.value = eqSettings.mid;
    
    high.type = 'highshelf';
    high.frequency.value = 4000;
    high.gain.value = eqSettings.high;
    
    low.connect(mid);
    mid.connect(high);
    
    return { input: low, output: high };
  };
  
  const processAudioBuffer = async (buffer: AudioBuffer) => {
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Create effects chain
    const preGain = audioContext.createGain();
    const reverb = await applyReverb(audioContext, buffer, audioSettings.reverb);
    const delay = applyDelay(audioContext, audioSettings.delay);
    const compressor = applyCompression(audioContext, -50 + audioSettings.compression * 50);
    const eq = applyEQ(audioContext, audioSettings.eq);
    const limiter = audioContext.createDynamicsCompressor(); // Add limiter
    const postGain = audioContext.createGain();
    
    // Configure limiter for maximum loudness
    limiter.threshold.value = -3.0;
    limiter.knee.value = 0.0;
    limiter.ratio.value = 20.0;
    limiter.attack.value = 0.001;
    limiter.release.value = 0.1;
    
    // Set pre and post gain levels
    preGain.gain.value = 0.8;
    postGain.gain.value = 0.9;
    
    // Connect the processing chain
    source
      .connect(preGain)
      .connect(eq.input);
    
    eq.output
      .connect(compressor)
      .connect(delay)
      .connect(reverb)
      .connect(limiter)
      .connect(postGain)
      .connect(audioContext.destination);
    
    // Create offline context for rendering
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );
    
    // Clone nodes for offline rendering
    const offlineSource = offlineContext.createBufferSource();
    offlineSource.buffer = buffer;
    
    // Create and connect offline processing chain
    const offlinePreGain = offlineContext.createGain();
    const offlineReverb = await applyReverb(offlineContext, buffer, audioSettings.reverb);
    const offlineDelay = applyDelay(offlineContext, audioSettings.delay);
    const offlineCompressor = applyCompression(offlineContext, -50 + audioSettings.compression * 50);
    const offlineEq = applyEQ(offlineContext, audioSettings.eq);
    const offlineLimiter = offlineContext.createDynamicsCompressor();
    const offlinePostGain = offlineContext.createGain();
    
    // Configure offline limiter
    offlineLimiter.threshold.value = -3.0;
    offlineLimiter.knee.value = 0.0;
    offlineLimiter.ratio.value = 20.0;
    offlineLimiter.attack.value = 0.001;
    offlineLimiter.release.value = 0.1;
    
    // Set offline gains
    offlinePreGain.gain.value = 0.8;
    offlinePostGain.gain.value = 0.9;
    
    // Connect offline chain
    offlineSource
      .connect(offlinePreGain)
      .connect(offlineEq.input);
    
    offlineEq.output
      .connect(offlineCompressor)
      .connect(offlineDelay)
      .connect(offlineReverb)
      .connect(offlineLimiter)
      .connect(offlinePostGain)
      .connect(offlineContext.destination);
    
    // Render audio
    offlineSource.start();
    const renderedBuffer = await offlineContext.startRendering();
    
    return renderedBuffer;
  };

  // Helper function to convert AudioBuffer to WAV format
  const audioBufferToWav = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const buffer32 = new Float32Array(buffer.length * numOfChan);
    const view = new DataView(new ArrayBuffer(44 + length));
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const offset = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numOfChan; channel++) {
        const sample = buffer.getChannelData(channel)[i];
        const scaled = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        view.setInt16(offset + (i * numOfChan + channel) * 2, scaled, true);
      }
    }
    
    return view.buffer;
  };
  
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
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

  return (
    <div className="w-full transition-all duration-300 hover:shadow-lg p-4 rounded-xl bg-studio-darkerBlue/50 backdrop-blur-sm">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {subtitle && (
        <div className="flex justify-between mb-2">
          <div>
            <h3 className="text-white text-xl font-medium">{title}</h3>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-studio-neon hover:bg-studio-neon/10 transition-colors"
              onClick={handleDownload}
            >
              <Download size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-studio-neon hover:bg-studio-neon/10 transition-colors"
              onClick={handleShare}
            >
              <Share2 size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:text-studio-neon hover:bg-studio-neon/10 transition-colors"
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </div>
      )}
      
      <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-studio-dark to-black border border-studio-darkerBlue">
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <AudioVisualizer 
            isActive={visualizerActive} 
            type="complete" 
            audioUrl={audioUrl}
            isPlaying={isPlayingState}
          />
        </div>
        
        <img 
          src="/lovable-uploads/cc2eca7d-d517-4f42-86ee-7f680af2f474.png" 
          alt="Visualizer" 
          className="w-full h-64 object-cover rounded-lg opacity-60"
        />
        
        <div className="absolute inset-0 flex items-center justify-center space-x-8">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/30 text-white hover:bg-black/50 hover:scale-110 transition rounded-full h-12 w-12"
            onClick={handleSkipBack}
          >
            <SkipBack size={24} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white text-black hover:bg-white/90 hover:scale-110 transition rounded-full h-16 w-16"
            onClick={togglePlayPause}
          >
            {isPlayingState ? <Pause size={30} /> : <Play size={30} className="ml-1" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/30 text-white hover:bg-black/50 hover:scale-110 transition rounded-full h-12 w-12"
            onClick={handleSkipForward}
          >
            <SkipForward size={24} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center mt-3 mb-6">
        <span className="text-gray-400 text-sm w-12">{formatTime(currentTimeState)}</span>
        <Slider
          className="mx-2 flex-1"
          value={[currentTimeState]}
          max={durationState || 100}
          step={0.1}
          onValueChange={handleSeek}
        />
        <span className="text-gray-400 text-sm w-12">{formatTime(durationState)}</span>
        
        <div className="ml-4 flex items-center w-32">
          <Volume2 size={18} className="text-gray-400 mr-2" />
          <Slider
            className="flex-1"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
      
      {(onSaveToLibrary || onGenerateNew) && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {onGenerateNew && (
            <Button 
              variant="outline" 
              className="py-6 border-gray-700 hover:border-studio-neon hover:bg-studio-neon/10 text-white transition-all duration-300 hover:scale-105"
              onClick={onGenerateNew}
            >
              Generate New Remix
            </Button>
          )}
          
          {onSaveToLibrary && (
            <Button 
              className="py-6 bg-studio-neon hover:bg-studio-neon/90 text-black transition-all duration-300 hover:scale-105"
              onClick={handleSave}
            >
              Save to Library
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;

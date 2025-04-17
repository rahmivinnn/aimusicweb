import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Plus, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { AudioSample } from '@/services/audioSampleService';
import EnhancedAudioVisualizer from './EnhancedAudioVisualizer';

interface AudioSamplePlayerProps {
  sample: AudioSample;
  audioContext: AudioContext | null;
  onAddToMixer: (sample: AudioSample, buffer: AudioBuffer) => void;
}

const AudioSamplePlayer: FC<AudioSamplePlayerProps> = ({
  sample,
  audioContext,
  onAddToMixer
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [buffer, setBuffer] = useState<AudioBuffer | null>(null);
  
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Load or create sample buffer
  useEffect(() => {
    if (!audioContext) return;
    
    // In a real app, this would fetch the actual audio file
    // For now, we'll create a synthetic buffer
    const createSyntheticBuffer = () => {
      const sampleRate = audioContext.sampleRate;
      const duration = sample.duration || 2; // Default to 2 seconds if not specified
      const frameCount = sampleRate * duration;
      
      const newBuffer = audioContext.createBuffer(
        2, // Stereo
        frameCount,
        sampleRate
      );
      
      // Fill buffer with synthetic audio based on sample type
      for (let channel = 0; channel < 2; channel++) {
        const channelData = newBuffer.getChannelData(channel);
        
        switch (sample.category) {
          case 'drums':
            createDrumSound(channelData, sampleRate, sample.name);
            break;
          case 'bass':
            createBassSound(channelData, sampleRate);
            break;
          case 'melody':
            createMelodySound(channelData, sampleRate, sample.name);
            break;
          case 'fx':
            createFxSound(channelData, sampleRate);
            break;
          case 'vocals':
            createVocalSound(channelData, sampleRate);
            break;
          default:
            createDefaultSound(channelData, sampleRate);
        }
      }
      
      return newBuffer;
    };
    
    const newBuffer = createSyntheticBuffer();
    setBuffer(newBuffer);
    
    return () => {
      stopPlayback();
    };
  }, [audioContext, sample]);
  
  // Create synthetic drum sounds
  const createDrumSound = (channelData: Float32Array, sampleRate: number, name: string) => {
    if (name.toLowerCase().includes('kick')) {
      // Kick drum
      const decay = 0.9;
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * 60 * Math.exp(-t * 10) * t) * Math.exp(-t * decay * 5);
      }
    } else if (name.toLowerCase().includes('snare')) {
      // Snare drum
      const decay = 0.3;
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        const noise = Math.random() * 2 - 1;
        channelData[i] = (noise * Math.exp(-t * 20) * 0.8 + Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 10) * 0.2) * Math.exp(-t * decay * 5);
      }
    } else if (name.toLowerCase().includes('hat') || name.toLowerCase().includes('hi-hat')) {
      // Hi-hat
      const decay = 0.2;
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        const noise = Math.random() * 2 - 1;
        channelData[i] = noise * Math.exp(-t * 50) * Math.exp(-t * decay * 10);
      }
    } else {
      // Generic percussion
      const decay = 0.5;
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        const noise = Math.random() * 2 - 1;
        channelData[i] = (noise * 0.5 + Math.sin(2 * Math.PI * 150 * t) * 0.5) * Math.exp(-t * decay * 8);
      }
    }
  };
  
  // Create synthetic bass sounds
  const createBassSound = (channelData: Float32Array, sampleRate: number) => {
    const baseFreq = 60 + Math.random() * 40; // Random bass frequency
    const decay = 0.5;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Bass with slight envelope
      channelData[i] = Math.sin(2 * Math.PI * baseFreq * t) * Math.exp(-t * decay) * 0.8;
      // Add some harmonics
      channelData[i] += Math.sin(2 * Math.PI * baseFreq * 2 * t) * Math.exp(-t * decay * 2) * 0.2;
    }
  };
  
  // Create synthetic melody sounds
  const createMelodySound = (channelData: Float32Array, sampleRate: number, name: string) => {
    // Create a sequence of notes
    const notes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C4, D4, E4, F4, G4, A4, B4
    const noteLength = 0.2; // seconds per note
    const decay = 0.8;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor(t / noteLength) % notes.length;
      const noteTime = t % noteLength;
      const freq = notes[noteIndex];
      
      // Create a plucky sound with envelope
      const envelope = Math.exp(-noteTime * 10) * 0.5 + Math.exp(-noteTime * 2) * 0.5;
      channelData[i] = Math.sin(2 * Math.PI * freq * noteTime) * envelope * Math.exp(-t * decay * 0.5);
    }
  };
  
  // Create synthetic FX sounds
  const createFxSound = (channelData: Float32Array, sampleRate: number) => {
    // Create a sweeping effect
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      const sweep = 100 + 4000 * Math.pow(t / (channelData.length / sampleRate), 2);
      const noise = Math.random() * 2 - 1;
      
      channelData[i] = (
        Math.sin(2 * Math.PI * sweep * t) * 0.7 + 
        noise * 0.3
      ) * Math.exp(-t * 1.5);
    }
  };
  
  // Create synthetic vocal-like sounds
  const createVocalSound = (channelData: Float32Array, sampleRate: number) => {
    const baseFreq = 220; // A3
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      // Create a formant-like sound with multiple harmonics
      let sample = 0;
      
      // Fundamental
      sample += Math.sin(2 * Math.PI * baseFreq * t) * 0.5;
      
      // Formants (vowel-like)
      sample += Math.sin(2 * Math.PI * baseFreq * 2 * t) * 0.25;
      sample += Math.sin(2 * Math.PI * baseFreq * 3 * t) * 0.125;
      sample += Math.sin(2 * Math.PI * baseFreq * 4 * t) * 0.0625;
      
      // Add vibrato
      const vibrato = Math.sin(2 * Math.PI * 5 * t) * 0.01;
      sample *= 1 + vibrato;
      
      // Apply envelope
      channelData[i] = sample * Math.exp(-t * 0.5);
    }
  };
  
  // Default sound for any other category
  const createDefaultSound = (channelData: Float32Array, sampleRate: number) => {
    const baseFreq = 220;
    
    for (let i = 0; i < channelData.length; i++) {
      const t = i / sampleRate;
      channelData[i] = Math.sin(2 * Math.PI * baseFreq * t) * Math.exp(-t * 2);
    }
  };
  
  // Play the sample
  const playSample = () => {
    if (!audioContext || !buffer) return;
    
    // Stop any currently playing source
    stopPlayback();
    
    // Create new source and gain nodes
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = isMuted ? 0 : volume;
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start playback
    source.loop = true;
    source.start();
    
    // Save references
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    
    setIsPlaying(true);
  };
  
  // Stop playback
  const stopPlayback = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    
    setIsPlaying(false);
  };
  
  // Toggle play/pause
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playSample();
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : newVolume;
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newMutedState ? 0 : volume;
    }
  };
  
  // Add sample to mixer
  const handleAddToMixer = () => {
    if (buffer) {
      onAddToMixer(sample, buffer);
    }
  };
  
  return (
    <motion.div
      className="bg-[#1A1F26] rounded-lg p-4 hover:bg-[#1E242C] transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              isPlaying ? 'bg-[#00FFD1] text-black' : 'bg-[#2A2F36] text-white'
            }`}
          >
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-10 w-10 rounded-full"
              onClick={togglePlayback}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium">{sample.name}</h4>
            <p className="text-gray-400 text-xs">
              {sample.bpm > 0 ? `${sample.bpm} BPM` : 'One-shot'} • {sample.category}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 rounded-full hover:bg-[#00FFD1]/20"
          onClick={handleAddToMixer}
        >
          <Plus className="h-4 w-4 text-[#00FFD1]" />
        </Button>
      </div>
      
      <div className="mb-3">
        <EnhancedAudioVisualizer 
          isActive={isPlaying}
          type="bars"
          isPlaying={isPlaying}
          height={40}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-8 w-8"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-gray-500" />
            ) : (
              <Volume2 className="h-4 w-4 text-white" />
            )}
          </Button>
          <Slider
            value={[volume]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full max-w-[120px]"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {sample.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-1.5 py-0.5 rounded bg-[#2A2F36] text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AudioSamplePlayer;

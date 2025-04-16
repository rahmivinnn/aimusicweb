import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import {
  Music,
  Wand2,
  Upload,
  Settings2,
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  Share2,
  Volume2,
  Sliders,
  Layers,
  Disc,
  Headphones
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import AudioControls from './AudioControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioPlayer from './AudioPlayer';
import AudioEffects from './AudioEffects';
import RemixEffects from './RemixEffects';
import StemMixer from './StemMixer';
import BeatGrid from './BeatGrid';
import AudioSampleLibrary from './AudioSampleLibrary';
import AudioTrackMixer from './AudioTrackMixer';
import AudioEffectsRack from './AudioEffectsRack';
import { remixService } from '@/services/remixService';
import { AudioSample, audioSampleService } from '@/services/audioSampleService';
import { v4 as uuidv4 } from 'uuid';

// Interface for mixer tracks
interface MixerTrack {
  id: string;
  name: string;
  type: 'sample' | 'uploaded' | 'stem';
  buffer: AudioBuffer;
  volume: number;
  muted: boolean;
  solo: boolean;
  pan: number;
  color: string;
  // For sample tracks
  sample?: AudioSample;
}

// Interface for audio effects
interface AudioEffects {
  reverb: {
    enabled: boolean;
    amount: number; // 0-100
    decay: number; // 0-100
  };
  delay: {
    enabled: boolean;
    time: number; // 0-100 (maps to actual delay time)
    feedback: number; // 0-100
    mix: number; // 0-100
  };
  filter: {
    enabled: boolean;
    type: 'lowpass' | 'highpass' | 'bandpass';
    frequency: number; // 0-100 (maps to actual frequency)
    resonance: number; // 0-100
  };
  distortion: {
    enabled: boolean;
    amount: number; // 0-100
  };
  compressor: {
    enabled: boolean;
    threshold: number; // 0-100 (maps to dB)
    ratio: number; // 0-100 (maps to actual ratio)
    attack: number; // 0-100 (maps to ms)
    release: number; // 0-100 (maps to ms)
  };
}

interface AudioVisualizerProps {
  audioContext: AudioContext;
  buffer: AudioBuffer | null;
  isPlaying: boolean;
  theme?: 'default' | 'neon';
}

const RemixStudio: FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedAudioUrl, setProcessedAudioUrl] = useState<string | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedBPM, setDetectedBPM] = useState<number | null>(null);
  const [stems, setStems] = useState<{
    vocals: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    drums: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    bass: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    other: { buffer: AudioBuffer | null, volume: number, muted: boolean }
  } | null>(null);
  const [isSeparatingStem, setIsSeparatingStem] = useState(false);
  const [activeStems, setActiveStems] = useState<string[]>([]);
  const [loopPoints, setLoopPoints] = useState<{start: number, end: number} | null>(null);
  const [cuePoints, setCuePoints] = useState<number[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  // New state for enhanced remix functionality
  const [mixerTracks, setMixerTracks] = useState<MixerTrack[]>([]);
  const [activeTab, setActiveTab] = useState('mixer'); // 'mixer', 'samples', 'effects'
  const [audioEffects, setAudioEffects] = useState<AudioEffects>({
    reverb: { enabled: false, amount: 30, decay: 50 },
    delay: { enabled: false, time: 40, feedback: 30, mix: 50 },
    filter: { enabled: false, type: 'lowpass', frequency: 50, resonance: 20 },
    distortion: { enabled: false, amount: 20 },
    compressor: { enabled: false, threshold: 30, ratio: 40, attack: 20, release: 50 }
  });

  // Reference to audio effect nodes
  const masterGainRef = useRef<GainNode | null>(null);
  const effectsChainRef = useRef<{
    reverb?: ConvolverNode,
    delay?: DelayNode,
    filter?: BiquadFilterNode,
    distortion?: WaveShaperNode,
    compressor?: DynamicsCompressorNode
  }>({});

  const [audioSettings, setAudioSettings] = useState({
    reverb: 20,
    delay: 30,
    compression: 40,
    eq: { low: 0, mid: 0, high: 0 },
    volume: 1,
    sourceType: 'drums',
  });

  useEffect(() => {
    if (waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a5568',
        progressColor: '#00FFD1',
        cursorColor: '#00FFD1',
        barWidth: 2,
        barGap: 1,
        height: 100,
        normalize: true,
        barRadius: 3,
        minPxPerSec: 50 * zoomLevel, // Adjust zoom level
        plugins: [
          // Add regions plugin for loop points and cue points
        ]
      });

      // Add event listeners for waveform interactions
      if (wavesurferRef.current) {
        wavesurferRef.current.on('ready', handleWaveformReady);
        wavesurferRef.current.on('seek', handleWaveformSeek);
      }

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, [zoomLevel]);

  // Handler for waveform ready event
  const handleWaveformReady = () => {
    if (wavesurferRef.current && audioBuffer) {
      // Detect BPM
      detectBPM(audioBuffer);

      // Enable loop mode if loop points are set
      if (loopPoints) {
        wavesurferRef.current.setLoopSelection(loopPoints.start, loopPoints.end);
      }
    }
  };

  // Handler for waveform seek event
  const handleWaveformSeek = (progress: number) => {
    if (wavesurferRef.current) {
      const currentTime = progress * (wavesurferRef.current.getDuration() || 0);
      setCurrentTime(currentTime);
    }
  };

  // Detect BPM from audio buffer
  const detectBPM = async (buffer: AudioBuffer) => {
    try {
      // In a real implementation, this would use a BPM detection algorithm
      // For now, we'll simulate it with a random value between 90-140
      const simulatedBPM = Math.floor(Math.random() * 50) + 90;
      setDetectedBPM(simulatedBPM);

      toast({
        title: "BPM Detected",
        description: `Track tempo: ${simulatedBPM} BPM`,
      });
    } catch (error) {
      console.error('Error detecting BPM:', error);
    }
  };

  // Separate audio into stems
  const separateStems = async (buffer: AudioBuffer) => {
    if (!buffer) return;

    setIsSeparatingStem(true);

    try {
      // In a real implementation, this would use a stem separation algorithm like Spleeter
      // For now, we'll simulate it by creating copies of the buffer with different gains

      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const ctx = audioContextRef.current;

      // Simulate stem separation by creating modified copies of the original buffer
      const vocalsBuffer = simulateStemSeparation(buffer, ctx, 'vocals');
      const drumsBuffer = simulateStemSeparation(buffer, ctx, 'drums');
      const bassBuffer = simulateStemSeparation(buffer, ctx, 'bass');
      const otherBuffer = simulateStemSeparation(buffer, ctx, 'other');

      // Set the stems
      setStems({
        vocals: { buffer: vocalsBuffer, volume: 1, muted: false },
        drums: { buffer: drumsBuffer, volume: 1, muted: false },
        bass: { buffer: bassBuffer, volume: 1, muted: false },
        other: { buffer: otherBuffer, volume: 1, muted: false }
      });

      // Set all stems as active
      setActiveStems(['vocals', 'drums', 'bass', 'other']);

      toast({
        title: "Stems Separated",
        description: "Track has been separated into vocals, drums, bass, and other instruments.",
      });
    } catch (error) {
      console.error('Error separating stems:', error);
      toast({
        title: "Stem Separation Failed",
        description: "There was a problem separating the audio stems.",
        variant: "destructive"
      });
    } finally {
      setIsSeparatingStem(false);
    }
  };

  // Simulate stem separation (in a real app, this would use a proper algorithm)
  const simulateStemSeparation = (buffer: AudioBuffer, ctx: AudioContext, stemType: string): AudioBuffer => {
    // Create a new buffer with the same properties
    const newBuffer = ctx.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    // Copy and modify the data based on stem type
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const originalData = buffer.getChannelData(channel);
      const newData = new Float32Array(originalData.length);

      // Apply different processing based on stem type
      for (let i = 0; i < originalData.length; i++) {
        // This is a very simplified simulation - in reality, ML models would be used
        switch (stemType) {
          case 'vocals':
            // Emphasize mid frequencies
            newData[i] = originalData[i] * (Math.sin(i * 0.001) * 0.5 + 0.5);
            break;
          case 'drums':
            // Emphasize transients
            newData[i] = originalData[i] * (Math.abs(originalData[i]) > 0.1 ? 1 : 0.2);
            break;
          case 'bass':
            // Emphasize low frequencies
            newData[i] = originalData[i] * (Math.cos(i * 0.0005) * 0.5 + 0.5);
            break;
          case 'other':
            // Everything else
            newData[i] = originalData[i] * (Math.sin(i * 0.0002) * 0.3 + 0.7);
            break;
        }
      }

      newBuffer.copyToChannel(newData, channel);
    }

    return newBuffer;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setOriginalAudioUrl(fileUrl);

      // Load the file into WaveSurfer
      if (wavesurferRef.current) {
        wavesurferRef.current.load(fileUrl);
      }

      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Load the file into an AudioBuffer for processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result && audioContextRef.current) {
          try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            setAudioBuffer(decodedBuffer);

            // Detect BPM
            detectBPM(decodedBuffer);

            // Separate stems
            separateStems(decodedBuffer);
          } catch (error) {
            console.error('Error decoding audio data:', error);
            toast({
              title: "Processing Error",
              description: "There was a problem processing the audio file.",
              variant: "destructive"
            });
          }
        }
      };
      reader.readAsArrayBuffer(file);

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setOriginalAudioUrl(fileUrl);

      // Load the file into WaveSurfer
      if (wavesurferRef.current) {
        wavesurferRef.current.load(fileUrl);
      }

      // Create AudioContext if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      // Load the file into an AudioBuffer for processing
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result && audioContextRef.current) {
          try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const decodedBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            setAudioBuffer(decodedBuffer);

            // Detect BPM
            detectBPM(decodedBuffer);

            // Separate stems
            separateStems(decodedBuffer);
          } catch (error) {
            console.error('Error decoding audio data:', error);
            toast({
              title: "Processing Error",
              description: "There was a problem processing the audio file.",
              variant: "destructive"
            });
          }
        }
      };
      reader.readAsArrayBuffer(file);

      toast({
        title: "File uploaded",
        description: `${file.name} has been uploaded successfully.`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (wavesurferRef.current) {
      wavesurferRef.current.stop();
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(value);
    }
  };

  // Handle loop points
  const handleSetLoopPoints = (start: number, end: number) => {
    setLoopPoints({ start, end });

    if (wavesurferRef.current) {
      wavesurferRef.current.setLoopSelection(start, end);
    }

    toast({
      title: "Loop Set",
      description: `Loop from ${formatTime(start)} to ${formatTime(end)}`,
    });
  };

  // Handle cue points
  const handleAddCuePoint = (time: number) => {
    setCuePoints(prev => [...prev, time]);

    toast({
      title: "Cue Point Added",
      description: `Cue point added at ${formatTime(time)}`,
    });
  };

  // Handle stem volume change
  const handleStemVolumeChange = (stemType: string, volume: number) => {
    if (!stems) return;

    setStems(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        [stemType]: {
          ...prev[stemType as keyof typeof prev],
          volume
        }
      };
    });
  };

  // Handle stem mute toggle
  const handleStemMuteToggle = (stemType: string) => {
    if (!stems) return;

    setStems(prev => {
      if (!prev) return prev;

      const stem = prev[stemType as keyof typeof prev];

      return {
        ...prev,
        [stemType]: {
          ...stem,
          muted: !stem.muted
        }
      };
    });

    // Update active stems
    setActiveStems(prev => {
      if (prev.includes(stemType)) {
        return prev.filter(s => s !== stemType);
      } else {
        return [...prev, stemType];
      }
    });
  };

  // Handle zoom level change
  const handleZoomChange = (level: number) => {
    setZoomLevel(level);

    if (wavesurferRef.current) {
      wavesurferRef.current.zoom(50 * level);
    }
  };

  // Format time in MM:SS format
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProcessed = (buffer: AudioBuffer) => {
    setAudioBuffer(buffer);
    setIsProcessing(false);
    toast({
      title: "Processing complete",
      description: "Audio has been processed successfully!",
    });
  };

  // Handle adding a sample to the mixer
  const handleAddSample = (sample: AudioSample, buffer: AudioBuffer) => {
    // Create a new mixer track for the sample
    const newTrack: MixerTrack = {
      id: uuidv4(),
      name: sample.name,
      type: 'sample',
      buffer: buffer,
      volume: 0.8,
      muted: false,
      solo: false,
      pan: 0,
      color: getColorForSampleType(sample.category),
      sample: sample
    };

    setMixerTracks(prev => [...prev, newTrack]);

    toast({
      title: "Sample Added",
      description: `${sample.name} has been added to the mixer.`,
    });
  };

  // Get color for sample type
  const getColorForSampleType = (category: string): string => {
    switch (category) {
      case 'drums': return '#FF5E5E';
      case 'bass': return '#FFB800';
      case 'melody': return '#9D5CFF';
      case 'fx': return '#00FFD1';
      case 'vocals': return '#00B2FF';
      default: return '#FFFFFF';
    }
  };

  // Handle removing a track from the mixer
  const handleRemoveTrack = (trackId: string) => {
    setMixerTracks(prev => prev.filter(track => track.id !== trackId));
  };

  // Handle updating a track in the mixer
  const handleUpdateTrack = (trackId: string, updates: Partial<MixerTrack>) => {
    setMixerTracks(prev =>
      prev.map(track =>
        track.id === trackId ? { ...track, ...updates } : track
      )
    );
  };

  // Handle audio effects change
  const handleEffectsChange = (effects: AudioEffects) => {
    setAudioEffects(effects);

    // Apply effects to audio if playing
    if (isPlaying && audioContextRef.current) {
      applyAudioEffects(effects);
    }
  };

  // Apply audio effects to the current audio
  const applyAudioEffects = (effects: AudioEffects) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;

    // Create master gain node if it doesn't exist
    if (!masterGainRef.current) {
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.connect(ctx.destination);
    }

    // Disconnect all existing effect nodes
    Object.values(effectsChainRef.current).forEach(node => {
      if (node) {
        node.disconnect();
      }
    });

    // Clear effects chain
    effectsChainRef.current = {};

    // Create and connect new effect nodes based on enabled effects
    let lastNode: AudioNode = masterGainRef.current;

    // Compressor
    if (effects.compressor.enabled) {
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -60 + (effects.compressor.threshold / 100) * 60;
      compressor.ratio.value = 1 + (effects.compressor.ratio / 100) * 19;
      compressor.attack.value = 0.001 + (effects.compressor.attack / 100) * 0.999;
      compressor.release.value = 0.01 + (effects.compressor.release / 100) * 0.99;

      compressor.connect(lastNode);
      lastNode = compressor;
      effectsChainRef.current.compressor = compressor;
    }

    // Filter
    if (effects.filter.enabled) {
      const filter = ctx.createBiquadFilter();
      filter.type = effects.filter.type;
      filter.frequency.value = 20 + (effects.filter.frequency / 100) * 19980;
      filter.Q.value = (effects.filter.resonance / 100) * 20;

      filter.connect(lastNode);
      lastNode = filter;
      effectsChainRef.current.filter = filter;
    }

    // Distortion
    if (effects.distortion.enabled) {
      const distortion = ctx.createWaveShaper();
      const amount = effects.distortion.amount / 100 * 50;
      const curve = new Float32Array(ctx.sampleRate);
      const deg = Math.PI / 180;

      for (let i = 0; i < ctx.sampleRate; ++i) {
        const x = i * 2 / ctx.sampleRate - 1;
        curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
      }

      distortion.curve = curve;
      distortion.oversample = '4x';

      distortion.connect(lastNode);
      lastNode = distortion;
      effectsChainRef.current.distortion = distortion;
    }

    // Delay
    if (effects.delay.enabled) {
      const delay = ctx.createDelay(5.0);
      delay.delayTime.value = effects.delay.time / 100 * 2;

      const feedback = ctx.createGain();
      feedback.gain.value = effects.delay.feedback / 100;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - (effects.delay.mix / 100);

      const wetGain = ctx.createGain();
      wetGain.gain.value = effects.delay.mix / 100;

      // Connect delay with feedback loop
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);

      // Connect dry path
      dryGain.connect(lastNode);
      wetGain.connect(lastNode);

      lastNode = dryGain;
      effectsChainRef.current.delay = delay;
    }

    // Reverb (simplified - in a real app, would use convolution with impulse response)
    if (effects.reverb.enabled) {
      // Simulate reverb with a simple delay network
      const reverb = ctx.createConvolver();

      // Create impulse response (simplified)
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * (effects.reverb.decay / 100 * 5);
      const impulse = ctx.createBuffer(2, length, sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const impulseData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, effects.reverb.decay / 50);
        }
      }

      reverb.buffer = impulse;

      const dryGain = ctx.createGain();
      dryGain.gain.value = 1 - (effects.reverb.amount / 100);

      const wetGain = ctx.createGain();
      wetGain.gain.value = effects.reverb.amount / 100;

      reverb.connect(wetGain);
      wetGain.connect(lastNode);
      dryGain.connect(lastNode);

      lastNode = dryGain;
      effectsChainRef.current.reverb = reverb;
    }
  };

  // Preview an audio effect
  const handlePreviewEffect = (type: string) => {
    if (!audioContextRef.current || !audioBuffer) {
      toast({
        title: "No Audio",
        description: "Upload an audio file to preview effects.",
        variant: "destructive"
      });
      return;
    }

    // Create a short preview of the effect
    const ctx = audioContextRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Apply the specific effect
    const effectGain = ctx.createGain();
    effectGain.connect(ctx.destination);

    switch (type) {
      case 'reverb':
        if (audioEffects.reverb.enabled) {
          // Apply reverb effect for preview
          const reverb = ctx.createConvolver();
          const sampleRate = ctx.sampleRate;
          const length = sampleRate * (audioEffects.reverb.decay / 100 * 3);
          const impulse = ctx.createBuffer(2, length, sampleRate);

          for (let channel = 0; channel < 2; channel++) {
            const impulseData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
              impulseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, audioEffects.reverb.decay / 50);
            }
          }

          reverb.buffer = impulse;

          const dryGain = ctx.createGain();
          dryGain.gain.value = 1 - (audioEffects.reverb.amount / 100);

          const wetGain = ctx.createGain();
          wetGain.gain.value = audioEffects.reverb.amount / 100;

          source.connect(dryGain);
          source.connect(reverb);
          reverb.connect(wetGain);
          dryGain.connect(effectGain);
          wetGain.connect(effectGain);
        }
        break;

      case 'delay':
        if (audioEffects.delay.enabled) {
          // Apply delay effect for preview
          const delay = ctx.createDelay(5.0);
          delay.delayTime.value = audioEffects.delay.time / 100 * 0.5;

          const feedback = ctx.createGain();
          feedback.gain.value = audioEffects.delay.feedback / 100;

          const dryGain = ctx.createGain();
          dryGain.gain.value = 1 - (audioEffects.delay.mix / 100);

          const wetGain = ctx.createGain();
          wetGain.gain.value = audioEffects.delay.mix / 100;

          source.connect(dryGain);
          source.connect(delay);
          delay.connect(feedback);
          feedback.connect(delay);
          delay.connect(wetGain);
          dryGain.connect(effectGain);
          wetGain.connect(effectGain);
        }
        break;

      case 'filter':
        if (audioEffects.filter.enabled) {
          // Apply filter effect for preview
          const filter = ctx.createBiquadFilter();
          filter.type = audioEffects.filter.type;
          filter.frequency.value = 20 + (audioEffects.filter.frequency / 100) * 19980;
          filter.Q.value = (audioEffects.filter.resonance / 100) * 20;

          source.connect(filter);
          filter.connect(effectGain);
        }
        break;

      case 'distortion':
        if (audioEffects.distortion.enabled) {
          // Apply distortion effect for preview
          const distortion = ctx.createWaveShaper();
          const amount = audioEffects.distortion.amount / 100 * 50;
          const curve = new Float32Array(ctx.sampleRate);
          const deg = Math.PI / 180;

          for (let i = 0; i < ctx.sampleRate; ++i) {
            const x = i * 2 / ctx.sampleRate - 1;
            curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
          }

          distortion.curve = curve;
          distortion.oversample = '4x';

          source.connect(distortion);
          distortion.connect(effectGain);
        }
        break;

      case 'compressor':
        if (audioEffects.compressor.enabled) {
          // Apply compressor effect for preview
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -60 + (audioEffects.compressor.threshold / 100) * 60;
          compressor.ratio.value = 1 + (audioEffects.compressor.ratio / 100) * 19;
          compressor.attack.value = 0.001 + (audioEffects.compressor.attack / 100) * 0.999;
          compressor.release.value = 0.01 + (audioEffects.compressor.release / 100) * 0.99;

          source.connect(compressor);
          compressor.connect(effectGain);
        }
        break;

      default:
        source.connect(effectGain);
    }

    // Play a short preview
    source.start();
    source.stop(ctx.currentTime + 2); // Play for 2 seconds

    toast({
      title: `Previewing ${type}`,
      description: `Playing a short preview with the current ${type} settings.`,
    });
  };

  const handleGenerateRemix = async () => {
    if (!uploadedFile && mixerTracks.length === 0) {
      toast({
        title: "Missing input",
        description: "Please upload an audio file or add samples to the mixer",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Build a detailed prompt based on all the elements in the remix
      let genrePrompt = "";

      // Add stem information if available
      if (stems) {
        const activeStems = Object.entries(stems)
          .filter(([_, stem]) => !stem.muted)
          .map(([type, stem]) => {
            const volume = Math.round(stem.volume * 100);
            return `${type} at ${volume}%`;
          });

        if (activeStems.length > 0) {
          genrePrompt += `Stems: ${activeStems.join(', ')}. `;
        }
      }

      // Add mixer tracks information
      if (mixerTracks.length > 0) {
        const activeTracks = mixerTracks
          .filter(track => !track.muted)
          .map(track => {
            const volume = Math.round(track.volume * 100);
            const pan = track.pan === 0 ? 'center' : track.pan < 0 ? 'left' : 'right';
            return `${track.name} (${track.type}) at ${volume}% panned ${pan}`;
          });

        if (activeTracks.length > 0) {
          genrePrompt += `Tracks: ${activeTracks.join(', ')}. `;
        }
      }

      // Add effects information
      const activeEffects = [];
      if (audioEffects.reverb.enabled) {
        activeEffects.push(`reverb at ${audioEffects.reverb.amount}% with ${audioEffects.reverb.decay}% decay`);
      }
      if (audioEffects.delay.enabled) {
        activeEffects.push(`delay at ${audioEffects.delay.mix}% with ${audioEffects.delay.feedback}% feedback`);
      }
      if (audioEffects.filter.enabled) {
        activeEffects.push(`${audioEffects.filter.type} filter at ${audioEffects.filter.frequency}% with ${audioEffects.filter.resonance}% resonance`);
      }
      if (audioEffects.distortion.enabled) {
        activeEffects.push(`distortion at ${audioEffects.distortion.amount}%`);
      }
      if (audioEffects.compressor.enabled) {
        activeEffects.push(`compression with ${audioEffects.compressor.ratio}:1 ratio`);
      }

      if (activeEffects.length > 0) {
        genrePrompt += `Effects: ${activeEffects.join(', ')}. `;
      }

      // Add BPM information
      if (detectedBPM) {
        genrePrompt += `BPM: ${detectedBPM}. `;
      }

      // Add genre information
      genrePrompt += `Genre: ${audioSettings.sourceType || "EDM"}.`;

      console.log('Generated prompt:', genrePrompt);

      // Call the remix service to generate a remix
      await remixService.generateRemix(
        uploadedFile || new File([], 'remix.mp3'), // Fallback if using only samples
        genrePrompt,
        {
          bpm: detectedBPM || 128,
          genre: audioSettings.sourceType || "EDM"
        }
      );

      // Redirect to the processing page
      navigate('/processing');
    } catch (error) {
      console.error('Error generating remix:', error);
      toast({
        title: "Generation failed",
        description: "There was a problem generating your remix. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Remix Studio</h1>
        <p className="text-gray-400">Create unique genre-blending tracks using AI</p>
      </div>

      {/* Main Tabs for Remix Studio */}
      <Tabs defaultValue="mixer" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="mixer" className="text-lg py-3">
            <Sliders className="mr-2 h-5 w-5" />
            Mixer
          </TabsTrigger>
          <TabsTrigger value="samples" className="text-lg py-3">
            <Music className="mr-2 h-5 w-5" />
            Samples
          </TabsTrigger>
          <TabsTrigger value="effects" className="text-lg py-3">
            <Wand2 className="mr-2 h-5 w-5" />
            Effects
          </TabsTrigger>
        </TabsList>

        {/* Mixer Tab */}
        <TabsContent value="mixer" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Input Section */}
              <motion.div
                className="bg-[#0C1015] rounded-lg p-6"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-xl font-semibold text-white mb-4">Input Source</h2>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Upload Audio File or Drag & Drop
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="w-full bg-[#1A1F26] hover:bg-[#2A2F36]"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  {uploadedFile && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-gray-400 mt-2"
                    >
                      {uploadedFile.name}
                      {detectedBPM && (
                        <span className="ml-2 text-[#00FFD1]">{detectedBPM} BPM</span>
                      )}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              {/* Audio Preview */}
              <motion.div
                className="bg-[#0C1015] rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Audio Preview</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePlayPause}
                      className="w-8 h-8"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStop}
                      className="w-8 h-8"
                    >
                      <Square size={16} />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} className="text-gray-400" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="original" className="space-y-4">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="original">Original</TabsTrigger>
                    <TabsTrigger value="processed">Processed</TabsTrigger>
                  </TabsList>

                  <TabsContent value="original">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {originalAudioUrl ? (
                        <div>
                          <div ref={waveformRef} className="mb-4" />
                          <AudioPlayer
                            audioUrl={originalAudioUrl}
                            title={uploadedFile?.name || "Original Track"}
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            currentTime={currentTime}
                            onTimeUpdate={setCurrentTime}
                            duration={duration}
                            onDurationChange={setDuration}
                            showControls={true}
                          />
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No audio file uploaded
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="processed">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {processedAudioUrl ? (
                        <AudioPlayer
                          audioUrl={processedAudioUrl}
                          title="Processed Track"
                          isPlaying={isPlaying}
                          onPlayPause={handlePlayPause}
                          currentTime={currentTime}
                          onTimeUpdate={setCurrentTime}
                          duration={duration}
                          onDurationChange={setDuration}
                          showControls={true}
                        />
                      ) : (
                        <div className="text-gray-400 text-center py-8">
                          No processed audio yet
                        </div>
                      )}
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>

              {/* Beat Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <BeatGrid
                  bpm={detectedBPM}
                  onBpmChange={(bpm) => setDetectedBPM(bpm)}
                  duration={duration}
                  currentTime={currentTime}
                  zoomLevel={zoomLevel}
                  onZoomChange={handleZoomChange}
                  onAddCuePoint={handleAddCuePoint}
                  onSetLoopPoints={handleSetLoopPoints}
                />
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Track Mixer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AudioTrackMixer
                  tracks={mixerTracks}
                  audioContext={audioContextRef.current}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onRemoveTrack={handleRemoveTrack}
                  onUpdateTrack={handleUpdateTrack}
                />
              </motion.div>

              {/* Stem Mixer */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StemMixer
                  stems={stems}
                  onVolumeChange={handleStemVolumeChange}
                  onMuteToggle={handleStemMuteToggle}
                  isLoading={isSeparatingStem}
                  audioContext={audioContextRef.current}
                />
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* Samples Tab */}
        <TabsContent value="samples" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Sample Library */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AudioSampleLibrary
                  audioContext={audioContextRef.current}
                  onAddSample={handleAddSample}
                />
              </motion.div>
            </div>

            {/* Right Column - Track Mixer */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AudioTrackMixer
                  tracks={mixerTracks}
                  audioContext={audioContextRef.current}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  onRemoveTrack={handleRemoveTrack}
                  onUpdateTrack={handleUpdateTrack}
                />
              </motion.div>
            </div>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Audio Preview */}
            <div className="space-y-6">
              <motion.div
                className="bg-[#0C1015] rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Audio Preview</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePlayPause}
                      className="w-8 h-8"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStop}
                      className="w-8 h-8"
                    >
                      <Square size={16} />
                    </Button>
                  </div>
                </div>

                <div>
                  <div ref={waveformRef} className="mb-4" />
                  <AudioPlayer
                    audioUrl={originalAudioUrl || ''}
                    title={uploadedFile?.name || "No Audio"}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    currentTime={currentTime}
                    onTimeUpdate={setCurrentTime}
                    duration={duration}
                    onDurationChange={setDuration}
                    showControls={true}
                  />
                </div>
              </motion.div>

              {/* Audio Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AudioControls
                  settings={audioSettings}
                  onSettingsChange={setAudioSettings}
                  onPreviewEffect={handlePreviewEffect}
                />
              </motion.div>
            </div>

            {/* Right Column - Effects Rack */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <AudioEffectsRack
                  audioContext={audioContextRef.current}
                  effects={audioEffects}
                  onEffectsChange={handleEffectsChange}
                  onPreviewEffect={handlePreviewEffect}
                />
              </motion.div>

              {/* Audio Effects */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <AudioEffects
                  audioBuffer={audioBuffer}
                  onEffectChange={() => {}}
                  onTrimAudio={() => {}}
                  onLoopChange={() => {}}
                />
              </motion.div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          className="w-full py-6 bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black text-lg font-semibold"
          onClick={handleGenerateRemix}
          disabled={isGenerating || !uploadedFile}
        >
          {isGenerating ? 'Generating Remix...' : 'Generate Remix'}
        </Button>
      </motion.div>

      {/* Keyboard Shortcuts Help */}
      <motion.div
        className="mt-4 text-center text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Keyboard shortcuts: Space (Play/Pause) • Ctrl+R (Generate)
      </motion.div>

      {audioBuffer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <RemixEffects
            audioContext={audioContextRef.current || new AudioContext()}
            audioBuffer={audioBuffer}
            onProcessed={handleProcessed}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

export default RemixStudio;
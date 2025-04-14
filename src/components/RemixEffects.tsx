import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Music,
  Disc,
  Mic2,
  Radio,
  Wand2,
  Volume2,
  Zap,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RemixEffectsProps {
  audioContext: AudioContext;
  audioBuffer: AudioBuffer | null;
  onProcessed: (processedBuffer: AudioBuffer) => void;
}

interface GenrePreset {
  name: string;
  icon: JSX.Element;
  effects: {
    bass: number;
    treble: number;
    reverb: number;
    delay: number;
    distortion: number;
    compression: number;
    tempo: number;
    pitch: number;
  };
  description: string;
}

const genrePresets: GenrePreset[] = [
  {
    name: 'Afrojack EDM',
    icon: <Disc className="w-5 h-5" />,
    effects: {
      bass: 0.8,
      treble: 0.7,
      reverb: 0.6,
      delay: 0.4,
      distortion: 0.3,
      compression: 0.8,
      tempo: 1.2,
      pitch: 1.0
    },
    description: 'High-energy EDM with heavy bass and electro house vibes'
  },
  {
    name: 'Hip Hop',
    icon: <Mic2 className="w-5 h-5" />,
    effects: {
      bass: 0.7,
      treble: 0.5,
      reverb: 0.4,
      delay: 0.3,
      distortion: 0.2,
      compression: 0.6,
      tempo: 0.95,
      pitch: 0.98
    },
    description: 'Deep bass, punchy drums, and urban atmosphere'
  },
  {
    name: 'R&B Smooth',
    icon: <Radio className="w-5 h-5" />,
    effects: {
      bass: 0.5,
      treble: 0.6,
      reverb: 0.5,
      delay: 0.4,
      distortion: 0.1,
      compression: 0.5,
      tempo: 0.9,
      pitch: 0.97
    },
    description: 'Warm bass, smooth highs, and soulful ambiance'
  },
  {
    name: 'Future Bass',
    icon: <Music className="w-5 h-5" />,
    effects: {
      bass: 0.9,
      treble: 0.8,
      reverb: 0.7,
      delay: 0.5,
      distortion: 0.4,
      compression: 0.7,
      tempo: 1.1,
      pitch: 1.02
    },
    description: 'Massive bass, bright synths, and modern sound design'
  }
];

const RemixEffects: FC<RemixEffectsProps> = ({
  audioContext,
  audioBuffer,
  onProcessed
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPreset, setCurrentPreset] = useState<string>('');
  const [effects, setEffects] = useState(genrePresets[0].effects);
  const [previewNode, setPreviewNode] = useState<AudioBufferSourceNode | null>(null);

  const applyEffects = async (buffer: AudioBuffer, effects: GenrePreset['effects']) => {
    const offlineContext = new OfflineAudioContext(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    // Source node
    const source = offlineContext.createBufferSource();
    source.buffer = buffer;

    // Bass boost
    const bassFilter = offlineContext.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 100;
    bassFilter.gain.value = effects.bass * 15;

    // Treble
    const trebleFilter = offlineContext.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 10000;
    trebleFilter.gain.value = effects.treble * 15;

    // Reverb
    const convolver = offlineContext.createConvolver();
    const reverbBuffer = await createReverb(offlineContext, effects.reverb * 3);
    convolver.buffer = reverbBuffer;

    // Delay
    const delay = offlineContext.createDelay();
    delay.delayTime.value = effects.delay * 0.5;
    const feedback = offlineContext.createGain();
    feedback.gain.value = effects.delay * 0.4;

    // Distortion
    const distortion = offlineContext.createWaveShaper();
    const distortionCurve = new Float32Array(44100);
    const distortionAmount = effects.distortion * 400;
    for (let i = 0; i < 44100; i++) {
      const x = i * 2 / 44100 - 1;
      distortionCurve[i] = (3 + distortionAmount) * x * 20 * (Math.PI / 180) / (Math.PI + distortionAmount * Math.abs(x));
    }
    distortion.curve = distortionCurve;

    // Compression
    const compressor = offlineContext.createDynamicsCompressor();
    compressor.threshold.value = -50 + (effects.compression * 50);
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    // Connect nodes
    source.connect(bassFilter);
    bassFilter.connect(trebleFilter);
    trebleFilter.connect(convolver);
    convolver.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(distortion);
    distortion.connect(compressor);
    compressor.connect(offlineContext.destination);

    // Apply tempo and pitch changes
    source.playbackRate.value = effects.tempo;
    source.detune.value = (effects.pitch - 1) * 100;

    // Render audio
    source.start();
    const renderedBuffer = await offlineContext.startRendering();
    return renderedBuffer;
  };

  const createReverb = async (context: AudioContext | OfflineAudioContext, duration: number) => {
    const sampleRate = context.sampleRate;
    const length = sampleRate * duration;
    const impulse = context.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const t = (1 - n) ** 2;
      left[i] = (Math.random() * 2 - 1) * t;
      right[i] = (Math.random() * 2 - 1) * t;
    }

    return impulse;
  };

  const handlePresetChange = async (preset: GenrePreset) => {
    setCurrentPreset(preset.name);
    setEffects(preset.effects);

    if (!audioBuffer) return;

    try {
      setIsProcessing(true);
      const processedBuffer = await applyEffects(audioBuffer, preset.effects);
      previewEffect(processedBuffer);
    } catch (error) {
      console.error('Error applying preset:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const previewEffect = (buffer: AudioBuffer) => {
    if (previewNode) {
      previewNode.stop();
      previewNode.disconnect();
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    setPreviewNode(source);
  };

  const handleApplyEffects = async () => {
    if (!audioBuffer) return;

    try {
      setIsProcessing(true);
      const processedBuffer = await applyEffects(audioBuffer, effects);
      onProcessed(processedBuffer);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {genrePresets.map((preset) => (
          <motion.div
            key={preset.name}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant={currentPreset === preset.name ? 'default' : 'outline'}
              className="w-full h-auto py-4 px-4"
              onClick={() => handlePresetChange(preset)}
              disabled={isProcessing || !audioBuffer}
            >
              <div className="flex items-center gap-3">
                {preset.icon}
                <div className="text-left">
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-gray-400">{preset.description}</div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Bass Boost</label>
          <div className="flex items-center gap-4">
            <Volume2 className="w-4 h-4 text-white" />
            <Slider
              value={[effects.bass * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => setEffects({ ...effects, bass: value / 100 })}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Tempo</label>
          <div className="flex items-center gap-4">
            <Music className="w-4 h-4 text-white" />
            <Slider
              value={[effects.tempo * 100]}
              min={50}
              max={150}
              step={1}
              onValueChange={([value]) => setEffects({ ...effects, tempo: value / 100 })}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Effects Mix</label>
          <div className="flex items-center gap-4">
            <Wand2 className="w-4 h-4 text-white" />
            <Slider
              value={[effects.reverb * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={([value]) => setEffects({ ...effects, reverb: value / 100 })}
              disabled={isProcessing}
            />
          </div>
        </div>
      </div>

      <Button
        className="w-full"
        onClick={handleApplyEffects}
        disabled={isProcessing || !audioBuffer}
      >
        {isProcessing ? (
          <Sparkles className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Zap className="w-4 h-4 mr-2" />
        )}
        {isProcessing ? 'Processing...' : 'Apply Effects'}
      </Button>
    </div>
  );
};

export default RemixEffects; 
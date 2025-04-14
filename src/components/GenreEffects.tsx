import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Music,
  Wand2,
  Volume2,
  Zap,
  Disc,
  Mic2,
  Radio,
  Speaker,
} from 'lucide-react';

export interface GenreEffect {
  bass: number;
  treble: number;
  reverb: number;
  delay: number;
  distortion: number;
  compression: number;
}

export interface GenrePreset {
  name: string;
  icon: JSX.Element;
  effects: GenreEffect;
  description: string;
}

interface GenreEffectsProps {
  onEffectChange: (effect: GenreEffect) => void;
  onPresetChange: (preset: GenrePreset) => void;
}

const genrePresets: GenrePreset[] = [
  {
    name: 'Afrojack EDM',
    icon: <Disc className="w-4 h-4" />,
    effects: {
      bass: 0.8,
      treble: 0.7,
      reverb: 0.6,
      delay: 0.4,
      distortion: 0.3,
      compression: 0.8
    },
    description: 'Heavy bass, energetic drops, and electro house vibes'
  },
  {
    name: 'Hip Hop',
    icon: <Mic2 className="w-4 h-4" />,
    effects: {
      bass: 0.7,
      treble: 0.5,
      reverb: 0.4,
      delay: 0.3,
      distortion: 0.2,
      compression: 0.6
    },
    description: 'Deep bass, punchy drums, and urban atmosphere'
  },
  {
    name: 'R&B Smooth',
    icon: <Radio className="w-4 h-4" />,
    effects: {
      bass: 0.5,
      treble: 0.6,
      reverb: 0.5,
      delay: 0.4,
      distortion: 0.1,
      compression: 0.5
    },
    description: 'Warm bass, smooth highs, and soulful ambiance'
  },
  {
    name: 'Future Bass',
    icon: <Speaker className="w-4 h-4" />,
    effects: {
      bass: 0.9,
      treble: 0.8,
      reverb: 0.7,
      delay: 0.5,
      distortion: 0.4,
      compression: 0.7
    },
    description: 'Massive bass, bright synths, and modern sound design'
  }
];

const GenreEffects: FC<GenreEffectsProps> = ({ onEffectChange, onPresetChange }) => {
  const [currentPreset, setCurrentPreset] = useState<string>('');
  const [customEffects, setCustomEffects] = useState<GenreEffect>({
    bass: 0.5,
    treble: 0.5,
    reverb: 0.3,
    delay: 0.2,
    distortion: 0.1,
    compression: 0.5
  });

  const handlePresetChange = (preset: GenrePreset) => {
    setCurrentPreset(preset.name);
    setCustomEffects(preset.effects);
    onPresetChange(preset);
  };

  const handleEffectChange = (effect: keyof GenreEffect, value: number) => {
    const newEffects = {
      ...customEffects,
      [effect]: value
    };
    setCustomEffects(newEffects);
    onEffectChange(newEffects);
  };

  return (
    <div className="bg-[#1A1F26] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Genre Effects</h3>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => setCustomEffects({
            bass: 0.5,
            treble: 0.5,
            reverb: 0.3,
            delay: 0.2,
            distortion: 0.1,
            compression: 0.5
          })}
        >
          <Zap className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {genrePresets.map((preset) => (
          <Button
            key={preset.name}
            variant={currentPreset === preset.name ? 'default' : 'outline'}
            className="flex items-center gap-2 h-auto py-3 px-4"
            onClick={() => handlePresetChange(preset)}
          >
            {preset.icon}
            <div className="text-left">
              <div className="font-medium">{preset.name}</div>
              <div className="text-xs text-gray-400">{preset.description}</div>
            </div>
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Bass Boost</label>
          <div className="flex items-center gap-4">
            <Volume2 className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.bass]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('bass', value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Treble</label>
          <div className="flex items-center gap-4">
            <Music className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.treble]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('treble', value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Reverb</label>
          <div className="flex items-center gap-4">
            <Wand2 className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.reverb]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('reverb', value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Delay</label>
          <div className="flex items-center gap-4">
            <Radio className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.delay]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('delay', value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Distortion</label>
          <div className="flex items-center gap-4">
            <Zap className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.distortion]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('distortion', value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Compression</label>
          <div className="flex items-center gap-4">
            <Speaker className="w-4 h-4 text-white" />
            <Slider
              value={[customEffects.compression]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) => handleEffectChange('compression', value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenreEffects; 
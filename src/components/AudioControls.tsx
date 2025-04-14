import { FC } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  Waves,
  Clock,
  Music2,
  Wand2,
  Wave,
} from 'lucide-react';

interface AudioControlsProps {
  onSettingsChange: (settings: {
    reverb: number;
    delay: number;
    compression: number;
    eq: { low: number; mid: number; high: number };
    volume: number;
    sourceType: string;
  }) => void;
  settings: {
    reverb: number;
    delay: number;
    compression: number;
    eq: { low: number; mid: number; high: number };
    volume: number;
    sourceType: string;
  };
  onPreviewEffect?: (type: string) => void;
}

const AudioControls: FC<AudioControlsProps> = ({ onSettingsChange, settings, onPreviewEffect }) => {
  const handleSliderChange = (key: string, value: number | string) => {
    if (key.startsWith('eq.')) {
      const eqKey = key.split('.')[1] as 'low' | 'mid' | 'high';
      onSettingsChange({
        ...settings,
        eq: {
          ...settings.eq,
          [eqKey]: value as number
        }
      });
    } else if (key === 'sourceType') {
      onSettingsChange({
        ...settings,
        sourceType: value as string
      });
    } else {
      onSettingsChange({
        ...settings,
        [key]: value as number
      });
    }
  };

  const handlePreviewEffect = (type: string) => {
    if (onPreviewEffect) {
      onPreviewEffect(type);
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6 space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Audio Processing</h3>
      
      {/* Effects Controls */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Reverb</span>
            <span className="text-gray-400">{settings.reverb}%</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.reverb}
              onChange={(e) => handleSliderChange('reverb', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('reverb')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Delay</span>
            <span className="text-gray-400">{settings.delay}%</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.delay}
              onChange={(e) => handleSliderChange('delay', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('delay')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Compression</span>
            <span className="text-gray-400">{settings.compression}%</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={settings.compression}
              onChange={(e) => handleSliderChange('compression', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('compression')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* EQ Controls */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Equalizer</h4>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Low</span>
            <span className="text-gray-400">{settings.eq.low}dB</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="-12"
              max="12"
              value={settings.eq.low}
              onChange={(e) => handleSliderChange('eq.low', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('eq.low')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Mid</span>
            <span className="text-gray-400">{settings.eq.mid}dB</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="-12"
              max="12"
              value={settings.eq.mid}
              onChange={(e) => handleSliderChange('eq.mid', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('eq.mid')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">High</span>
            <span className="text-gray-400">{settings.eq.high}dB</span>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="-12"
              max="12"
              value={settings.eq.high}
              onChange={(e) => handleSliderChange('eq.high', Number(e.target.value))}
              className="w-full accent-[#00FFD1]"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePreviewEffect('eq.high')}
              className="min-w-[80px]"
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <h4 className="text-lg font-medium text-white mb-3">Quick Presets</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700"
            onClick={() => onSettingsChange({
              reverb: 20,
              delay: 0,
              compression: 40,
              eq: { low: 3, mid: 0, high: 2 },
              volume: 1,
              sourceType: 'vocal'
            })}
          >
            <Music2 className="mr-2 h-4 w-4" />
            Vocal Clear
          </Button>
          <Button
            variant="outline"
            className="bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700"
            onClick={() => onSettingsChange({
              reverb: 60,
              delay: 30,
              compression: 50,
              eq: { low: 4, mid: -2, high: 3 },
              volume: 1,
              sourceType: 'ambient'
            })}
          >
            <Waves className="mr-2 h-4 w-4" />
            Ambient
          </Button>
          <Button
            variant="outline"
            className="bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700"
            onClick={() => onSettingsChange({
              reverb: 10,
              delay: 0,
              compression: 70,
              eq: { low: 6, mid: 1, high: 4 },
              volume: 1,
              sourceType: 'punchy'
            })}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Punchy
          </Button>
          <Button
            variant="outline"
            className="bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700"
            onClick={() => onSettingsChange({
              reverb: 0,
              delay: 0,
              compression: 30,
              eq: { low: 0, mid: 0, high: 0 },
              volume: 1,
              sourceType: 'reset'
            })}
          >
            <Clock className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">Volume</label>
          <Volume2 className="h-4 w-4 text-gray-400" />
        </div>
        <div className="flex items-center gap-4">
          <Slider
            value={[settings.volume * 100]}
            onValueChange={([value]) => handleSliderChange('volume', value / 100)}
            max={100}
            step={1}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePreviewEffect('volume')}
            className="min-w-[80px]"
          >
            Preview
          </Button>
        </div>
      </div>

      {/* Source Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-400">Source Type</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={settings.sourceType === 'drums' ? 'default' : 'outline'}
            onClick={() => handleSliderChange('sourceType', 'drums')}
            className="w-full"
          >
            Drums
          </Button>
          <Button
            variant={settings.sourceType === 'synth' ? 'default' : 'outline'}
            onClick={() => handleSliderChange('sourceType', 'synth')}
            className="w-full"
          >
            Synth
          </Button>
          <Button
            variant={settings.sourceType === 'bass' ? 'default' : 'outline'}
            onClick={() => handleSliderChange('sourceType', 'bass')}
            className="w-full"
          >
            Bass
          </Button>
          <Button
            variant={settings.sourceType === 'fx' ? 'default' : 'outline'}
            onClick={() => handleSliderChange('sourceType', 'fx')}
            className="w-full"
          >
            FX
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AudioControls; 
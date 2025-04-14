import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Volume2,
  Music,
  Scissors,
  RotateCcw,
  Repeat,
  Mic,
  Settings,
  Sparkles,
  Wand2,
  Workflow,
  Layers,
  Zap,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AudioEffectsProps {
  audioBuffer: AudioBuffer | null;
  onEffectChange: (effectName: string, value: number) => void;
  onTrimAudio: (start: number, end: number) => void;
  onLoopChange: (isLooping: boolean, loopStart: number, loopEnd: number) => void;
}

interface Effect {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
}

interface AIPreset {
  name: string;
  description: string;
  effects: Record<string, number>;
}

const aiPresets: AIPreset[] = [
  {
    name: 'Studio Professional',
    description: 'Clean, balanced sound with optimal clarity',
    effects: {
      reverb: 0.2,
      delay: 0.1,
      pitch: 1,
      distortion: 0,
      chorus: 0.1,
      compression: 0.4,
      eq: 0.5
    }
  },
  {
    name: 'Vintage Warmth',
    description: 'Analog-style warmth with subtle harmonics',
    effects: {
      reverb: 0.3,
      delay: 0.2,
      pitch: 0.98,
      distortion: 0.2,
      chorus: 0.15,
      compression: 0.6,
      eq: 0.7
    }
  },
  {
    name: 'Modern Pop',
    description: 'Bright and punchy with enhanced presence',
    effects: {
      reverb: 0.25,
      delay: 0.15,
      pitch: 1.02,
      distortion: 0.1,
      chorus: 0.2,
      compression: 0.7,
      eq: 0.8
    }
  }
];

const AudioEffects: FC<AudioEffectsProps> = ({
  audioBuffer,
  onEffectChange,
  onTrimAudio,
  onLoopChange,
}) => {
  const [effects, setEffects] = useState<Effect[]>([
    { name: 'reverb', value: 0, min: 0, max: 1, step: 0.01 },
    { name: 'delay', value: 0, min: 0, max: 1, step: 0.01 },
    { name: 'pitch', value: 1, min: 0.5, max: 2, step: 0.01 },
    { name: 'distortion', value: 0, min: 0, max: 1, step: 0.01 },
    { name: 'chorus', value: 0, min: 0, max: 1, step: 0.01 },
    { name: 'compression', value: 0, min: 0, max: 1, step: 0.01 },
    { name: 'eq', value: 0.5, min: 0, max: 1, step: 0.01 }
  ]);

  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [isLooping, setIsLooping] = useState(false);
  const [loopRange, setLoopRange] = useState<[number, number]>([0, 100]);
  const [volume, setVolume] = useState(1);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiEnhancementLevel, setAiEnhancementLevel] = useState(0);

  const handleEffectChange = (effectName: string, newValue: number) => {
    setEffects(prev =>
      prev.map(effect =>
        effect.name === effectName ? { ...effect, value: newValue } : effect
      )
    );
    onEffectChange(effectName, newValue);
  };

  const handlePresetChange = (presetName: string) => {
    const preset = aiPresets.find(p => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      Object.entries(preset.effects).forEach(([name, value]) => {
        handleEffectChange(name, value);
      });
    }
  };

  const handleAIEnhancement = async () => {
    setIsProcessing(true);
    try {
      // Simulated AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAiEnhancementLevel(prev => Math.min(prev + 0.2, 1));
      
      // Apply AI-enhanced effects
      handleEffectChange('clarity', 0.8);
      handleEffectChange('presence', 0.7);
      handleEffectChange('warmth', 0.6);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Advanced Audio Effects</h3>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleAIEnhancement}
          disabled={isProcessing}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Enhancing...' : 'AI Enhance'}
        </Button>
      </div>

      <Tabs defaultValue="effects" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="effects">Effects</TabsTrigger>
          <TabsTrigger value="presets">AI Presets</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="effects" className="space-y-6">
          {/* Volume Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white">Volume</label>
              <span className="text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <Volume2 className="w-4 h-4 text-white" />
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => setVolume(value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Effects Controls */}
          <div className="space-y-4">
            {effects.map((effect) => (
              <div key={effect.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white capitalize">{effect.name}</label>
                  <span className="text-gray-400">
                    {Math.round(effect.value * 100)}%
                  </span>
                </div>
                <Slider
                  value={[effect.value]}
                  min={effect.min}
                  max={effect.max}
                  step={effect.step}
                  onValueChange={([value]) => handleEffectChange(effect.name, value)}
                  className="flex-1"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          <div className="grid gap-4">
            {aiPresets.map((preset) => (
              <div
                key={preset.name}
                className={`p-4 rounded-lg border border-gray-700 cursor-pointer transition-all ${
                  selectedPreset === preset.name
                    ? 'bg-primary/20 border-primary'
                    : 'hover:bg-gray-800'
                }`}
                onClick={() => handlePresetChange(preset.name)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <h4 className="text-white font-medium">{preset.name}</h4>
                </div>
                <p className="text-gray-400 text-sm">{preset.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          {/* Trim Controls */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">Trim Audio</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-white" />
                <span className="text-gray-400">
                  {trimRange[0]}% - {trimRange[1]}%
                </span>
              </div>
              <Slider
                value={trimRange}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setTrimRange(value as [number, number])}
                className="flex-1"
              />
            </div>
          </div>

          {/* Loop Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-medium text-white">Loop Section</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLooping(!isLooping)}
                className={`flex items-center gap-2 ${
                  isLooping ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Repeat className="w-4 h-4" />
                {isLooping ? 'Looping' : 'Loop'}
              </Button>
            </div>
            {isLooping && (
              <div className="space-y-2">
                <span className="text-gray-400">
                  {loopRange[0]}% - {loopRange[1]}%
                </span>
                <Slider
                  value={loopRange}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setLoopRange(value as [number, number])}
                  className="flex-1"
                />
              </div>
            )}
          </div>

          {/* AI Enhancement Level */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-white">AI Enhancement Level</h4>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${aiEnhancementLevel * 100}%` }}
                />
              </div>
              <span className="text-gray-400 min-w-[3ch]">
                {Math.round(aiEnhancementLevel * 100)}%
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset Effects
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Workflow className="w-4 h-4" />
          Save Chain
        </Button>
      </div>
    </div>
  );
};

export default AudioEffects; 
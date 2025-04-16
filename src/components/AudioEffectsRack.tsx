import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Activity,
  Repeat,
  Scissors,
  RotateCcw,
  Waves,
  Sparkles,
  Zap,
  Volume2,
  Disc
} from 'lucide-react';
import { motion } from 'framer-motion';

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

interface AudioEffectsRackProps {
  audioContext: AudioContext | null;
  effects: AudioEffects;
  onEffectsChange: (effects: AudioEffects) => void;
  onPreviewEffect: (effectType: string) => void;
}

const AudioEffectsRack: FC<AudioEffectsRackProps> = ({
  audioContext,
  effects,
  onEffectsChange,
  onPreviewEffect
}) => {
  const [activeTab, setActiveTab] = useState('reverb');

  // Handle effect toggle
  const handleEffectToggle = (effectType: keyof AudioEffects) => {
    const newEffects = { ...effects };
    newEffects[effectType].enabled = !newEffects[effectType].enabled;
    onEffectsChange(newEffects);

    // Preview the effect
    onPreviewEffect(effectType);
  };

  // Handle effect parameter change
  const handleEffectParamChange = (
    effectType: keyof AudioEffects,
    paramName: string,
    value: number
  ) => {
    const newEffects = { ...effects };
    (newEffects[effectType] as any)[paramName] = value;
    onEffectsChange(newEffects);
  };

  // Handle filter type change
  const handleFilterTypeChange = (type: 'lowpass' | 'highpass' | 'bandpass') => {
    const newEffects = { ...effects };
    newEffects.filter.type = type;
    onEffectsChange(newEffects);
  };

  // Effect tabs configuration
  const effectTabs = [
    { id: 'reverb', label: 'Reverb', icon: <Waves className="h-4 w-4" /> },
    { id: 'delay', label: 'Delay', icon: <Repeat className="h-4 w-4" /> },
    { id: 'filter', label: 'Filter', icon: <Activity className="h-4 w-4" /> },
    { id: 'distortion', label: 'Distortion', icon: <Zap className="h-4 w-4" /> },
    { id: 'compressor', label: 'Compressor', icon: <Sparkles className="h-4 w-4" /> }
  ];

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Effects Rack</h3>

      <Tabs defaultValue="reverb" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-4">
          {effectTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-1"
            >
              {tab.icon}
              <span>{tab.label}</span>
              <div
                className={`w-2 h-2 rounded-full ml-1 ${
                  effects[tab.id as keyof AudioEffects].enabled ? 'bg-[#00FFD1]' : 'bg-gray-600'
                }`}
              />
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Reverb */}
        <TabsContent value="reverb" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="h-5 w-5 text-[#00FFD1]" />
              <h4 className="text-white font-medium">Reverb</h4>
            </div>
            <Switch
              checked={effects.reverb.enabled}
              onCheckedChange={() => handleEffectToggle('reverb')}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Amount</Label>
                <span className="text-white text-sm">{effects.reverb.amount}%</span>
              </div>
              <Slider
                value={[effects.reverb.amount]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('reverb', 'amount', value)}
                disabled={!effects.reverb.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Decay</Label>
                <span className="text-white text-sm">{effects.reverb.decay}%</span>
              </div>
              <Slider
                value={[effects.reverb.decay]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('reverb', 'decay', value)}
                disabled={!effects.reverb.enabled}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPreviewEffect('reverb')}
              disabled={!effects.reverb.enabled}
            >
              <Disc className="h-4 w-4 mr-2" />
              Preview Effect
            </Button>
          </div>
        </TabsContent>

        {/* Delay */}
        <TabsContent value="delay" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-[#00FFD1]" />
              <h4 className="text-white font-medium">Delay</h4>
            </div>
            <Switch
              checked={effects.delay.enabled}
              onCheckedChange={() => handleEffectToggle('delay')}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Time</Label>
                <span className="text-white text-sm">{Math.round(effects.delay.time * 5)}ms</span>
              </div>
              <Slider
                value={[effects.delay.time]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('delay', 'time', value)}
                disabled={!effects.delay.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Feedback</Label>
                <span className="text-white text-sm">{effects.delay.feedback}%</span>
              </div>
              <Slider
                value={[effects.delay.feedback]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('delay', 'feedback', value)}
                disabled={!effects.delay.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Mix</Label>
                <span className="text-white text-sm">{effects.delay.mix}%</span>
              </div>
              <Slider
                value={[effects.delay.mix]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('delay', 'mix', value)}
                disabled={!effects.delay.enabled}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPreviewEffect('delay')}
              disabled={!effects.delay.enabled}
            >
              <Disc className="h-4 w-4 mr-2" />
              Preview Effect
            </Button>
          </div>
        </TabsContent>

        {/* Filter */}
        <TabsContent value="filter" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#00FFD1]" />
              <h4 className="text-white font-medium">Filter</h4>
            </div>
            <Switch
              checked={effects.filter.enabled}
              onCheckedChange={() => handleEffectToggle('filter')}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={effects.filter.type === 'lowpass' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterTypeChange('lowpass')}
                disabled={!effects.filter.enabled}
                className={effects.filter.type === 'lowpass' ? "bg-[#00FFD1] text-black" : ""}
              >
                Lowpass
              </Button>
              <Button
                variant={effects.filter.type === 'highpass' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterTypeChange('highpass')}
                disabled={!effects.filter.enabled}
                className={effects.filter.type === 'highpass' ? "bg-[#00FFD1] text-black" : ""}
              >
                Highpass
              </Button>
              <Button
                variant={effects.filter.type === 'bandpass' ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterTypeChange('bandpass')}
                disabled={!effects.filter.enabled}
                className={effects.filter.type === 'bandpass' ? "bg-[#00FFD1] text-black" : ""}
              >
                Bandpass
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Frequency</Label>
                <span className="text-white text-sm">
                  {Math.round(20 + (effects.filter.frequency / 100) * 19980)}Hz
                </span>
              </div>
              <Slider
                value={[effects.filter.frequency]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('filter', 'frequency', value)}
                disabled={!effects.filter.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Resonance</Label>
                <span className="text-white text-sm">{effects.filter.resonance}%</span>
              </div>
              <Slider
                value={[effects.filter.resonance]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('filter', 'resonance', value)}
                disabled={!effects.filter.enabled}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPreviewEffect('filter')}
              disabled={!effects.filter.enabled}
            >
              <Disc className="h-4 w-4 mr-2" />
              Preview Effect
            </Button>
          </div>
        </TabsContent>

        {/* Distortion */}
        <TabsContent value="distortion" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#00FFD1]" />
              <h4 className="text-white font-medium">Distortion</h4>
            </div>
            <Switch
              checked={effects.distortion.enabled}
              onCheckedChange={() => handleEffectToggle('distortion')}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Amount</Label>
                <span className="text-white text-sm">{effects.distortion.amount}%</span>
              </div>
              <Slider
                value={[effects.distortion.amount]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('distortion', 'amount', value)}
                disabled={!effects.distortion.enabled}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPreviewEffect('distortion')}
              disabled={!effects.distortion.enabled}
            >
              <Disc className="h-4 w-4 mr-2" />
              Preview Effect
            </Button>
          </div>
        </TabsContent>

        {/* Compressor */}
        <TabsContent value="compressor" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00FFD1]" />
              <h4 className="text-white font-medium">Compressor</h4>
            </div>
            <Switch
              checked={effects.compressor.enabled}
              onCheckedChange={() => handleEffectToggle('compressor')}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Threshold</Label>
                <span className="text-white text-sm">
                  {-60 + (effects.compressor.threshold / 100) * 60}dB
                </span>
              </div>
              <Slider
                value={[effects.compressor.threshold]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('compressor', 'threshold', value)}
                disabled={!effects.compressor.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Ratio</Label>
                <span className="text-white text-sm">
                  {1 + (effects.compressor.ratio / 100) * 19}:1
                </span>
              </div>
              <Slider
                value={[effects.compressor.ratio]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('compressor', 'ratio', value)}
                disabled={!effects.compressor.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Attack</Label>
                <span className="text-white text-sm">
                  {Math.round(1 + (effects.compressor.attack / 100) * 999)}ms
                </span>
              </div>
              <Slider
                value={[effects.compressor.attack]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('compressor', 'attack', value)}
                disabled={!effects.compressor.enabled}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-gray-400">Release</Label>
                <span className="text-white text-sm">
                  {Math.round(10 + (effects.compressor.release / 100) * 990)}ms
                </span>
              </div>
              <Slider
                value={[effects.compressor.release]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => handleEffectParamChange('compressor', 'release', value)}
                disabled={!effects.compressor.enabled}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onPreviewEffect('compressor')}
              disabled={!effects.compressor.enabled}
            >
              <Disc className="h-4 w-4 mr-2" />
              Preview Effect
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AudioEffectsRack;

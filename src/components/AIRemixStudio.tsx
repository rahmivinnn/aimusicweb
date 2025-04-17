import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Play,
  Pause,
  Download,
  Wand2,
  Music,
  Settings2,
  Volume2,
  Mic,
  Drum,
  Guitar,
  Radio
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import ProcessingStage from './ProcessingStage';
import { aiAudioService, StemTrack, remixPresets } from '@/services/aiAudioService';
import { Input } from '@/components/ui/input';

interface AIRemixStudioProps {}

const AIRemixStudio: React.FC<AIRemixStudioProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState<'analyzing' | 'processing' | 'finalizing'>('analyzing');
  const [progress, setProgress] = useState(0);
  const [stems, setStems] = useState<StemTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.type.startsWith('audio/')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an audio file (MP3, WAV, or M4A)',
        variant: 'destructive'
      });
      return;
    }

    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const result = await aiAudioService.processAudioFile(uploadedFile, (status) => {
        setProgress(status.progress);
        if (status.stage === 'extracting_stems') setCurrentStage('analyzing');
        else if (status.stage === 'applying_remix') setCurrentStage('processing');
        else if (status.stage === 'rendering') setCurrentStage('finalizing');
      });

      setStems(result.stems);
      toast({
        title: 'Processing Complete',
        description: `Detected BPM: ${result.bpm}, Key: ${result.key}`,
      });
    } catch (error) {
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemix = async () => {
    if (!stems.length) return;

    setIsProcessing(true);
    try {
      const remixedBuffer = await aiAudioService.applyRemix(stems, prompt, undefined, (status) => {
        setProgress(status.progress);
        if (status.stage === 'applying_remix') setCurrentStage('processing');
        else if (status.stage === 'rendering') setCurrentStage('finalizing');
      });

      setAudioBuffer(remixedBuffer);
      toast({
        title: 'Remix Complete',
        description: 'Your remix is ready to play!',
      });
    } catch (error) {
      toast({
        title: 'Remix Error',
        description: 'Failed to generate remix. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePresetRemix = async (preset: typeof remixPresets[0]) => {
    if (!stems.length) return;

    setIsProcessing(true);
    try {
      const remixedBuffer = await aiAudioService.applyRemix(stems, undefined, preset, (status) => {
        setProgress(status.progress);
        if (status.stage === 'applying_remix') setCurrentStage('processing');
        else if (status.stage === 'rendering') setCurrentStage('finalizing');
      });

      setAudioBuffer(remixedBuffer);
      toast({
        title: 'Preset Applied',
        description: `Applied ${preset.name} preset to your track!`,
      });
    } catch (error) {
      toast({
        title: 'Preset Error',
        description: 'Failed to apply preset. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!audioBuffer) return;

    // Convert AudioBuffer to WAV and trigger download
    const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'remix.wav';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {isProcessing ? (
        <ProcessingStage
          currentStage={currentStage}
          progress={progress}
          estimatedTime={30}
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />
            <label
              htmlFor="audio-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <span className="text-lg font-medium">Upload Audio File</span>
              <span className="text-sm text-gray-500 mt-1">
                MP3, WAV, or M4A (max 10MB)
              </span>
            </label>
          </div>

          {stems.length > 0 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                {remixPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    onClick={() => handlePresetRemix(preset)}
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    {preset.name}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Describe how you want to remix the track (e.g., 'Make it lo-fi with vinyl crackle')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleRemix}
                  className="w-full"
                  disabled={!prompt.trim()}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate AI Remix
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stems.map((stem) => (
                  <div
                    key={stem.id}
                    className="p-4 bg-gray-100 rounded-lg space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      {stem.type === 'vocals' && <Mic className="w-4 h-4" />}
                      {stem.type === 'drums' && <Drum className="w-4 h-4" />}
                      {stem.type === 'bass' && <Radio className="w-4 h-4" />}
                      {stem.type === 'other' && <Guitar className="w-4 h-4" />}
                      <span className="font-medium capitalize">{stem.type}</span>
                    </div>
                    <Slider
                      value={[stem.volume * 100]}
                      onValueChange={(value) => {
                        const newStems = stems.map((s) =>
                          s.id === stem.id ? { ...s, volume: value[0] / 100 } : s
                        );
                        setStems(newStems);
                      }}
                      max={100}
                      step={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {audioBuffer && (
            <div className="space-y-4">
              <AudioVisualizer
                audioContext={audioContextRef.current!}
                buffer={audioBuffer}
                isPlaying={isPlaying}
              />
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="outline"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIRemixStudio;
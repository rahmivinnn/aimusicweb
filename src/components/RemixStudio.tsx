import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
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
  Volume2
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import AudioControls from './AudioControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioPlayer from './AudioPlayer';
import AudioEffects from './AudioEffects';
import RemixEffects from './RemixEffects';

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
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();
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
      });

      return () => {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }
      };
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setOriginalAudioUrl(fileUrl);
      if (wavesurferRef.current) {
        wavesurferRef.current.load(fileUrl);
      }
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
      if (wavesurferRef.current) {
        wavesurferRef.current.load(fileUrl);
      }
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

  const handleProcessed = (buffer: AudioBuffer) => {
    setAudioBuffer(buffer);
    setIsProcessing(false);
    toast({
      title: "Processing complete",
      description: "Audio has been processed successfully!",
    });
  };

  const handlePreviewEffect = (type: string) => {
    console.log('Previewing effect:', type);
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Audio Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AudioControls
              settings={audioSettings}
              onSettingsChange={setAudioSettings}
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

      {/* Generate Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          className="w-full py-6 bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black text-lg font-semibold"
          onClick={() => setIsGenerating(true)}
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
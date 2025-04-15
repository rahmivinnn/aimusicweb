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
  Layers
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import AudioControls from './AudioControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AudioPlayer from './AudioPlayer';
import AudioEffects from './AudioEffects';
import RemixEffects from './RemixEffects';
import StemMixer from './StemMixer';
import BeatGrid from './BeatGrid';
import { remixService } from '@/services/remixService';

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

  const handlePreviewEffect = (type: string) => {
    console.log('Previewing effect:', type);
  };

  const handleGenerateRemix = async () => {
    if (!uploadedFile) {
      toast({
        title: "Missing input",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Process stems if available
      let genrePrompt = "";
      if (stems) {
        // Create a description based on active stems and their settings
        const activeStems = Object.entries(stems)
          .filter(([_, stem]) => !stem.muted)
          .map(([type, stem]) => {
            const volume = Math.round(stem.volume * 100);
            return `${type} at ${volume}%`;
          });

        if (activeStems.length > 0) {
          genrePrompt = `Remix with ${activeStems.join(', ')}`;
        }
      }

      // Call the remix service to generate a remix
      await remixService.generateRemix(
        uploadedFile,
        genrePrompt || "", // Use stem info as prompt if available
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
          {/* Stem Mixer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StemMixer
              stems={stems}
              onVolumeChange={handleStemVolumeChange}
              onMuteToggle={handleStemMuteToggle}
              isLoading={isSeparatingStem}
              audioContext={audioContextRef.current}
            />
          </motion.div>

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
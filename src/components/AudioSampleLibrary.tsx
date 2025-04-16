import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { AudioSample, audioSampleService } from '@/services/audioSampleService';
import { Play, Pause, Plus, Search, Music, WaveformIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AudioSampleLibraryProps {
  audioContext: AudioContext | null;
  onAddSample: (sample: AudioSample, buffer: AudioBuffer) => void;
}

const AudioSampleLibrary: FC<AudioSampleLibraryProps> = ({
  audioContext,
  onAddSample
}) => {
  const [activeCategory, setActiveCategory] = useState<AudioSample['category']>('drums');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingSampleId, setPlayingSampleId] = useState<string | null>(null);
  const [filteredSamples, setFilteredSamples] = useState<AudioSample[]>([]);

  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  // Initialize filtered samples
  useEffect(() => {
    if (searchQuery) {
      setFilteredSamples(audioSampleService.getSamplesByTag(searchQuery));
    } else {
      setFilteredSamples(audioSampleService.getSamplesByCategory(activeCategory));
    }
  }, [activeCategory, searchQuery]);

  // Play a sample
  const playSample = (sample: AudioSample) => {
    if (!audioContext) return;

    // Stop any currently playing sample
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
      setPlayingSampleId(null);
    }

    // If we're clicking on the currently playing sample, just stop it
    if (playingSampleId === sample.id) {
      return;
    }

    // Check if we already have the buffer
    let buffer = audioBuffersRef.current.get(sample.id);

    if (!buffer) {
      // Create a dummy buffer for now
      // In a real app, this would fetch the actual audio file
      buffer = audioSampleService.createDummyBuffer(audioContext, sample);
      audioBuffersRef.current.set(sample.id, buffer);
    }

    // Create and play the source
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.loop = true;
    source.start();

    // Save reference and update state
    audioSourceRef.current = source;
    setPlayingSampleId(sample.id);

    // Add event listener for when playback ends
    source.onended = () => {
      setPlayingSampleId(null);
    };
  };

  // Add a sample to the remix
  const handleAddSample = (sample: AudioSample) => {
    if (!audioContext) return;

    // Get or create the buffer
    let buffer = audioBuffersRef.current.get(sample.id);

    if (!buffer) {
      buffer = audioSampleService.createDummyBuffer(audioContext, sample);
      audioBuffersRef.current.set(sample.id, buffer);
    }

    // Call the parent component's handler
    onAddSample(sample, buffer);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
    };
  }, []);

  // Categories for the tabs
  const categories: { value: AudioSample['category']; label: string; icon: JSX.Element }[] = [
    { value: 'drums', label: 'Drums', icon: <WaveformIcon className="h-4 w-4" /> },
    { value: 'bass', label: 'Bass', icon: <WaveformIcon className="h-4 w-4" /> },
    { value: 'melody', label: 'Melody', icon: <Music className="h-4 w-4" /> },
    { value: 'fx', label: 'FX', icon: <WaveformIcon className="h-4 w-4" /> },
    { value: 'vocals', label: 'Vocals', icon: <WaveformIcon className="h-4 w-4" /> }
  ];

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Sample Library</h3>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search samples..."
            className="pl-8 bg-[#1A1F26] border-none text-white w-48"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="drums" value={activeCategory} onValueChange={(value) => setActiveCategory(value as AudioSample['category'])}>
        <TabsList className="grid grid-cols-5 mb-4">
          {categories.map((category) => (
            <TabsTrigger
              key={category.value}
              value={category.value}
              className="flex items-center gap-1"
            >
              {category.icon}
              <span>{category.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.value} value={category.value} className="mt-0">
            <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
              <AnimatePresence>
                {filteredSamples.map((sample) => (
                  <motion.div
                    key={sample.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-[#1A1F26] rounded-lg p-3 flex flex-col ${
                      playingSampleId === sample.id ? 'border border-[#00FFD1]' : 'border border-transparent'
                    } hover:border-[#00FFD1]/50 transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            playingSampleId === sample.id ? 'bg-[#00FFD1] text-black' : 'bg-[#2A2F36] text-white'
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8 rounded-full"
                            onClick={() => playSample(sample)}
                          >
                            {playingSampleId === sample.id ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div>
                          <h4 className="text-white text-sm font-medium">{sample.name}</h4>
                          <p className="text-gray-400 text-xs">{sample.bpm > 0 ? `${sample.bpm} BPM` : 'One-shot'}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full hover:bg-[#00FFD1]/20"
                        onClick={() => handleAddSample(sample)}
                      >
                        <Plus className="h-4 w-4 text-[#00FFD1]" />
                      </Button>
                    </div>

                    <div className="w-full h-6 bg-[#0C1015] rounded-md overflow-hidden">
                      {/* Waveform visualization */}
                      <div className="h-full flex items-center justify-center">
                        {playingSampleId === sample.id ? (
                          <div className="flex space-x-1">
                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-0.5 bg-[#00FFD1] rounded-full"
                                animate={{
                                  height: [3, 6, 12, 6, 3][i % 5],
                                }}
                                transition={{
                                  duration: 0.5,
                                  repeat: Infinity,
                                  repeatType: "reverse",
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex space-x-0.5">
                            {[...Array(12)].map((_, i) => (
                              <div
                                key={i}
                                className="w-0.5 bg-gray-600 rounded-full"
                                style={{
                                  height: `${Math.max(2, Math.sin(i * 0.5) * 6 + 6)}px`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {sample.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded bg-[#2A2F36] text-gray-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AudioSampleLibrary;

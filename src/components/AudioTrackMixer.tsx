import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AudioSample } from '@/services/audioSampleService';
import { Play, Pause, X, Volume2, VolumeX, Music, WaveformIcon, Trash2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for a track in the mixer
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

interface AudioTrackMixerProps {
  tracks: MixerTrack[];
  audioContext: AudioContext | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onRemoveTrack: (trackId: string) => void;
  onUpdateTrack: (trackId: string, updates: Partial<MixerTrack>) => void;
}

const AudioTrackMixer: FC<AudioTrackMixerProps> = ({
  tracks,
  audioContext,
  isPlaying,
  onPlayPause,
  onRemoveTrack,
  onUpdateTrack
}) => {
  const [soloActive, setSoloActive] = useState(false);
  const trackNodesRef = useRef<Map<string, { source: AudioBufferSourceNode, gain: GainNode, pan: StereoPannerNode }>>(new Map());

  // Check if any track is soloed
  useEffect(() => {
    setSoloActive(tracks.some(track => track.solo));
  }, [tracks]);

  // Start/stop audio playback
  useEffect(() => {
    if (!audioContext) return;

    if (isPlaying) {
      // Start playback for all tracks
      tracks.forEach(track => {
        // Skip if already playing
        if (trackNodesRef.current.has(track.id)) return;

        // Create nodes
        const source = audioContext.createBufferSource();
        source.buffer = track.buffer;
        source.loop = true;

        const gainNode = audioContext.createGain();
        gainNode.gain.value = calculateEffectiveVolume(track);

        const panNode = audioContext.createStereoPanner();
        panNode.pan.value = track.pan;

        // Connect nodes
        source.connect(panNode);
        panNode.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Start playback
        source.start();

        // Save references
        trackNodesRef.current.set(track.id, {
          source,
          gain: gainNode,
          pan: panNode
        });
      });
    } else {
      // Stop all playback
      trackNodesRef.current.forEach(({ source }) => {
        source.stop();
        source.disconnect();
      });
      trackNodesRef.current.clear();
    }

    // Cleanup on unmount
    return () => {
      trackNodesRef.current.forEach(({ source }) => {
        try {
          source.stop();
          source.disconnect();
        } catch (e) {
          // Ignore errors if already stopped
        }
      });
      trackNodesRef.current.clear();
    };
  }, [isPlaying, audioContext]);

  // Update volume and pan when tracks change
  useEffect(() => {
    tracks.forEach(track => {
      const nodes = trackNodesRef.current.get(track.id);
      if (nodes) {
        nodes.gain.gain.value = calculateEffectiveVolume(track);
        nodes.pan.pan.value = track.pan;
      }
    });
  }, [tracks, soloActive]);

  // Calculate effective volume considering mute and solo states
  const calculateEffectiveVolume = (track: MixerTrack): number => {
    if (track.muted) return 0;
    if (soloActive && !track.solo) return 0;
    return track.volume;
  };

  // Handle volume change
  const handleVolumeChange = (trackId: string, volume: number) => {
    onUpdateTrack(trackId, { volume });
  };

  // Handle pan change
  const handlePanChange = (trackId: string, pan: number) => {
    onUpdateTrack(trackId, { pan });
  };

  // Toggle mute
  const handleToggleMute = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onUpdateTrack(trackId, { muted: !track.muted });
    }
  };

  // Toggle solo
  const handleToggleSolo = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (track) {
      onUpdateTrack(trackId, { solo: !track.solo });
    }
  };

  // Get icon for track type
  const getTrackIcon = (track: MixerTrack) => {
    switch (track.type) {
      case 'sample':
        return <Music className="h-4 w-4" />;
      case 'uploaded':
        return <WaveformIcon className="h-4 w-4" />;
      case 'stem':
        return <WaveformIcon className="h-4 w-4" />;
      default:
        return <Music className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Track Mixer</h3>
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          className={isPlaying ? "bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black" : ""}
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
          {isPlaying ? "Stop" : "Play All"}
        </Button>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        <AnimatePresence>
          {tracks.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No tracks added yet. Add samples or upload audio.
            </div>
          ) : (
            tracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`bg-[#1A1F26] rounded-lg p-3 ${
                  track.solo ? 'border border-yellow-500' :
                  track.muted ? 'border border-gray-700 opacity-60' : 'border border-transparent'
                }`}
                style={{ borderLeftColor: track.color, borderLeftWidth: '3px' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-2"
                      style={{ backgroundColor: track.color }}
                    >
                      {getTrackIcon(track)}
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-medium">{track.name}</h4>
                      <p className="text-gray-400 text-xs">{track.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-8 w-8 ${track.muted ? 'text-gray-500' : 'text-white'}`}
                      onClick={() => handleToggleMute(track.id)}
                    >
                      {track.muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-8 w-8 ${track.solo ? 'text-yellow-500' : 'text-white'}`}
                      onClick={() => handleToggleSolo(track.id)}
                    >
                      <span className="text-xs font-bold">S</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8 text-red-500 hover:bg-red-500/10"
                      onClick={() => onRemoveTrack(track.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center">
                      <Volume2 className="h-3 w-3 text-gray-400 mr-1" />
                      <Slider
                        value={[track.volume * 100]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => handleVolumeChange(track.id, value / 100)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center text-xs text-gray-400">
                      <span>L</span>
                      <Slider
                        value={[(track.pan + 1) * 50]} // Convert -1...1 to 0...100
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={([value]) => handlePanChange(track.id, value / 50 - 1)}
                        className="mx-1 w-full"
                      />
                      <span>R</span>
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-6 w-6 text-gray-400 hover:text-white"
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="w-full h-6 bg-[#0C1015] rounded-md overflow-hidden mt-2 relative">
                  {/* Track waveform visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isPlaying && !track.muted && (!soloActive || track.solo) ? (
                      <div className="flex space-x-1">
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-0.5 rounded-full"
                            style={{ backgroundColor: track.color }}
                            animate={{
                              height: [3, 6, 12, 18, 12, 6, 3][i % 7],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              repeatType: "reverse",
                              delay: i * 0.05,
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex space-x-0.5">
                        {[...Array(16)].map((_, i) => (
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
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AudioTrackMixer;

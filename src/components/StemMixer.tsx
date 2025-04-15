import { FC, useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Mic, Drum, Guitar, Music, Volume2, VolumeX, Play, Pause, Waveform } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StemMixerProps {
  stems: {
    vocals: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    drums: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    bass: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    other: { buffer: AudioBuffer | null, volume: number, muted: boolean }
  } | null;
  onVolumeChange: (stemType: string, volume: number) => void;
  onMuteToggle: (stemType: string) => void;
  isLoading: boolean;
  audioContext?: AudioContext | null;
}

const StemMixer: FC<StemMixerProps> = ({
  stems,
  onVolumeChange,
  onMuteToggle,
  isLoading,
  audioContext
}) => {
  const [playingStem, setPlayingStem] = useState<string | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Function to play a stem
  const playStem = (stemType: string) => {
    if (!stems || !audioContext) return;

    const stemData = stems[stemType as keyof typeof stems];
    if (!stemData.buffer || stemData.muted) return;

    // Stop any currently playing stem
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    // If we're clicking on the currently playing stem, just stop it
    if (playingStem === stemType) {
      setPlayingStem(null);
      return;
    }

    // Create new audio source and gain node
    const source = audioContext.createBufferSource();
    source.buffer = stemData.buffer;

    const gainNode = audioContext.createGain();
    gainNode.gain.value = stemData.volume;

    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Start playback
    source.start();
    source.loop = true;

    // Save references
    audioSourceRef.current = source;
    gainNodeRef.current = gainNode;

    // Update state
    setPlayingStem(stemType);

    // Add event listener for when playback ends
    source.onended = () => {
      setPlayingStem(null);
    };
  };

  // Update gain when volume changes
  useEffect(() => {
    if (playingStem && gainNodeRef.current && stems) {
      const stemData = stems[playingStem as keyof typeof stems];
      gainNodeRef.current.gain.value = stemData.volume;
    }
  }, [stems, playingStem]);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
    };
  }, []);
  if (!stems && !isLoading) {
    return (
      <div className="bg-[#0C1015] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>
        <p className="text-gray-400 text-center py-8">
          Upload an audio file to separate stems
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#0C1015] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFD1]"></div>
          <span className="ml-3 text-gray-400">Separating stems...</span>
        </div>
      </div>
    );
  }

  const stemConfig = [
    {
      type: 'vocals',
      name: 'Vocals',
      icon: <Mic className="h-5 w-5" />,
      color: '#00FFD1'
    },
    {
      type: 'drums',
      name: 'Drums',
      icon: <Drum className="h-5 w-5" />,
      color: '#FF5E5E'
    },
    {
      type: 'bass',
      name: 'Bass',
      icon: <Guitar className="h-5 w-5" />,
      color: '#FFB800'
    },
    {
      type: 'other',
      name: 'Other',
      icon: <Music className="h-5 w-5" />,
      color: '#9D5CFF'
    }
  ];

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>

      <div className="grid grid-cols-4 gap-4">
        {stemConfig.map((stem) => {
          const stemData = stems?.[stem.type as keyof typeof stems];

          return (
            <motion.div
              key={stem.type}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`w-full h-40 rounded-lg mb-2 flex flex-col items-center justify-between p-3 ${
                  stemData?.muted ? 'bg-[#1A1F26]/50 opacity-50' : 'bg-[#1A1F26]'
                } hover:shadow-lg transition-all duration-300 cursor-pointer`}
                style={{
                  borderLeft: `3px solid ${stem.color}`,
                  boxShadow: playingStem === stem.type ? `0 0 15px ${stem.color}40` : 'none'
                }}
                onClick={() => !stemData?.muted && playStem(stem.type)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div
                      className={`p-1 rounded-full transition-transform duration-300 ${playingStem === stem.type ? 'scale-110' : ''}`}
                      style={{ backgroundColor: stem.color }}
                    >
                      {stem.icon}
                    </div>
                    <span className="ml-2 text-white text-sm">{stem.name}</span>
                    {playingStem === stem.type && (
                      <motion.div
                        className="ml-2 text-xs text-white px-1 py-0.5 rounded"
                        style={{ backgroundColor: stem.color }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        PLAYING
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        playStem(stem.type);
                      }}
                      disabled={stemData?.muted}
                    >
                      {playingStem === stem.type ? (
                        <Pause className="h-4 w-4 text-white" />
                      ) : (
                        <Play className="h-4 w-4 text-white" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMuteToggle(stem.type);
                        // If this stem is playing and we mute it, stop playback
                        if (playingStem === stem.type) {
                          if (audioSourceRef.current) {
                            audioSourceRef.current.stop();
                            audioSourceRef.current.disconnect();
                          }
                          setPlayingStem(null);
                        }
                      }}
                    >
                      {stemData?.muted ? (
                        <VolumeX className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="w-full mt-2">
                  <Slider
                    value={[stemData?.volume ? stemData.volume * 100 : 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => onVolumeChange(stem.type, value / 100)}
                    disabled={stemData?.muted}
                    className="w-full"
                  />
                </div>

                <div className="w-full bg-[#0C1015] h-12 rounded-md overflow-hidden mt-2 relative">
                  {/* Stem waveform visualization */}
                  <div
                    className={`h-full transition-all duration-300 ${playingStem === stem.type ? 'animate-pulse' : ''}`}
                    style={{
                      width: `${stemData?.volume ? stemData.volume * 100 : 0}%`,
                      backgroundColor: stem.color,
                      opacity: playingStem === stem.type ? 0.7 : 0.4
                    }}
                  ></div>

                  {/* Waveform visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {playingStem === stem.type && (
                      <motion.div
                        className="flex space-x-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-white rounded-full"
                            style={{ backgroundColor: stem.color }}
                            animate={{
                              height: [8, 16, 24, 16, 8],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.1,
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StemMixer;

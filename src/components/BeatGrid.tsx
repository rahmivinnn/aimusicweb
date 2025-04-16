import { FC, useEffect, useRef, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Clock, ZoomIn, ZoomOut, Plus, Music, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeatGridProps {
  bpm: number | null;
  onBpmChange: (bpm: number) => void;
  duration: number;
  currentTime: number;
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onAddCuePoint: (time: number) => void;
  onSetLoopPoints: (start: number, end: number) => void;
}

const BeatGrid: FC<BeatGridProps> = ({
  bpm,
  onBpmChange,
  duration,
  currentTime,
  zoomLevel,
  onZoomChange,
  onAddCuePoint,
  onSetLoopPoints
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Metronome functionality
  const toggleMetronome = () => {
    if (isMetronomeActive) {
      // Stop metronome
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setIsMetronomeActive(false);
    } else {
      // Start metronome
      if (!bpm) return;

      const beatInterval = 60000 / bpm; // in milliseconds
      setCurrentBeat(0);

      // Play first beat immediately
      playMetronomeSound(true);

      // Set up interval for subsequent beats
      metronomeIntervalRef.current = window.setInterval(() => {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % 4;
          playMetronomeSound(nextBeat === 0); // Accent on first beat of measure
          return nextBeat;
        });
      }, beatInterval);

      setIsMetronomeActive(true);
    }
  };

  // Play metronome sound
  const playMetronomeSound = (isAccent: boolean) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // Configure oscillator
    oscillator.type = isAccent ? 'sine' : 'triangle';
    oscillator.frequency.value = isAccent ? 1000 : 800;

    // Configure gain (volume and envelope)
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(isAccent ? 0.3 : 0.15, ctx.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    // Connect and start
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  // Draw beat grid on canvas
  useEffect(() => {
    if (!canvasRef.current || !bpm) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate beat spacing
    const secondsPerBeat = 60 / bpm;
    const pixelsPerSecond = width / (duration / zoomLevel);
    const beatSpacing = secondsPerBeat * pixelsPerSecond;

    // Draw background
    ctx.fillStyle = '#1A1F26';
    ctx.fillRect(0, 0, width, height);

    // Draw beat lines
    const totalBeats = Math.ceil(duration / secondsPerBeat);
    const visibleBeats = Math.ceil((duration / zoomLevel) / secondsPerBeat);
    const startBeat = Math.floor(currentTime / secondsPerBeat);

    for (let i = 0; i < visibleBeats; i++) {
      const beatPosition = (i * beatSpacing) % width;
      const isMeasureStart = (startBeat + i) % 4 === 0;

      ctx.strokeStyle = isMeasureStart ? '#00FFD1' : '#4a5568';
      ctx.lineWidth = isMeasureStart ? 2 : 1;

      ctx.beginPath();
      ctx.moveTo(beatPosition, 0);
      ctx.lineTo(beatPosition, height);
      ctx.stroke();

      if (isMeasureStart) {
        ctx.fillStyle = '#00FFD1';
        ctx.font = '10px Arial';
        ctx.fillText(`${Math.floor((startBeat + i) / 4) + 1}`, beatPosition + 4, 12);
      }
    }

    // Draw playhead
    const playheadPosition = (currentTime % (duration / zoomLevel)) * pixelsPerSecond;
    ctx.strokeStyle = '#FF5E5E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadPosition, 0);
    ctx.lineTo(playheadPosition, height);
    ctx.stroke();

  }, [bpm, duration, currentTime, zoomLevel]);

  const handleAddCuePoint = () => {
    onAddCuePoint(currentTime);
  };

  const handleSetLoopStart = () => {
    // Store current time as loop start
    const loopStart = currentTime;
    const loopEnd = loopStart + 4 * (60 / (bpm || 120)); // Default to 4 beats
    onSetLoopPoints(loopStart, loopEnd);
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Beat Grid</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.5))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-gray-400 text-sm">{zoomLevel}x</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.min(4, zoomLevel + 0.5))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <motion.div
              animate={isMetronomeActive ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] } : {}}
              transition={{ repeat: Infinity, duration: 60 / (bpm || 120) }}
            >
              <Music className={`h-4 w-4 mr-2 ${isMetronomeActive ? 'text-[#00FFD1]' : 'text-gray-400'}`} />
            </motion.div>
            <span className="text-gray-400 text-sm">BPM</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{bpm || '--'}</span>
            <Button
              variant={isMetronomeActive ? "default" : "outline"}
              size="sm"
              className={isMetronomeActive ? "bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black" : ""}
              onClick={toggleMetronome}
              disabled={!bpm}
            >
              {isMetronomeActive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        <Slider
          value={[bpm || 120]}
          min={60}
          max={200}
          step={1}
          onValueChange={([value]) => {
            onBpmChange(value);
            // Update metronome if active
            if (isMetronomeActive) {
              if (metronomeIntervalRef.current) {
                clearInterval(metronomeIntervalRef.current);
              }
              const beatInterval = 60000 / value;
              metronomeIntervalRef.current = window.setInterval(() => {
                setCurrentBeat(prev => {
                  const nextBeat = (prev + 1) % 4;
                  playMetronomeSound(nextBeat === 0);
                  return nextBeat;
                });
              }, beatInterval);
            }
          }}
          className="w-full"
        />
      </div>

      <div className="relative h-40 mb-4 rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={160}
          className="w-full h-full"
        />

        {/* Beat indicators */}
        {isMetronomeActive && (
          <div className="absolute bottom-2 left-2 flex space-x-2">
            {[0, 1, 2, 3].map((beat) => (
              <motion.div
                key={beat}
                className={`w-3 h-3 rounded-full ${currentBeat === beat ? 'bg-[#00FFD1]' : 'bg-gray-600'}`}
                animate={currentBeat === beat ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCuePoint}
          className="hover:bg-[#00FFD1]/10 transition-colors duration-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cue
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSetLoopStart}
          className="hover:bg-[#00FFD1]/10 transition-colors duration-300"
        >
          <Clock className="h-4 w-4 mr-2" />
          Set Loop
        </Button>
      </div>
    </div>
  );
};

export default BeatGrid;

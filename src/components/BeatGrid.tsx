import { FC, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Clock, ZoomIn, ZoomOut, Plus, Metronome } from 'lucide-react';
import { motion } from 'framer-motion';

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
            <Metronome className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-400 text-sm">BPM</span>
          </div>
          <span className="text-white font-medium">{bpm || '--'}</span>
        </div>
        <Slider
          value={[bpm || 120]}
          min={60}
          max={200}
          step={1}
          onValueChange={([value]) => onBpmChange(value)}
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
      </div>
      
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddCuePoint}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Cue
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSetLoopStart}
        >
          <Clock className="h-4 w-4 mr-2" />
          Set Loop
        </Button>
      </div>
    </div>
  );
};

export default BeatGrid;

import { FC, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface EnhancedAudioVisualizerProps {
  isActive: boolean;
  type?: 'bars' | 'wave' | 'circular' | 'spectrum' | 'complete';
  audioUrl?: string;
  isPlaying?: boolean;
  color?: string;
  height?: number;
}

const EnhancedAudioVisualizer: FC<EnhancedAudioVisualizerProps> = ({
  isActive,
  type = 'bars',
  audioUrl,
  isPlaying = false,
  color = '#00FFD1',
  height = 160
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize audio context and analyzer
  useEffect(() => {
    if (!isActive || !canvasRef.current) return;

    // Create audio elements if they don't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (!audioRef.current && audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.loop = true;
    }

    // Set up analyzer
    if (audioContextRef.current && audioRef.current && !analyserRef.current) {
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      
      // Connect audio source to analyzer
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      setIsInitialized(true);
    }

    return () => {
      // Clean up animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, audioUrl]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current || !isInitialized) return;

    if (isPlaying) {
      audioContextRef.current?.resume().then(() => {
        audioRef.current?.play().catch(err => console.error("Error playing audio:", err));
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isInitialized]);

  // Draw visualizer
  useEffect(() => {
    if (!isActive || !isInitialized || !analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!ctx || !analyser) return;

      // Get canvas dimensions
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Draw based on type
      switch (type) {
        case 'bars':
          drawBars(ctx, width, height, dataArray, bufferLength);
          break;
        case 'wave':
          drawWave(ctx, width, height, dataArray, bufferLength);
          break;
        case 'circular':
          drawCircular(ctx, width, height, dataArray, bufferLength);
          break;
        case 'spectrum':
          drawSpectrum(ctx, width, height, dataArray, bufferLength);
          break;
        case 'complete':
          drawComplete(ctx, width, height, dataArray, bufferLength);
          break;
      }

      // Request next frame
      animationRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, isInitialized, type, color]);

  // Draw bars visualizer
  const drawBars = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    const barWidth = width / bufferLength * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * height;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, adjustColor(color, 30));

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  // Draw wave visualizer
  const drawWave = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;

    // Draw top wave
    ctx.beginPath();
    ctx.moveTo(0, height / 2);

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (height / 2) - (v * height / 4);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    // Complete the path
    ctx.lineTo(width, height / 2);
    
    // Draw bottom wave (mirror)
    x = width;
    for (let i = bufferLength - 1; i >= 0; i--) {
      const v = dataArray[i] / 128.0;
      const y = (height / 2) + (v * height / 4);
      ctx.lineTo(x, y);
      x -= sliceWidth;
    }

    ctx.lineTo(0, height / 2);
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, adjustColor(color, 30));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, adjustColor(color, 30));
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = color;
  };

  // Draw circular visualizer
  const drawCircular = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw base circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = adjustColor(color, -70);
    ctx.lineWidth = 1;
    ctx.stroke();

    const barCount = bufferLength / 2; // Use fewer bars for better visualization
    const barWidth = (2 * Math.PI) / barCount;
    
    // Draw bars around circle
    for (let i = 0; i < barCount; i++) {
      const barHeight = (dataArray[i] / 255) * (radius * 0.5);
      const angle = i * barWidth;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      
      // Create color gradient based on position
      const hue = (i / barCount) * 360;
      ctx.strokeStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  // Draw spectrum visualizer
  const drawSpectrum = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;

    // Draw spectrum line
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 255.0;
      const y = height - (v * height);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    // Complete the path
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    // Fill with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;
  };

  // Draw complete visualizer (combination of multiple types)
  const drawComplete = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    // Draw background spectrum
    drawSpectrum(ctx, width, height, dataArray, bufferLength);
    
    // Draw bars on top with reduced opacity
    ctx.globalAlpha = 0.7;
    drawBars(ctx, width, height, dataArray, bufferLength);
    ctx.globalAlpha = 1.0;
    
    // Draw center line
    const centerY = height / 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.strokeStyle = adjustColor(color, -30);
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Add pulsing circle in center
    const centerX = width / 2;
    const avgFrequency = getAverageFrequency(dataArray);
    const pulseRadius = 20 + (avgFrequency * 30);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
    ctx.fillStyle = adjustColor(color, 20);
    ctx.globalAlpha = 0.2;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius * 0.7, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.fill();
    ctx.globalAlpha = 1.0;
  };

  // Helper function to get average frequency
  const getAverageFrequency = (dataArray: Uint8Array): number => {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length / 255;
  };

  // Helper function to adjust color brightness
  const adjustColor = (color: string, amount: number): string => {
    // For hex colors
    if (color.startsWith('#')) {
      let hex = color.slice(1);
      
      // Convert to RGB
      let r = parseInt(hex.slice(0, 2), 16);
      let g = parseInt(hex.slice(2, 4), 16);
      let b = parseInt(hex.slice(4, 6), 16);
      
      // Adjust values
      r = Math.max(0, Math.min(255, r + amount));
      g = Math.max(0, Math.min(255, g + amount));
      b = Math.max(0, Math.min(255, b + amount));
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // For other color formats, return as is
    return color;
  };

  // If not active, return empty div with same dimensions
  if (!isActive) {
    return <div className="w-full" style={{ height: `${height}px` }} />;
  }

  return (
    <motion.div
      className="w-full overflow-hidden"
      style={{ height: `${height}px` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={height}
        className="w-full h-full"
      />
    </motion.div>
  );
};

export default EnhancedAudioVisualizer;

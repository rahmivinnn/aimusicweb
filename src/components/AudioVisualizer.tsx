import { FC, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode | null;
  isPlaying: boolean;
  theme?: 'default' | 'neon' | 'spectrum' | 'circular';
}

const AudioVisualizer: FC<AudioVisualizerProps> = ({
  audioContext,
  audioSource,
  isPlaying,
  theme = 'default'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode>();

  useEffect(() => {
    if (!audioContext || !audioSource || !canvasRef.current) return;

    const analyzer = audioContext.createAnalyser();
    analyzerRef.current = analyzer;
    analyzer.fftSize = 256;
    audioSource.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      analyzer.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      if (theme === 'circular') {
        drawCircularVisualizer(ctx, width, height, dataArray, bufferLength);
      } else if (theme === 'spectrum') {
        drawSpectrumVisualizer(ctx, width, height, dataArray, bufferLength);
      } else if (theme === 'neon') {
        drawNeonVisualizer(ctx, width, height, dataArray, bufferLength);
      } else {
        drawDefaultVisualizer(ctx, width, height, dataArray, bufferLength);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioContext, audioSource, isPlaying, theme]);

  const drawDefaultVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    const barWidth = width / bufferLength * 2.5;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height;

      const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
      gradient.addColorStop(0, '#00FFD1');
      gradient.addColorStop(1, '#00A3FF');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawNeonVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    const barWidth = width / bufferLength * 2.5;
    let barHeight;
    let x = 0;

    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00FFD1';

    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height;

      ctx.fillStyle = '#00FFD1';
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      // Mirror effect
      ctx.fillRect(x, 0, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  const drawSpectrumVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, height);

    const sliceWidth = width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.strokeStyle = '#00FFD1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00FFD1';
  };

  const drawCircularVisualizer = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    dataArray: Uint8Array,
    bufferLength: number
  ) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1A1F26';
    ctx.lineWidth = 2;
    ctx.stroke();

    const barWidth = (2 * Math.PI) / bufferLength;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * 50;
      const angle = i * barWidth;

      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsl(${(i / bufferLength) * 360}, 100%, 50%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };

  return (
    <motion.div
      className="w-full h-40 bg-[#1A1F26] rounded-lg overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={160}
        className="w-full h-full"
      />
    </motion.div>
  );
};

export default AudioVisualizer;

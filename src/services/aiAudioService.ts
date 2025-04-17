import { v4 as uuidv4 } from 'uuid';

// Types for AI audio processing
export interface StemTrack {
  id: string;
  type: 'vocals' | 'drums' | 'bass' | 'other';
  buffer: AudioBuffer;
  volume: number;
  muted: boolean;
}

export interface RemixStyle {
  name: string;
  description: string;
  presetSettings: RemixSettings;
}

export interface RemixSettings {
  bpm: number;
  genre: string;
  effects: {
    reverb: number;
    delay: number;
    filter: {
      type: 'lowpass' | 'highpass' | 'bandpass';
      frequency: number;
      resonance: number;
    };
    distortion: number;
    compression: {
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
    };
  };
}

export interface ProcessingStatus {
  stage: 'uploading' | 'extracting_stems' | 'analyzing' | 'applying_remix' | 'rendering' | 'complete';
  progress: number;
  message: string;
}

// Predefined remix styles
export const remixPresets: RemixStyle[] = [
  {
    name: 'Lo-Fi',
    description: 'Warm, nostalgic beats with vinyl crackle',
    presetSettings: {
      bpm: 90,
      genre: 'lo-fi',
      effects: {
        reverb: 40,
        delay: 20,
        filter: {
          type: 'lowpass',
          frequency: 4000,
          resonance: 2
        },
        distortion: 10,
        compression: {
          threshold: -20,
          ratio: 4,
          attack: 10,
          release: 100
        }
      }
    }
  },
  {
    name: 'EDM',
    description: 'High-energy electronic dance music',
    presetSettings: {
      bpm: 128,
      genre: 'edm',
      effects: {
        reverb: 30,
        delay: 30,
        filter: {
          type: 'highpass',
          frequency: 100,
          resonance: 4
        },
        distortion: 20,
        compression: {
          threshold: -15,
          ratio: 5,
          attack: 5,
          release: 50
        }
      }
    }
  },
  // Add more presets...
];

class AIAudioService {
  private audioContext: AudioContext | null = null;
  private processingCallbacks: Map<string, (status: ProcessingStatus) => void> = new Map();

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Upload and process audio file
  async processAudioFile(file: File, onProgress?: (status: ProcessingStatus) => void): Promise<{
    stems: StemTrack[];
    bpm: number;
    key: string;
  }> {
    const processId = uuidv4();
    if (onProgress) {
      this.processingCallbacks.set(processId, onProgress);
    }

    try {
      // Update status: Uploading
      this.updateProgress(processId, {
        stage: 'uploading',
        progress: 0,
        message: 'Uploading audio file...'
      });

      // Load audio file
      const audioBuffer = await this.loadAudioFile(file);

      // Update status: Extracting stems
      this.updateProgress(processId, {
        stage: 'extracting_stems',
        progress: 20,
        message: 'Separating audio into stems...'
      });

      // Perform stem separation (mock implementation)
      const stems = await this.separateStems(audioBuffer);

      // Update status: Analyzing
      this.updateProgress(processId, {
        stage: 'analyzing',
        progress: 60,
        message: 'Analyzing audio characteristics...'
      });

      // Analyze audio (mock implementation)
      const analysis = await this.analyzeAudio(audioBuffer);

      // Update status: Complete
      this.updateProgress(processId, {
        stage: 'complete',
        progress: 100,
        message: 'Processing complete!'
      });

      return {
        stems,
        ...analysis
      };
    } finally {
      this.processingCallbacks.delete(processId);
    }
  }

  // Apply AI remix based on natural language prompt or preset
  async applyRemix(
    stems: StemTrack[],
    prompt?: string,
    preset?: RemixStyle,
    onProgress?: (status: ProcessingStatus) => void
  ): Promise<AudioBuffer> {
    const processId = uuidv4();
    if (onProgress) {
      this.processingCallbacks.set(processId, onProgress);
    }

    try {
      // Update status: Applying remix
      this.updateProgress(processId, {
        stage: 'applying_remix',
        progress: 0,
        message: 'Generating AI remix...'
      });

      // Apply remix effects based on prompt or preset
      const settings = preset?.presetSettings || this.interpretPrompt(prompt || '');
      const remixedStems = await this.applyRemixEffects(stems, settings);

      // Update status: Rendering
      this.updateProgress(processId, {
        stage: 'rendering',
        progress: 80,
        message: 'Rendering final mix...'
      });

      // Render final mix
      const finalMix = await this.renderFinalMix(remixedStems);

      // Update status: Complete
      this.updateProgress(processId, {
        stage: 'complete',
        progress: 100,
        message: 'Remix complete!'
      });

      return finalMix;
    } finally {
      this.processingCallbacks.delete(processId);
    }
  }

  // Private helper methods
  private async loadAudioFile(file: File): Promise<AudioBuffer> {
    const arrayBuffer = await file.arrayBuffer();
    return await this.audioContext!.decodeAudioData(arrayBuffer);
  }

  private async separateStems(audioBuffer: AudioBuffer): Promise<StemTrack[]> {
    // Create separate buffers for each stem using Web Audio API
    const stems: StemTrack[] = [];
    const stemTypes: ('vocals' | 'drums' | 'bass' | 'other')[] = ['vocals', 'drums', 'bass', 'other'];

    for (const type of stemTypes) {
      // Create a new buffer for each stem
      const stemBuffer = this.audioContext!.createBuffer(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      // Apply frequency filtering based on stem type
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const inputData = audioBuffer.getChannelData(channel);
        const outputData = stemBuffer.getChannelData(channel);

        // Create audio nodes for processing
        const sourceNode = this.audioContext!.createBufferSource();
        sourceNode.buffer = audioBuffer;

        const filterNode = this.audioContext!.createBiquadFilter();
        switch (type) {
          case 'vocals':
            filterNode.type = 'bandpass';
            filterNode.frequency.value = 2000;
            filterNode.Q.value = 1;
            break;
          case 'drums':
            filterNode.type = 'highpass';
            filterNode.frequency.value = 200;
            break;
          case 'bass':
            filterNode.type = 'lowpass';
            filterNode.frequency.value = 200;
            break;
          case 'other':
            filterNode.type = 'bandpass';
            filterNode.frequency.value = 1000;
            filterNode.Q.value = 0.5;
            break;
        }

        // Process audio data
        for (let i = 0; i < inputData.length; i++) {
          outputData[i] = filterNode.frequency.value > 0 ? 
            inputData[i] * (type === 'other' ? 0.5 : 1.0) : 
            inputData[i];
        }
      }

      stems.push({
        id: uuidv4(),
        type,
        buffer: stemBuffer,
        volume: 1,
        muted: false
      });
    }

    return stems;
  }

  private async analyzeAudio(audioBuffer: AudioBuffer): Promise<{ bpm: number; key: string }> {
    // Create analyzer node
    const analyserNode = this.audioContext!.createAnalyser();
    analyserNode.fftSize = 2048;

    // Create buffer source
    const sourceNode = this.audioContext!.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(analyserNode);

    // Analyze frequency data
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserNode.getByteFrequencyData(dataArray);

    // Calculate BPM using peak detection
    const peaks = this.detectPeaks(dataArray);
    const bpm = this.calculateBPM(peaks, audioBuffer.sampleRate);

    // Detect key using frequency analysis
    const key = this.detectKey(dataArray);

    return {
      bpm,
      key
    };
  }

  private interpretPrompt(prompt: string): RemixSettings {
    // Mock prompt interpretation - in a real implementation, this would use NLP
    return {
      bpm: 120,
      genre: 'electronic',
      effects: {
        reverb: 30,
        delay: 20,
        filter: {
          type: 'lowpass',
          frequency: 2000,
          resonance: 1
        },
        distortion: 10,
        compression: {
          threshold: -20,
          ratio: 4,
          attack: 10,
          release: 100
        }
      }
    };
  }

  private async applyRemixEffects(stems: StemTrack[], settings: RemixSettings): Promise<StemTrack[]> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    return Promise.all(stems.map(async (stem) => {
      try {
        const processedBuffer = this.audioContext!.createBuffer(
          stem.buffer.numberOfChannels,
          stem.buffer.length,
          stem.buffer.sampleRate
        );

        // Create offline context for processing
        const offlineContext = new OfflineAudioContext(
          stem.buffer.numberOfChannels,
          stem.buffer.length,
          stem.buffer.sampleRate
        );

        // Create and configure nodes
        const sourceNode = offlineContext.createBufferSource();
        sourceNode.buffer = stem.buffer;

        const filterNode = offlineContext.createBiquadFilter();
        filterNode.type = settings.effects.filter.type;
        filterNode.frequency.value = settings.effects.filter.frequency;
        filterNode.Q.value = settings.effects.filter.resonance;

        const delayNode = offlineContext.createDelay();
        delayNode.delayTime.value = settings.effects.delay / 1000;

        const distortionNode = offlineContext.createWaveShaper();
        const compressorNode = offlineContext.createDynamicsCompressor();
        compressorNode.threshold.value = settings.effects.compression.threshold;
        compressorNode.ratio.value = settings.effects.compression.ratio;
        compressorNode.attack.value = settings.effects.compression.attack / 1000;
        compressorNode.release.value = settings.effects.compression.release / 1000;

        // Connect nodes
        sourceNode.connect(filterNode);
        filterNode.connect(delayNode);
        delayNode.connect(distortionNode);
        distortionNode.connect(compressorNode);
        compressorNode.connect(offlineContext.destination);

        // Start source and render
        sourceNode.start();
        const renderedBuffer = await offlineContext.startRendering();

        // Copy rendered buffer to processed buffer
        for (let channel = 0; channel < renderedBuffer.numberOfChannels; channel++) {
          const outputData = processedBuffer.getChannelData(channel);
          const renderedData = renderedBuffer.getChannelData(channel);
          outputData.set(renderedData);
        }

        return {
          ...stem,
          buffer: processedBuffer
        };
      } catch (error) {
        console.error('Error processing stem:', error);
        throw new Error(`Failed to process stem: ${error.message}`);
      }
    }));
  }

  private async renderFinalMix(stems: StemTrack[]): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      // Create offline context for final mix
      const maxLength = Math.max(...stems.map(stem => stem.buffer.length));
      const offlineContext = new OfflineAudioContext(
        2, // Stereo output
        maxLength,
        this.audioContext.sampleRate
      );

      // Create gain nodes for each stem
      const stemNodes = stems.map(stem => {
        if (stem.muted) return null;

        const sourceNode = offlineContext.createBufferSource();
        sourceNode.buffer = stem.buffer;

        const gainNode = offlineContext.createGain();
        gainNode.gain.value = stem.volume;

        sourceNode.connect(gainNode);
        gainNode.connect(offlineContext.destination);

        return sourceNode;
      }).filter(Boolean);

      // Start all sources
      stemNodes.forEach(node => node?.start());

      // Render final mix
      const outputBuffer = await offlineContext.startRendering();

      // Normalize output
      const channels = [];
      let maxAmplitude = 0;

      // Find maximum amplitude across all channels
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel);
        channels.push(outputData);
        
        for (let i = 0; i < outputData.length; i++) {
          maxAmplitude = Math.max(maxAmplitude, Math.abs(outputData[i]));
        }
      }

      // Apply normalization if needed
      if (maxAmplitude > 1) {
        const normalizeRatio = 0.99 / maxAmplitude;
        channels.forEach(channel => {
          for (let i = 0; i < channel.length; i++) {
            channel[i] *= normalizeRatio;
          }
        });
      }

      return outputBuffer;
    } catch (error) {
      console.error('Error rendering final mix:', error);
      throw new Error(`Failed to render final mix: ${error.message}`);
    }
  }

  private updateProgress(processId: string, status: ProcessingStatus) {
    const callback = this.processingCallbacks.get(processId);
    if (callback) {
      callback(status);
    }
  }

  private detectPeaks(dataArray: Uint8Array): number[] {
    const peaks: number[] = [];
    const threshold = 0.6;
    
    for (let i = 1; i < dataArray.length - 1; i++) {
      if (dataArray[i] > dataArray[i - 1] && 
          dataArray[i] > dataArray[i + 1] && 
          dataArray[i] > threshold * 255) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  private calculateBPM(peaks: number[], sampleRate: number): number {
    if (peaks.length < 2) return 120;

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1]);
    }

    // Convert intervals to time
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const timeInterval = avgInterval / sampleRate;

    // Calculate BPM
    const bpm = Math.round(60 / timeInterval);
    return Math.max(60, Math.min(200, bpm)); // Clamp between 60-200 BPM
  }

  private detectKey(frequencyData: Uint8Array): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const modes = ['major', 'minor'];

    // Simplified key detection using frequency peaks
    const dominantFreqIndex = frequencyData.indexOf(Math.max(...Array.from(frequencyData)));
    const noteIndex = Math.floor((dominantFreqIndex % 12));
    const modeIndex = dominantFreqIndex % 2;

    return `${notes[noteIndex]} ${modes[modeIndex]}`;
  }
}

export const aiAudioService = new AIAudioService();
// Audio Effect Processor Service
// Provides functionality for processing audio with various effects

// Interface for audio effects settings
export interface AudioEffects {
  reverb: {
    enabled: boolean;
    amount: number; // 0-100
    decay: number; // 0-100
  };
  delay: {
    enabled: boolean;
    time: number; // 0-100 (maps to actual delay time)
    feedback: number; // 0-100
    mix: number; // 0-100
  };
  filter: {
    enabled: boolean;
    type: 'lowpass' | 'highpass' | 'bandpass';
    frequency: number; // 0-100 (maps to actual frequency)
    resonance: number; // 0-100
  };
  distortion: {
    enabled: boolean;
    amount: number; // 0-100
  };
  compressor: {
    enabled: boolean;
    threshold: number; // 0-100 (maps to dB)
    ratio: number; // 0-100 (maps to actual ratio)
    attack: number; // 0-100 (maps to ms)
    release: number; // 0-100 (maps to ms)
  };
}

// Default effects settings
export const defaultEffects: AudioEffects = {
  reverb: { enabled: false, amount: 30, decay: 50 },
  delay: { enabled: false, time: 40, feedback: 30, mix: 50 },
  filter: { enabled: false, type: 'lowpass', frequency: 50, resonance: 20 },
  distortion: { enabled: false, amount: 20 },
  compressor: { enabled: false, threshold: 30, ratio: 40, attack: 20, release: 50 }
};

// Create a reverb effect
export const createReverb = async (
  audioContext: BaseAudioContext,
  amount: number,
  decay: number
): Promise<ConvolverNode> => {
  const convolver = audioContext.createConvolver();
  
  // Create impulse response
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * (decay / 100) * 3; // Convert decay to seconds (0-3s)
  const impulse = audioContext.createBuffer(2, length, sampleRate);
  
  // Fill impulse response buffer
  for (let channel = 0; channel < 2; channel++) {
    const impulseData = impulse.getChannelData(channel);
    
    for (let i = 0; i < length; i++) {
      // Decay curve
      const t = i / sampleRate;
      const decay = Math.exp(-t * (10 - (decay / 10)));
      
      // Random noise with decay
      impulseData[i] = (Math.random() * 2 - 1) * decay;
    }
  }
  
  convolver.buffer = impulse;
  return convolver;
};

// Create a delay effect
export const createDelay = (
  audioContext: BaseAudioContext,
  time: number,
  feedback: number,
  mix: number
): { input: GainNode; output: GainNode; delayNode: DelayNode } => {
  // Create nodes
  const inputGain = audioContext.createGain();
  const outputGain = audioContext.createGain();
  const dryGain = audioContext.createGain();
  const wetGain = audioContext.createGain();
  const feedbackGain = audioContext.createGain();
  const delayNode = audioContext.createDelay();
  
  // Set parameters
  const delayTime = (time / 100) * 1; // 0-1 second
  delayNode.delayTime.value = delayTime;
  feedbackGain.gain.value = feedback / 100;
  
  // Set wet/dry mix
  dryGain.gain.value = 1 - (mix / 100);
  wetGain.gain.value = mix / 100;
  
  // Connect nodes
  // Input -> Dry -> Output
  inputGain.connect(dryGain);
  dryGain.connect(outputGain);
  
  // Input -> Delay -> Wet -> Output
  inputGain.connect(delayNode);
  delayNode.connect(wetGain);
  wetGain.connect(outputGain);
  
  // Feedback loop
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  
  return { input: inputGain, output: outputGain, delayNode };
};

// Create a filter effect
export const createFilter = (
  audioContext: BaseAudioContext,
  type: 'lowpass' | 'highpass' | 'bandpass',
  frequency: number,
  resonance: number
): BiquadFilterNode => {
  const filter = audioContext.createBiquadFilter();
  
  // Set filter type
  filter.type = type;
  
  // Map frequency from 0-100 to actual frequency range
  // Using logarithmic scale for more natural sound
  const minFreq = 20;
  const maxFreq = 20000;
  const freqValue = minFreq * Math.pow(maxFreq / minFreq, frequency / 100);
  filter.frequency.value = freqValue;
  
  // Set resonance (Q)
  filter.Q.value = (resonance / 100) * 20; // 0-20
  
  return filter;
};

// Create a distortion effect
export const createDistortion = (
  audioContext: BaseAudioContext,
  amount: number
): WaveShaperNode => {
  const distortion = audioContext.createWaveShaper();
  
  // Create distortion curve
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  const amount2 = amount / 100;
  
  for (let i = 0; i < samples; ++i) {
    const x = (i * 2) / samples - 1;
    const y = (3 + amount2) * x * 20 * deg / (Math.PI + amount2 * Math.abs(x));
    curve[i] = y;
  }
  
  distortion.curve = curve;
  distortion.oversample = '4x';
  
  return distortion;
};

// Create a compressor effect
export const createCompressor = (
  audioContext: BaseAudioContext,
  threshold: number,
  ratio: number,
  attack: number,
  release: number
): DynamicsCompressorNode => {
  const compressor = audioContext.createDynamicsCompressor();
  
  // Map parameters to appropriate ranges
  compressor.threshold.value = -60 + (threshold / 100) * 60; // -60 to 0 dB
  compressor.ratio.value = 1 + (ratio / 100) * 19; // 1 to 20
  compressor.attack.value = (attack / 100) * 0.5; // 0 to 0.5 seconds
  compressor.release.value = 0.1 + (release / 100) * 0.9; // 0.1 to 1 second
  compressor.knee.value = 10; // Fixed knee
  
  return compressor;
};

// Process audio buffer with effects
export const processAudioBuffer = async (
  buffer: AudioBuffer,
  effects: AudioEffects
): Promise<AudioBuffer> => {
  // Create offline context for rendering
  const offlineContext = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.length,
    buffer.sampleRate
  );
  
  // Create source node
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  
  // Create gain nodes for input and output
  const inputGain = offlineContext.createGain();
  const outputGain = offlineContext.createGain();
  
  // Connect source to input gain
  source.connect(inputGain);
  
  // Create effect nodes
  let lastNode: AudioNode = inputGain;
  
  // Add reverb if enabled
  if (effects.reverb.enabled) {
    const reverb = await createReverb(
      offlineContext,
      effects.reverb.amount,
      effects.reverb.decay
    );
    lastNode.connect(reverb);
    lastNode = reverb;
  }
  
  // Add delay if enabled
  if (effects.delay.enabled) {
    const delay = createDelay(
      offlineContext,
      effects.delay.time,
      effects.delay.feedback,
      effects.delay.mix
    );
    lastNode.connect(delay.input);
    lastNode = delay.output;
  }
  
  // Add filter if enabled
  if (effects.filter.enabled) {
    const filter = createFilter(
      offlineContext,
      effects.filter.type,
      effects.filter.frequency,
      effects.filter.resonance
    );
    lastNode.connect(filter);
    lastNode = filter;
  }
  
  // Add distortion if enabled
  if (effects.distortion.enabled) {
    const distortion = createDistortion(
      offlineContext,
      effects.distortion.amount
    );
    lastNode.connect(distortion);
    lastNode = distortion;
  }
  
  // Add compressor if enabled
  if (effects.compressor.enabled) {
    const compressor = createCompressor(
      offlineContext,
      effects.compressor.threshold,
      effects.compressor.ratio,
      effects.compressor.attack,
      effects.compressor.release
    );
    lastNode.connect(compressor);
    lastNode = compressor;
  }
  
  // Connect last node to output gain
  lastNode.connect(outputGain);
  outputGain.connect(offlineContext.destination);
  
  // Start source and render
  source.start();
  const renderedBuffer = await offlineContext.startRendering();
  
  return renderedBuffer;
};

// Convert AudioBuffer to WAV format
export const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2;
  const view = new DataView(new ArrayBuffer(44 + length));
  
  // Write WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
  view.setUint16(32, numOfChan * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);
  
  // Write audio data
  const offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numOfChan; channel++) {
      const sample = buffer.getChannelData(channel)[i];
      const scaled = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
      view.setInt16(offset + (i * numOfChan + channel) * 2, scaled, true);
    }
  }
  
  return view.buffer;
};

// Helper function to write string to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Create a complete audio processing chain
export const createAudioProcessingChain = (
  audioContext: AudioContext,
  effects: AudioEffects
): {
  input: AudioNode;
  output: AudioNode;
  nodes: Record<string, AudioNode>;
} => {
  // Create nodes
  const input = audioContext.createGain();
  const output = audioContext.createGain();
  const nodes: Record<string, AudioNode> = {};
  
  // Create effect nodes
  let lastNode: AudioNode = input;
  
  // Add reverb if enabled
  if (effects.reverb.enabled) {
    createReverb(audioContext, effects.reverb.amount, effects.reverb.decay)
      .then(reverb => {
        nodes.reverb = reverb;
        lastNode.connect(reverb);
        reverb.connect(output);
      });
  }
  
  // Add delay if enabled
  if (effects.delay.enabled) {
    const delay = createDelay(
      audioContext,
      effects.delay.time,
      effects.delay.feedback,
      effects.delay.mix
    );
    nodes.delay = delay.input;
    lastNode.connect(delay.input);
    delay.output.connect(output);
  }
  
  // Add filter if enabled
  if (effects.filter.enabled) {
    const filter = createFilter(
      audioContext,
      effects.filter.type,
      effects.filter.frequency,
      effects.filter.resonance
    );
    nodes.filter = filter;
    lastNode.connect(filter);
    filter.connect(output);
  }
  
  // Add distortion if enabled
  if (effects.distortion.enabled) {
    const distortion = createDistortion(
      audioContext,
      effects.distortion.amount
    );
    nodes.distortion = distortion;
    lastNode.connect(distortion);
    distortion.connect(output);
  }
  
  // Add compressor if enabled
  if (effects.compressor.enabled) {
    const compressor = createCompressor(
      audioContext,
      effects.compressor.threshold,
      effects.compressor.ratio,
      effects.compressor.attack,
      effects.compressor.release
    );
    nodes.compressor = compressor;
    lastNode.connect(compressor);
    compressor.connect(output);
  }
  
  // If no effects are enabled, connect input directly to output
  if (Object.keys(nodes).length === 0) {
    input.connect(output);
  }
  
  return { input, output, nodes };
};

// Export the audio effect processor service
const audioEffectProcessor = {
  createReverb,
  createDelay,
  createFilter,
  createDistortion,
  createCompressor,
  processAudioBuffer,
  audioBufferToWav,
  createAudioProcessingChain,
  defaultEffects
};

export default audioEffectProcessor;

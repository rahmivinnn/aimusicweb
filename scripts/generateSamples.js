import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to create WAV header
function createWavHeader(sampleRate, numChannels, bitsPerSample, dataLength) {
  const buffer = Buffer.alloc(44);
  
  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write('WAVE', 8);
  
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);
  
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataLength, 40);
  
  return buffer;
}

// Function to generate audio samples
function generateSamples(frequency, duration, sampleRate = 44100) {
  const numSamples = Math.floor(duration * sampleRate);
  const samples = new Float32Array(numSamples);
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Add some harmonics for richer sound
    samples[i] = 
      0.5 * Math.sin(2 * Math.PI * frequency * t) + // fundamental
      0.25 * Math.sin(4 * Math.PI * frequency * t) + // 2nd harmonic
      0.125 * Math.sin(6 * Math.PI * frequency * t); // 3rd harmonic
  }
  
  return samples;
}

// Function to create stereo WAV file
function createStereoWavFile(filename, frequencies, duration = 2) {
  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;
  const numSamples = Math.floor(duration * sampleRate);
  
  // Generate samples for both channels
  const leftChannel = generateSamples(frequencies[0], duration, sampleRate);
  const rightChannel = generateSamples(frequencies[1], duration, sampleRate);
  
  // Create data buffer
  const dataLength = numSamples * numChannels * (bitsPerSample / 8);
  const dataBuffer = Buffer.alloc(dataLength);
  
  // Write interleaved audio data
  for (let i = 0; i < numSamples; i++) {
    const left = Math.floor(leftChannel[i] * 32767);
    const right = Math.floor(rightChannel[i] * 32767);
    dataBuffer.writeInt16LE(left, i * 4);
    dataBuffer.writeInt16LE(right, i * 4 + 2);
  }
  
  // Create header
  const header = createWavHeader(sampleRate, numChannels, bitsPerSample, dataLength);
  
  // Write file
  const outputPath = join(__dirname, '..', 'public', 'samples', filename);
  writeFileSync(outputPath, Buffer.concat([header, dataBuffer]));
  console.log(`Created ${filename}`);
}

// Generate sample files
const samples = [
  {
    name: 'classic-drums.wav',
    frequencies: [100, 120], // Low frequencies for drums
  },
  {
    name: 'synth-leads.wav',
    frequencies: [440, 442], // Standard A4 with slight detuning
  },
  {
    name: 'basslines.wav',
    frequencies: [55, 57], // Low A with slight variation
  },
  {
    name: 'fx-transitions.wav',
    frequencies: [880, 890], // High frequencies for effects
  }
];

// Create samples directory if it doesn't exist
const samplesDir = join(__dirname, '..', 'public', 'samples');
if (!existsSync(samplesDir)) {
  mkdirSync(samplesDir, { recursive: true });
}

// Generate all sample files
samples.forEach(sample => {
  createStereoWavFile(sample.name, sample.frequencies);
}); 
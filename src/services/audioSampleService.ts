// Audio sample service to provide sample loops and sounds for remixing

// Define sample categories and their audio files
export interface AudioSample {
  id: string;
  name: string;
  category: 'drums' | 'bass' | 'melody' | 'fx' | 'vocals';
  bpm: number;
  audioUrl: string;
  duration: number; // in seconds
  tags: string[];
}

// Sample audio files (in a real app, these would be hosted on a server)
// For now, we'll use some placeholder URLs that would be replaced with actual audio files
const SAMPLE_BASE_URL = '/audio-samples';

export const audioSamples: AudioSample[] = [
  // Drum loops
  {
    id: 'drum-loop-1',
    name: 'House Beat 128BPM',
    category: 'drums',
    bpm: 128,
    audioUrl: `${SAMPLE_BASE_URL}/drums/house-beat-128.mp3`,
    duration: 4,
    tags: ['house', 'electronic', 'beat']
  },
  {
    id: 'drum-loop-2',
    name: 'Trap Beat 140BPM',
    category: 'drums',
    bpm: 140,
    audioUrl: `${SAMPLE_BASE_URL}/drums/trap-beat-140.mp3`,
    duration: 4,
    tags: ['trap', 'hip-hop', 'beat']
  },
  {
    id: 'drum-loop-3',
    name: 'EDM Beat 130BPM',
    category: 'drums',
    bpm: 130,
    audioUrl: `${SAMPLE_BASE_URL}/drums/edm-beat-130.mp3`,
    duration: 4,
    tags: ['edm', 'electronic', 'beat']
  },
  
  // Bass loops
  {
    id: 'bass-loop-1',
    name: 'Deep House Bass 128BPM',
    category: 'bass',
    bpm: 128,
    audioUrl: `${SAMPLE_BASE_URL}/bass/deep-house-bass-128.mp3`,
    duration: 4,
    tags: ['house', 'electronic', 'bass']
  },
  {
    id: 'bass-loop-2',
    name: 'Dubstep Bass 140BPM',
    category: 'bass',
    bpm: 140,
    audioUrl: `${SAMPLE_BASE_URL}/bass/dubstep-bass-140.mp3`,
    duration: 4,
    tags: ['dubstep', 'electronic', 'bass']
  },
  
  // Melody loops
  {
    id: 'melody-loop-1',
    name: 'Synth Arp 128BPM',
    category: 'melody',
    bpm: 128,
    audioUrl: `${SAMPLE_BASE_URL}/melody/synth-arp-128.mp3`,
    duration: 8,
    tags: ['synth', 'electronic', 'melody']
  },
  {
    id: 'melody-loop-2',
    name: 'Piano Chord Progression 120BPM',
    category: 'melody',
    bpm: 120,
    audioUrl: `${SAMPLE_BASE_URL}/melody/piano-chords-120.mp3`,
    duration: 8,
    tags: ['piano', 'chords', 'melody']
  },
  
  // FX sounds
  {
    id: 'fx-1',
    name: 'Riser',
    category: 'fx',
    bpm: 0, // Not applicable for one-shot FX
    audioUrl: `${SAMPLE_BASE_URL}/fx/riser.mp3`,
    duration: 4,
    tags: ['riser', 'fx', 'transition']
  },
  {
    id: 'fx-2',
    name: 'Impact',
    category: 'fx',
    bpm: 0,
    audioUrl: `${SAMPLE_BASE_URL}/fx/impact.mp3`,
    duration: 2,
    tags: ['impact', 'fx', 'hit']
  },
  {
    id: 'fx-3',
    name: 'Downlifter',
    category: 'fx',
    bpm: 0,
    audioUrl: `${SAMPLE_BASE_URL}/fx/downlifter.mp3`,
    duration: 4,
    tags: ['downlifter', 'fx', 'transition']
  },
  
  // Vocal samples
  {
    id: 'vocal-1',
    name: 'Female Vocal Hook',
    category: 'vocals',
    bpm: 128,
    audioUrl: `${SAMPLE_BASE_URL}/vocals/female-hook-128.mp3`,
    duration: 8,
    tags: ['female', 'vocals', 'hook']
  },
  {
    id: 'vocal-2',
    name: 'Male Vocal Phrase',
    category: 'vocals',
    bpm: 140,
    audioUrl: `${SAMPLE_BASE_URL}/vocals/male-phrase-140.mp3`,
    duration: 4,
    tags: ['male', 'vocals', 'phrase']
  }
];

// Service functions
export const audioSampleService = {
  // Get all samples
  getAllSamples: (): AudioSample[] => {
    return audioSamples;
  },
  
  // Get samples by category
  getSamplesByCategory: (category: AudioSample['category']): AudioSample[] => {
    return audioSamples.filter(sample => sample.category === category);
  },
  
  // Get samples by BPM range
  getSamplesByBpmRange: (minBpm: number, maxBpm: number): AudioSample[] => {
    return audioSamples.filter(sample => 
      sample.bpm >= minBpm && 
      sample.bpm <= maxBpm && 
      sample.bpm > 0 // Exclude one-shot FX that don't have a BPM
    );
  },
  
  // Get samples by tag
  getSamplesByTag: (tag: string): AudioSample[] => {
    return audioSamples.filter(sample => 
      sample.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  },
  
  // Get sample by ID
  getSampleById: (id: string): AudioSample | undefined => {
    return audioSamples.find(sample => sample.id === id);
  },
  
  // For development/testing: create an audio buffer from a sample
  // In a real app, this would fetch the actual audio file
  createDummyBuffer: (audioContext: AudioContext, sample: AudioSample): AudioBuffer => {
    // Create a dummy buffer based on the sample's duration
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(
      2, // stereo
      Math.floor(sample.duration * sampleRate),
      sampleRate
    );
    
    // Fill with a simple waveform based on the category
    for (let channel = 0; channel < 2; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        
        // Different waveforms for different categories
        switch (sample.category) {
          case 'drums':
            // Drum-like pattern with transients
            channelData[i] = Math.random() * 0.1;
            if (i % Math.floor(sampleRate / 4) < 100) {
              channelData[i] = Math.random() * 0.5;
            }
            break;
            
          case 'bass':
            // Low frequency sine wave
            channelData[i] = Math.sin(2 * Math.PI * 80 * t) * 0.3;
            break;
            
          case 'melody':
            // Higher frequency with some modulation
            channelData[i] = Math.sin(2 * Math.PI * (440 + Math.sin(t * 2) * 20) * t) * 0.2;
            break;
            
          case 'fx':
            // Sweeping noise
            channelData[i] = (Math.random() * 2 - 1) * Math.max(0, 1 - t / sample.duration) * 0.3;
            break;
            
          case 'vocals':
            // Formant-like oscillation
            channelData[i] = (
              Math.sin(2 * Math.PI * 220 * t) * 0.3 + 
              Math.sin(2 * Math.PI * 440 * t) * 0.2 +
              Math.sin(2 * Math.PI * 880 * t) * 0.1
            );
            break;
            
          default:
            channelData[i] = Math.sin(2 * Math.PI * 440 * t) * 0.2;
        }
        
        // Apply envelope
        const attack = 0.01;
        const release = 0.1;
        let envelope = 1;
        
        if (t < attack) {
          envelope = t / attack;
        } else if (t > sample.duration - release) {
          envelope = (sample.duration - t) / release;
        }
        
        channelData[i] *= Math.max(0, Math.min(1, envelope));
      }
    }
    
    return buffer;
  }
};

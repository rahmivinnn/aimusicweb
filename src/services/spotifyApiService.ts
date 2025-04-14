
// This is a mock implementation of Spotify API service
// In a real application, this would integrate with the actual Spotify API

// Mock audio file URLs (in a real app, these would come from the Spotify API)
const SAMPLE_AUDIO_TRACKS = [
  '/lovable-uploads/352e9e2a-4503-4d2f-8729-62c9411fba78.png', // This would be an actual audio file URL
];

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  imageUrl: string;
  audioUrl: string;
}

export interface RemixResult {
  id: string;
  title: string;
  originalTrack: Track;
  genre: string;
  bpm: number;
  duration: number; // in seconds
  imageUrl: string;
  audioUrl: string;
  createdAt: Date;
}

// Mock data
const mockTracks: Track[] = [
  {
    id: '1',
    name: 'Dreams',
    artist: 'Sarah Chen',
    album: 'Dreamscape',
    duration: 187,
    imageUrl: '/lovable-uploads/3d43b5b9-2e80-4fa4-be1f-10a6bfa16a9c.png',
    audioUrl: SAMPLE_AUDIO_TRACKS[0]
  }
];

const mockRemixes: RemixResult[] = [
  {
    id: '101',
    title: 'Neon Dreams (EDM Remix)',
    originalTrack: mockTracks[0],
    genre: 'EDM',
    bpm: 128,
    duration: 200,
    imageUrl: '/lovable-uploads/3d43b5b9-2e80-4fa4-be1f-10a6bfa16a9c.png',
    audioUrl: SAMPLE_AUDIO_TRACKS[0],
    createdAt: new Date('2024-03-14')
  },
  {
    id: '102',
    title: 'Neon Dreams (EDM Remix)',
    originalTrack: mockTracks[0],
    genre: 'EDM',
    bpm: 128,
    duration: 200,
    imageUrl: '/lovable-uploads/5cf4ed88-027e-41b3-80f7-732e2eff1903.png',
    audioUrl: SAMPLE_AUDIO_TRACKS[0],
    createdAt: new Date('2024-03-14')
  },
  {
    id: '103',
    title: 'Neon Dreams (EDM Remix)',
    originalTrack: mockTracks[0],
    genre: 'EDM',
    bpm: 128,
    duration: 200,
    imageUrl: '/lovable-uploads/8a2e170e-d2a3-476d-9616-bb9a08bdf2ed.png',
    audioUrl: SAMPLE_AUDIO_TRACKS[0],
    createdAt: new Date('2024-03-14')
  },
  {
    id: '104',
    title: 'Neon Dreams (EDM Remix)',
    originalTrack: mockTracks[0],
    genre: 'EDM',
    bpm: 128,
    duration: 200,
    imageUrl: '/lovable-uploads/3d43b5b9-2e80-4fa4-be1f-10a6bfa16a9c.png',
    audioUrl: SAMPLE_AUDIO_TRACKS[0],
    createdAt: new Date('2024-03-14')
  }
];

// Mock API services
export const spotifyApiService = {
  searchTracks: async (query: string): Promise<Track[]> => {
    // In a real app, this would call the Spotify API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTracks.filter(track => 
          track.name.toLowerCase().includes(query.toLowerCase()) ||
          track.artist.toLowerCase().includes(query.toLowerCase())
        ));
      }, 500);
    });
  },
  
  getTrackById: async (id: string): Promise<Track | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const track = mockTracks.find(t => t.id === id);
        resolve(track || null);
      }, 300);
    });
  },
  
  getSavedRemixes: async (): Promise<RemixResult[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockRemixes]);
      }, 800);
    });
  },
  
  generateRemix: async (
    trackOrFile: Track | File, 
    prompt: string, 
    settings: { bpm?: number; genre: string; voiceSetup?: string }
  ): Promise<RemixResult> => {
    // In a real app, this would use the Spotify API or another AI service
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock remix result
        const remix: RemixResult = {
          id: Math.random().toString(36).substring(7),
          title: prompt ? `${prompt.slice(0, 20)}... (${settings.genre} Remix)` : `${mockTracks[0].name} (${settings.genre} Remix)`,
          originalTrack: mockTracks[0],
          genre: settings.genre,
          bpm: settings.bpm || 128,
          duration: 200,
          imageUrl: mockRemixes[Math.floor(Math.random() * mockRemixes.length)].imageUrl,
          audioUrl: SAMPLE_AUDIO_TRACKS[0],
          createdAt: new Date()
        };
        resolve(remix);
      }, 4000); // Simulate processing time
    });
  },
  
  saveRemixToLibrary: async (remix: RemixResult): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In a real app, this would save to the user's library via the Spotify API
        mockRemixes.push(remix);
        resolve(true);
      }, 500);
    });
  },
  
  deleteRemix: async (remixId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockRemixes.findIndex(r => r.id === remixId);
        if (index !== -1) {
          mockRemixes.splice(index, 1);
          resolve(true);
        } else {
          resolve(false);
        }
      }, 300);
    });
  }
};

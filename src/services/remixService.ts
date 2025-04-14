
import { spotifyApiService, RemixResult, Track } from './spotifyApiService';

// This is a service layer that interacts with the spotify API service
// In a real application, this would be more complex and handle error cases better

export const remixService = {
  // Get all saved remixes
  getSavedRemixes: async () => {
    try {
      return await spotifyApiService.getSavedRemixes();
    } catch (error) {
      console.error('Error getting saved remixes:', error);
      return [];
    }
  },

  // Generate a remix from a track or file
  generateRemix: async (
    trackOrFile: Track | File,
    prompt: string,
    settings: { bpm?: number; genre: string; voiceSetup?: string }
  ) => {
    try {
      return await spotifyApiService.generateRemix(trackOrFile, prompt, settings);
    } catch (error) {
      console.error('Error generating remix:', error);
      throw error;
    }
  },

  // Save a remix to the user's library
  saveRemixToLibrary: async (remix: RemixResult) => {
    try {
      return await spotifyApiService.saveRemixToLibrary(remix);
    } catch (error) {
      console.error('Error saving remix to library:', error);
      return false;
    }
  },

  // Search for tracks
  searchTracks: async (query: string) => {
    try {
      return await spotifyApiService.searchTracks(query);
    } catch (error) {
      console.error('Error searching tracks:', error);
      return [];
    }
  },

  // Get a track by ID
  getTrackById: async (id: string) => {
    try {
      return await spotifyApiService.getTrackById(id);
    } catch (error) {
      console.error(`Error getting track by ID ${id}:`, error);
      return null;
    }
  },

  // Delete a remix
  deleteRemix: async (remixId: string) => {
    try {
      return await spotifyApiService.deleteRemix(remixId);
    } catch (error) {
      console.error(`Error deleting remix ${remixId}:`, error);
      return false;
    }
  }
};

import { FC, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Download,
  Share2,
  Trash2,
  Play,
  Pause,
  Clock,
  Search,
  Filter,
} from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  coverUrl: string;
  audioUrl: string;
  createdAt: string;
}

const generateRandomSongs = (count: number): Song[] => {
  const genres = ['EDM', 'Trap', 'Instrumental', 'Pop', 'Rock', 'Hip Hop'];
  const artists = ['Sarah Chen', 'Mike Wave', 'DJ Pulse', 'Luna Beat', 'The Remix Crew', 'Sound Master'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Neon Dreams ${genres[Math.floor(Math.random() * genres.length)]} Remix ${i + 1}`,
    artist: artists[Math.floor(Math.random() * artists.length)],
    genre: genres[Math.floor(Math.random() * genres.length)],
    duration: '02:20',
    coverUrl: `/covers/cover${(i % 4) + 1}.jpg`,
    audioUrl: `/audio/song${(i % 4) + 1}.mp3`,
    createdAt: new Date(2024, 3, 14).toISOString(),
  }));
};

const MusicLibrary: FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [currentFilter, setCurrentFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate 100 random songs
    const initialSongs = generateRandomSongs(100);
    setSongs(initialSongs);
    setFilteredSongs(initialSongs);
  }, []);

  useEffect(() => {
    // Filter songs based on search query and current filter
    const filtered = songs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = currentFilter === 'All' || song.genre === currentFilter;
      return matchesSearch && matchesFilter;
    });
    setFilteredSongs(filtered);
  }, [searchQuery, currentFilter, songs]);

  const handlePlay = (songId: number, audioUrl: string) => {
    if (currentlyPlaying === songId) {
      audioElement?.pause();
      setCurrentlyPlaying(null);
    } else {
      if (audioElement) {
        audioElement.pause();
      }
      const newAudio = new Audio(audioUrl);
      newAudio.play();
      setAudioElement(newAudio);
      setCurrentlyPlaying(songId);
    }
  };

  const handleDownload = async (audioUrl: string, title: string) => {
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Music Library</h1>
        <p className="text-gray-400">Browse and play your favorite remixes</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search remixes"
            className="pl-10 bg-[#1A1F26] border-none text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'EDM', 'Trap', 'Instrumental'].map(filter => (
            <Button
              key={filter}
              variant={currentFilter === filter ? 'default' : 'outline'}
              onClick={() => setCurrentFilter(filter)}
              className={currentFilter === filter ? 'bg-[#00FFD1] text-black' : ''}
            >
              {filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Songs List */}
      <div className="space-y-4">
        {filteredSongs.map(song => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#0C1015] rounded-lg p-4 flex items-center gap-4"
          >
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute inset-0 bg-black/50 hover:bg-black/70"
                onClick={() => handlePlay(song.id, song.audioUrl)}
              >
                {currentlyPlaying === song.id ? (
                  <Pause className="h-6 w-6 text-white" />
                ) : (
                  <Play className="h-6 w-6 text-white" />
                )}
              </Button>
            </div>

            <div className="flex-1">
              <h3 className="text-white font-semibold">{song.title}</h3>
              <p className="text-gray-400 text-sm">Original: {song.artist}</p>
              <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                <Clock className="h-3 w-3" />
                <span>{song.duration}</span>
                <span>•</span>
                <span>{new Date(song.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(song.audioUrl, song.title)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MusicLibrary; 
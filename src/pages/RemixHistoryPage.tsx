
import { FC, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { remixService } from '@/services/remixService';
import { RemixResult } from '@/services/spotifyApiService';
import RemixCard from '@/components/RemixCard';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RemixHistoryPage: FC = () => {
  const [remixes, setRemixes] = useState<RemixResult[]>([]);
  const [recentRemixes, setRecentRemixes] = useState<RemixResult[]>([]);
  const [mostPlayedRemixes, setMostPlayedRemixes] = useState<RemixResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchRemixes = async () => {
      try {
        const savedRemixes = await remixService.getSavedRemixes();
        setRemixes(savedRemixes);
        setRecentRemixes(savedRemixes.slice(0, 4));
        setMostPlayedRemixes(savedRemixes.slice(0, 4));
      } catch (error) {
        console.error('Error fetching remixes:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRemixes();
  }, []);
  
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handlePlayRemix = (remixId: string) => {
    navigate(`/remix-result/${remixId}`);
  };
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'most-played', label: 'Most played' },
    { id: 'instrumental', label: 'Instrumental' },
    { id: 'edm', label: 'EDM' },
    { id: 'trap', label: 'Trap' }
  ];
  
  return (
    <div className="py-8 px-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Remix History</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Search remixes"
              className="pl-10 bg-studio-dark border-gray-700 text-white"
            />
          </div>
          
          <Select defaultValue={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px] bg-studio-dark border-gray-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="bg-studio-dark border-gray-700 text-white">
              <SelectItem value="recent">Recent remixes</SelectItem>
              <SelectItem value="a-z">A-Z</SelectItem>
              <SelectItem value="oldest">Oldest remixes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="mb-8 flex space-x-2">
        {filters.map(filter => (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            className={activeFilter === filter.id 
              ? "bg-studio-neon text-black hover:bg-studio-neon/90" 
              : "bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
            }
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Remixes</h2>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400">Loading remixes...</p>
          ) : recentRemixes.length === 0 ? (
            <p className="text-gray-400">No recent remixes found.</p>
          ) : (
            recentRemixes.map(remix => (
              <RemixCard
                key={remix.id}
                id={remix.id}
                title={remix.title}
                originalTitle={remix.originalTrack.name}
                originalArtist={remix.originalTrack.artist}
                date={formatDate(remix.createdAt)}
                duration={formatDuration(remix.duration)}
                imageUrl={remix.imageUrl}
                onPlay={() => handlePlayRemix(remix.id)}
              />
            ))
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Most Played Remixes</h2>
          <Button variant="link" className="text-studio-neon">
            Show all
          </Button>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <p className="text-gray-400">Loading remixes...</p>
          ) : mostPlayedRemixes.length === 0 ? (
            <p className="text-gray-400">No played remixes found.</p>
          ) : (
            mostPlayedRemixes.map(remix => (
              <RemixCard
                key={remix.id}
                id={remix.id}
                title={remix.title}
                originalTitle={remix.originalTrack.name}
                originalArtist={remix.originalTrack.artist}
                date={formatDate(remix.createdAt)}
                duration={formatDuration(remix.duration)}
                imageUrl={remix.imageUrl}
                onPlay={() => handlePlayRemix(remix.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RemixHistoryPage;

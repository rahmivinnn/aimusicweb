import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioPlayer from '@/components/AudioPlayer';
import { remixService } from '@/services/remixService';
import { RemixResult } from '@/services/spotifyApiService';
import { useToast } from "@/hooks/use-toast";
import AudioControls from '@/components/AudioControls';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

const RemixResultPage: FC = () => {
  const [remix, setRemix] = useState<RemixResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioSettings, setAudioSettings] = useState({
    reverb: 20,
    delay: 30,
    compression: 40,
    eq: { low: 0, mid: 0, high: 0 }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeTab, setActiveTab] = useState('after');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchRemix = async () => {
      try {
        const remixes = await remixService.getSavedRemixes();
        if (remixes.length > 0) {
          setRemix(remixes[0]);
        }
      } catch (error) {
        console.error('Error fetching remix:', error);
        toast({
          title: "Error",
          description: "Could not load the remix. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchRemix();
  }, [toast]);
  
  const handleSaveToLibrary = async () => {
    if (remix) {
      try {
        await remixService.saveRemixToLibrary(remix);
        toast({
          title: "Success",
          description: "Remix saved to your library",
        });
        navigate('/my-library');
      } catch (error) {
        console.error('Error saving remix:', error);
        toast({
          title: "Error",
          description: "Could not save the remix. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleGenerateNew = () => {
    navigate('/');
  };

  const handleAudioSettingsChange = (newSettings: typeof audioSettings) => {
    setAudioSettings(newSettings);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleReset = () => {
    setAudioSettings({
      reverb: 20,
      delay: 30,
      compression: 40,
      eq: { low: 0, mid: 0, high: 0 }
    });
  };
  
  if (loading) {
    return (
      <div className="py-8 px-6 max-w-4xl mx-auto flex justify-center items-center min-h-[70vh]">
        <p className="text-white">Loading your remix...</p>
      </div>
    );
  }
  
  if (!remix) {
    return (
      <div className="py-8 px-6 max-w-4xl mx-auto flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Remix not found</h2>
          <p className="text-gray-400 mb-6">We couldn't find the remix you're looking for.</p>
          <Button 
            className="bg-studio-neon text-black hover:bg-studio-neon/90"
            onClick={() => navigate('/')}
          >
            Create a new remix
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your Generated Remix</h1>
        <p className="text-gray-400">Composition converter Powered {remix.genre} Remix. {remix.bpm}BPM</p>
      </div>
      
      <Tabs defaultValue="after" className="mb-6" onValueChange={value => setActiveTab(value)}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="before">Original Track</TabsTrigger>
          <TabsTrigger value="after">Remixed Version</TabsTrigger>
        </TabsList>
        <TabsContent value="before" className="space-y-4">
          <div className="bg-[#0C1015] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Original Track</h3>
            <AudioPlayer 
              audioUrl={remix.originalTrack.audioUrl}
              title={remix.originalTrack.name}
              subtitle={`Original by ${remix.originalTrack.artist}`}
              showControls={true}
            />
          </div>
        </TabsContent>
        <TabsContent value="after" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="bg-[#0C1015] rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Remixed Version</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePlayPause}
                      className="w-8 h-8"
                    >
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleStop}
                      className="w-8 h-8"
                    >
                      <Square size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleReset}
                      className="w-8 h-8"
                    >
                      <RotateCcw size={16} />
                    </Button>
                  </div>
                </div>
                <AudioPlayer 
                  audioUrl={remix.audioUrl}
                  title={remix.title}
                  onSaveToLibrary={handleSaveToLibrary}
                  onGenerateNew={handleGenerateNew}
                  audioSettings={audioSettings}
                  isPlaying={isPlaying}
                  onPlayPause={handlePlayPause}
                  currentTime={currentTime}
                  onTimeUpdate={setCurrentTime}
                  duration={duration}
                  onDurationChange={setDuration}
                  showControls={true}
                />
              </div>
            </div>
            
            <div>
              <AudioControls 
                settings={audioSettings}
                onSettingsChange={handleAudioSettingsChange}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline"
          className="w-full py-6 border-gray-700 hover:border-studio-neon hover:bg-studio-neon/10 text-white"
          onClick={handleGenerateNew}
        >
          Generate New Remix
        </Button>
        <Button 
          className="w-full py-6 bg-studio-neon hover:bg-studio-neon/90 text-black"
          onClick={handleSaveToLibrary}
        >
          Save to Library
        </Button>
      </div>
    </div>
  );
};

export default RemixResultPage;

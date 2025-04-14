import { FC, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Music,
  Drum,
  Waves,
  Zap,
  Plus,
  Check,
  Play,
  Pause
} from 'lucide-react';

interface SamplePack {
  id: string;
  name: string;
  type: 'drums' | 'synth' | 'bass' | 'fx';
  count: number;
  icon: JSX.Element;
  audioUrl: string;
}

const samplePacks: SamplePack[] = [
  { 
    id: '1',
    name: 'Classic Drums',
    type: 'drums',
    count: 24,
    icon: <Drum className="w-6 h-6" />,
    audioUrl: '/samples/classic-drums.wav'
  },
  {
    id: '2',
    name: 'Synth Leads',
    type: 'synth',
    count: 32,
    icon: <Waves className="w-6 h-6" />,
    audioUrl: '/samples/synth-leads.wav'
  },
  {
    id: '3',
    name: 'Bass Lines',
    type: 'bass',
    count: 16,
    icon: <Music className="w-6 h-6" />,
    audioUrl: '/samples/basslines.wav'
  },
  {
    id: '4',
    name: 'FX & Transitions',
    type: 'fx',
    count: 48,
    icon: <Zap className="w-6 h-6" />,
    audioUrl: '/samples/fx-transitions.wav'
  },
];

interface SamplePacksProps {
  onSelect: (packIds: string[]) => void;
  selectedPacks: string[];
}

const SamplePacks: FC<SamplePacksProps> = ({ onSelect, selectedPacks }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const togglePack = (packId: string) => {
    if (selectedPacks.includes(packId)) {
      onSelect(selectedPacks.filter(id => id !== packId));
    } else {
      onSelect([...selectedPacks, packId]);
    }
  };

  const handlePreview = async (e: React.MouseEvent, pack: SamplePack) => {
    e.stopPropagation();
    
    if (!audioRefs.current[pack.id]) {
      audioRefs.current[pack.id] = new Audio(pack.audioUrl);
      audioRefs.current[pack.id].addEventListener('ended', () => {
        setPlayingId(null);
      });
    }

    if (playingId === pack.id) {
      audioRefs.current[pack.id].pause();
      audioRefs.current[pack.id].currentTime = 0;
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
        audioRefs.current[playingId].currentTime = 0;
      }
      
      try {
        await audioRefs.current[pack.id].play();
        setPlayingId(pack.id);
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Sample Packs</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {samplePacks.map((pack) => (
          <motion.div
            key={pack.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative cursor-pointer rounded-lg p-4 ${
              selectedPacks.includes(pack.id)
                ? 'bg-[#1A1F26] border-2 border-[#00FFD1]'
                : 'bg-[#1A1F26] border-2 border-transparent'
            }`}
            onClick={() => togglePack(pack.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-[#2A2F36] rounded-lg">
                  {pack.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium">{pack.name}</h4>
                  <p className="text-sm text-gray-400">{pack.count} samples</p>
                </div>
              </div>
              
              {selectedPacks.includes(pack.id) ? (
                <div className="bg-[#00FFD1] rounded-full p-1">
                  <Check className="w-4 h-4 text-black" />
                </div>
              ) : (
                <div className="bg-[#2A2F36] rounded-full p-1">
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>

            {/* Preview Button */}
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 w-full text-gray-400 hover:text-white hover:bg-[#2A2F36] flex items-center justify-center gap-2"
              onClick={(e) => handlePreview(e, pack)}
            >
              {playingId === pack.id ? (
                <>
                  <Pause className="w-4 h-4" />
                  Stop Preview
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Preview Sample
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SamplePacks; 
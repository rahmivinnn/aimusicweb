import { FC } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Mic, Drum, Guitar, Music, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface StemMixerProps {
  stems: {
    vocals: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    drums: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    bass: { buffer: AudioBuffer | null, volume: number, muted: boolean },
    other: { buffer: AudioBuffer | null, volume: number, muted: boolean }
  } | null;
  onVolumeChange: (stemType: string, volume: number) => void;
  onMuteToggle: (stemType: string) => void;
  isLoading: boolean;
}

const StemMixer: FC<StemMixerProps> = ({
  stems,
  onVolumeChange,
  onMuteToggle,
  isLoading
}) => {
  if (!stems && !isLoading) {
    return (
      <div className="bg-[#0C1015] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>
        <p className="text-gray-400 text-center py-8">
          Upload an audio file to separate stems
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-[#0C1015] rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00FFD1]"></div>
          <span className="ml-3 text-gray-400">Separating stems...</span>
        </div>
      </div>
    );
  }

  const stemConfig = [
    {
      type: 'vocals',
      name: 'Vocals',
      icon: <Mic className="h-5 w-5" />,
      color: '#00FFD1'
    },
    {
      type: 'drums',
      name: 'Drums',
      icon: <Drum className="h-5 w-5" />,
      color: '#FF5E5E'
    },
    {
      type: 'bass',
      name: 'Bass',
      icon: <Guitar className="h-5 w-5" />,
      color: '#FFB800'
    },
    {
      type: 'other',
      name: 'Other',
      icon: <Music className="h-5 w-5" />,
      color: '#9D5CFF'
    }
  ];

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Stem Mixer</h3>
      
      <div className="grid grid-cols-4 gap-4">
        {stemConfig.map((stem) => {
          const stemData = stems?.[stem.type as keyof typeof stems];
          
          return (
            <motion.div 
              key={stem.type}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className={`w-full h-32 rounded-lg mb-2 flex flex-col items-center justify-between p-3 ${
                  stemData?.muted ? 'bg-[#1A1F26]/50 opacity-50' : 'bg-[#1A1F26]'
                }`}
                style={{ borderLeft: `3px solid ${stem.color}` }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <div className="p-1 rounded-full" style={{ backgroundColor: stem.color }}>
                      {stem.icon}
                    </div>
                    <span className="ml-2 text-white text-sm">{stem.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-8 w-8"
                    onClick={() => onMuteToggle(stem.type)}
                  >
                    {stemData?.muted ? (
                      <VolumeX className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
                
                <div className="w-full">
                  <Slider
                    value={[stemData?.volume ? stemData.volume * 100 : 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => onVolumeChange(stem.type, value / 100)}
                    disabled={stemData?.muted}
                    className="w-full"
                  />
                </div>
                
                <div className="w-full bg-[#0C1015] h-8 rounded-md overflow-hidden">
                  {/* Stem waveform visualization would go here */}
                  <div 
                    className="h-full"
                    style={{ 
                      width: `${stemData?.volume ? stemData.volume * 100 : 0}%`,
                      backgroundColor: stem.color,
                      opacity: 0.5
                    }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default StemMixer;

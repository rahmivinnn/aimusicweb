
import { FC, useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RemixSettingsProps {
  targetBpm: number;
  onBpmChange: (value: number) => void;
  genre: string;
  onGenreChange: (value: string) => void;
  showVoiceSetup?: boolean;
  voiceSetup?: string;
  onVoiceSetupChange?: (value: string) => void;
}

const RemixSettings: FC<RemixSettingsProps> = ({
  targetBpm,
  onBpmChange,
  genre,
  onGenreChange,
  showVoiceSetup = false,
  voiceSetup = "Male Pop",
  onVoiceSetupChange
}) => {
  const handleSliderChange = (values: number[]) => {
    if (values.length > 0) {
      onBpmChange(values[0]);
    }
  };

  return (
    <div className="bg-studio-darkerBlue p-6 rounded-lg mb-6">
      <h3 className="text-white text-xl mb-4">Remix Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {showVoiceSetup ? (
          <div>
            <p className="text-white mb-2">Voice Setup</p>
            <Select 
              value={voiceSetup} 
              onValueChange={onVoiceSetupChange}
            >
              <SelectTrigger className="bg-studio-dark border-gray-700 text-white">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent className="bg-studio-dark border-gray-700 text-white">
                <SelectItem value="Male Pop">Male Pop</SelectItem>
                <SelectItem value="Female Pop">Female Pop</SelectItem>
                <SelectItem value="Rap">Rap</SelectItem>
                <SelectItem value="Rock">Rock</SelectItem>
                <SelectItem value="Soul">Soul</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <div className="flex justify-between mb-2">
              <p className="text-white">Target BPM</p>
              <p className="text-studio-neon">{targetBpm} BPM</p>
            </div>
            <Slider
              className="py-4"
              defaultValue={[targetBpm]}
              max={240}
              min={60}
              step={1}
              onValueChange={handleSliderChange}
            />
          </div>
        )}
        
        <div>
          <p className="text-white mb-2">Genre Style</p>
          <Select value={genre} onValueChange={onGenreChange}>
            <SelectTrigger className="bg-studio-dark border-gray-700 text-white">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent className="bg-studio-dark border-gray-700 text-white">
              <SelectItem value="Pop">Pop</SelectItem>
              <SelectItem value="EDM">EDM</SelectItem>
              <SelectItem value="Rock">Rock</SelectItem>
              <SelectItem value="Solid">Solid</SelectItem>
              <SelectItem value="Electronic">Electronic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default RemixSettings;

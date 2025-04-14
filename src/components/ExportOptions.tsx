import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Download,
  FileAudio,
  Music,
  Settings2,
  Share2,
} from 'lucide-react';

interface ExportOptionsProps {
  onExport: (options: ExportSettings) => void;
  isExporting: boolean;
}

interface ExportSettings {
  format: 'mp3' | 'wav' | 'ogg';
  quality: 'high' | 'medium' | 'low';
  splitStems: boolean;
  includeMidiData: boolean;
}

const ExportOptions: FC<ExportOptionsProps> = ({ onExport, isExporting }) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'wav',
    quality: 'high',
    splitStems: false,
    includeMidiData: false,
  });

  const qualitySettings = {
    mp3: {
      high: '320kbps',
      medium: '192kbps',
      low: '128kbps',
    },
    wav: {
      high: '24-bit/48kHz',
      medium: '16-bit/44.1kHz',
      low: '16-bit/22.05kHz',
    },
    ogg: {
      high: 'Q10',
      medium: 'Q6',
      low: 'Q2',
    },
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Export Options</h3>
      
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['mp3', 'wav', 'ogg'] as const).map((format) => (
              <Button
                key={format}
                variant={settings.format === format ? 'default' : 'outline'}
                className={`${
                  settings.format === format
                    ? 'bg-[#00FFD1] text-black hover:bg-[#00FFD1]/90'
                    : 'bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700'
                }`}
                onClick={() => setSettings({ ...settings, format })}
              >
                <FileAudio className="mr-2 h-4 w-4" />
                {format.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Quality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Quality - {qualitySettings[settings.format][settings.quality]}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['high', 'medium', 'low'] as const).map((quality) => (
              <Button
                key={quality}
                variant={settings.quality === quality ? 'default' : 'outline'}
                className={`${
                  settings.quality === quality
                    ? 'bg-[#00FFD1] text-black hover:bg-[#00FFD1]/90'
                    : 'bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700'
                }`}
                onClick={() => setSettings({ ...settings, quality })}
              >
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Additional Options
          </label>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="splitStems"
              checked={settings.splitStems}
              onChange={(e) => setSettings({ ...settings, splitStems: e.target.checked })}
              className="rounded border-gray-700 bg-[#1A1F26] text-[#00FFD1] focus:ring-[#00FFD1]"
            />
            <label htmlFor="splitStems" className="ml-2 text-sm text-gray-400">
              Export individual stems (drums, bass, melody, etc.)
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeMidi"
              checked={settings.includeMidiData}
              onChange={(e) => setSettings({ ...settings, includeMidiData: e.target.checked })}
              className="rounded border-gray-700 bg-[#1A1F26] text-[#00FFD1] focus:ring-[#00FFD1]"
            />
            <label htmlFor="includeMidi" className="ml-2 text-sm text-gray-400">
              Include MIDI data
            </label>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex gap-3">
          <Button
            className="flex-1 bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black"
            onClick={() => onExport(settings)}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Settings2 className="mr-2 h-5 w-5 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Export
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="bg-[#1A1F26] hover:bg-[#2A2F36] border-gray-700"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions; 
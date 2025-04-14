import { FC, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Mic,
  Upload,
  Play,
  Pause,
  Music,
  Languages,
  Wand2,
  Volume2,
  Clock,
  ArrowLeftRight,
  Layers,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceSettings {
  pitch: number;
  tempo: number;
  tone: number;
  emotion: string;
  language: string;
  accent: string;
  voiceStyle: string;
  ageEffect: number;
  clarity: number;
  expressiveness: number;
  breathiness: number;
  stability: number;
}

interface VoiceCloningProps {
  onSettingsChange: (settings: VoiceSettings) => void;
  onVoiceUpload: (file: File) => void;
  settings: VoiceSettings;
}

const emotions = [
  'Happy', 'Sad', 'Excited', 'Calm', 'Angry', 'Neutral', 'Passionate', 'Tender',
  'Energetic', 'Melancholic', 'Confident', 'Mysterious', 'Playful', 'Serious'
];

const voiceStyles = [
  'Natural', 'Broadcast', 'Whisper', 'Shouting', 'Opera', 'Rap', 'Jazz',
  'Rock', 'Classical', 'Pop', 'Electronic', 'Vintage', 'Future'
];

const languages = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Chinese',
  'Hindi', 'Arabic', 'Russian', 'Portuguese', 'Dutch', 'Swedish'
];

const accents = {
  English: ['US', 'UK', 'Australian', 'Canadian', 'Indian', 'Irish', 'Scottish'],
  Spanish: ['Spain', 'Mexican', 'Argentine', 'Colombian', 'Chilean'],
  French: ['France', 'Canadian', 'Belgian', 'Swiss'],
  // Add more accents for other languages
};

const VoiceCloning: FC<VoiceCloningProps> = ({ onSettingsChange, onVoiceUpload, settings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceBlendMode, setVoiceBlendMode] = useState<'single' | 'multi'>('single');
  const [selectedVoices, setSelectedVoices] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setRecordedBlob(audioBlob);
        const file = new File([audioBlob], 'voice-sample.wav', { type: 'audio/wav' });
        onVoiceUpload(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSettingChange = (key: keyof VoiceSettings, value: number | string) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleVoiceStyleTransfer = async () => {
    setIsProcessing(true);
    try {
      // Implementation for AI-powered voice style transfer
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated processing
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMultiVoiceBlend = async () => {
    setIsProcessing(true);
    try {
      // Implementation for blending multiple voice characteristics
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulated processing
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Advanced Voice Cloning & Synthesis</h3>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isProcessing}
        >
          <Sparkles className="w-4 h-4" />
          {isProcessing ? 'Processing...' : 'AI Enhance'}
        </Button>
      </div>

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="record">Record Voice</TabsTrigger>
          <TabsTrigger value="upload">Upload Sample</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-4">
          <Button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00FFD1] hover:bg-[#00FFD1]/90'}`}
            disabled={isProcessing}
          >
            <Mic className="mr-2 h-4 w-4" />
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Button>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Button
            onClick={() => document.getElementById('voice-upload')?.click()}
            className="w-full bg-[#1A1F26] hover:bg-[#2A2F36]"
            disabled={isProcessing}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Voice Sample
          </Button>
          <input
            id="voice-upload"
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onVoiceUpload(e.target.files[0])}
          />
        </TabsContent>
      </Tabs>

      <div className="space-y-6 mt-6">
        {/* Advanced Voice Characteristics */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Voice Characteristics</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Voice Style</label>
            <Select
              value={settings.voiceStyle}
              onValueChange={(value) => handleSettingChange('voiceStyle', value)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select voice style" />
              </SelectTrigger>
              <SelectContent>
                {voiceStyles.map((style) => (
                  <SelectItem key={style} value={style.toLowerCase()}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Age Effect</label>
            <Slider
              value={[settings.ageEffect]}
              onValueChange={([value]) => handleSettingChange('ageEffect', value)}
              min={-50}
              max={50}
              step={1}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Clarity</label>
            <Slider
              value={[settings.clarity]}
              onValueChange={([value]) => handleSettingChange('clarity', value)}
              min={0}
              max={100}
              step={1}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Expressiveness</label>
            <Slider
              value={[settings.expressiveness]}
              onValueChange={([value]) => handleSettingChange('expressiveness', value)}
              min={0}
              max={100}
              step={1}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Breathiness</label>
            <Slider
              value={[settings.breathiness]}
              onValueChange={([value]) => handleSettingChange('breathiness', value)}
              min={0}
              max={100}
              step={1}
              disabled={isProcessing}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Stability</label>
            <Slider
              value={[settings.stability]}
              onValueChange={([value]) => handleSettingChange('stability', value)}
              min={0}
              max={100}
              step={1}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* Voice Blending */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Voice Blending</h4>
          <div className="flex items-center gap-4">
            <Button
              variant={voiceBlendMode === 'single' ? 'default' : 'outline'}
              onClick={() => setVoiceBlendMode('single')}
              className="flex-1"
              disabled={isProcessing}
            >
              <Layers className="w-4 h-4 mr-2" />
              Single Voice
            </Button>
            <Button
              variant={voiceBlendMode === 'multi' ? 'default' : 'outline'}
              onClick={() => setVoiceBlendMode('multi')}
              className="flex-1"
              disabled={isProcessing}
            >
              <Music className="w-4 h-4 mr-2" />
              Multi Voice
            </Button>
          </div>
        </div>

        {/* AI Processing Options */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">AI Processing</h4>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={handleVoiceStyleTransfer} 
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <Workflow className="w-4 h-4" />
              Style Transfer
            </Button>
            <Button 
              variant="outline" 
              onClick={handleMultiVoiceBlend} 
              className="flex items-center gap-2"
              disabled={isProcessing}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Voice Fusion
            </Button>
          </div>
        </div>

        {/* Language and Accent Selection */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-white">Language & Accent</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Language</label>
              <Select
                value={settings.language}
                onValueChange={(value) => handleSettingChange('language', value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language.toLowerCase()}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Accent</label>
              <Select
                value={settings.accent}
                onValueChange={(value) => handleSettingChange('accent', value)}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select accent" />
                </SelectTrigger>
                <SelectContent>
                  {(accents[settings.language as keyof typeof accents] || []).map((accent) => (
                    <SelectItem key={accent} value={accent.toLowerCase()}>
                      {accent}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceCloning;

import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { remixService } from '@/services/remixService';
import { useNavigate } from 'react-router-dom';

const TextToAudioPage: FC = () => {
  const [prompt, setPrompt] = useState('');
  const [targetBpm, setTargetBpm] = useState(200);
  const [genre, setGenre] = useState('EDM');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerateRemix = async () => {
    if (!prompt) {
      toast({
        title: "Missing input",
        description: "Please enter a prompt to generate audio",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      await remixService.generateFromPrompt(prompt, {
        bpm: targetBpm,
        genre: genre
      });
      
      navigate('/processing');
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        title: "Generation failed",
        description: "There was a problem generating your audio. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  const genreOptions = ['Pop', 'EDM', 'Rock', 'Solid', 'Electronic'];
  const moodOptions = ['Classic', 'sad', 'Rock', 'Hiphop', 'Guitar music', 'High music'];

  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Composition Converter Remix Studio –</h1>
        <h2 className="text-2xl font-bold text-white mb-2">Customize Your Sound</h2>
        <p className="text-gray-400">Adjust BPM, effects, and style to create the perfect remix.</p>
      </div>

      <div className="bg-[#0C1015] rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Enter Prompt</h3>
        <textarea
          className="w-full h-32 bg-[#1A1F26] text-white rounded-lg p-4 mb-4"
          placeholder="Describe what you want to create"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood}
              className="px-4 py-2 rounded-full bg-[#1A1F26] text-white hover:bg-[#2A2F36]"
              onClick={() => setPrompt(prompt + ' ' + mood)}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0C1015] rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Remix Settings</h3>
        <div className="mb-6">
          <div className="flex justify-between text-white mb-2">
            <span>Target BMP</span>
            <span>{targetBpm}BMP</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            value={targetBpm}
            onChange={(e) => setTargetBpm(Number(e.target.value))}
            className="w-full accent-[#00FFD1]"
          />
        </div>
        <div>
          <label className="text-white block mb-2">Genre Style</label>
          <div className="relative">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#1A1F26] text-white p-3 rounded-lg appearance-none"
            >
              {genreOptions.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Button 
        className="w-full py-6 bg-[#00FFD1] hover:bg-[#00FFD1]/90 text-black text-lg font-semibold"
        onClick={handleGenerateRemix}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating Remix...' : 'Generate Remix'}
      </Button>
    </div>
  );
};

export default TextToAudioPage; 
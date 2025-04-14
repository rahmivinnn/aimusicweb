
import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AudioUploader from '@/components/AudioUploader';
import PromptInput from '@/components/PromptInput';
import RemixSettings from '@/components/RemixSettings';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { remixService } from '@/services/remixService';
import { useUser } from '@/context/UserContext';

const HomePage: FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [selectedGenrePrompt, setSelectedGenrePrompt] = useState('');
  const [targetBpm, setTargetBpm] = useState(128);
  const [genre, setGenre] = useState('EDM');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Redirect to login page if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };
  
  const handleGenerateRemix = async () => {
    if (!uploadedFile && !prompt) {
      toast({
        title: "Missing input",
        description: "Please upload an audio file or enter a prompt",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real app, we would send the file/prompt to the server
      // For now, we'll just simulate a delay
      if (uploadedFile) {
        await remixService.generateRemix(
          uploadedFile,
          prompt || selectedGenrePrompt,
          { bpm: targetBpm, genre }
        );
      } else {
        // Generate from prompt only
        await remixService.generateRemix(
          { id: '1', name: 'Generated Track', artist: 'AI', album: 'Generated', duration: 180, imageUrl: '', audioUrl: '' },
          prompt || selectedGenrePrompt,
          { genre }
        );
      }
      
      // Redirect to the processing page
      navigate('/processing');
    } catch (error) {
      console.error('Error generating remix:', error);
      toast({
        title: "Generation failed",
        description: "There was a problem generating your remix. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Remix Studio – Customize Your Sound</h1>
        <p className="text-gray-400">Adjust BPM, effects, and style to create the perfect remix.</p>
      </div>
      
      <AudioUploader onFileUpload={handleFileUpload} />
      
      <PromptInput 
        onPromptChange={setPrompt}
        selectedGenre={selectedGenrePrompt}
        onGenreSelect={setSelectedGenrePrompt}
      />
      
      <RemixSettings 
        targetBpm={targetBpm}
        onBpmChange={setTargetBpm}
        genre={genre}
        onGenreChange={setGenre}
      />
      
      <Button 
        className="w-full py-6 bg-studio-neon hover:bg-studio-neon/90 text-black text-lg"
        onClick={handleGenerateRemix}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating Remix...' : 'Generate Remix'}
      </Button>
    </div>
  );
};

export default HomePage;

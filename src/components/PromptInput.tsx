
import { FC, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PromptInputProps {
  onPromptChange: (prompt: string) => void;
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

const PromptInput: FC<PromptInputProps> = ({ 
  onPromptChange, 
  selectedGenre, 
  onGenreSelect 
}) => {
  const [inputValue, setInputValue] = useState("");
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    onPromptChange(e.target.value);
  };
  
  const genres = [
    "Classic", "Sad", "Rock", "Hiphop", "Guitar music", "High music"
  ];
  
  return (
    <div className="bg-studio-darkerBlue p-6 rounded-lg mb-6">
      <h3 className="text-white text-xl mb-4">Enter Prompt</h3>
      
      <Textarea 
        placeholder="Describe what you want to create" 
        className="bg-studio-dark border-gray-700 text-white mb-4 h-32 resize-none focus:border-studio-neon"
        value={inputValue}
        onChange={handleInputChange}
      />
      
      <div className="flex flex-wrap gap-3">
        {genres.map(genre => (
          <Button
            key={genre}
            variant="outline"
            className={`border-gray-700 ${
              selectedGenre === genre 
                ? 'bg-studio-neon text-black' 
                : 'bg-[#191d2a] text-gray-300 hover:bg-gray-800'
            }`}
            onClick={() => onGenreSelect(genre)}
          >
            {genre}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PromptInput;

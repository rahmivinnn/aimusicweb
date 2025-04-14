
import { FC, useState, useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

interface AudioUploaderProps {
  onFileUpload: (file: File) => void;
}

const AudioUploader: FC<AudioUploaderProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }
    
    onFileUpload(file);
    
    toast({
      title: "File uploaded",
      description: `${file.name} has been uploaded successfully`,
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${
          isDragging ? 'border-studio-neon bg-studio-neon/10' : 'border-gray-600 hover:border-studio-neon/50'
        } transition-colors cursor-pointer h-48`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <Upload size={36} className="mb-4 text-gray-400" />
        <p className="text-white mb-2">Drag & drop your audio file</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="audio/*"
          className="hidden"
        />
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline" 
          className="border-gray-600 text-gray-400 hover:bg-studio-neon/10 hover:text-studio-neon hover:border-studio-neon flex items-center gap-2"
          onClick={triggerFileInput}
        >
          <Plus size={16} />
          Add Another File
        </Button>
      </div>
    </div>
  );
};

export default AudioUploader;

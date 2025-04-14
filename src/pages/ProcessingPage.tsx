
import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProcessingStage from '@/components/ProcessingStage';
import AudioVisualizer from '@/components/AudioVisualizer';

const ProcessingPage: FC = () => {
  const [currentStage, setCurrentStage] = useState<'analyzing' | 'processing' | 'finalizing'>('analyzing');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(20);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const totalDuration = 8000; // 8 seconds total processing time
    const interval = 50; // update every 50ms
    const totalSteps = totalDuration / interval;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const newProgress = Math.min(100, (step / totalSteps) * 100);
      setProgress(newProgress);
      
      // Update estimated time (count down)
      const remainingTime = Math.max(0, Math.round(20 * (1 - newProgress / 100)));
      setEstimatedTime(remainingTime);
      
      // Update current stage based on progress
      if (newProgress >= 33 && newProgress < 66) {
        setCurrentStage('processing');
      } else if (newProgress >= 66) {
        setCurrentStage('finalizing');
      }
      
      // When complete, navigate to result page
      if (newProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          navigate('/remix-result');
        }, 500);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [navigate]);
  
  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <ProcessingStage 
        currentStage={currentStage}
        progress={progress}
        estimatedTime={estimatedTime}
      />
      
      <div className="mt-16">
        <AudioVisualizer type="complete" />
      </div>
    </div>
  );
};

export default ProcessingPage;

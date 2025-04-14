
import { FC, useEffect, useState } from 'react';
import { Activity, Brain, Sparkles } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface ProcessingStageProps {
  currentStage: 'analyzing' | 'processing' | 'finalizing';
  progress: number;
  estimatedTime: number;
}

const ProcessingStage: FC<ProcessingStageProps> = ({ 
  currentStage, 
  progress,
  estimatedTime
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev < progress) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [progress]);
  
  const stages = [
    {
      id: 'analyzing',
      title: 'Analyzing Audio',
      description: 'Extracting Tempo, Key and Musical Elements',
      icon: Activity,
      completed: currentStage === 'processing' || currentStage === 'finalizing',
      active: currentStage === 'analyzing'
    },
    {
      id: 'processing',
      title: 'AI Processing',
      description: 'Applying advance composition converter algorithm',
      icon: Brain,
      completed: currentStage === 'finalizing',
      active: currentStage === 'processing'
    },
    {
      id: 'finalizing',
      title: 'Finalizing',
      description: 'Optimizing and polishing your remix',
      icon: Sparkles,
      completed: false,
      active: currentStage === 'finalizing'
    }
  ];
  
  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-2xl font-medium">Create Your remix</h2>
        <p className="text-gray-400">Estimated time remaining: {estimatedTime} sec</p>
      </div>
      
      <Progress value={animatedProgress} className="h-2 mb-8 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-studio-neon/50 to-studio-neon h-full" style={{ width: `${animatedProgress}%` }}></div>
      </Progress>
      
      <motion.div 
        className="space-y-4"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="show"
      >
        {stages.map((stage) => (
          <motion.div 
            key={stage.id} 
            variants={itemVariants}
            className={`flex items-start p-4 rounded-lg transition-all duration-300 ${
              stage.active 
                ? 'bg-studio-darkerBlue border border-studio-neon shadow-lg shadow-studio-neon/20' 
                : 'bg-studio-darkerBlue border border-transparent'
            }`}
          >
            <div className={`rounded-full p-3 mr-4 transition-all duration-300 ${
              stage.completed 
                ? 'bg-studio-neon text-black' 
                : stage.active 
                  ? 'bg-studio-neon/30 text-studio-neon' 
                  : 'bg-gray-800 text-gray-400'
            }`}>
              <stage.icon size={24} className={stage.active ? 'animate-pulse' : ''} />
            </div>
            <div>
              <h3 className={`font-medium ${
                stage.completed || stage.active ? 'text-white' : 'text-gray-400'
              }`}>
                {stage.title}
              </h3>
              <p className="text-gray-400 text-sm">{stage.description}</p>
            </div>
            
            {stage.completed && (
              <div className="ml-auto">
                <motion.div 
                  className="rounded-full bg-studio-neon/20 p-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="#00e6cc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProcessingStage;

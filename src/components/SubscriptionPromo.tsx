
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const SubscriptionPromo: FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleUpgradeClick = () => {
    navigate('/subscription');
    toast({
      title: "Subscription",
      description: "Check out our Pro plans for unlimited remixes!",
    });
  };

  return (
    <motion.div 
      className="bg-studio-neon/10 rounded-lg p-4 text-white transition-colors"
      whileHover={{ backgroundColor: "rgba(0, 230, 204, 0.2)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.h3 
        className="text-studio-neon font-bold text-sm mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Go Premium & Remix Like a Pro!
      </motion.h3>
      <motion.p 
        className="text-xs text-white/80 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Get unlimited AI-powered remixes with high-quality EDM effects & exclusive sound packs!
      </motion.p>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          className="w-full bg-[#222] text-white hover:bg-[#333] text-xs py-1 h-auto"
          onClick={handleUpgradeClick}
        >
          Upgrade Now
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPromo;

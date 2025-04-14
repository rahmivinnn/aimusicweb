
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

const AppLogo: FC = () => {
  const { user } = useUser();
  const targetRoute = user?.isLoggedIn ? "/dashboard" : "/";
  
  return (
    <Link to={targetRoute} className="transition-transform hover:scale-105 duration-300">
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
      >
        <img 
          src="/lovable-uploads/bcc7d218-d69c-4ecb-802d-35cdd21003d8.png" 
          alt="Pink Floyd Logo" 
          className="w-full h-auto max-w-[150px]"
        />
      </motion.div>
    </Link>
  );
};

export default AppLogo;

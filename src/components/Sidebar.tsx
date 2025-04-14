
import { FC } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, Library, CreditCard, Bell, Settings, Music, Wand2 } from 'lucide-react';
import AppLogo from './AppLogo';
import SubscriptionPromo from './SubscriptionPromo';
import { useUser } from '@/context/UserContext';
import { motion } from 'framer-motion';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

const SidebarLink: FC<SidebarLinkProps> = ({ to, icon: Icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-3 p-3 w-full rounded-md transition-all duration-300 ${
          isActive 
            ? 'bg-studio-neon/10 text-studio-neon shadow-inner shadow-studio-neon/5' 
            : 'text-white/80 hover:bg-white/10'
        }`
      }
    >
      {({ isActive }) => (
        <motion.div 
          className="flex items-center gap-3 w-full"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Icon size={20} className={isActive ? "text-studio-neon" : ""} />
          <span>{label}</span>
          {isActive && (
            <motion.div 
              className="w-1 h-8 bg-studio-neon absolute right-0 rounded-l-md"
              layoutId="activeIndicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  );
};

const Sidebar: FC = () => {
  const { user } = useUser();
  const location = useLocation();
  
  // Don't show sidebar on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Animation variants
  const sidebarVariants = {
    hidden: { x: -300, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2 
      }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.aside 
      className="w-[240px] bg-studio-dark shrink-0 flex flex-col h-screen"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <AppLogo />
      
      <nav className="flex-1 px-3 py-2 space-y-1">
        <motion.div variants={itemVariants}>
          <SidebarLink to="/dashboard" icon={Home} label="Home" />
        </motion.div>
        
        <motion.div className="py-2" variants={itemVariants}>
          <h3 className="text-xs uppercase text-gray-500 font-medium px-3 mb-2">Create</h3>
          <SidebarLink to="/" icon={Wand2} label="Remix Song AI" />
          <SidebarLink to="/generate-audio" icon={Music} label="Text-to-Audio" />
        </motion.div>
        
        <motion.div className="py-2" variants={itemVariants}>
          <h3 className="text-xs uppercase text-gray-500 font-medium px-3 mb-2">Library</h3>
          <SidebarLink to="/remix-history" icon={History} label="Remix History" />
          <SidebarLink to="/my-library" icon={Library} label="My Library" />
        </motion.div>
        
        <motion.div className="py-2" variants={itemVariants}>
          <h3 className="text-xs uppercase text-gray-500 font-medium px-3 mb-2">Account</h3>
          <SidebarLink to="/subscription" icon={CreditCard} label="Subscription" />
          <SidebarLink to="/notifications" icon={Bell} label="Notifications" />
          <SidebarLink to="/profile" icon={Settings} label="Profile & Settings" />
        </motion.div>
      </nav>
      
      <motion.div 
        className="mt-auto mb-4 px-3"
        variants={itemVariants}
      >
        <SubscriptionPromo />
      </motion.div>
    </motion.aside>
  );
};

export default Sidebar;

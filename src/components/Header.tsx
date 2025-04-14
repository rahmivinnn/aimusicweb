
import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CreditCard, LogOut, Search, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import NotificationsPanel from './NotificationsPanel';
import { motion, AnimatePresence } from 'framer-motion';

const Header: FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    setShowUserMenu(false);
  };
  
  const handleUpgradeClick = () => {
    navigate('/subscription');
    toast({
      title: "Subscription Options",
      description: "Check out our subscription plans for premium features!",
    });
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };
  
  const handleSettingsClick = () => {
    navigate('/settings');
    setShowUserMenu(false);
  };
  
  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (showUserMenu) setShowUserMenu(false);
  };
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  return (
    <header className="flex justify-end items-center py-3 px-6 relative">
      <div className="flex items-center gap-4">
        <motion.button 
          className="text-white/70 hover:text-white transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search size={20} />
        </motion.button>
        
        <div className="relative">
          <motion.button 
            className="text-white/70 hover:text-white transition-colors relative"
            onClick={toggleNotifications}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} />
            <motion.span 
              className="absolute -top-1 -right-1 bg-studio-neon text-black text-xs w-4 h-4 flex items-center justify-center rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              3
            </motion.span>
          </motion.button>
        </div>
        
        <div className="relative">
          <motion.button 
            className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-studio-neon transition-all"
            onClick={toggleUserMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img 
              src="/lovable-uploads/0e06c333-6b0e-406d-8d9b-38daa4948267.png" 
              alt="User Profile" 
              className="w-full h-full object-cover"
            />
          </motion.button>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div 
                className="absolute top-full right-0 mt-2 w-56 bg-studio-darkerBlue rounded-md shadow-lg overflow-hidden z-50 border border-gray-700"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="p-4 border-b border-gray-700">
                  <p className="text-white font-medium">{user?.name || 'User'}</p>
                  <p className="text-gray-400 text-sm truncate">{user?.email || 'user@example.com'}</p>
                </div>
                <div className="py-1">
                  <motion.button 
                    onClick={handleProfileClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    whileHover={{ backgroundColor: "rgba(75, 75, 75, 0.3)" }}
                  >
                    <User size={16} className="mr-2" />
                    Your Profile
                  </motion.button>
                  <motion.button 
                    onClick={handleSettingsClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    whileHover={{ backgroundColor: "rgba(75, 75, 75, 0.3)" }}
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </motion.button>
                  <motion.button 
                    onClick={handleUpgradeClick}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    whileHover={{ backgroundColor: "rgba(75, 75, 75, 0.3)" }}
                  >
                    <CreditCard size={16} className="mr-2" />
                    Upgrade to Pro
                  </motion.button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <motion.button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                    whileHover={{ backgroundColor: "rgba(75, 75, 75, 0.3)" }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <NotificationsPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </header>
  );
};

export default Header;

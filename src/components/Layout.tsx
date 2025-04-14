
import { FC, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUser } from '@/context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout: FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Check if we're on the login page
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user?.isLoggedIn && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <motion.div 
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            className="flex-1 bg-gradient-to-b from-studio-darkerBlue/80 to-black"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Layout;

import { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';

interface User {
  email: string;
  name: string;
  isLoggedIn: boolean;
  profileImage: string;
  subscriptionType?: 'free' | 'pro' | 'premium';
  subscriptionActive?: boolean;
}

interface UserContextType {
  user: User | null;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user data from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const updateUser = (updates: Partial<User>) => {
    const updatedUser = {
      ...(updates as User)  // Cast as User karena kita memastikan semua field yang diperlukan ada
    };
    
    // Simpan ke localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

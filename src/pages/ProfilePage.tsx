
import { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext';
import { Camera, Save, X } from 'lucide-react';

const ProfilePage: FC = () => {
  const { user, updateUser, logout } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profileImage || '/lovable-uploads/e5e21b8f-af14-4069-9388-f2094781ac91.png');
  
  const handleSaveChanges = () => {
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    
    updateUser({
      name,
      email,
      profileImage: profilePicture
    });
    
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  const handleCancel = () => {
    navigate('/dashboard');
  };
  
  // Mocked profile picture upload - in a real app, this would upload to a server
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfilePicture(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="py-8 px-6 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p className="text-gray-400">Manage your personal information and account preferences</p>
      </div>
      
      <div className="bg-studio-darkerBlue rounded-lg p-6 shadow-lg mb-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center justify-start">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-studio-neon/30">
                <img 
                  src={profilePicture} 
                  alt={name || 'User'} 
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-studio-neon text-black p-2 rounded-full cursor-pointer hover:bg-studio-neon/90 transition-colors">
                <Camera size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleProfilePictureChange} 
                />
              </label>
            </div>
            <p className="text-center text-sm text-gray-400 mt-3">Upload a profile picture</p>
          </div>
          
          {/* Profile Info Section */}
          <div className="flex-1 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-studio-dark border-gray-700 text-white"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-studio-dark border-gray-700 text-white"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Settings Sections */}
      <div className="bg-studio-darkerBlue rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Account Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-gray-400 text-sm">Receive updates about new features and remixes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-studio-neon"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Dark Mode</h3>
              <p className="text-gray-400 text-sm">Use dark theme throughout the application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-studio-neon"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Audio Autoplay</h3>
              <p className="text-gray-400 text-sm">Automatically play audio previews</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-studio-neon"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Security Section */}
      <div className="bg-studio-darkerBlue rounded-lg p-6 shadow-lg mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Security</h2>
        <Button 
          variant="outline" 
          className="border-gray-700 text-white hover:bg-gray-800"
        >
          Change Password
        </Button>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
        <Button 
          onClick={handleSaveChanges}
          className="bg-studio-neon hover:bg-studio-neon/90 text-black w-full sm:w-auto"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="border-gray-700 text-white hover:bg-gray-800 w-full sm:w-auto"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <div className="flex-1"></div>
        <Button 
          variant="destructive"
          onClick={handleLogout}
          className="w-full sm:w-auto"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;

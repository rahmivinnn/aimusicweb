
import { FC, useState } from 'react';
import { Bell, Check, Clock, Music, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'success' | 'info' | 'warning';
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPanel: FC<NotificationsPanelProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Remix complete',
      message: 'Your "Neon Dreams" remix has been processed and is ready to play!',
      time: '2 minutes ago',
      read: false,
      type: 'success'
    },
    {
      id: '2',
      title: 'New feature available',
      message: 'Try our new Text-to-Audio generator with improved voice synthesis.',
      time: '1 hour ago',
      read: false,
      type: 'info'
    },
    {
      id: '3',
      title: 'Processing started',
      message: 'Your "Bass Overdrive" remix is now being processed.',
      time: '3 hours ago',
      read: true,
      type: 'info'
    },
    {
      id: '4',
      title: 'Weekly summary',
      message: 'You created 5 remixes this week. Keep up the good work!',
      time: '1 day ago',
      read: true,
      type: 'info'
    },
  ]);
  
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
    
    toast({
      title: "Notifications",
      description: "All notifications marked as read",
    });
  };
  
  const clearAll = () => {
    setNotifications([]);
    
    toast({
      title: "Notifications",
      description: "All notifications cleared",
    });
  };
  
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const removeNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-start justify-end transition-transform ${
        isOpen ? 'transform-none' : 'translate-x-full'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />
      
      <div 
        className={`w-full max-w-sm h-screen bg-studio-darkerBlue shadow-xl transform transition-all duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <div className="flex items-center">
            <Bell className="text-studio-neon mr-2" />
            <h2 className="text-xl font-semibold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 bg-studio-neon text-black rounded-full px-2 py-0.5 text-xs font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-2">
          <div className="flex justify-between p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-white"
              disabled={unreadCount === 0}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-white"
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-120px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Bell className="text-gray-500 h-12 w-12 mb-4" />
              <p className="text-gray-400 mb-2">No notifications</p>
              <p className="text-sm text-gray-500">You'll see notifications here when your remixes are complete or when we have updates for you.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 transition-colors hover:bg-gray-800/50 ${
                    notification.read ? 'bg-transparent' : 'bg-studio-neon/5'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      notification.type === 'success' ? 'bg-green-900/20 text-green-500' :
                      notification.type === 'warning' ? 'bg-amber-900/20 text-amber-500' :
                      'bg-blue-900/20 text-blue-500'
                    }`}>
                      {notification.type === 'success' ? (
                        <Check className="h-5 w-5" />
                      ) : notification.type === 'warning' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <Music className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center">
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-studio-neon mr-2"></div>
                          )}
                          <button 
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-500 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{notification.time}</span>
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-studio-neon hover:text-studio-neon/80 hover:bg-studio-neon/10"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPanel;

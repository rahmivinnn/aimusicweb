
import { FC } from 'react';

const NotificationsPage: FC = () => {
  return (
    <div className="py-8 px-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-gray-400">Stay updated with your remix activity</p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-white text-lg mb-4">No notifications yet</p>
        <p className="text-gray-400">Your notifications will appear here</p>
      </div>
    </div>
  );
};

export default NotificationsPage;

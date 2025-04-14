import { FC, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users,
  MessageSquare,
  Share2,
  Lock,
  UserPlus,
  Save,
} from 'lucide-react';

interface CollaboratorInfo {
  id: string;
  name: string;
  role: 'editor' | 'viewer';
  online: boolean;
}

interface CollaborationProps {
  projectId: string;
  onShareProject: (email: string, role: 'editor' | 'viewer') => void;
  onSaveProject: () => void;
}

const Collaboration: FC<CollaborationProps> = ({
  projectId,
  onShareProject,
  onSaveProject,
}) => {
  const [collaborators, setCollaborators] = useState<CollaboratorInfo[]>([]);
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'editor' | 'viewer'>('editor');

  // Simulated WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('wss://your-websocket-server.com');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'collaborator_joined':
          setCollaborators(prev => [...prev, data.collaborator]);
          break;
        case 'collaborator_left':
          setCollaborators(prev => prev.filter(c => c.id !== data.collaboratorId));
          break;
        case 'new_message':
          setMessages(prev => [...prev, data.message]);
          break;
        // Add more cases for other real-time events
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleShare = () => {
    if (shareEmail) {
      onShareProject(shareEmail, shareRole);
      setShareEmail('');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Send message through WebSocket
      setMessages(prev => [...prev, { user: 'You', text: newMessage }]);
      setNewMessage('');
    }
  };

  return (
    <div className="bg-[#0C1015] rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Collaboration</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProject}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Project
        </Button>
      </div>

      {/* Share Project */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Share Project</h4>
        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="flex-1"
          />
          <select
            value={shareRole}
            onChange={(e) => setShareRole(e.target.value as 'editor' | 'viewer')}
            className="bg-[#1A1F26] text-white rounded-md px-3 py-2"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </select>
          <Button onClick={handleShare}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      {/* Active Collaborators */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Active Collaborators</h4>
        <div className="space-y-2">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between bg-[#1A1F26] p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  collaborator.online ? 'bg-green-500' : 'bg-gray-500'
                }`} />
                <span className="text-white">{collaborator.name}</span>
              </div>
              <span className="text-gray-400 text-sm">{collaborator.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Project Chat</h4>
        <div className="bg-[#1A1F26] rounded-lg p-4 h-64 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="flex flex-col">
              <span className="text-gray-400 text-sm">{message.user}</span>
              <p className="text-white">{message.text}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>

      {/* Project Settings */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-white">Project Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Privacy Settings
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Export Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Collaboration; 
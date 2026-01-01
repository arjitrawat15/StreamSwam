import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConnectionStatus } from '@/hooks/usePeerSimulation';
import { Notification } from '@/hooks/useNotifications';
import UserDropdown from '@/components/dropdowns/UserDropdown';
import NotificationsDropdown from '@/components/dropdowns/NotificationsDropdown';
import SearchDropdown from '@/components/dropdowns/SearchDropdown';

interface HeaderProps {
  peerCount: number;
  connectionStatus: ConnectionStatus;
  onSettingsClick: () => void;
  onPeerClick: () => void;
  onProfileClick: () => void;
  onStatsClick: () => void;
  onHistoryClick: () => void;
  notifications: Notification[];
  onNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({
  peerCount,
  connectionStatus,
  onSettingsClick,
  onPeerClick,
  onProfileClick,
  onStatsClick,
  onHistoryClick,
  notifications,
  onNotificationRead,
  onClearNotifications,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profile, setProfile] = useState({ avatarSeed: 'user123' });

  useEffect(() => {
    const saved = localStorage.getItem('streamswarm-profile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-cyber';
      case 'connecting': return 'bg-warning';
      case 'cdn-only': return 'bg-destructive';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return `${peerCount} Peers Connected`;
      case 'connecting': return 'Connecting...';
      case 'cdn-only': return 'CDN Only';
    }
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 h-20 glass border-b border-border/50"
    >
      <div className="h-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">
        <Link to="/">
          <motion.div className="flex items-center gap-3 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="w-10 h-10 rounded-xl gradient-animated flex items-center justify-center">
              <span className="text-xl font-bold text-background">S</span>
            </div>
            <h1 className="text-2xl font-extrabold gradient-text tracking-tight">StreamSwarm</h1>
          </motion.div>
        </Link>

        <SearchDropdown onClose={() => {}} />

        <div className="flex items-center gap-4">
          <motion.button onClick={onPeerClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
            <motion.span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}
              animate={connectionStatus === 'connecting' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }} />
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getStatusText()}</span>
          </motion.button>

          <div className="relative">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />}
            </motion.button>
            <NotificationsDropdown isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)}
              notifications={notifications} onRead={onNotificationRead} onClearAll={onClearNotifications} />
          </div>

          <motion.button onClick={onSettingsClick} whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.4 }} className="p-2.5 rounded-full bg-muted/30 hover:bg-muted/50 transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.button>

          <div className="relative">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-secondary to-accent p-0.5 hover:shadow-glow transition-all duration-300">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`} alt="Avatar"
                className="w-full h-full rounded-full bg-card" />
            </motion.button>
            <UserDropdown isOpen={userDropdownOpen} onClose={() => setUserDropdownOpen(false)}
              onProfileClick={onProfileClick} onStatsClick={onStatsClick} onHistoryClick={onHistoryClick} onSettingsClick={onSettingsClick} />
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

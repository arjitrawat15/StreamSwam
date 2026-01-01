import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  BarChart2, 
  History, 
  Settings, 
  HelpCircle, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import SignOutDialog from '@/components/modals/SignOutDialog';

interface UserDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
  onStatsClick: () => void;
  onHistoryClick: () => void;
  onSettingsClick: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  avatarSeed: string;
}

const UserDropdown: React.FC<UserDropdownProps> = ({
  isOpen,
  onClose,
  onProfileClick,
  onStatsClick,
  onHistoryClick,
  onSettingsClick,
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'User',
    email: 'user@example.com',
    avatarSeed: 'user123',
  });
  const [showSignOut, setShowSignOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('streamswarm-profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const menuItems = [
    { icon: User, label: 'My Profile', onClick: onProfileClick },
    { icon: BarChart2, label: 'My Stats', onClick: onStatsClick },
    { icon: History, label: 'Watch History', onClick: onHistoryClick },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => {} },
  ];

  const handleSignOut = () => {
    setShowSignOut(false);
    onClose();
    // Clear profile data
    localStorage.removeItem('streamswarm-profile');
    window.location.href = '/';
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-72 glass-card overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border border-border/50"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{profile.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    item.onClick();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                           hover:bg-muted/30 transition-colors text-left group"
                >
                  <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-border/30">
              <button
                onClick={() => setShowSignOut(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                         hover:bg-destructive/10 transition-colors text-destructive"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SignOutDialog
        isOpen={showSignOut}
        onClose={() => setShowSignOut(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
};

export default UserDropdown;

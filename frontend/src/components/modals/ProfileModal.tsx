import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserProfile {
  username: string;
  email: string;
  location: string;
  avatarSeed: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'User',
    email: 'user@example.com',
    location: 'New York, USA',
    avatarSeed: 'user123',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('streamswarm-profile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, [isOpen]);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem('streamswarm-profile', JSON.stringify(profile));
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleAvatarChange = () => {
    setProfile((prev) => ({
      ...prev,
      avatarSeed: Math.random().toString(36).substr(2, 9),
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                     w-full max-w-md"
          >
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">User Profile</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-2 border-primary/50"
                  />
                  <button
                    onClick={handleAvatarChange}
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground
                             hover:scale-110 transition-transform"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => setProfile((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50
                             focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50
                             focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50
                             focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50
                           hover:bg-muted/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground
                           font-semibold hover:shadow-glow transition-all duration-300
                           flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;

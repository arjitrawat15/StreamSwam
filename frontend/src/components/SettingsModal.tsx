import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Wifi, Palette, Code, Zap, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  p2pEnabled: boolean;
  onToggleP2p: () => void;
}

type SettingsTab = 'playback' | 'network' | 'appearance' | 'advanced';

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  p2pEnabled,
  onToggleP2p,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('playback');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [maxUpload, setMaxUpload] = useState(50);
  const [maxPeers, setMaxPeers] = useState(8);
  const [animations, setAnimations] = useState(true);

  const tabs = [
    { id: 'playback' as const, label: 'Playback', icon: Monitor },
    { id: 'network' as const, label: 'Network', icon: Wifi },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'advanced' as const, label: 'Advanced', icon: Code },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="glass-card w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Settings</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="flex">
              {/* Tabs */}
              <div className="w-48 border-r border-border/50 p-4">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ x: 4 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
                             transition-colors ${
                               activeTab === tab.id
                                 ? 'bg-primary/10 text-primary'
                                 : 'hover:bg-muted text-muted-foreground'
                             }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[60vh]">
                <AnimatePresence mode="wait">
                  {activeTab === 'playback' && (
                    <motion.div
                      key="playback"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Playback Speed
                        </label>
                        <select
                          value={playbackSpeed}
                          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                          className="w-full p-3 rounded-lg bg-muted border border-border focus:border-primary
                                   focus:outline-none transition-colors"
                        >
                          <option value={0.25}>0.25x</option>
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>Normal</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Auto-play next</p>
                          <p className="text-sm text-muted-foreground">
                            Automatically play the next video
                          </p>
                        </div>
                        <button
                          className="w-12 h-6 rounded-full bg-primary/20 relative"
                        >
                          <motion.div
                            className="w-5 h-5 rounded-full bg-primary absolute top-0.5 left-0.5"
                            animate={{ x: 24 }}
                          />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'network' && (
                    <motion.div
                      key="network"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-cyber" />
                          <div>
                            <p className="font-medium">Enable P2P</p>
                            <p className="text-sm text-muted-foreground">
                              Share bandwidth with other viewers
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={onToggleP2p}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            p2pEnabled ? 'bg-cyber/30' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            className={`w-5 h-5 rounded-full absolute top-0.5 ${
                              p2pEnabled ? 'bg-cyber' : 'bg-muted-foreground'
                            }`}
                            animate={{ x: p2pEnabled ? 24 : 2 }}
                          />
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Max Upload Speed</label>
                          <span className="text-sm text-muted-foreground">
                            {maxUpload === 100 ? 'Unlimited' : `${maxUpload} MB/s`}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={maxUpload}
                          onChange={(e) => setMaxUpload(parseInt(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium">Max Peers</label>
                          <span className="text-sm text-muted-foreground">{maxPeers}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={maxPeers}
                          onChange={(e) => setMaxPeers(parseInt(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'appearance' && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="text-sm font-medium mb-3 block">Theme</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Dark', 'Darker', 'Midnight'].map((theme) => (
                            <button
                              key={theme}
                              className={`p-4 rounded-lg border text-sm font-medium transition-colors ${
                                theme === 'Dark'
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              {theme}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Animations</p>
                          <p className="text-sm text-muted-foreground">
                            Enable smooth animations
                          </p>
                        </div>
                        <button
                          onClick={() => setAnimations(!animations)}
                          className={`w-12 h-6 rounded-full relative transition-colors ${
                            animations ? 'bg-primary/30' : 'bg-muted'
                          }`}
                        >
                          <motion.div
                            className={`w-5 h-5 rounded-full absolute top-0.5 ${
                              animations ? 'bg-primary' : 'bg-muted-foreground'
                            }`}
                            animate={{ x: animations ? 24 : 2 }}
                          />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'advanced' && (
                    <motion.div
                      key="advanced"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Debug Mode</p>
                          <p className="text-sm text-muted-foreground">
                            Show technical information
                          </p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-muted relative">
                          <motion.div
                            className="w-5 h-5 rounded-full bg-muted-foreground absolute top-0.5 left-0.5"
                          />
                        </button>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Log Level</label>
                        <select className="w-full p-3 rounded-lg bg-muted border border-border focus:border-primary
                                         focus:outline-none transition-colors">
                          <option>Error</option>
                          <option>Warn</option>
                          <option>Info</option>
                          <option>Debug</option>
                        </select>
                      </div>

                      <button className="w-full py-3 rounded-lg border border-destructive text-destructive
                                       hover:bg-destructive/10 transition-colors">
                        Reset to Defaults
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface QualityDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  quality: string;
  onQualityChange: (quality: string) => void;
}

const qualities = [
  { value: 'auto', label: 'Auto', badge: 'Recommended' },
  { value: '1080p', label: '1080p HD', badge: null },
  { value: '720p', label: '720p', badge: null },
  { value: '480p', label: '480p', badge: null },
  { value: '360p', label: '360p', badge: null },
];

const QualityDropdown: React.FC<QualityDropdownProps> = ({
  isOpen,
  onClose,
  quality,
  onQualityChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full mb-2 right-0 w-48 glass-card overflow-hidden z-50"
        >
          <div className="p-2">
            {qualities.map((q) => (
              <button
                key={q.value}
                onClick={() => {
                  onQualityChange(q.value);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg
                         transition-colors text-left ${
                           quality === q.value 
                             ? 'bg-primary/10 text-primary' 
                             : 'hover:bg-muted/30'
                         }`}
              >
                <div className="w-5 flex justify-center">
                  {quality === q.value && <Check className="w-4 h-4" />}
                </div>
                <span className="flex-1">{q.label}</span>
                {q.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
                    {q.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QualityDropdown;

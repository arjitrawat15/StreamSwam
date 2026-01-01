import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

interface SignOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SignOutDialog: React.FC<SignOutDialogProps> = ({ isOpen, onClose, onConfirm }) => {
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
                     w-full max-w-sm"
          >
            <div className="glass-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 
                            flex items-center justify-center">
                <LogOut className="w-8 h-8 text-destructive" />
              </div>

              <h2 className="text-xl font-bold mb-2">Sign Out?</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to sign out?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-border/50
                           hover:bg-muted/30 transition-colors"
                >
                  Stay Logged In
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-3 rounded-xl bg-destructive text-destructive-foreground
                           font-semibold hover:bg-destructive/90 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SignOutDialog;

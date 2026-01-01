import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onPlayPause: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onMute: () => void;
  onFullscreen: () => void;
  onToggleChunkGrid: () => void;
  onShowShortcuts: () => void;
  onSeekToPercent: (percent: number) => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlers.onPlayPause();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handlers.onSeekForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlers.onSeekBackward();
          break;
        case 'ArrowUp':
          e.preventDefault();
          handlers.onVolumeUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handlers.onVolumeDown();
          break;
        case 'm':
        case 'M':
          handlers.onMute();
          break;
        case 'f':
        case 'F':
          handlers.onFullscreen();
          break;
        case 'c':
        case 'C':
          handlers.onToggleChunkGrid();
          break;
        case '?':
          handlers.onShowShortcuts();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          handlers.onSeekToPercent(parseInt(e.key) * 10);
          break;
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export const shortcuts = [
  { key: 'Space', action: 'Play / Pause' },
  { key: '→', action: 'Seek forward 10s' },
  { key: '←', action: 'Seek backward 10s' },
  { key: '↑', action: 'Volume up 10%' },
  { key: '↓', action: 'Volume down 10%' },
  { key: 'M', action: 'Mute / Unmute' },
  { key: 'F', action: 'Fullscreen' },
  { key: 'C', action: 'Toggle chunk grid' },
  { key: '0-9', action: 'Seek to 0%-90%' },
  { key: '?', action: 'Show shortcuts' },
];

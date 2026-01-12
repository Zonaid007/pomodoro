import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
    onToggleTimer: () => void;
    onToggleFullscreen: () => void;
    onExitFullscreen: () => void;
    isFullscreen: boolean;
}

/**
 * Hook for global keyboard shortcuts
 * Space → start/pause, F → toggle fullscreen, Esc → exit fullscreen
 */
export function useKeyboardShortcuts({
    onToggleTimer,
    onToggleFullscreen,
    onExitFullscreen,
    isFullscreen,
}: KeyboardShortcuts) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Ignore if user is typing in an input
        if (
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement
        ) {
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                onToggleTimer();
                break;
            case 'KeyF':
                e.preventDefault();
                onToggleFullscreen();
                break;
            case 'Escape':
                if (isFullscreen) {
                    e.preventDefault();
                    onExitFullscreen();
                }
                break;
        }
    }, [onToggleTimer, onToggleFullscreen, onExitFullscreen, isFullscreen]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

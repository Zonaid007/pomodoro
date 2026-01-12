import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { getSettings, saveSettings } from '../utils/storage';

interface UseSettingsReturn {
    settings: Settings;
    updateSettings: (updates: Partial<Settings>) => void;
    resetSettings: () => void;
}

/**
 * Hook for managing user settings with localStorage persistence
 */
export function useSettings(): UseSettingsReturn {
    const [settings, setSettings] = useState<Settings>(() => getSettings());

    // Persist settings whenever they change
    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    const updateSettings = useCallback((updates: Partial<Settings>) => {
        setSettings(prev => ({
            ...prev,
            ...updates,
        }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings({ ...DEFAULT_SETTINGS });
    }, []);

    return {
        settings,
        updateSettings,
        resetSettings,
    };
}

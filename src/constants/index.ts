import type { Settings } from '../types';

// Default settings
export const DEFAULT_SETTINGS: Settings = {
    focusDuration: 25,          // 25 minutes
    shortBreakDuration: 5,      // 5 minutes
    longBreakDuration: 15,      // 15 minutes
    longBreakInterval: 4,       // Long break after 4 focus sessions
    autoAdvance: true,
    soundEnabled: false,        // Default OFF to respect user attention
    focusModeEnabled: false,
};

// Duration constraints (in minutes)
export const DURATION_LIMITS = {
    focus: { min: 15, max: 60 },
    shortBreak: { min: 3, max: 15 },
    longBreak: { min: 10, max: 30 },
    longBreakInterval: { min: 2, max: 6 },
} as const;

// Storage keys
export const STORAGE_KEYS = {
    SCHEMA: 'pomodoro_data',
} as const;

// Current schema version for migrations
export const CURRENT_SCHEMA_VERSION = 1;

// Distraction type labels for display
export const DISTRACTION_LABELS: Record<string, string> = {
    thought: 'Thought',
    phone: 'Phone',
    notification: 'Notification',
    noise: 'Noise',
    urge: 'Urge',
    other: 'Other',
};

// Phase labels for display
export const PHASE_LABELS = {
    focus: 'Focus',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
} as const;

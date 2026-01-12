// Phase types for the timer
export type Phase = 'focus' | 'shortBreak' | 'longBreak';

// Timer state
export type TimerStatus = 'idle' | 'running' | 'paused';

// Distraction types for logging
export type DistractionType = 'thought' | 'phone' | 'notification' | 'noise' | 'urge' | 'other';

// Reflection quality options
export type ReflectionQuality = 'great' | 'okay' | 'struggled';

// User settings interface
export interface Settings {
    focusDuration: number;        // 15-60 minutes
    shortBreakDuration: number;   // 3-15 minutes
    longBreakDuration: number;    // 10-30 minutes
    longBreakInterval: number;    // 2-6 sessions
    autoAdvance: boolean;
    soundEnabled: boolean;
    focusModeEnabled: boolean;
}

// Distraction event during a session
export interface Distraction {
    type: DistractionType;
    note: string;
    tOffsetSec: number;  // Seconds from session start
}

// End-of-session reflection
export interface Reflection {
    quality: ReflectionQuality;
    biggestDistraction: DistractionType | null;
    note: string;
}

// Completed session record
export interface Session {
    id: string;
    date: string;                 // ISO date string (YYYY-MM-DD)
    startTime: number;            // Unix timestamp ms
    endTime: number | null;       // Unix timestamp ms
    phaseDurations: {
        focus: number;
        shortBreak: number;
        longBreak: number;
    };
    intention: string;
    distractions: Distraction[];
    reflection: Reflection | null;
    completed: boolean;
}

// Current session state (for persistence during refresh)
export interface CurrentSession {
    id: string;
    phase: Phase;
    targetDuration: number;       // Target duration in ms
    startTimestamp: number;       // When timer was started (or resumed)
    pausedRemaining: number | null; // Remaining ms when paused
    completedFocusSessions: number;
    intention: string;
    distractions: Distraction[];
}

// Full storage schema
export interface StorageSchema {
    schemaVersion: number;
    settings: Settings;
    sessions: Session[];
    currentSession: CurrentSession | null;
}

// Timer state for the useTimer hook
export interface TimerState {
    phase: Phase;
    status: TimerStatus;
    remainingMs: number;
    targetDurationMs: number;
    completedFocusSessions: number;
}

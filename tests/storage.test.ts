import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    getStorageData,
    saveStorageData,
    saveSettings,
    saveCurrentSession,
    getCurrentSession,
    getSettings
} from '../src/utils/storage';
import { DEFAULT_SETTINGS, CURRENT_SCHEMA_VERSION } from '../src/constants';
import type { CurrentSession } from '../src/types';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('Storage utilities', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    describe('getStorageData', () => {
        it('returns default schema when no data exists', () => {
            const data = getStorageData();
            expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
            expect(data.settings).toEqual(DEFAULT_SETTINGS);
            expect(data.sessions).toEqual([]);
            expect(data.currentSession).toBeNull();
        });

        it('returns stored data when it exists', () => {
            const testData = {
                schemaVersion: CURRENT_SCHEMA_VERSION,
                settings: { ...DEFAULT_SETTINGS, focusDuration: 30 },
                sessions: [],
                currentSession: null,
            };
            localStorageMock.setItem('pomodoro_data', JSON.stringify(testData));

            const data = getStorageData();
            expect(data.settings.focusDuration).toBe(30);
        });

        it('handles corrupted data gracefully', () => {
            localStorageMock.setItem('pomodoro_data', 'not valid json');

            const data = getStorageData();
            expect(data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
            expect(data.settings).toEqual(DEFAULT_SETTINGS);
        });
    });

    describe('saveSettings', () => {
        it('saves settings to storage', () => {
            const newSettings = { ...DEFAULT_SETTINGS, focusDuration: 45 };
            saveSettings(newSettings);

            const data = getStorageData();
            expect(data.settings.focusDuration).toBe(45);
        });

        it('preserves other data when saving settings', () => {
            const session: CurrentSession = {
                id: 'test-123',
                phase: 'focus',
                targetDuration: 1500000,
                startTimestamp: Date.now(),
                pausedRemaining: null,
                completedFocusSessions: 0,
                intention: 'Test intention',
                distractions: [],
            };
            saveCurrentSession(session);

            const newSettings = { ...DEFAULT_SETTINGS, focusDuration: 50 };
            saveSettings(newSettings);

            const data = getStorageData();
            expect(data.settings.focusDuration).toBe(50);
            expect(data.currentSession?.intention).toBe('Test intention');
        });
    });

    describe('saveCurrentSession', () => {
        it('saves current session', () => {
            const session: CurrentSession = {
                id: 'test-456',
                phase: 'focus',
                targetDuration: 1500000,
                startTimestamp: Date.now(),
                pausedRemaining: null,
                completedFocusSessions: 2,
                intention: 'Write code',
                distractions: [],
            };

            saveCurrentSession(session);

            const retrieved = getCurrentSession();
            expect(retrieved?.id).toBe('test-456');
            expect(retrieved?.intention).toBe('Write code');
            expect(retrieved?.completedFocusSessions).toBe(2);
        });

        it('clears current session when null is passed', () => {
            const session: CurrentSession = {
                id: 'test-789',
                phase: 'focus',
                targetDuration: 1500000,
                startTimestamp: Date.now(),
                pausedRemaining: null,
                completedFocusSessions: 0,
                intention: '',
                distractions: [],
            };
            saveCurrentSession(session);

            saveCurrentSession(null);

            const retrieved = getCurrentSession();
            expect(retrieved).toBeNull();
        });
    });

    describe('getSettings', () => {
        it('returns default settings when none are saved', () => {
            const settings = getSettings();
            expect(settings).toEqual(DEFAULT_SETTINGS);
        });

        it('returns saved settings', () => {
            const customSettings = { ...DEFAULT_SETTINGS, soundEnabled: true };
            saveSettings(customSettings);

            const settings = getSettings();
            expect(settings.soundEnabled).toBe(true);
        });
    });
});

describe('Timer state persistence', () => {
    beforeEach(() => {
        localStorageMock.clear();
    });

    it('preserves pause state correctly', () => {
        const pausedSession: CurrentSession = {
            id: 'paused-test',
            phase: 'focus',
            targetDuration: 1500000,
            startTimestamp: Date.now() - 600000, // Started 10 min ago
            pausedRemaining: 900000, // 15 min remaining
            completedFocusSessions: 1,
            intention: 'Paused task',
            distractions: [
                { type: 'phone', note: 'Checked messages', tOffsetSec: 120 }
            ],
        };

        saveCurrentSession(pausedSession);

        const retrieved = getCurrentSession();
        expect(retrieved?.pausedRemaining).toBe(900000);
        expect(retrieved?.distractions.length).toBe(1);
        expect(retrieved?.distractions[0].type).toBe('phone');
    });

    it('handles running state for refresh recovery', () => {
        const runningSession: CurrentSession = {
            id: 'running-test',
            phase: 'focus',
            targetDuration: 1500000,
            startTimestamp: Date.now() - 300000, // Started 5 min ago
            pausedRemaining: null, // Still running
            completedFocusSessions: 0,
            intention: 'Focus task',
            distractions: [],
        };

        saveCurrentSession(runningSession);

        const retrieved = getCurrentSession();
        expect(retrieved?.pausedRemaining).toBeNull();

        // Simulate refresh recovery: calculate remaining time
        const elapsed = Date.now() - retrieved!.startTimestamp;
        const remaining = retrieved!.targetDuration - elapsed;

        // Should have around 20 minutes remaining (25 - 5)
        expect(remaining).toBeLessThan(1500000);
        expect(remaining).toBeGreaterThan(1100000);
    });
});

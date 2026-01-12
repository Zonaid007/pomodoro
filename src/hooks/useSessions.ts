import { useState, useCallback } from 'react';
import type { Session, Distraction, Reflection, Phase } from '../types';
import { saveSession, getSessions } from '../utils/storage';
import { generateId, getTodayDate } from '../utils/time';

interface UseSessionsReturn {
    sessions: Session[];
    createSession: (data: {
        phase: Phase;
        intention: string;
        distractions: Distraction[];
        startTime: number;
        endTime: number;
        phaseDurations: { focus: number; shortBreak: number; longBreak: number };
        completed: boolean;
    }) => string;
    addReflection: (sessionId: string, reflection: Reflection) => void;
    refreshSessions: () => void;
}

/**
 * Hook for managing session history
 */
export function useSessions(): UseSessionsReturn {
    const [sessions, setSessions] = useState<Session[]>(() => getSessions());

    const refreshSessions = useCallback(() => {
        setSessions(getSessions());
    }, []);

    const createSession = useCallback((data: {
        phase: Phase;
        intention: string;
        distractions: Distraction[];
        startTime: number;
        endTime: number;
        phaseDurations: { focus: number; shortBreak: number; longBreak: number };
        completed: boolean;
    }): string => {
        const id = generateId();
        const session: Session = {
            id,
            date: getTodayDate(),
            startTime: data.startTime,
            endTime: data.endTime,
            phaseDurations: data.phaseDurations,
            intention: data.intention,
            distractions: data.distractions,
            reflection: null,
            completed: data.completed,
        };

        saveSession(session);
        setSessions(prev => [...prev, session]);

        return id;
    }, []);

    const addReflection = useCallback((sessionId: string, reflection: Reflection) => {
        setSessions(prev => {
            const updated = prev.map(s =>
                s.id === sessionId ? { ...s, reflection } : s
            );

            // Also update in storage
            const allSessions = getSessions();
            const updatedStorage = allSessions.map(s =>
                s.id === sessionId ? { ...s, reflection } : s
            );

            // Save to localStorage
            const raw = localStorage.getItem('pomodoro_data');
            if (raw) {
                const data = JSON.parse(raw);
                data.sessions = updatedStorage;
                localStorage.setItem('pomodoro_data', JSON.stringify(data));
            }

            return updated;
        });
    }, []);

    return {
        sessions,
        createSession,
        addReflection,
        refreshSessions,
    };
}

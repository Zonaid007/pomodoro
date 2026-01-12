import { useState, useEffect, useCallback, useRef } from 'react';
import type { Phase, TimerState, Settings, CurrentSession, Distraction } from '../types';
import { minutesToMs, generateId } from '../utils/time';
import { saveCurrentSession, getCurrentSession } from '../utils/storage';
import { playChime, resumeAudioContext } from '../utils/audio';

interface UseTimerOptions {
    settings: Settings;
    onPhaseComplete: (phase: Phase, sessionData: {
        intention: string;
        distractions: Distraction[];
        startTime: number;
        completedFocusSessions: number;
    }) => void;
}

interface UseTimerReturn {
    state: TimerState;
    intention: string;
    distractions: Distraction[];
    sessionStartTime: number | null;
    start: (newIntention?: string) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    skip: () => void;
    addMinute: () => void;
    addDistraction: (distraction: Distraction) => void;
    setIntention: (intention: string) => void;
}

/**
 * Core timer hook with real-time accuracy
 * Uses Date.now() comparisons instead of setInterval counting
 * to handle system sleep and tab throttling correctly
 */
export function useTimer({ settings, onPhaseComplete }: UseTimerOptions): UseTimerReturn {
    // Calculate target duration based on phase and settings
    const getDuration = useCallback((phase: Phase): number => {
        switch (phase) {
            case 'focus':
                return minutesToMs(settings.focusDuration);
            case 'shortBreak':
                return minutesToMs(settings.shortBreakDuration);
            case 'longBreak':
                return minutesToMs(settings.longBreakDuration);
        }
    }, [settings]);

    // Initialize state
    const [state, setState] = useState<TimerState>(() => {
        const initialPhase: Phase = 'focus';
        return {
            phase: initialPhase,
            status: 'idle',
            remainingMs: getDuration(initialPhase),
            targetDurationMs: getDuration(initialPhase),
            completedFocusSessions: 0,
        };
    });

    const [intention, setIntention] = useState('');
    const [distractions, setDistractions] = useState<Distraction[]>([]);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    // Refs for interval management and tracking
    const startTimestampRef = useRef<number | null>(null);
    const pausedRemainingRef = useRef<number | null>(null);
    const sessionIdRef = useRef<string>(generateId());

    // Restore session on mount
    useEffect(() => {
        const saved = getCurrentSession();
        if (saved) {
            const now = Date.now();

            if (saved.pausedRemaining !== null) {
                // Session was paused
                setState({
                    phase: saved.phase,
                    status: 'paused',
                    remainingMs: saved.pausedRemaining,
                    targetDurationMs: saved.targetDuration,
                    completedFocusSessions: saved.completedFocusSessions,
                });
                pausedRemainingRef.current = saved.pausedRemaining;
                setIntention(saved.intention);
                setDistractions(saved.distractions);
                sessionIdRef.current = saved.id;
                setSessionStartTime(saved.startTimestamp - (saved.targetDuration - saved.pausedRemaining));
            } else {
                // Session was running - calculate elapsed time
                const elapsed = now - saved.startTimestamp;
                const remaining = Math.max(0, saved.targetDuration - elapsed);

                if (remaining > 0) {
                    setState({
                        phase: saved.phase,
                        status: 'running',
                        remainingMs: remaining,
                        targetDurationMs: saved.targetDuration,
                        completedFocusSessions: saved.completedFocusSessions,
                    });
                    startTimestampRef.current = saved.startTimestamp;
                    setIntention(saved.intention);
                    setDistractions(saved.distractions);
                    sessionIdRef.current = saved.id;
                    setSessionStartTime(saved.startTimestamp);
                } else {
                    // Timer completed while away - clear saved session
                    saveCurrentSession(null);
                }
            }
        }
    }, []); // Only run on mount

    // Timer tick effect
    useEffect(() => {
        if (state.status !== 'running') return;

        const tick = () => {
            const now = Date.now();
            const startTime = startTimestampRef.current;

            if (!startTime) return;

            const elapsed = now - startTime;
            const targetDuration = state.targetDurationMs;
            const remaining = Math.max(0, targetDuration - elapsed);

            if (remaining <= 0) {
                // Phase complete
                if (settings.soundEnabled) {
                    playChime();
                }

                // Notify parent of phase completion
                onPhaseComplete(state.phase, {
                    intention,
                    distractions,
                    startTime: sessionStartTime || startTime,
                    completedFocusSessions: state.completedFocusSessions,
                });

                // Determine next phase
                let nextPhase: Phase;
                let newCompletedSessions = state.completedFocusSessions;

                if (state.phase === 'focus') {
                    newCompletedSessions += 1;
                    if (newCompletedSessions % settings.longBreakInterval === 0) {
                        nextPhase = 'longBreak';
                    } else {
                        nextPhase = 'shortBreak';
                    }
                } else {
                    nextPhase = 'focus';
                }

                const nextDuration = getDuration(nextPhase);

                // Clear current session
                saveCurrentSession(null);
                setDistractions([]);
                sessionIdRef.current = generateId();

                if (settings.autoAdvance) {
                    // Auto-advance to next phase
                    const newStartTime = Date.now();
                    startTimestampRef.current = newStartTime;
                    setSessionStartTime(newStartTime);

                    setState({
                        phase: nextPhase,
                        status: 'running',
                        remainingMs: nextDuration,
                        targetDurationMs: nextDuration,
                        completedFocusSessions: newCompletedSessions,
                    });

                    // Save new session state
                    saveCurrentSession({
                        id: sessionIdRef.current,
                        phase: nextPhase,
                        targetDuration: nextDuration,
                        startTimestamp: newStartTime,
                        pausedRemaining: null,
                        completedFocusSessions: newCompletedSessions,
                        intention: nextPhase === 'focus' ? '' : intention,
                        distractions: [],
                    });

                    if (nextPhase !== 'focus') {
                        setIntention('');
                    }
                } else {
                    // Stop and wait for user
                    startTimestampRef.current = null;
                    setSessionStartTime(null);

                    setState({
                        phase: nextPhase,
                        status: 'idle',
                        remainingMs: nextDuration,
                        targetDurationMs: nextDuration,
                        completedFocusSessions: newCompletedSessions,
                    });
                }
            } else {
                setState(prev => ({
                    ...prev,
                    remainingMs: remaining,
                }));
            }
        };

        // Update every 100ms for smooth display
        const intervalId = setInterval(tick, 100);
        tick(); // Initial tick

        return () => clearInterval(intervalId);
    }, [state.status, state.phase, state.targetDurationMs, state.completedFocusSessions,
        settings, intention, distractions, sessionStartTime, onPhaseComplete, getDuration]);

    // Save current session state when running/paused
    useEffect(() => {
        if (state.status === 'idle') return;

        const currentSession: CurrentSession = {
            id: sessionIdRef.current,
            phase: state.phase,
            targetDuration: state.targetDurationMs,
            startTimestamp: startTimestampRef.current || Date.now(),
            pausedRemaining: state.status === 'paused' ? pausedRemainingRef.current : null,
            completedFocusSessions: state.completedFocusSessions,
            intention,
            distractions,
        };

        saveCurrentSession(currentSession);
    }, [state.status, state.phase, state.targetDurationMs, state.completedFocusSessions, intention, distractions]);

    const start = useCallback((newIntention?: string) => {
        resumeAudioContext();

        const now = Date.now();
        startTimestampRef.current = now;
        pausedRemainingRef.current = null;
        sessionIdRef.current = generateId();

        setSessionStartTime(now);
        setDistractions([]);

        if (newIntention !== undefined) {
            setIntention(newIntention);
        }

        setState(prev => ({
            ...prev,
            status: 'running',
            remainingMs: prev.targetDurationMs,
        }));
    }, []);

    const pause = useCallback(() => {
        if (state.status !== 'running') return;

        pausedRemainingRef.current = state.remainingMs;
        startTimestampRef.current = null;

        setState(prev => ({
            ...prev,
            status: 'paused',
        }));
    }, [state.status, state.remainingMs]);

    const resume = useCallback(() => {
        if (state.status !== 'paused') return;

        resumeAudioContext();

        // Set start timestamp so that remaining time counts down
        const pausedRemaining = pausedRemainingRef.current || state.remainingMs;
        startTimestampRef.current = Date.now() - (state.targetDurationMs - pausedRemaining);
        pausedRemainingRef.current = null;

        setState(prev => ({
            ...prev,
            status: 'running',
        }));
    }, [state.status, state.remainingMs, state.targetDurationMs]);

    const reset = useCallback(() => {
        const duration = getDuration(state.phase);

        startTimestampRef.current = null;
        pausedRemainingRef.current = null;
        setSessionStartTime(null);
        setDistractions([]);
        sessionIdRef.current = generateId();

        saveCurrentSession(null);

        setState(prev => ({
            ...prev,
            status: 'idle',
            remainingMs: duration,
            targetDurationMs: duration,
        }));
    }, [state.phase, getDuration]);

    const skip = useCallback(() => {
        // Complete current phase early
        if (settings.soundEnabled) {
            playChime();
        }

        let nextPhase: Phase;
        let newCompletedSessions = state.completedFocusSessions;

        if (state.phase === 'focus' && state.status === 'running') {
            // If focus was running, count it as completed
            newCompletedSessions += 1;

            // Notify parent
            onPhaseComplete(state.phase, {
                intention,
                distractions,
                startTime: sessionStartTime || Date.now(),
                completedFocusSessions: state.completedFocusSessions,
            });
        }

        if (state.phase === 'focus') {
            if (newCompletedSessions % settings.longBreakInterval === 0) {
                nextPhase = 'longBreak';
            } else {
                nextPhase = 'shortBreak';
            }
        } else {
            nextPhase = 'focus';
        }

        const nextDuration = getDuration(nextPhase);

        startTimestampRef.current = null;
        pausedRemainingRef.current = null;
        setSessionStartTime(null);
        setDistractions([]);
        sessionIdRef.current = generateId();

        saveCurrentSession(null);

        if (nextPhase !== 'focus') {
            setIntention('');
        }

        setState({
            phase: nextPhase,
            status: 'idle',
            remainingMs: nextDuration,
            targetDurationMs: nextDuration,
            completedFocusSessions: newCompletedSessions,
        });
    }, [state.phase, state.status, state.completedFocusSessions, settings,
        intention, distractions, sessionStartTime, onPhaseComplete, getDuration]);

    const addMinute = useCallback(() => {
        const additionalMs = 60 * 1000;

        setState(prev => ({
            ...prev,
            remainingMs: prev.remainingMs + additionalMs,
            targetDurationMs: prev.targetDurationMs + additionalMs,
        }));

        // Adjust start timestamp if running
        if (startTimestampRef.current) {
            // Move start back to account for extra minute
            startTimestampRef.current -= additionalMs;
        }

        // Adjust paused remaining if paused
        if (pausedRemainingRef.current !== null) {
            pausedRemainingRef.current += additionalMs;
        }
    }, []);

    const addDistraction = useCallback((distraction: Distraction) => {
        setDistractions(prev => [...prev, distraction]);
    }, []);

    return {
        state,
        intention,
        distractions,
        sessionStartTime,
        start,
        pause,
        resume,
        reset,
        skip,
        addMinute,
        addDistraction,
        setIntention,
    };
}

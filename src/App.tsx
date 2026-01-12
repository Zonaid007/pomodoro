import { useState, useCallback } from 'react';
import type { Phase, Distraction, Reflection, DistractionType } from './types';
import { useTimer } from './hooks/useTimer';
import { useSettings } from './hooks/useSettings';
import { useSessions } from './hooks/useSessions';
import { Timer } from './components/Timer';
import { IntentionInput } from './components/Intention';
import { DistractionModal } from './components/Distraction';
import { ReflectionModal } from './components/Reflection';
import { SettingsPanel } from './components/Settings';
import { StatsView } from './components/Stats';
import './App.css';

type View = 'timer' | 'intention';

function App() {
    // Core state
    const { settings, updateSettings } = useSettings();
    const { sessions, createSession, addReflection, refreshSessions } = useSessions();

    // UI state
    const [view, setView] = useState<View>('timer');
    const [showSettings, setShowSettings] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [showDistraction, setShowDistraction] = useState(false);
    const [showReflection, setShowReflection] = useState(false);
    const [pendingReflectionSessionId, setPendingReflectionSessionId] = useState<string | null>(null);
    const [pendingReflectionDistractions, setPendingReflectionDistractions] = useState<DistractionType[]>([]);

    // Handle phase completion
    const handlePhaseComplete = useCallback((phase: Phase, data: {
        intention: string;
        distractions: Distraction[];
        startTime: number;
        completedFocusSessions: number;
    }) => {
        if (phase === 'focus') {
            // Save the focus session
            const sessionId = createSession({
                phase,
                intention: data.intention,
                distractions: data.distractions,
                startTime: data.startTime,
                endTime: Date.now(),
                phaseDurations: {
                    focus: settings.focusDuration,
                    shortBreak: settings.shortBreakDuration,
                    longBreak: settings.longBreakDuration,
                },
                completed: true,
            });

            // Show reflection modal
            setPendingReflectionSessionId(sessionId);
            setPendingReflectionDistractions(data.distractions.map(d => d.type));
            setShowReflection(true);
        }
    }, [createSession, settings]);

    // Timer hook
    const timer = useTimer({
        settings,
        onPhaseComplete: handlePhaseComplete,
    });

    // Handle starting a focus session with intention
    const handleStartWithIntention = useCallback((intention: string) => {
        timer.setIntention(intention);
        timer.start(intention);
        setView('timer');
    }, [timer]);

    // Handle starting without intention
    const handleSkipIntention = useCallback(() => {
        timer.start('');
        setView('timer');
    }, [timer]);

    // Handle start button click
    const handleStart = useCallback(() => {
        if (timer.state.phase === 'focus' && timer.state.status === 'idle') {
            // Show intention input before starting focus
            setView('intention');
        } else {
            // Start break immediately
            timer.start();
        }
    }, [timer]);

    // Handle logging a distraction
    const handleLogDistraction = useCallback((distraction: Distraction) => {
        timer.addDistraction(distraction);
    }, [timer]);

    // Handle reflection submit
    const handleReflectionSubmit = useCallback((reflection: Reflection) => {
        if (pendingReflectionSessionId) {
            addReflection(pendingReflectionSessionId, reflection);
        }
        setShowReflection(false);
        setPendingReflectionSessionId(null);
        setPendingReflectionDistractions([]);
    }, [pendingReflectionSessionId, addReflection]);

    // Handle reflection skip
    const handleReflectionSkip = useCallback(() => {
        setShowReflection(false);
        setPendingReflectionSessionId(null);
        setPendingReflectionDistractions([]);
    }, []);

    // Calculate elapsed time for distraction logging
    const sessionElapsedMs = timer.sessionStartTime
        ? Date.now() - timer.sessionStartTime
        : 0;

    // Determine if focus mode UI should be applied
    const isFocusModeActive = settings.focusModeEnabled &&
        timer.state.phase === 'focus' &&
        timer.state.status === 'running';

    return (
        <div className={`app ${isFocusModeActive ? 'focus-mode' : ''}`}>
            {/* Header */}
            <header className="app-header">
                <div className="app-logo">
                    <svg className="app-logo-icon" viewBox="0 0 100 100" aria-hidden="true">
                        <circle cx="50" cy="50" r="45" fill="#1E293B" stroke="#F59E0B" strokeWidth="4" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="110 110" strokeDashoffset="27.5" transform="rotate(-90 50 50)" />
                        <circle cx="50" cy="20" r="4" fill="#F59E0B" />
                    </svg>
                    <h1 className="app-title">Focus Trainer</h1>
                </div>

                <nav className="app-nav" aria-label="Main navigation">
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => { refreshSessions(); setShowStats(true); }}
                        aria-label="View statistics"
                        title="Stats"
                    >
                        <StatsIcon />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setShowSettings(true)}
                        aria-label="Open settings"
                        title="Settings"
                    >
                        <SettingsIcon />
                    </button>
                </nav>
            </header>

            {/* Main content */}
            <main className="app-main">
                {view === 'intention' ? (
                    <IntentionInput
                        onStart={handleStartWithIntention}
                        onSkip={handleSkipIntention}
                    />
                ) : (
                    <Timer
                        state={timer.state}
                        settings={settings}
                        intention={timer.intention}
                        onStart={handleStart}
                        onPause={timer.pause}
                        onResume={timer.resume}
                        onReset={timer.reset}
                        onSkip={timer.skip}
                        onAddMinute={timer.addMinute}
                        onLogDistraction={() => setShowDistraction(true)}
                    />
                )}
            </main>

            {/* Distraction Modal */}
            <DistractionModal
                isOpen={showDistraction}
                onClose={() => setShowDistraction(false)}
                onLog={handleLogDistraction}
                sessionElapsedMs={sessionElapsedMs}
            />

            {/* Reflection Modal */}
            <ReflectionModal
                isOpen={showReflection}
                onSubmit={handleReflectionSubmit}
                onSkip={handleReflectionSkip}
                distractionsLogged={pendingReflectionDistractions}
            />

            {/* Settings Panel */}
            {showSettings && (
                <>
                    <div
                        className="panel-overlay"
                        onClick={() => setShowSettings(false)}
                        aria-hidden="true"
                    />
                    <SettingsPanel
                        settings={settings}
                        onUpdate={updateSettings}
                        onClose={() => setShowSettings(false)}
                    />
                </>
            )}

            {/* Stats View */}
            {showStats && (
                <>
                    <div
                        className="panel-overlay"
                        onClick={() => setShowStats(false)}
                        aria-hidden="true"
                    />
                    <StatsView
                        sessions={sessions}
                        onClose={() => setShowStats(false)}
                    />
                </>
            )}
        </div>
    );
}

// Icons
function StatsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
    );
}

function SettingsIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    );
}

export default App;

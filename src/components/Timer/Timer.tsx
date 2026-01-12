import type { TimerState, Settings } from '../../types';
import { formatTime } from '../../utils/time';
import { PhaseIndicator } from './PhaseIndicator';
import { TimerControls } from './TimerControls';
import './Timer.css';

interface TimerProps {
    state: TimerState;
    settings: Settings;
    intention: string;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onSkip: () => void;
    onAddMinute: () => void;
    onLogDistraction: () => void;
}

/**
 * Main timer component with circular progress ring
 */
export function Timer({
    state,
    settings,
    intention,
    onStart,
    onPause,
    onResume,
    onReset,
    onSkip,
    onAddMinute,
    onLogDistraction,
}: TimerProps) {
    const { phase, status, remainingMs, targetDurationMs, completedFocusSessions } = state;

    // Calculate progress for the ring (0 to 1)
    const progress = 1 - (remainingMs / targetDurationMs);

    // SVG circle parameters
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    // Status text
    const statusText = status === 'running'
        ? (phase === 'focus' ? 'Focusing' : 'Resting')
        : status === 'paused'
            ? 'Paused'
            : 'Ready';

    return (
        <div className="timer-container">
            <PhaseIndicator
                phase={phase}
                completedSessions={completedFocusSessions}
                longBreakInterval={settings.longBreakInterval}
            />

            <div className="timer-display" role="timer" aria-live="polite" aria-atomic="true">
                {/* Progress ring */}
                <div className="timer-ring">
                    <svg className="timer-ring-svg" viewBox="0 0 260 260">
                        {/* Background circle */}
                        <circle
                            className="timer-ring-bg"
                            cx="130"
                            cy="130"
                            r={radius}
                        />
                        {/* Progress circle */}
                        <circle
                            className={`timer-ring-progress ${phase}`}
                            cx="130"
                            cy="130"
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                </div>

                {/* Timer text */}
                <div className="timer-inner">
                    <span className="timer-time" aria-label={`${Math.ceil(remainingMs / 1000)} seconds remaining`}>
                        {formatTime(remainingMs)}
                    </span>
                    <span className="timer-status">{statusText}</span>
                </div>
            </div>

            {/* Show intention during focus */}
            {phase === 'focus' && intention && status !== 'idle' && (
                <div className="intention-display">
                    <span className="intention-label">Focusing on</span>
                    <p className="intention-text">"{intention}"</p>
                </div>
            )}

            <TimerControls
                status={status}
                onStart={onStart}
                onPause={onPause}
                onResume={onResume}
                onReset={onReset}
                onSkip={onSkip}
                onAddMinute={onAddMinute}
                isFocusPhase={phase === 'focus'}
            />

            {/* Distraction logger button - only during running focus */}
            {phase === 'focus' && status === 'running' && (
                <button
                    className="distraction-trigger btn"
                    onClick={onLogDistraction}
                    aria-label="Log a distraction"
                >
                    Log distraction
                </button>
            )}
        </div>
    );
}

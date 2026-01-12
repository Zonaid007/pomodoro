import type { TimerStatus } from '../../types';

interface TimerControlsProps {
    status: TimerStatus;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onReset: () => void;
    onSkip: () => void;
    onAddMinute: () => void;
    isFocusPhase: boolean;
}

/**
 * Timer control buttons: Start/Pause, Reset, Skip, +1 minute
 */
export function TimerControls({
    status,
    onStart,
    onPause,
    onResume,
    onReset,
    onSkip,
    onAddMinute,
    isFocusPhase,
}: TimerControlsProps) {
    const buttonClass = isFocusPhase ? 'btn btn-lg btn-focus' : 'btn btn-lg btn-break';

    return (
        <div className="timer-controls">
            {/* Primary action button */}
            <div className="primary-control">
                {status === 'idle' && (
                    <button
                        className={buttonClass}
                        onClick={onStart}
                        aria-label="Start timer"
                    >
                        <PlayIcon />
                        Start
                    </button>
                )}

                {status === 'running' && (
                    <button
                        className={buttonClass}
                        onClick={onPause}
                        aria-label="Pause timer"
                    >
                        <PauseIcon />
                        Pause
                    </button>
                )}

                {status === 'paused' && (
                    <button
                        className={buttonClass}
                        onClick={onResume}
                        aria-label="Resume timer"
                    >
                        <PlayIcon />
                        Resume
                    </button>
                )}
            </div>

            {/* Secondary controls */}
            <div className="secondary-controls">
                {status !== 'idle' && (
                    <button
                        className="btn btn-icon btn-ghost"
                        onClick={onReset}
                        aria-label="Reset timer"
                        title="Reset"
                    >
                        <ResetIcon />
                    </button>
                )}

                <button
                    className="btn btn-icon btn-ghost"
                    onClick={onSkip}
                    aria-label="Skip to next phase"
                    title="Skip"
                >
                    <SkipIcon />
                </button>

                {status !== 'idle' && (
                    <button
                        className="btn btn-ghost"
                        onClick={onAddMinute}
                        aria-label="Add one minute"
                        title="Add 1 minute"
                    >
                        +1m
                    </button>
                )}
            </div>
        </div>
    );
}

// Simple SVG icons
function PlayIcon() {
    return (
        <svg className="control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function PauseIcon() {
    return (
        <svg className="control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
    );
}

function ResetIcon() {
    return (
        <svg className="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
        </svg>
    );
}

function SkipIcon() {
    return (
        <svg className="control-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 5v14l11-7zM19 5v14h-2V5z" />
        </svg>
    );
}

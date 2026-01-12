import type { Phase } from '../../types';
import { PHASE_LABELS } from '../../constants';

interface PhaseIndicatorProps {
    phase: Phase;
    completedSessions: number;
    longBreakInterval: number;
}

/**
 * Shows current phase label and progress dots for focus sessions
 */
export function PhaseIndicator({
    phase,
    completedSessions,
    longBreakInterval
}: PhaseIndicatorProps) {
    // Generate dots for the current cycle
    const sessionInCycle = completedSessions % longBreakInterval;
    const dots = Array.from({ length: longBreakInterval }, (_, i) => {
        const isCompleted = i < sessionInCycle;
        const isCurrent = i === sessionInCycle && phase === 'focus';

        return (
            <span
                key={i}
                className={`phase-dot ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                aria-hidden="true"
            />
        );
    });

    return (
        <div className="phase-indicator">
            <div className="phase-dots" role="img" aria-label={`${sessionInCycle} of ${longBreakInterval} focus sessions completed`}>
                {dots}
            </div>
            <span className={`phase-label ${phase}`}>
                {PHASE_LABELS[phase]}
            </span>
        </div>
    );
}

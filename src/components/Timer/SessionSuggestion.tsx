import './SessionSuggestion.css';

interface SessionSuggestionProps {
    suggestedDuration: number;
    currentDuration: number;
    reason: string;
    onAccept: () => void;
    onDismiss: () => void;
}

/**
 * A gentle suggestion card for adjusting session length
 * Always asks permission, never auto-changes
 */
export function SessionSuggestion({
    suggestedDuration,
    currentDuration,
    reason,
    onAccept,
    onDismiss,
}: SessionSuggestionProps) {
    const isLonger = suggestedDuration > currentDuration;

    return (
        <div className="suggestion-card fade-in">
            <div className="suggestion-content">
                <span className="suggestion-icon">{isLonger ? '⬆️' : '⬇️'}</span>
                <div className="suggestion-text">
                    <p className="suggestion-reason">{reason}</p>
                    <p className="suggestion-action">
                        Want to try a <strong>{suggestedDuration}-minute</strong> session?
                    </p>
                </div>
            </div>
            <div className="suggestion-buttons">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={onDismiss}
                >
                    Not now
                </button>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={onAccept}
                >
                    Yes, let's try
                </button>
            </div>
        </div>
    );
}

import { useState, type FormEvent } from 'react';
import './IntentionInput.css';

interface IntentionInputProps {
    onStart: (intention: string) => void;
    onSkip: () => void;
}

/**
 * Pre-session intention capture screen
 * Encourages user to set a focus intention before starting
 */
export function IntentionInput({ onStart, onSkip }: IntentionInputProps) {
    const [intention, setIntention] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onStart(intention.trim());
    };

    const handleSkip = () => {
        onSkip();
    };

    return (
        <div className="intention-input-container">
            <div className="intention-prompt">
                <h2>What will you focus on?</h2>
                <p>Set a clear intention for this session.</p>
            </div>

            <form className="intention-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="input input-lg intention-input"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="e.g., Write intro paragraph"
                    maxLength={100}
                    autoFocus
                    aria-label="Focus intention"
                />

                <p className="intention-hint">
                    A specific task helps you stay focused.
                </p>

                <div className="intention-actions">
                    <button
                        type="submit"
                        className="btn btn-lg btn-focus intention-start-btn"
                    >
                        Start Focus Session
                    </button>

                    <button
                        type="button"
                        className="intention-skip"
                        onClick={handleSkip}
                    >
                        Skip for now
                    </button>
                </div>
            </form>
        </div>
    );
}

import { useState } from 'react';
import type { DistractionType, Reflection, ReflectionQuality } from '../../types';
import { Modal } from '../common/Modal';
import { DISTRACTION_LABELS } from '../../constants';
import './ReflectionModal.css';

interface ReflectionModalProps {
    isOpen: boolean;
    onSubmit: (reflection: Reflection) => void;
    onSkip: () => void;
    distractionsLogged: DistractionType[];
}

const QUALITY_OPTIONS: { value: ReflectionQuality; label: string; emoji: string }[] = [
    { value: 'great', label: 'Great', emoji: '🎯' },
    { value: 'okay', label: 'Okay', emoji: '👍' },
    { value: 'struggled', label: 'Struggled', emoji: '🌊' },
];

const DISTRACTION_TYPES: DistractionType[] = [
    'thought', 'phone', 'notification', 'noise', 'urge', 'other'
];

/**
 * End-of-session reflection modal
 * Quick check-in to build self-awareness about focus quality
 */
export function ReflectionModal({
    isOpen,
    onSubmit,
    onSkip,
    distractionsLogged
}: ReflectionModalProps) {
    const [quality, setQuality] = useState<ReflectionQuality | null>(null);
    const [biggestDistraction, setBiggestDistraction] = useState<DistractionType | null>(null);
    const [note, setNote] = useState('');

    const handleSubmit = () => {
        if (!quality) return;

        onSubmit({
            quality,
            biggestDistraction,
            note: note.trim(),
        });

        // Reset state
        setQuality(null);
        setBiggestDistraction(null);
        setNote('');
    };

    const handleSkip = () => {
        setQuality(null);
        setBiggestDistraction(null);
        setNote('');
        onSkip();
    };

    // Get unique distraction types from logged distractions
    const loggedTypes = [...new Set(distractionsLogged)];

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleSkip}
            title="Session Complete"
            footer={
                <>
                    <button
                        className="btn btn-ghost"
                        onClick={handleSkip}
                    >
                        Skip
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!quality}
                    >
                        Save Reflection
                    </button>
                </>
            }
        >
            <div className="reflection-content">
                <p className="reflection-message">
                    Nice work! Take a moment to reflect.
                </p>

                {/* Quality rating */}
                <div className="reflection-section">
                    <label className="reflection-label">How was your focus?</label>
                    <div className="quality-options">
                        {QUALITY_OPTIONS.map(option => (
                            <button
                                key={option.value}
                                className={`quality-btn ${quality === option.value ? 'selected' : ''}`}
                                onClick={() => setQuality(option.value)}
                                aria-pressed={quality === option.value}
                            >
                                <span className="quality-emoji">{option.emoji}</span>
                                <span className="quality-label">{option.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Biggest distraction */}
                <div className="reflection-section">
                    <label className="reflection-label">Biggest distraction?</label>
                    <div className="distraction-options">
                        <button
                            className={`distraction-opt-btn ${biggestDistraction === null ? 'selected' : ''}`}
                            onClick={() => setBiggestDistraction(null)}
                            aria-pressed={biggestDistraction === null}
                        >
                            None
                        </button>
                        {DISTRACTION_TYPES.map(type => (
                            <button
                                key={type}
                                className={`distraction-opt-btn ${biggestDistraction === type ? 'selected' : ''} ${loggedTypes.includes(type) ? 'logged' : ''}`}
                                onClick={() => setBiggestDistraction(type)}
                                aria-pressed={biggestDistraction === type}
                            >
                                {DISTRACTION_LABELS[type]}
                                {loggedTypes.includes(type) && <span className="logged-indicator">•</span>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Improvement note */}
                <div className="reflection-section">
                    <label htmlFor="improvement-note" className="reflection-label">
                        What will you try next time? (optional)
                    </label>
                    <input
                        id="improvement-note"
                        type="text"
                        className="input"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="One small adjustment..."
                        maxLength={120}
                    />
                </div>
            </div>
        </Modal>
    );
}

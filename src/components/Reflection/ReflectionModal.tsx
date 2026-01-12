import { useState } from 'react';
import type { DistractionType, Reflection, ReflectionQuality } from '../../types';
import { Modal } from '../common/Modal';
import './ReflectionModal.css';

interface ReflectionModalProps {
    isOpen: boolean;
    onSubmit: (reflection: Reflection) => void;
    onSkip: () => void;
}

const DISTRACTION_OPTIONS: { value: DistractionType; label: string }[] = [
    { value: 'notification', label: 'Notifications' },
    { value: 'thought', label: 'Thoughts' },
    { value: 'noise', label: 'Environment' }, // Mapping 'noise' to Environment for now, or add new type
    { value: 'other', label: 'Other' },
];

// We might need to map existing types to these new labels if they differ
// For now, let's keep the underlying types but change labels

/**
 * End-of-session reflection modal
 * 1-5 star rating + optional distraction details
 */
export function ReflectionModal({
    isOpen,
    onSubmit,
    onSkip
}: ReflectionModalProps) {
    const [quality, setQuality] = useState<ReflectionQuality | null>(null);
    const [biggestDistraction, setBiggestDistraction] = useState<DistractionType | null>(null);
    const [note, setNote] = useState('');
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
        setIsDetailsOpen(false);
    };

    const handleSkip = () => {
        setQuality(null);
        setBiggestDistraction(null);
        setNote('');
        setIsDetailsOpen(false);
        onSkip();
    };

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
                        Save
                    </button>
                </>
            }
        >
            <div className="reflection-content">
                {/* 1. Mandatory Question */}
                <div className="reflection-section centered">
                    <h3 className="reflection-question">How focused were you?</h3>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className={`star-btn ${quality && quality >= star ? 'active' : ''}`}
                                onClick={() => setQuality(star)}
                                aria-label={`Rate ${star} stars`}
                            >
                                {quality && quality >= star ? '★' : '☆'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Optional Collapsed Section */}
                <div className="reflection-section">
                    <button
                        className="details-toggle"
                        onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                        aria-expanded={isDetailsOpen}
                    >
                        {isDetailsOpen ? 'Hide Details' : 'Add Details (Optional)'}
                        <span className="toggle-icon">{isDetailsOpen ? '−' : '+'}</span>
                    </button>

                    {isDetailsOpen && (
                        <div className="reflection-details fade-in">
                            <label className="reflection-label">What distracted you?</label>
                            <div className="distraction-options">
                                {DISTRACTION_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        className={`distraction-opt-btn ${biggestDistraction === option.value ? 'selected' : ''}`}
                                        onClick={() => setBiggestDistraction(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            <label className="reflection-label" style={{ marginTop: '1rem' }}>
                                Notes
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Any thoughts..."
                                maxLength={120}
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}

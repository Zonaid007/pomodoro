import { useState } from 'react';
import type { DistractionType, Distraction } from '../../types';
import { Modal } from '../common/Modal';
import { DISTRACTION_LABELS } from '../../constants';
import './DistractionModal.css';

interface DistractionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLog: (distraction: Distraction) => void;
    sessionElapsedMs: number;
}

const DISTRACTION_TYPES: DistractionType[] = [
    'thought',
    'phone',
    'notification',
    'noise',
    'urge',
    'other',
];

/**
 * Lightweight modal for logging distractions during focus
 */
export function DistractionModal({
    isOpen,
    onClose,
    onLog,
    sessionElapsedMs
}: DistractionModalProps) {
    const [selectedType, setSelectedType] = useState<DistractionType | null>(null);
    const [note, setNote] = useState('');

    const handleLog = () => {
        if (!selectedType) return;

        onLog({
            type: selectedType,
            note: note.trim(),
            tOffsetSec: Math.floor(sessionElapsedMs / 1000),
        });

        // Reset and close
        setSelectedType(null);
        setNote('');
        onClose();
    };

    const handleClose = () => {
        setSelectedType(null);
        setNote('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Log Distraction"
            footer={
                <>
                    <button
                        className="btn btn-secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleLog}
                        disabled={!selectedType}
                    >
                        Log & Return
                    </button>
                </>
            }
        >
            <div className="distraction-content">
                <p className="distraction-message">
                    It's okay. Noticing is the first step. What pulled your attention?
                </p>

                <div className="distraction-types">
                    {DISTRACTION_TYPES.map(type => (
                        <button
                            key={type}
                            className={`distraction-type-btn ${selectedType === type ? 'selected' : ''}`}
                            onClick={() => setSelectedType(type)}
                            aria-pressed={selectedType === type}
                        >
                            <span className="distraction-type-icon">{getIcon(type)}</span>
                            <span className="distraction-type-label">{DISTRACTION_LABELS[type]}</span>
                        </button>
                    ))}
                </div>

                <div className="distraction-note">
                    <label htmlFor="distraction-note" className="distraction-note-label">
                        Brief note (optional)
                    </label>
                    <input
                        id="distraction-note"
                        type="text"
                        className="input"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What happened?"
                        maxLength={120}
                    />
                </div>

                <p className="distraction-hint">
                    Return to the task. You're doing great.
                </p>
            </div>
        </Modal>
    );
}

function getIcon(type: DistractionType): string {
    switch (type) {
        case 'thought': return '💭';
        case 'phone': return '📱';
        case 'notification': return '🔔';
        case 'noise': return '🔊';
        case 'urge': return '⚡';
        case 'other': return '•••';
    }
}

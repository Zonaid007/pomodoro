import type { Settings } from '../../types';
import { DURATION_LIMITS } from '../../constants';
import './SettingsPanel.css';

interface SettingsPanelProps {
    settings: Settings;
    onUpdate: (updates: Partial<Settings>) => void;
    onClose: () => void;
}

/**
 * Settings panel for customizing timer durations and preferences
 */
export function SettingsPanel({ settings, onUpdate, onClose }: SettingsPanelProps) {
    return (
        <div className="settings-panel" role="dialog" aria-label="Settings">
            <div className="settings-header">
                <h2 className="settings-title">Settings</h2>
                <button
                    className="btn btn-icon btn-ghost settings-close"
                    onClick={onClose}
                    aria-label="Close settings"
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="settings-content">
                {/* Duration settings */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Timer Durations</h3>

                    <div className="setting-item">
                        <label htmlFor="focus-duration" className="setting-label">
                            Focus: {settings.focusDuration} min
                        </label>
                        <input
                            id="focus-duration"
                            type="range"
                            className="range-input"
                            min={DURATION_LIMITS.focus.min}
                            max={DURATION_LIMITS.focus.max}
                            value={settings.focusDuration}
                            onChange={(e) => onUpdate({ focusDuration: Number(e.target.value) })}
                        />
                    </div>

                    <div className="setting-item">
                        <label htmlFor="short-break" className="setting-label">
                            Short Break: {settings.shortBreakDuration} min
                        </label>
                        <input
                            id="short-break"
                            type="range"
                            className="range-input"
                            min={DURATION_LIMITS.shortBreak.min}
                            max={DURATION_LIMITS.shortBreak.max}
                            value={settings.shortBreakDuration}
                            onChange={(e) => onUpdate({ shortBreakDuration: Number(e.target.value) })}
                        />
                    </div>

                    <div className="setting-item">
                        <label htmlFor="long-break" className="setting-label">
                            Long Break: {settings.longBreakDuration} min
                        </label>
                        <input
                            id="long-break"
                            type="range"
                            className="range-input"
                            min={DURATION_LIMITS.longBreak.min}
                            max={DURATION_LIMITS.longBreak.max}
                            value={settings.longBreakDuration}
                            onChange={(e) => onUpdate({ longBreakDuration: Number(e.target.value) })}
                        />
                    </div>

                    <div className="setting-item">
                        <label htmlFor="long-break-interval" className="setting-label">
                            Long Break After: {settings.longBreakInterval} sessions
                        </label>
                        <input
                            id="long-break-interval"
                            type="range"
                            className="range-input"
                            min={DURATION_LIMITS.longBreakInterval.min}
                            max={DURATION_LIMITS.longBreakInterval.max}
                            value={settings.longBreakInterval}
                            onChange={(e) => onUpdate({ longBreakInterval: Number(e.target.value) })}
                        />
                    </div>
                </section>

                {/* Behavior settings */}
                <section className="settings-section">
                    <h3 className="settings-section-title">Behavior</h3>

                    <div className="setting-toggle-item">
                        <span className="setting-toggle-label">Auto-advance to next phase</span>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={settings.autoAdvance}
                                onChange={(e) => onUpdate({ autoAdvance: e.target.checked })}
                            />
                            <span className="toggle-track">
                                <span className="toggle-thumb" />
                            </span>
                        </label>
                    </div>

                    <div className="setting-toggle-item">
                        <span className="setting-toggle-label">Sound notifications</span>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={settings.soundEnabled}
                                onChange={(e) => onUpdate({ soundEnabled: e.target.checked })}
                            />
                            <span className="toggle-track">
                                <span className="toggle-thumb" />
                            </span>
                        </label>
                    </div>

                    <div className="setting-toggle-item">
                        <span className="setting-toggle-label">Focus mode (minimal UI)</span>
                        <label className="toggle">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={settings.focusModeEnabled}
                                onChange={(e) => onUpdate({ focusModeEnabled: e.target.checked })}
                            />
                            <span className="toggle-track">
                                <span className="toggle-thumb" />
                            </span>
                        </label>
                    </div>
                </section>

                <p className="settings-note">
                    Duration changes apply to the next session.
                </p>
            </div>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

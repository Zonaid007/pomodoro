import type { StorageSchema, Settings, Session, CurrentSession } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '../constants';

/**
 * Get data from localStorage with schema validation
 */
export function getStorageData(): StorageSchema {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.SCHEMA);
        if (!raw) {
            return createDefaultSchema();
        }

        const data = JSON.parse(raw) as StorageSchema;

        // Schema version check - migrate if needed
        if (data.schemaVersion !== CURRENT_SCHEMA_VERSION) {
            return migrateSchema(data);
        }

        return data;
    } catch {
        console.warn('Failed to parse storage data, returning defaults');
        return createDefaultSchema();
    }
}

/**
 * Save data to localStorage
 */
export function saveStorageData(data: StorageSchema): void {
    try {
        localStorage.setItem(STORAGE_KEYS.SCHEMA, JSON.stringify(data));
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Create default schema structure
 */
function createDefaultSchema(): StorageSchema {
    return {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        settings: { ...DEFAULT_SETTINGS },
        sessions: [],
        currentSession: null,
    };
}

/**
 * Migrate old schema versions to current
 */
function migrateSchema(data: StorageSchema): StorageSchema {
    // Currently only version 1 exists
    // Future migrations would be handled here
    return {
        ...createDefaultSchema(),
        settings: { ...DEFAULT_SETTINGS, ...data.settings },
        sessions: data.sessions || [],
        currentSession: data.currentSession || null,
    };
}

/**
 * Save settings to storage
 */
export function saveSettings(settings: Settings): void {
    const data = getStorageData();
    data.settings = settings;
    saveStorageData(data);
}

/**
 * Save a completed session
 */
export function saveSession(session: Session): void {
    const data = getStorageData();
    data.sessions.push(session);
    saveStorageData(data);
}

/**
 * Save current session state (for refresh recovery)
 */
export function saveCurrentSession(session: CurrentSession | null): void {
    const data = getStorageData();
    data.currentSession = session;
    saveStorageData(data);
}

/**
 * Get all sessions
 */
export function getSessions(): Session[] {
    return getStorageData().sessions;
}

/**
 * Get current session (for refresh recovery)
 */
export function getCurrentSession(): CurrentSession | null {
    return getStorageData().currentSession;
}

/**
 * Get settings
 */
export function getSettings(): Settings {
    return getStorageData().settings;
}

import { useMemo } from 'react';
import type { Session, Settings } from '../types';

interface SessionSuggestion {
    suggestedDuration: number;   // Suggested focus duration in minutes
    reason: string;              // User-friendly explanation
    shouldShow: boolean;         // Whether to show suggestion
}

/**
 * Hook to generate adaptive session length suggestions
 * Based on: time of day, last 5 focus ratings, abandonment frequency
 */
export function useSessionSuggestion(
    sessions: Session[],
    settings: Settings
): SessionSuggestion {
    return useMemo(() => {
        const currentDuration = settings.focusDuration;
        const now = new Date();
        const currentHour = now.getHours();

        // Get last 5 completed sessions with reflections
        const recentSessions = sessions
            .filter(s => s.completed && s.reflection?.quality)
            .slice(-5);

        // Get recent abandoned sessions (last 10 sessions, any that weren't completed)
        const last10Sessions = sessions.slice(-10);
        const abandonedCount = last10Sessions.filter(s => !s.completed).length;
        const abandonmentRate = last10Sessions.length > 0 ? abandonedCount / last10Sessions.length : 0;

        // Calculate average focus rating from last 5
        const avgFocus = recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => sum + (s.reflection?.quality || 0), 0) / recentSessions.length
            : 3; // Default to neutral

        // Calculate average actual session length before abandonment/completion
        const avgSessionLength = recentSessions.length > 0
            ? recentSessions.reduce((sum, s) => {
                if (s.startTime && s.endTime) {
                    return sum + Math.floor((s.endTime - s.startTime) / 60000);
                }
                return sum;
            }, 0) / recentSessions.length
            : currentDuration;

        // Decision logic
        let suggestedDuration = currentDuration;
        let reason = '';
        let shouldShow = false;

        // Rule 1: Late night (10pm - 6am) → cap at 15-20 min
        if (currentHour >= 22 || currentHour < 6) {
            if (currentDuration > 20) {
                suggestedDuration = 20;
                reason = "It's late. A shorter session might be easier to complete.";
                shouldShow = true;
            }
        }
        // Rule 2: High abandonment rate (>30%) → suggest shorter
        else if (abandonmentRate > 0.3 && currentDuration > 15) {
            const shorter = Math.max(15, currentDuration - 5);
            if (shorter !== currentDuration) {
                suggestedDuration = shorter;
                reason = `You've been losing focus after ~${Math.round(avgSessionLength)} minutes. A shorter session might help.`;
                shouldShow = true;
            }
        }
        // Rule 3: Low average focus (<3) → suggest -5 min
        else if (avgFocus < 3 && currentDuration > 15 && recentSessions.length >= 3) {
            suggestedDuration = Math.max(15, currentDuration - 5);
            reason = "Your recent sessions have been challenging. Try a shorter, more focused burst.";
            shouldShow = true;
        }
        // Rule 4: Consistent high focus (≥4) → suggest +5 min
        else if (avgFocus >= 4 && recentSessions.length >= 3 && currentDuration < 45) {
            const allHigh = recentSessions.every(s => (s.reflection?.quality || 0) >= 4);
            if (allHigh) {
                suggestedDuration = Math.min(45, currentDuration + 5);
                reason = "You've been in the zone lately. Ready to stretch your focus a bit?";
                shouldShow = true;
            }
        }

        return {
            suggestedDuration,
            reason,
            shouldShow,
        };
    }, [sessions, settings.focusDuration]);
}

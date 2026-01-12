import { useMemo } from 'react';
import type { Session, DistractionType } from '../../types';
import { getTodayDate, getDateDaysAgo } from '../../utils/time';
import { DISTRACTION_LABELS } from '../../constants';
import { WeeklyChart } from './WeeklyChart';
import './StatsView.css';

interface StatsViewProps {
    sessions: Session[];
    onClose: () => void;
}

/**
 * Stats view showing today's progress, weekly chart, and streak
 */
export function StatsView({ sessions, onClose }: StatsViewProps) {
    const stats = useMemo(() => calculateStats(sessions), [sessions]);

    return (
        <div className="stats-view" role="dialog" aria-label="Statistics">
            <div className="stats-header">
                <h2 className="stats-title">Your Focus Stats</h2>
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={onClose}
                    aria-label="Close statistics"
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="stats-content">
                {/* Today's stats */}
                <section className="stats-section">
                    <h3 className="stats-section-title">Today</h3>
                    <div className="today-stats">
                        <div className="stat-card">
                            <span className="stat-value">{stats.todaySessions}</span>
                            <span className="stat-label">Focus Sessions</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.todayMinutes}</span>
                            <span className="stat-label">Minutes Focused</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-value">{stats.todayDistractions}</span>
                            <span className="stat-label">Distractions</span>
                        </div>
                    </div>
                </section>

                {/* Weekly chart */}
                <section className="stats-section">
                    <h3 className="stats-section-title">Last 7 Days</h3>
                    <WeeklyChart data={stats.weeklyData} />
                </section>

                {/* Streak and insights */}
                <section className="stats-section">
                    <h3 className="stats-section-title">Streak</h3>
                    <div className="streak-display">
                        <span className="streak-value">{stats.streak}</span>
                        <span className="streak-label">
                            {stats.streak === 1 ? 'day' : 'days'} in a row
                        </span>
                        {stats.streak >= 3 && (
                            <span className="streak-emoji">🔥</span>
                        )}
                    </div>
                </section>

                {/* Top distraction */}
                {stats.topDistraction && (
                    <section className="stats-section">
                        <h3 className="stats-section-title">Top Distraction (7 days)</h3>
                        <div className="insight-card">
                            <span className="insight-icon">{getIcon(stats.topDistraction.type)}</span>
                            <div className="insight-content">
                                <span className="insight-value">{DISTRACTION_LABELS[stats.topDistraction.type]}</span>
                                <span className="insight-detail">{stats.topDistraction.count} times</span>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

interface Stats {
    todaySessions: number;
    todayMinutes: number;
    todayDistractions: number;
    weeklyData: { date: string; minutes: number; label: string }[];
    streak: number;
    topDistraction: { type: DistractionType; count: number } | null;
}

function calculateStats(sessions: Session[]): Stats {
    const today = getTodayDate();

    // Today's completed focus sessions
    const todaySessions = sessions.filter(s =>
        s.date === today && s.completed
    );

    const todayMinutes = todaySessions.reduce((sum, s) => {
        if (s.startTime && s.endTime) {
            return sum + Math.floor((s.endTime - s.startTime) / 60000);
        }
        return sum;
    }, 0);

    const todayDistractions = todaySessions.reduce((sum, s) =>
        sum + s.distractions.length, 0
    );

    // Weekly data
    const weeklyData: { date: string; minutes: number; label: string }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const date = getDateDaysAgo(i);
        const dayDate = new Date(date);
        const daySessions = sessions.filter(s => s.date === date && s.completed);
        const minutes = daySessions.reduce((sum, s) => {
            if (s.startTime && s.endTime) {
                return sum + Math.floor((s.endTime - s.startTime) / 60000);
            }
            return sum;
        }, 0);

        weeklyData.push({
            date,
            minutes,
            label: dayNames[dayDate.getDay()],
        });
    }

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const date = getDateDaysAgo(i);
        const hasSessions = sessions.some(s => s.date === date && s.completed);
        if (hasSessions) {
            streak++;
        } else if (i > 0) {
            // If not today, break the streak
            break;
        }
    }

    // Top distraction in last 7 days
    const last7Days = new Set(
        Array.from({ length: 7 }, (_, i) => getDateDaysAgo(i))
    );

    const distractionCounts = new Map<DistractionType, number>();
    sessions
        .filter(s => last7Days.has(s.date))
        .forEach(s => {
            s.distractions.forEach(d => {
                distractionCounts.set(d.type, (distractionCounts.get(d.type) || 0) + 1);
            });
        });

    let topDistraction: { type: DistractionType; count: number } | null = null;
    let maxCount = 0;
    distractionCounts.forEach((count, type) => {
        if (count > maxCount) {
            maxCount = count;
            topDistraction = { type, count };
        }
    });

    return {
        todaySessions: todaySessions.length,
        todayMinutes,
        todayDistractions,
        weeklyData,
        streak,
        topDistraction,
    };
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

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

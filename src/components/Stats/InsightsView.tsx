import { useMemo } from 'react';
import type { Session } from '../../types';
import { getDateDaysAgo } from '../../utils/time';
import { ForestScene } from '../Progress';
import './InsightsView.css';

interface InsightsViewProps {
    sessions: Session[];
    onClose: () => void;
}

/**
 * Focus Insights view with trend chart and time-of-day analysis
 */
export function InsightsView({ sessions, onClose }: InsightsViewProps) {
    const insights = useMemo(() => calculateInsights(sessions), [sessions]);
    const completedCount = useMemo(() =>
        sessions.filter(s => s.completed).length,
        [sessions]);

    return (
        <div className="insights-view" role="dialog" aria-label="Focus Insights">
            <div className="insights-header">
                <h2 className="insights-title">Focus Insights</h2>
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={onClose}
                    aria-label="Close insights"
                >
                    <CloseIcon />
                </button>
            </div>

            <div className="insights-content">
                {/* Forest Progress Visualization */}
                <section className="insights-section">
                    <ForestScene completedSessions={completedCount} />
                </section>

                {/* Supportive message */}
                {insights.message && (
                    <div className="insight-message">
                        <span className="insight-emoji">✨</span>
                        <p>{insights.message}</p>
                    </div>
                )}

                {/* Focus Trend Chart */}
                <section className="insights-section">
                    <h3 className="section-title">Focus Over Time</h3>
                    <div className="trend-chart">
                        <svg
                            viewBox="0 0 300 120"
                            className="trend-svg"
                            aria-label="Focus trend over the past 14 days"
                        >
                            {/* Background grid lines */}
                            <line x1="0" y1="30" x2="300" y2="30" className="grid-line" />
                            <line x1="0" y1="60" x2="300" y2="60" className="grid-line" />
                            <line x1="0" y1="90" x2="300" y2="90" className="grid-line" />

                            {/* Trend line */}
                            {insights.trendPoints.length > 1 && (
                                <>
                                    {/* Gradient fill under line */}
                                    <defs>
                                        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="var(--color-focus)" stopOpacity="0.3" />
                                            <stop offset="100%" stopColor="var(--color-focus)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d={createAreaPath(insights.trendPoints)}
                                        fill="url(#trendGradient)"
                                    />
                                    <path
                                        d={createLinePath(insights.trendPoints)}
                                        className="trend-line"
                                        fill="none"
                                    />
                                    {/* Data points */}
                                    {insights.trendPoints.map((point, i) => (
                                        <circle
                                            key={i}
                                            cx={point.x}
                                            cy={point.y}
                                            r="3"
                                            className="trend-point"
                                        />
                                    ))}
                                </>
                            )}
                            {insights.trendPoints.length <= 1 && (
                                <text x="150" y="60" textAnchor="middle" className="no-data-text">
                                    More sessions needed
                                </text>
                            )}
                        </svg>
                        <div className="trend-labels">
                            <span>14 days ago</span>
                            <span>Today</span>
                        </div>
                    </div>
                </section>

                {/* Time of Day Heatmap */}
                <section className="insights-section">
                    <h3 className="section-title">Your Focus Hours</h3>
                    <div className="heatmap-container">
                        <div className="heatmap">
                            {insights.hourlyData.map((hour) => (
                                <div
                                    key={hour.hour}
                                    className="heatmap-cell"
                                    style={{
                                        opacity: hour.intensity > 0 ? 0.3 + (hour.intensity * 0.7) : 0.1
                                    }}
                                    title={`${formatHour(hour.hour)}: ${hour.sessions} sessions`}
                                >
                                    <span className="hour-label">{formatHour(hour.hour)}</span>
                                </div>
                            ))}
                        </div>
                        {insights.bestHourRange && (
                            <p className="best-hours-note">
                                Your focus feels strongest between {insights.bestHourRange}.
                            </p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

interface Insights {
    message: string | null;
    trendPoints: { x: number; y: number; value: number }[];
    hourlyData: { hour: number; sessions: number; avgRating: number; intensity: number }[];
    bestHourRange: string | null;
}

function calculateInsights(sessions: Session[]): Insights {
    const completedSessions = sessions.filter(s => s.completed && s.reflection?.quality);

    // 1. Calculate trend data (past 14 days)
    const trendData: { date: string; avgRating: number; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
        const date = getDateDaysAgo(i);
        const daySessions = completedSessions.filter(s => s.date === date);
        if (daySessions.length > 0) {
            const avgRating = daySessions.reduce((sum, s) => sum + (s.reflection?.quality || 0), 0) / daySessions.length;
            trendData.push({ date, avgRating, count: daySessions.length });
        }
    }

    // Convert to SVG points
    const trendPoints: { x: number; y: number; value: number }[] = [];
    if (trendData.length > 0) {
        const xStep = 280 / Math.max(trendData.length - 1, 1);
        trendData.forEach((d, i) => {
            const x = 10 + i * xStep;
            const y = 100 - ((d.avgRating / 5) * 80); // Scale 1-5 to 20-100 (inverted for SVG)
            trendPoints.push({ x, y, value: d.avgRating });
        });
    }

    // 2. Calculate hourly data (all time)
    const hourlyMap = new Map<number, { sessions: number; totalRating: number }>();
    for (let h = 0; h < 24; h++) {
        hourlyMap.set(h, { sessions: 0, totalRating: 0 });
    }

    completedSessions.forEach(s => {
        const hour = new Date(s.startTime).getHours();
        const current = hourlyMap.get(hour)!;
        current.sessions++;
        current.totalRating += s.reflection?.quality || 0;
    });

    let maxSessions = 0;
    const hourlyData = Array.from(hourlyMap.entries()).map(([hour, data]) => {
        maxSessions = Math.max(maxSessions, data.sessions);
        return {
            hour,
            sessions: data.sessions,
            avgRating: data.sessions > 0 ? data.totalRating / data.sessions : 0,
            intensity: 0,
        };
    });

    // Calculate intensity (normalized)
    hourlyData.forEach(h => {
        h.intensity = maxSessions > 0 ? h.sessions / maxSessions : 0;
    });

    // 3. Find best hour range
    let bestStart = -1;
    let bestEnd = -1;
    let maxIntensity = 0;

    // Find the hour range with highest intensity
    for (let i = 0; i < 24; i++) {
        if (hourlyData[i].intensity >= 0.7) {
            if (bestStart === -1) bestStart = i;
            bestEnd = i;
            if (hourlyData[i].intensity > maxIntensity) {
                maxIntensity = hourlyData[i].intensity;
            }
        } else if (bestStart !== -1 && hourlyData[i].intensity < 0.5) {
            break; // End of a run
        }
    }

    let bestHourRange: string | null = null;
    if (bestStart !== -1 && bestEnd !== -1 && maxIntensity > 0) {
        bestHourRange = `${formatHour(bestStart)}–${formatHour(bestEnd + 1)}`;
    }

    // 4. Generate supportive message
    let message: string | null = null;
    const totalSessions = completedSessions.length;

    if (totalSessions === 0) {
        message = "Start your first session to see your focus patterns emerge.";
    } else if (totalSessions < 5) {
        message = "Keep going! A few more sessions will reveal your focus patterns.";
    } else if (bestHourRange) {
        message = `You tend to be most focused ${bestHourRange}. That's valuable self-knowledge.`;
    } else if (trendPoints.length >= 3) {
        const recent = trendPoints.slice(-3);
        const recentAvg = recent.reduce((sum, p) => sum + p.value, 0) / 3;
        if (recentAvg >= 4) {
            message = "Your recent sessions show strong focus. You're building a good rhythm.";
        } else {
            message = "Every session, even tough ones, builds your focus muscle.";
        }
    }

    return {
        message,
        trendPoints,
        hourlyData: hourlyData.filter(h => h.hour >= 6 && h.hour <= 23), // Show 6am-11pm
        bestHourRange,
    };
}

function formatHour(hour: number): string {
    if (hour === 0 || hour === 24) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
}

function createLinePath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function createAreaPath(points: { x: number; y: number }[]): string {
    if (points.length === 0) return '';
    const linePath = createLinePath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    return `${linePath} L ${lastPoint.x} 100 L ${firstPoint.x} 100 Z`;
}

function CloseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
        </svg>
    );
}

interface WeeklyChartProps {
    data: { date: string; minutes: number; label: string }[];
}

/**
 * Simple CSS-based bar chart for weekly focus minutes
 */
export function WeeklyChart({ data }: WeeklyChartProps) {
    const maxMinutes = Math.max(...data.map(d => d.minutes), 1);

    return (
        <div className="weekly-chart" role="img" aria-label="Weekly focus minutes chart">
            <div className="chart-bars">
                {data.map((day, index) => {
                    const height = (day.minutes / maxMinutes) * 100;
                    const isToday = index === data.length - 1;

                    return (
                        <div key={day.date} className="chart-bar-container">
                            <div className="chart-bar-wrapper">
                                <div
                                    className={`chart-bar ${isToday ? 'today' : ''}`}
                                    style={{ height: `${Math.max(height, 2)}%` }}
                                    title={`${day.minutes} minutes`}
                                />
                                {day.minutes > 0 && (
                                    <span className="chart-bar-value">{day.minutes}</span>
                                )}
                            </div>
                            <span className={`chart-bar-label ${isToday ? 'today' : ''}`}>
                                {day.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="chart-axis-label">minutes</div>
        </div>
    );
}

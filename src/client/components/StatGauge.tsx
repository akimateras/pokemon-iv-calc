interface StatGaugeProps {
    readonly label: string;
    readonly min: number;
    readonly max: number;
    readonly rangeStart: number;
    readonly rangeEnd: number;
}

export function StatGauge({ label, min, max, rangeStart, rangeEnd }: StatGaugeProps) {
    const totalRange = max - min;
    const leftPercent = totalRange > 0 ? ((rangeStart - min) / totalRange) * 100 : 0;
    const widthPercent = totalRange > 0 ? ((rangeEnd - rangeStart) / totalRange) * 100 : 100;

    // Ensure minimum visible width for single-value ranges
    const effectiveWidth = rangeStart === rangeEnd && totalRange > 0
        ? Math.max(widthPercent, 2)
        : Math.max(widthPercent, 1);

    const displayText = rangeStart === rangeEnd
        ? String(rangeStart)
        : `${rangeStart}-${rangeEnd}`;

    // Generate tick marks
    const tickCount = Math.min(max - min + 1, 32);
    const ticks: number[] = [];
    for (let i = 0; i < tickCount; i++) {
        ticks.push(i);
    }

    return (
        <div className="stat-gauge">
            <span className="stat-gauge-label">{label}</span>
            <div className="stat-gauge-bar-container">
                <div
                    className="stat-gauge-bar-fill"
                    style={{
                        left: `${leftPercent}%`,
                        width: `${effectiveWidth}%`,
                    }}
                />
                {tickCount <= 32 && (
                    <div className="stat-gauge-ticks">
                        {ticks.map(i => (
                            <div key={i} className="stat-gauge-tick" />
                        ))}
                    </div>
                )}
            </div>
            <span className="stat-gauge-value">{displayText}</span>
        </div>
    );
}

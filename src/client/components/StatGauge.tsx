interface StatGaugeProps {
    readonly label: string;
    readonly labelClassName?: string | undefined;
    readonly min: number;
    readonly max: number;
    readonly step: number;
    readonly rangeStart: number;
    readonly rangeEnd: number;
    readonly displayText?: string | undefined;
}

export function StatGauge({ label, labelClassName, min, max, step, rangeStart, rangeEnd, displayText }: StatGaugeProps) {
    const cellCount = Math.floor((max - min) / step);

    const overflow = rangeEnd > max;
    const clampedRangeEnd = Math.min(rangeEnd, max);

    const startCell = Math.floor((rangeStart - min) / step);
    const endCell = Math.floor((clampedRangeEnd - min) / step);

    const resolvedDisplayText = displayText ?? (rangeStart === rangeEnd
        ? String(rangeStart)
        : `${rangeStart}-${rangeEnd}`);

    return (
        <div className="stat-gauge">
            <span className={`stat-gauge-label ${labelClassName ?? ""}`}>{label}</span>
            <div className="stat-gauge-cells">
                {Array.from({ length: cellCount }, (_, i) => {
                    const isLastCell = i === cellCount - 1;
                    const isActive = overflow
                        ? (isLastCell ? true : (i >= startCell && i < endCell))
                        : (i >= startCell && i < endCell);
                    const color = overflow && isLastCell ? "#d94a4a" : "#4a90d9";
                    return (
                        <div
                            key={i}
                            className="stat-gauge-cell"
                            style={isActive ? { background: color } : undefined}
                        />
                    );
                })}
            </div>
            <span className="stat-gauge-value">{resolvedDisplayText}</span>
        </div>
    );
}

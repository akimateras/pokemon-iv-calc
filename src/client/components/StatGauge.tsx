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

    const startCell = Math.floor((rangeStart - min) / step);
    const endCell = Math.floor((rangeEnd - min) / step);

    const resolvedDisplayText = displayText ?? (rangeStart === rangeEnd
        ? String(rangeStart)
        : `${rangeStart}-${rangeEnd}`);

    return (
        <div className="stat-gauge">
            <span className={`stat-gauge-label ${labelClassName ?? ""}`}>{label}</span>
            <div className="stat-gauge-cells">
                {Array.from({ length: cellCount }, (_, i) => {
                    const isActive = i >= startCell && i < endCell;
                    return (
                        <div
                            key={i}
                            className="stat-gauge-cell"
                            style={isActive ? { background: "#4a90d9" } : undefined}
                        />
                    );
                })}
            </div>
            <span className="stat-gauge-value">{resolvedDisplayText}</span>
        </div>
    );
}

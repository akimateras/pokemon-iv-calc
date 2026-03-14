const IV_CELLS: readonly number[] = Array.from({ length: 32 }, (_, i) => i);

function getIvColor(iv: number): string {
    if (iv === 0) return "#4fc3f7";
    if (iv <= 15) return "#4caf50";
    if (iv <= 25) return "#fdd835";
    if (iv <= 29) return "#ff9800";
    if (iv === 30) return "#ff5722";
    return "#f44336";
}

interface IvGaugeProps {
    readonly label: string;
    readonly labelClassName?: string | undefined;
    readonly rangeStart: number;
    readonly rangeEnd: number;
    /** When true, all cells are greyed out. */
    readonly invalid?: boolean | undefined;
    /** Override the displayed value text (e.g. show stat value instead of IV). */
    readonly displayText?: string | undefined;
}

export function IvGauge({ label, labelClassName, rangeStart, rangeEnd, invalid, displayText }: IvGaugeProps) {
    const text = displayText ?? (rangeStart === rangeEnd
        ? String(rangeStart)
        : `${rangeStart}-${rangeEnd}`);

    return (
        <div className="iv-gauge">
            <span className={`iv-gauge-label ${labelClassName ?? ""}`}>{label}</span>
            <div className="iv-gauge-cells">
                {IV_CELLS.map(iv => {
                    const isActive = !invalid && iv >= rangeStart && iv <= rangeEnd;
                    return (
                        <div
                            key={iv}
                            className="iv-gauge-cell"
                            style={isActive ? { background: getIvColor(iv) } : undefined}
                        />
                    );
                })}
            </div>
            <span className="iv-gauge-value">{text}</span>
        </div>
    );
}

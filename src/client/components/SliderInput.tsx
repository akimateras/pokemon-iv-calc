interface SliderInputProps {
    readonly label: string;
    readonly min: number;
    readonly max: number;
    readonly value: number;
    readonly onChange: (value: number) => void;
}

export function SliderInput({ label, min, max, value, onChange }: SliderInputProps) {
    function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(Number(e.target.value));
    }

    function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
        const num = Number(e.target.value);
        if (!Number.isNaN(num)) {
            onChange(Math.max(min, Math.min(max, num)));
        }
    }

    function handleNumberBlur() {
        // Clamp on blur in case user typed out-of-range value
        if (value < min) onChange(min);
        if (value > max) onChange(max);
    }

    return (
        <div className="slider-input">
            <span className="slider-input-label">{label}</span>
            <input
                className="slider-input-range"
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleRangeChange}
            />
            <input
                className="slider-input-number"
                type="number"
                min={min}
                max={max}
                value={value}
                onChange={handleNumberChange}
                onBlur={handleNumberBlur}
            />
        </div>
    );
}

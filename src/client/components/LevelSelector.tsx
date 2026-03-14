import { SliderInput } from "./SliderInput";

interface LevelSelectorProps {
    readonly value: number;
    readonly onChange: (level: number) => void;
}

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
    return (
        <div className="section">
            <div className="section-label">レベル</div>
            <SliderInput
                label="Lv."
                min={1}
                max={100}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}

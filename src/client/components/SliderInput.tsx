import { StepButton } from "./StepButton";
import { useState } from "react";


interface SliderInputProps {
    readonly label: string;
    readonly min: number;
    readonly max: number;
    readonly value: number;
    readonly onChange: (value: number) => void;
}

export function SliderInput({ label, min, max, value, onChange }: SliderInputProps) {
    // Internal text state for free-form editing in the number input.
    // null means "not currently editing" — show the prop value instead.
    const [editText, setEditText] = useState<string | null>(null);

    function handleRangeChange(e: React.ChangeEvent<HTMLInputElement>) {
        setEditText(null);
        onChange(Number(e.target.value));
    }

    function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
        const text = e.target.value;
        setEditText(text);
        const num = Number(text);
        if (text !== "" && !Number.isNaN(num)) {
            // Report the raw value without clamping so the parent can
            // show "??" or equivalent for out-of-range inputs.
            onChange(Math.round(num));
        }
    }

    function commitEdit() {
        if (editText !== null) {
            const num = Number(editText);
            if (editText !== "" && !Number.isNaN(num)) {
                onChange(Math.max(min, Math.min(max, Math.round(num))));
            }
            setEditText(null);
        }
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
        e.currentTarget.select();
    }

    function handleBlur() {
        commitEdit();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            commitEdit();
            e.currentTarget.blur();
        }
    }

    function step(delta: number) {
        const next = Math.max(min, Math.min(max, value + delta));
        setEditText(null);
        onChange(next);
    }

    return (
        <div className="slider-input">
            <span className="slider-input-label">{label}</span>
            <input
                className="slider-input-number"
                type="text"
                inputMode="numeric"
                value={editText ?? value}
                onChange={handleNumberChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
            <StepButton
                className="slider-input-step-button"
                onStep={() => { step(-1); }}
            >
                −
            </StepButton>
            <input
                className="slider-input-range"
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={handleRangeChange}
            />
            <StepButton
                className="slider-input-step-button"
                onStep={() => { step(1); }}
            >
                +
            </StepButton>
        </div>
    );
}

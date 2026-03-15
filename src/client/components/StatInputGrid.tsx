import { StepButton } from "./StepButton";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { statNatureClassName } from "../helpers";
import { Fragment, useState } from "react";

import type { Nature, StatKey, StatRecord, StatRange } from "../../shared/types";

interface StatInputGridProps {
    readonly ranges: Readonly<Record<StatKey, StatRange>>;
    readonly values: StatRecord;
    readonly nature: Nature;
    readonly onChange: (key: StatKey, value: number) => void;
}

/**
 * Grid of stat inputs (label + number + slider) with tab order:
 * all number inputs first, then all sliders.
 *
 * CSS Grid places each element in the correct visual row/column
 * regardless of DOM order, so natural tab order follows:
 * number1 → number2 → ... → slider1 → slider2 → ...
 */
export function StatInputGrid({ ranges, values, nature, onChange }: StatInputGridProps) {
    function step(key: StatKey, delta: number) {
        const { min, max } = ranges[key];
        const next = Math.max(min, Math.min(max, values[key] + delta));
        onChange(key, next);
    }

    return (
        <div className="stat-input-grid">
            {STAT_KEYS.map((key, index) => (
                <StatNumberCell
                    key={`n-${key}`}
                    gridRow={index + 1}
                    min={ranges[key].min}
                    max={ranges[key].max}
                    value={values[key]}
                    onChange={(v) => { onChange(key, v); }}
                />
            ))}
            {STAT_KEYS.map((key, index) => (
                <Fragment key={`s-${key}`}>
                    <span
                        className={`stat-input-grid-label ${statNatureClassName(nature, key)}`}
                        style={{ gridRow: index + 1 }}
                    >
                        {STAT_LABELS[key]}
                    </span>
                    <StepButton
                        className="stat-input-grid-step-button"
                        style={{ gridRow: index + 1, gridColumn: 3 }}
                        onStep={() => { step(key, -1); }}
                    >
                        −
                    </StepButton>
                    <input
                        className="stat-input-grid-range"
                        type="range"
                        style={{ gridRow: index + 1 }}
                        min={ranges[key].min}
                        max={ranges[key].max}
                        value={Math.max(ranges[key].min, Math.min(ranges[key].max, values[key]))}
                        onChange={(e) => { onChange(key, Number(e.target.value)); }}
                    />
                    <StepButton
                        className="stat-input-grid-step-button"
                        style={{ gridRow: index + 1, gridColumn: 5 }}
                        onStep={() => { step(key, 1); }}
                    >
                        +
                    </StepButton>
                </Fragment>
            ))}
        </div>
    );
}


interface StatNumberCellProps {
    readonly gridRow: number;
    readonly min: number;
    readonly max: number;
    readonly value: number;
    readonly onChange: (value: number) => void;
}

function StatNumberCell({ gridRow, min, max, value, onChange }: StatNumberCellProps) {
    const [editText, setEditText] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const text = e.target.value;
        setEditText(text);
        const num = Number(text);
        if (text !== "" && !Number.isNaN(num)) {
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

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            commitEdit();
            e.currentTarget.blur();
        }
    }

    return (
        <input
            className="stat-input-grid-number"
            type="text"
            inputMode="numeric"
            style={{ gridRow }}
            value={editText ?? value}
            onChange={handleChange}
            onBlur={() => { commitEdit(); }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
        />
    );
}

import { StepButton } from "./StepButton";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { statNatureClassName } from "../helpers";
import { Fragment, useState } from "react";

import type { Nature, StatKey, StatRecord } from "../../shared/types";

interface StatInputGridProps {
    readonly validValues: Readonly<Record<StatKey, readonly number[]>>;
    readonly values: StatRecord;
    readonly nature: Nature;
    readonly onChange: (key: StatKey, value: number) => void;
}

/**
 * Find the index of the nearest value in a sorted array.
 */
function findNearestIndex(value: number, sortedValues: readonly number[]): number {
    let bestIndex = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < sortedValues.length; i++) {
        const v = sortedValues[i];
        if (v === undefined) continue;
        const diff = Math.abs(value - v);
        if (diff < bestDiff) {
            bestDiff = diff;
            bestIndex = i;
        }
    }
    return bestIndex;
}

/**
 * Grid of stat inputs (label + number + slider) with tab order:
 * all number inputs first, then all sliders.
 *
 * CSS Grid places each element in the correct visual row/column
 * regardless of DOM order, so natural tab order follows:
 * number1 → number2 → ... → slider1 → slider2 → ...
 */
export function StatInputGrid({ validValues, values, nature, onChange }: StatInputGridProps) {
    function step(key: StatKey, delta: number) {
        const vals = validValues[key];
        const currentIndex = findNearestIndex(values[key], vals);
        const nextIndex = Math.max(0, Math.min(vals.length - 1, currentIndex + delta));
        onChange(key, vals[nextIndex] ?? values[key]);
    }

    return (
        <div className="stat-input-grid">
            {STAT_KEYS.map((key, index) => (
                <StatNumberCell
                    key={`n-${key}`}
                    gridRow={index + 1}
                    validValues={validValues[key]}
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
                        min={0}
                        max={validValues[key].length - 1}
                        value={findNearestIndex(values[key], validValues[key])}
                        onChange={(e) => {
                            const v = validValues[key][Number(e.target.value)];
                            if (v !== undefined) onChange(key, v);
                        }}
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
    readonly validValues: readonly number[];
    readonly value: number;
    readonly onChange: (value: number) => void;
}

function StatNumberCell({ gridRow, validValues, value, onChange }: StatNumberCellProps) {
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
                const nearest = findNearestValue(Math.round(num), validValues);
                onChange(nearest);
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

/**
 * Find the nearest value in a sorted array.
 */
function findNearestValue(value: number, sortedValues: readonly number[]): number {
    let closest = value;
    let minDiff = Infinity;
    for (const v of sortedValues) {
        const diff = Math.abs(value - v);
        if (diff < minDiff) {
            minDiff = diff;
            closest = v;
        }
    }
    return closest;
}

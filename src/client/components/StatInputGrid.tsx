import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { Fragment, useState } from "react";
import type { StatKey, StatRecord, StatRange } from "../../shared/types";

interface StatInputGridProps {
    readonly ranges: Readonly<Record<StatKey, StatRange>>;
    readonly values: StatRecord;
    readonly onChange: (key: StatKey, value: number) => void;
}

/**
 * Grid of stat inputs (label + slider + number) with tab order:
 * all sliders first, then all number inputs.
 *
 * CSS Grid places each element in the correct visual row/column
 * regardless of DOM order, so natural tab order follows:
 * slider1 → slider2 → ... → number1 → number2 → ...
 */
export function StatInputGrid({ ranges, values, onChange }: StatInputGridProps) {
    return (
        <div className="stat-input-grid">
            {STAT_KEYS.map((key, index) => (
                <Fragment key={`s-${key}`}>
                    <span
                        className="stat-input-grid-label"
                        style={{ gridRow: index + 1 }}
                    >
                        {STAT_LABELS[key]}
                    </span>
                    <input
                        className="stat-input-grid-range"
                        type="range"
                        style={{ gridRow: index + 1 }}
                        min={ranges[key].min}
                        max={ranges[key].max}
                        value={Math.max(ranges[key].min, Math.min(ranges[key].max, values[key]))}
                        onChange={(e) => { onChange(key, Number(e.target.value)); }}
                    />
                </Fragment>
            ))}
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
            type="number"
            style={{ gridRow }}
            min={min}
            max={max}
            value={editText ?? value}
            onChange={handleChange}
            onBlur={() => { commitEdit(); }}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
        />
    );
}

import { STAT_KEYS } from "../../shared/types";
import { Fragment } from "react";
import type { StatKey, StatRecord } from "../../shared/types";

interface EvInputGridProps {
    readonly values: StatRecord;
    readonly onChange: (key: StatKey, value: number) => void;
}

function clampEv(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

const EV_MAX_PER_STAT = 252;
const EV_MAX_TOTAL = 510;

export function EvInputGrid({ values, onChange }: EvInputGridProps) {
    const total = STAT_KEYS.reduce((sum, key) => sum + values[key], 0);
    const totalOver = total > EV_MAX_TOTAL;

    return (
        <div className="ev-input-grid">
            {STAT_KEYS.map(key => (
                <Fragment key={key}>
                    <button
                        className="ev-input-grid-preset-button"
                        type="button"
                        onClick={() => { onChange(key, 0); }}
                    >
                        0
                    </button>
                    <EvNumberCell
                        value={values[key]}
                        invalid={totalOver || values[key] > EV_MAX_PER_STAT}
                        onChange={(v) => { onChange(key, v); }}
                    />
                    <button
                        className="ev-input-grid-preset-button"
                        type="button"
                        onClick={() => { onChange(key, 252); }}
                    >
                        252
                    </button>
                </Fragment>
            ))}
        </div>
    );
}

interface EvNumberCellProps {
    readonly value: number;
    readonly invalid: boolean;
    readonly onChange: (value: number) => void;
}

function EvNumberCell({ value, invalid, onChange }: EvNumberCellProps) {
    return (
        <input
            className={`ev-input-grid-number${invalid ? " ev-input-grid-number-invalid" : ""}`}
            type="number"
            min={0}
            max={255}
            value={value}
            onChange={(e) => {
                const num = e.target.valueAsNumber;
                if (!Number.isNaN(num)) {
                    onChange(clampEv(num));
                }
            }}
        />
    );
}

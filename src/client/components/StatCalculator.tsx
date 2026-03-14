import { SliderInput } from "./SliderInput";
import { StatGauge } from "./StatGauge";
import { calculateAllStats, getAllStatRanges } from "../../shared/calculator";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { useMemo } from "react";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../../shared/types";

interface StatCalculatorProps {
    readonly pokemon: PokemonSpecies;
    readonly level: number;
    readonly nature: Nature;
    readonly ivInputs: StatRecord;
    readonly onIvChange: (key: StatKey, value: number) => void;
}

export function StatCalculator({ pokemon, level, nature, ivInputs, onIvChange }: StatCalculatorProps) {
    const calculatedStats = useMemo(
        () => calculateAllStats(ivInputs, pokemon, level, nature),
        [ivInputs, pokemon, level, nature],
    );

    const statRanges = useMemo(
        () => getAllStatRanges(pokemon, level, nature),
        [pokemon, level, nature],
    );

    return (
        <div className="calculator-panel">
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値入力</h3>
                {STAT_KEYS.map(key => (
                    <SliderInput
                        key={key}
                        label={STAT_LABELS[key]}
                        min={0}
                        max={31}
                        value={ivInputs[key]}
                        onChange={(v) => { onIvChange(key, v); }}
                    />
                ))}
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス計算結果</h3>
                {STAT_KEYS.map(key => (
                    <StatGauge
                        key={key}
                        label={STAT_LABELS[key]}
                        min={statRanges[key].min}
                        max={statRanges[key].max}
                        rangeStart={calculatedStats[key]}
                        rangeEnd={calculatedStats[key]}
                    />
                ))}
            </div>
        </div>
    );
}

import { StatGauge } from "./StatGauge";
import { StatInputGrid } from "./StatInputGrid";
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

const IV_RANGES: Readonly<Record<StatKey, { readonly min: number; readonly max: number }>> = {
    hp: { min: 0, max: 31 },
    attack: { min: 0, max: 31 },
    defense: { min: 0, max: 31 },
    spAttack: { min: 0, max: 31 },
    spDefense: { min: 0, max: 31 },
    speed: { min: 0, max: 31 },
};

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
                <StatInputGrid
                    ranges={IV_RANGES}
                    values={ivInputs}
                    onChange={onIvChange}
                />
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

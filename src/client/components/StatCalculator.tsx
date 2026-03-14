import { IvGauge } from "./IvGauge";
import { StatInputGrid } from "./StatInputGrid";
import { calculateAllStats } from "../../shared/calculator";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { statNatureClassName } from "../helpers";
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

    return (
        <div className="calculator-panel">
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値入力</h3>
                <StatInputGrid
                    ranges={IV_RANGES}
                    values={ivInputs}
                    nature={nature}
                    onChange={onIvChange}
                />
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス計算結果</h3>
                {STAT_KEYS.map(key => (
                    <IvGauge
                        key={key}
                        label={STAT_LABELS[key]}
                        labelClassName={statNatureClassName(nature, key)}
                        rangeStart={ivInputs[key]}
                        rangeEnd={ivInputs[key]}
                        displayText={String(calculatedStats[key])}
                    />
                ))}
            </div>
        </div>
    );
}

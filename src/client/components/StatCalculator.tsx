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

const IV_VALUES: readonly number[] = Array.from({ length: 32 }, (_, i) => i);

const IV_VALID_VALUES: Readonly<Record<StatKey, readonly number[]>> = {
    hp: IV_VALUES,
    attack: IV_VALUES,
    defense: IV_VALUES,
    spAttack: IV_VALUES,
    spDefense: IV_VALUES,
    speed: IV_VALUES,
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
                    validValues={IV_VALID_VALUES}
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

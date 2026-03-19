import { EvInputGrid } from "./EvInputGrid";
import { IvGauge } from "./IvGauge";
import { StatInputGrid } from "./StatInputGrid";
import { calculateAllStats, estimateIv, getNatureModifier } from "../../shared/calculator";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { statNatureClassName } from "../helpers";
import { useMemo } from "react";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../../shared/types";

interface StatCalculatorProps {
    readonly pokemon: PokemonSpecies;
    readonly level: number;
    readonly nature: Nature;
    readonly ivInputs: StatRecord;
    readonly evInputs: StatRecord;
    readonly onIvChange: (key: StatKey, value: number) => void;
    readonly onEvChange: (key: StatKey, value: number) => void;
    readonly onIvReset: () => void;
    readonly onEvReset: () => void;
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

export function StatCalculator({ pokemon, level, nature, ivInputs, evInputs, onIvChange, onEvChange, onIvReset, onEvReset }: StatCalculatorProps) {
    const calculatedStats = useMemo(
        () => calculateAllStats(ivInputs, pokemon, level, nature, evInputs),
        [ivInputs, pokemon, level, nature, evInputs],
    );

    const ivRanges = useMemo(() => {
        const result: Partial<Record<StatKey, { start: number; end: number }>> = {};
        for (const key of STAT_KEYS) {
            const isHp = key === "hp";
            const baseStat = pokemon.baseStats[key];
            const modifier = getNatureModifier(nature, key);
            const range = estimateIv(calculatedStats[key], baseStat, level, modifier, isHp, evInputs[key]);
            if (range) {
                result[key] = { start: range.min, end: range.max };
            }
        }
        return result;
    }, [calculatedStats, pokemon, level, nature, evInputs]);

    return (
        <div className="calculator-panel calculator-panel-3col">
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値入力</h3>
                <StatInputGrid
                    validValues={IV_VALID_VALUES}
                    values={ivInputs}
                    nature={nature}
                    onChange={onIvChange}
                />
                <button className="reset-button" type="button" onClick={onIvReset}>リセット</button>
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">努力値入力</h3>
                <EvInputGrid
                    values={evInputs}
                    onChange={onEvChange}
                />
                <button className="reset-button" type="button" onClick={onEvReset}>リセット</button>
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス計算結果</h3>
                {STAT_KEYS.map(key => {
                    const range = ivRanges[key];
                    return (
                        <IvGauge
                            key={key}
                            label={STAT_LABELS[key]}
                            labelClassName={statNatureClassName(nature, key)}
                            rangeStart={range?.start ?? ivInputs[key]}
                            rangeEnd={range?.end ?? ivInputs[key]}
                            displayText={String(calculatedStats[key])}
                        />
                    );
                })}
            </div>
        </div>
    );
}

import { StatGauge } from "./StatGauge";
import { StatInputGrid } from "./StatInputGrid";
import { estimateAllIvs, getAllStatRanges } from "../../shared/calculator";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { useMemo } from "react";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../../shared/types";

interface IvEstimatorProps {
    readonly pokemon: PokemonSpecies;
    readonly level: number;
    readonly nature: Nature;
    readonly statInputs: StatRecord;
    readonly onStatChange: (key: StatKey, value: number) => void;
}

export function IvEstimator({ pokemon, level, nature, statInputs, onStatChange }: IvEstimatorProps) {
    const statRanges = useMemo(
        () => getAllStatRanges(pokemon, level, nature),
        [pokemon, level, nature],
    );

    const ivEstimations = useMemo(
        () => estimateAllIvs(statInputs, pokemon, level, nature),
        [statInputs, pokemon, level, nature],
    );

    function isInRange(key: StatKey): boolean {
        const range = statRanges[key];
        return statInputs[key] >= range.min && statInputs[key] <= range.max;
    }

    return (
        <div className="calculator-panel">
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス入力</h3>
                <StatInputGrid
                    ranges={statRanges}
                    values={statInputs}
                    onChange={onStatChange}
                />
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値推定結果</h3>
                {STAT_KEYS.map(key => {
                    const valid = isInRange(key);
                    return (
                        <StatGauge
                            key={key}
                            label={STAT_LABELS[key]}
                            min={0}
                            max={31}
                            rangeStart={valid ? ivEstimations[key].min : 0}
                            rangeEnd={valid ? ivEstimations[key].max : 0}
                            displayOverride={valid ? undefined : "??"}
                        />
                    );
                })}
            </div>
        </div>
    );
}

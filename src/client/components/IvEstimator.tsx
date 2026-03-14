import { SliderInput } from "./SliderInput";
import { StatGauge } from "./StatGauge";
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

    return (
        <div className="calculator-panel">
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス入力</h3>
                {STAT_KEYS.map(key => (
                    <SliderInput
                        key={key}
                        label={STAT_LABELS[key]}
                        min={statRanges[key].min}
                        max={statRanges[key].max}
                        value={statInputs[key]}
                        onChange={(v) => { onStatChange(key, v); }}
                    />
                ))}
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値推定結果</h3>
                {STAT_KEYS.map(key => (
                    <StatGauge
                        key={key}
                        label={STAT_LABELS[key]}
                        min={0}
                        max={31}
                        rangeStart={ivEstimations[key].min}
                        rangeEnd={ivEstimations[key].max}
                    />
                ))}
            </div>
        </div>
    );
}

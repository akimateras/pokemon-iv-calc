import { EvInputGrid } from "./EvInputGrid";
import { IvGauge } from "./IvGauge";
import { StatInputGrid } from "./StatInputGrid";
import { estimateAllIvs, getAllAchievableStatValues } from "../../shared/calculator";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { statNatureClassName } from "../helpers";
import { useMemo } from "react";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../../shared/types";

interface IvEstimatorProps {
    readonly pokemon: PokemonSpecies;
    readonly level: number;
    readonly nature: Nature;
    readonly statInputs: StatRecord;
    readonly evInputs: StatRecord;
    readonly onStatChange: (key: StatKey, value: number) => void;
    readonly onEvChange: (key: StatKey, value: number) => void;
}

export function IvEstimator({ pokemon, level, nature, statInputs, evInputs, onStatChange, onEvChange }: IvEstimatorProps) {
    const achievableValues = useMemo(
        () => getAllAchievableStatValues(pokemon, level, nature, evInputs),
        [pokemon, level, nature, evInputs],
    );

    const ivEstimations = useMemo(
        () => estimateAllIvs(statInputs, pokemon, level, nature, evInputs),
        [statInputs, pokemon, level, nature, evInputs],
    );

    return (
        <div className="calculator-panel calculator-panel-3col">
            <div className="calculator-column">
                <h3 className="calculator-column-title">ステータス入力</h3>
                <StatInputGrid
                    validValues={achievableValues}
                    values={statInputs}
                    nature={nature}
                    onChange={onStatChange}
                />
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">努力値入力</h3>
                <EvInputGrid
                    values={evInputs}
                    onChange={onEvChange}
                />
            </div>
            <div className="calculator-column">
                <h3 className="calculator-column-title">個体値推定結果</h3>
                {STAT_KEYS.map(key => {
                    const estimation = ivEstimations[key];
                    const valid = estimation !== undefined;
                    return (
                        <IvGauge
                            key={key}
                            label={STAT_LABELS[key]}
                            labelClassName={statNatureClassName(nature, key)}
                            rangeStart={estimation !== undefined ? estimation.min : 0}
                            rangeEnd={estimation !== undefined ? estimation.max : 0}
                            invalid={!valid}
                            displayText={valid ? undefined : "??"}
                        />
                    );
                })}
            </div>
        </div>
    );
}

import { IvEstimator } from "./IvEstimator";
import { StatCalculator } from "./StatCalculator";
import { useState } from "react";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../../shared/types";

type TabId = "iv-estimate" | "stat-calc";

interface CalculatorTabsProps {
    readonly pokemon: PokemonSpecies | null;
    readonly level: number;
    readonly nature: Nature;
    readonly statInputs: StatRecord;
    readonly ivInputs: StatRecord;
    readonly onStatChange: (key: StatKey, value: number) => void;
    readonly onIvChange: (key: StatKey, value: number) => void;
}

export function CalculatorTabs({
    pokemon,
    level,
    nature,
    statInputs,
    ivInputs,
    onStatChange,
    onIvChange,
}: CalculatorTabsProps) {
    const [activeTab, setActiveTab] = useState<TabId>("iv-estimate");

    return (
        <div className="section">
            <div className="tabs">
                <button
                    className="tab-button"
                    data-active={activeTab === "iv-estimate" ? "true" : undefined}
                    onClick={() => { setActiveTab("iv-estimate"); }}
                >
                    個体値推定
                </button>
                <button
                    className="tab-button"
                    data-active={activeTab === "stat-calc" ? "true" : undefined}
                    onClick={() => { setActiveTab("stat-calc"); }}
                >
                    ステータス計算
                </button>
            </div>

            {pokemon === null ? (
                <div className="no-pokemon-message">
                    ポケモンを選択してください
                </div>
            ) : (
                <>
                    {activeTab === "iv-estimate" && (
                        <IvEstimator
                            pokemon={pokemon}
                            level={level}
                            nature={nature}
                            statInputs={statInputs}
                            onStatChange={onStatChange}
                        />
                    )}
                    {activeTab === "stat-calc" && (
                        <StatCalculator
                            pokemon={pokemon}
                            level={level}
                            nature={nature}
                            ivInputs={ivInputs}
                            onIvChange={onIvChange}
                        />
                    )}
                </>
            )}
        </div>
    );
}

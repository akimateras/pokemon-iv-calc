import "./App.css";
import { CalculatorTabs } from "./components/CalculatorTabs";
import { LevelSelector } from "./components/LevelSelector";
import { NatureSelector } from "./components/NatureSelector";
import { PokemonSelector } from "./components/PokemonSelector";
import { calculateAllStats, clampStatInputs, estimateAllIvs } from "../shared/calculator";
import { DEFAULT_NATURE } from "../shared/natures";
import { useState } from "react";
import type { TabId } from "./components/CalculatorTabs";
import type { IvRange, Nature, PokemonSpecies, StatKey, StatRecord } from "../shared/types";

const INITIAL_STATS: StatRecord = {
    hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0,
};

const INITIAL_IVS: StatRecord = {
    hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31,
};

const INITIAL_EVS: StatRecord = {
    hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0,
};

const DEFAULT_IVS: StatRecord = {
    hp: 16, attack: 16, defense: 16, spAttack: 16, spDefense: 16, speed: 16,
};

function ivRangeMidpoint(range: IvRange | undefined): number {
    if (range === undefined) return 0;
    return Math.floor((range.min + range.max) / 2);
}

function updateStat(record: StatRecord, key: StatKey, value: number): StatRecord {
    switch (key) {
        case "hp": return { ...record, hp: value };
        case "attack": return { ...record, attack: value };
        case "defense": return { ...record, defense: value };
        case "spAttack": return { ...record, spAttack: value };
        case "spDefense": return { ...record, spDefense: value };
        case "speed": return { ...record, speed: value };
    }
}

function withVariation(pokemon: PokemonSpecies, variationIndex: number): PokemonSpecies {
    const statSet = pokemon.baseStatSets[variationIndex];
    if (!statSet) return pokemon;
    return { ...pokemon, baseStats: statSet.baseStats };
}

export function App() {
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonSpecies | null>(null);
    const [selectedVariation, setSelectedVariation] = useState(0);
    const [level, setLevel] = useState(50);
    const [nature, setNature] = useState<Nature>(DEFAULT_NATURE);
    const [statInputs, setStatInputs] = useState<StatRecord>(INITIAL_STATS);
    const [ivInputs, setIvInputs] = useState<StatRecord>(INITIAL_IVS);
    const [evInputs, setEvInputs] = useState<StatRecord>(INITIAL_EVS);
    const [activeTab, setActiveTab] = useState<TabId>("iv-estimate");

    const effectivePokemon = selectedPokemon
        ? withVariation(selectedPokemon, selectedVariation)
        : null;

    function handlePokemonChange(pokemon: PokemonSpecies | null) {
        setSelectedPokemon(pokemon);
        setSelectedVariation(0);
        if (pokemon) {
            if (activeTab === "iv-estimate") {
                setStatInputs(calculateAllStats(DEFAULT_IVS, pokemon, level, nature, evInputs));
            } else {
                setIvInputs(DEFAULT_IVS);
            }
        }
    }

    function handleVariationChange(index: number) {
        setSelectedVariation(index);
        if (selectedPokemon) {
            const effective = withVariation(selectedPokemon, index);
            if (activeTab === "iv-estimate") {
                setStatInputs(calculateAllStats(DEFAULT_IVS, effective, level, nature, evInputs));
            } else {
                setIvInputs(DEFAULT_IVS);
            }
        }
    }

    function handleLevelChange(newLevel: number) {
        setLevel(newLevel);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, newLevel, nature, evInputs));
        }
    }

    function handleNatureChange(newNature: Nature) {
        setNature(newNature);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, level, newNature, evInputs));
        }
    }

    function handleStatChange(key: StatKey, value: number) {
        setStatInputs(prev => updateStat(prev, key, value));
    }

    function handleEvChange(key: StatKey, value: number) {
        const newEvs = updateStat(evInputs, key, value);
        setEvInputs(newEvs);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, level, nature, newEvs));
        }
    }

    function handleIvChange(key: StatKey, value: number) {
        setIvInputs(prev => updateStat(prev, key, value));
    }

    function handleStatReset() {
        if (effectivePokemon) {
            setStatInputs(calculateAllStats(DEFAULT_IVS, effectivePokemon, level, nature, evInputs));
        }
    }

    function handleEvReset() {
        setEvInputs(INITIAL_EVS);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, level, nature, INITIAL_EVS));
        }
    }

    function handleIvReset() {
        setIvInputs(DEFAULT_IVS);
    }

    function handleTabChange(to: TabId) {
        setActiveTab(to);
        if (effectivePokemon === null) return;

        if (to === "stat-calc") {
            // IV estimate → Stat calc: transfer estimated IVs (midpoint of range)
            const e = estimateAllIvs(statInputs, effectivePokemon, level, nature, evInputs);
            setIvInputs({
                hp: ivRangeMidpoint(e.hp),
                attack: ivRangeMidpoint(e.attack),
                defense: ivRangeMidpoint(e.defense),
                spAttack: ivRangeMidpoint(e.spAttack),
                spDefense: ivRangeMidpoint(e.spDefense),
                speed: ivRangeMidpoint(e.speed),
            });
        } else {
            // Stat calc → IV estimate: transfer calculated stats
            const stats = calculateAllStats(ivInputs, effectivePokemon, level, nature, evInputs);
            setStatInputs(stats);
        }
    }

    return (
        <div className="app">
            <h1 className="app-title">ポケモン個体値計算機</h1>

            <PokemonSelector
                value={effectivePokemon}
                selectedVariation={selectedVariation}
                onChange={handlePokemonChange}
                onVariationChange={handleVariationChange}
            />

            <LevelSelector
                value={level}
                onChange={handleLevelChange}
            />

            <NatureSelector
                value={nature}
                onChange={handleNatureChange}
            />

            <CalculatorTabs
                pokemon={effectivePokemon}
                level={level}
                nature={nature}
                statInputs={statInputs}
                evInputs={evInputs}
                ivInputs={ivInputs}
                onStatChange={handleStatChange}
                onEvChange={handleEvChange}
                onIvChange={handleIvChange}
                onStatReset={handleStatReset}
                onEvReset={handleEvReset}
                onIvReset={handleIvReset}
                onTabChange={handleTabChange}
            />
        </div>
    );
}

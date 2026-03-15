import "./App.css";
import { CalculatorTabs } from "./components/CalculatorTabs";
import { LevelSelector } from "./components/LevelSelector";
import { NatureSelector } from "./components/NatureSelector";
import { PokemonSelector } from "./components/PokemonSelector";
import { calculateAllStats, clampStatInputs, estimateAllIvs } from "../shared/calculator";
import { DEFAULT_NATURE } from "../shared/natures";
import { useState } from "react";
import type { TabId } from "./components/CalculatorTabs";
import type { Nature, PokemonSpecies, StatKey, StatRecord } from "../shared/types";

const INITIAL_STATS: StatRecord = {
    hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0,
};

const INITIAL_IVS: StatRecord = {
    hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31,
};

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

    const effectivePokemon = selectedPokemon
        ? withVariation(selectedPokemon, selectedVariation)
        : null;

    function handlePokemonChange(pokemon: PokemonSpecies | null) {
        setSelectedPokemon(pokemon);
        setSelectedVariation(0);
        if (pokemon) {
            setStatInputs(prev => clampStatInputs(prev, pokemon, level, nature));
        }
    }

    function handleVariationChange(index: number) {
        setSelectedVariation(index);
        if (selectedPokemon) {
            const effective = withVariation(selectedPokemon, index);
            setStatInputs(prev => clampStatInputs(prev, effective, level, nature));
        }
    }

    function handleLevelChange(newLevel: number) {
        setLevel(newLevel);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, newLevel, nature));
        }
    }

    function handleNatureChange(newNature: Nature) {
        setNature(newNature);
        if (effectivePokemon) {
            setStatInputs(prev => clampStatInputs(prev, effectivePokemon, level, newNature));
        }
    }

    function handleStatChange(key: StatKey, value: number) {
        setStatInputs(prev => updateStat(prev, key, value));
    }

    function handleIvChange(key: StatKey, value: number) {
        setIvInputs(prev => updateStat(prev, key, value));
    }

    function handleTabChange(to: TabId) {
        if (effectivePokemon === null) return;

        if (to === "stat-calc") {
            // IV estimate → Stat calc: transfer estimated IVs (midpoint of range)
            const e = estimateAllIvs(statInputs, effectivePokemon, level, nature);
            setIvInputs({
                hp: Math.floor((e.hp.min + e.hp.max) / 2),
                attack: Math.floor((e.attack.min + e.attack.max) / 2),
                defense: Math.floor((e.defense.min + e.defense.max) / 2),
                spAttack: Math.floor((e.spAttack.min + e.spAttack.max) / 2),
                spDefense: Math.floor((e.spDefense.min + e.spDefense.max) / 2),
                speed: Math.floor((e.speed.min + e.speed.max) / 2),
            });
        } else {
            // Stat calc → IV estimate: transfer calculated stats
            const stats = calculateAllStats(ivInputs, effectivePokemon, level, nature);
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
                ivInputs={ivInputs}
                onStatChange={handleStatChange}
                onIvChange={handleIvChange}
                onTabChange={handleTabChange}
            />
        </div>
    );
}

import "./App.css";
import { CalculatorTabs } from "./components/CalculatorTabs";
import { LevelSelector } from "./components/LevelSelector";
import { NatureSelector } from "./components/NatureSelector";
import { PokemonSelector } from "./components/PokemonSelector";
import { clampStatInputs } from "../shared/calculator";
import { DEFAULT_NATURE } from "../shared/natures";
import { useState } from "react";
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

export function App() {
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonSpecies | null>(null);
    const [level, setLevel] = useState(50);
    const [nature, setNature] = useState<Nature>(DEFAULT_NATURE);
    const [statInputs, setStatInputs] = useState<StatRecord>(INITIAL_STATS);
    const [ivInputs, setIvInputs] = useState<StatRecord>(INITIAL_IVS);

    function handlePokemonChange(pokemon: PokemonSpecies | null) {
        setSelectedPokemon(pokemon);
        if (pokemon) {
            setStatInputs(prev => clampStatInputs(prev, pokemon, level, nature));
        }
    }

    function handleLevelChange(newLevel: number) {
        setLevel(newLevel);
        if (selectedPokemon) {
            setStatInputs(prev => clampStatInputs(prev, selectedPokemon, newLevel, nature));
        }
    }

    function handleNatureChange(newNature: Nature) {
        setNature(newNature);
        if (selectedPokemon) {
            setStatInputs(prev => clampStatInputs(prev, selectedPokemon, level, newNature));
        }
    }

    function handleStatChange(key: StatKey, value: number) {
        setStatInputs(prev => updateStat(prev, key, value));
    }

    function handleIvChange(key: StatKey, value: number) {
        setIvInputs(prev => updateStat(prev, key, value));
    }

    return (
        <div className="app">
            <h1 className="app-title">ポケモン個体値計算機</h1>

            <PokemonSelector
                value={selectedPokemon}
                onChange={handlePokemonChange}
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
                pokemon={selectedPokemon}
                level={level}
                nature={nature}
                statInputs={statInputs}
                ivInputs={ivInputs}
                onStatChange={handleStatChange}
                onIvChange={handleIvChange}
            />
        </div>
    );
}

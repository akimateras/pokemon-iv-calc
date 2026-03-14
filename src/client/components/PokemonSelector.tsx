import { Combobox } from "./Combobox";
import { POKEMON_LIST } from "../../shared/pokemon";
import { useMemo } from "react";
import type { PokemonSpecies } from "../../shared/types";

interface PokemonSelectorProps {
    readonly value: PokemonSpecies | null;
    readonly onChange: (pokemon: PokemonSpecies | null) => void;
}

export function PokemonSelector({ value, onChange }: PokemonSelectorProps) {
    const pokemonNames = useMemo(
        () => POKEMON_LIST.map(p => p.name),
        [],
    );

    function handleChange(name: string) {
        const found = POKEMON_LIST.find(p => p.name === name);
        onChange(found ?? null);
    }

    return (
        <div className="section">
            <div className="section-label">ポケモン</div>
            <Combobox
                options={pokemonNames}
                value={value?.name ?? ""}
                onChange={handleChange}
                placeholder="ポケモンを選択..."
            />
        </div>
    );
}

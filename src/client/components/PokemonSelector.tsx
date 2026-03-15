import { Combobox } from "./Combobox";
import { StatGauge } from "./StatGauge";
import { POKEMON_LIST } from "../../shared/pokemon";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
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
            {value && (
                <div className="base-stat-gauges">
                    <h3 className="base-stat-gauges-title">種族値</h3>
                    {STAT_KEYS.map(key => (
                        <StatGauge
                            key={key}
                            label={STAT_LABELS[key]}
                            min={0}
                            max={255}
                            step={5}
                            rangeStart={0}
                            rangeEnd={value.baseStats[key]}
                            displayText={String(value.baseStats[key])}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

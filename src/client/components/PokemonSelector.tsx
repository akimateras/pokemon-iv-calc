import { Combobox } from "./Combobox";
import { StatGauge } from "./StatGauge";
import { matchesKanaRomaji } from "../../shared/kana";
import { POKEMON_LIST } from "../../shared/pokemon";
import { STAT_KEYS, STAT_LABELS } from "../../shared/types";
import { useCallback, useMemo } from "react";
import type { PokemonSpecies } from "../../shared/types";

interface PokemonSelectorProps {
    readonly value: PokemonSpecies | null;
    readonly selectedVariation: number;
    readonly onChange: (pokemon: PokemonSpecies | null) => void;
    readonly onVariationChange: (index: number) => void;
}

export function PokemonSelector({ value, selectedVariation, onChange, onVariationChange }: PokemonSelectorProps) {
    const pokemonNames = useMemo(
        () => POKEMON_LIST.map(p => p.name),
        [],
    );

    const dexNumberByName = useMemo(
        () => new Map(POKEMON_LIST.map(p => [p.name, p.dexNumber])),
        [],
    );

    const filterFn = useCallback(
        (option: string, input: string) => matchesKanaRomaji(input, option),
        [],
    );

    const renderOption = useCallback((name: string) => {
        const dexNumber = dexNumberByName.get(name);
        if (dexNumber === undefined) return name;
        return (
            <>
                <span className="combobox-dex-number">
                    {String(dexNumber).padStart(4, "0")}:
                </span>
                {" "}{name}
            </>
        );
    }, [dexNumberByName]);

    function handleChange(name: string) {
        const found = POKEMON_LIST.find(p => p.name === name);
        onChange(found ?? null);
    }

    const hasVariations = value !== null && value.baseStatSets.length > 1;

    return (
        <div className="section">
            <div className="section-label">ポケモン</div>
            <Combobox
                options={pokemonNames}
                value={value?.name ?? ""}
                onChange={handleChange}
                placeholder="ポケモンを選択..."
                renderOption={renderOption}
                filterFn={filterFn}
            />
            {hasVariations && (
                <div className="variation-selector">
                    {value.baseStatSets.map((set, i) => (
                        <label key={set.label} className="variation-option">
                            <input
                                type="radio"
                                name="variation"
                                checked={selectedVariation === i}
                                onChange={() => { onVariationChange(i); }}
                            />
                            <span>{set.label}</span>
                        </label>
                    ))}
                </div>
            )}
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

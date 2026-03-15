import { Combobox } from "./Combobox";
import { matchesKanaRomaji } from "../../shared/kana";
import { ALL_NATURES, findNatureByFactors } from "../../shared/natures";
import { NATURE_STAT_KEYS, NATURE_TABLE_LABELS } from "../../shared/types";
import { useCallback, useMemo } from "react";
import type { Nature, NatureStatKey } from "../../shared/types";

interface NatureSelectorProps {
    readonly value: Nature;
    readonly onChange: (nature: Nature) => void;
}

// The nature table is a 5x5 grid indexed by [decreased][increased]
// Columns = increased stat, Rows = decreased stat
function getNatureAt(increased: NatureStatKey, decreased: NatureStatKey): Nature {
    return findNatureByFactors(increased, decreased);
}

export function NatureSelector({ value, onChange }: NatureSelectorProps) {
    const natureNames = useMemo(
        () => ALL_NATURES.map(n => n.name),
        [],
    );

    const filterFn = useCallback(
        (option: string, input: string) => matchesKanaRomaji(input, option),
        [],
    );

    function handleComboboxChange(name: string) {
        const found = ALL_NATURES.find(n => n.name === name);
        if (found) {
            onChange(found);
        }
    }

    function handleNatureCellClick(increased: NatureStatKey, decreased: NatureStatKey) {
        onChange(getNatureAt(increased, decreased));
    }

    function handleIncreasedChange(increased: NatureStatKey) {
        // Keep current decreased, change increased
        onChange(getNatureAt(increased, value.decreased));
    }

    function handleDecreasedChange(decreased: NatureStatKey) {
        // Keep current increased, change decreased
        onChange(getNatureAt(value.increased, decreased));
    }

    return (
        <div className="section nature-section">
            <div className="section-label">性格</div>
            <Combobox
                options={natureNames}
                value={value.name}
                onChange={handleComboboxChange}
                placeholder="性格を選択..."
                filterFn={filterFn}
            />
            <div className="nature-table-wrapper">
                <table className="nature-table">
                    <thead>
                        <tr>
                            <th />
                            {NATURE_STAT_KEYS.map(statKey => (
                                <th key={statKey}>
                                    <label className="nature-radio-label">
                                        <input
                                            type="radio"
                                            name="nature-increased"
                                            checked={value.increased === statKey}
                                            onChange={() => { handleIncreasedChange(statKey); }}
                                        />
                                        {NATURE_TABLE_LABELS[statKey]}&#x2191;
                                    </label>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {NATURE_STAT_KEYS.map(decreasedKey => (
                            <tr key={decreasedKey}>
                                <th>
                                    <label className="nature-radio-label">
                                        <input
                                            type="radio"
                                            name="nature-decreased"
                                            checked={value.decreased === decreasedKey}
                                            onChange={() => { handleDecreasedChange(decreasedKey); }}
                                        />
                                        {NATURE_TABLE_LABELS[decreasedKey]}&#x2193;
                                    </label>
                                </th>
                                {NATURE_STAT_KEYS.map(increasedKey => {
                                    const nature = getNatureAt(increasedKey, decreasedKey);
                                    const isSelected = value.name === nature.name;
                                    const isNeutral = increasedKey === decreasedKey;
                                    return (
                                        <td
                                            key={increasedKey}
                                            className="nature-cell"
                                            data-selected={isSelected ? "true" : undefined}
                                            data-neutral={isNeutral ? "true" : undefined}
                                            onClick={() => { handleNatureCellClick(increasedKey, decreasedKey); }}
                                        >
                                            <label className="nature-cell-label">
                                                <input
                                                    type="radio"
                                                    name="nature-value"
                                                    checked={isSelected}
                                                    onChange={() => { handleNatureCellClick(increasedKey, decreasedKey); }}
                                                />
                                                {nature.name}
                                            </label>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

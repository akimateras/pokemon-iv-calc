import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface ComboboxProps {
    readonly options: readonly string[];
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder: string;
    readonly renderOption?: (option: string) => ReactNode;
}

export function Combobox({ options, value, onChange, placeholder, renderOption }: ComboboxProps) {
    const [inputText, setInputText] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    // Sync input text when value changes externally
    useEffect(() => {
        setInputText(value);
    }, [value]);

    const filteredOptions = inputText === value
        ? options
        : options.filter(opt => opt.includes(inputText));

    function handleSelect(option: string) {
        onChange(option);
        setInputText(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputText(e.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    }

    // Find the single candidate to auto-select:
    // exact match by input text, or the sole filtered option.
    function findAutoSelectCandidate(): string | undefined {
        const exactMatch = filteredOptions.find(opt => opt === inputText);
        if (exactMatch !== undefined) return exactMatch;
        if (filteredOptions.length === 1) return filteredOptions[0];
        return undefined;
    }

    function openWithCurrentValue() {
        setIsOpen(true);
        const index = filteredOptions.indexOf(value);
        setHighlightedIndex(index === -1 ? -1 : index);
    }

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
        e.currentTarget.select();
        openWithCurrentValue();
    }

    function handleBlur() {
        const candidate = findAutoSelectCandidate();
        if (candidate !== undefined) {
            handleSelect(candidate);
            return;
        }
        setIsOpen(false);
        setInputText(value);
    }

    function handleClick() {
        if (!isOpen) {
            openWithCurrentValue();
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < filteredOptions.length - 1 ? prev + 1 : prev,
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (!isOpen) {
                openWithCurrentValue();
            } else {
                const highlighted = filteredOptions[highlightedIndex];
                if (highlighted !== undefined) {
                    handleSelect(highlighted);
                } else {
                    const candidate = findAutoSelectCandidate();
                    if (candidate !== undefined) {
                        handleSelect(candidate);
                    }
                }
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
            setInputText(value);
        }
    }

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const items = listRef.current.children;
            const item = items[highlightedIndex];
            if (item instanceof HTMLElement) {
                item.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex]);

    return (
        <div className="combobox">
            <input
                className="combobox-input"
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="combobox-dropdown" ref={listRef}>
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option}
                            className="combobox-option"
                            data-highlighted={index === highlightedIndex ? "true" : undefined}
                            data-selected={option === value ? "true" : undefined}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelect(option);
                            }}
                        >
                            {renderOption ? renderOption(option) : option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

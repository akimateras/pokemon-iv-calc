import { useEffect, useRef, useState } from "react";

interface ComboboxProps {
    readonly options: readonly string[];
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly placeholder: string;
}

export function Combobox({ options, value, onChange, placeholder }: ComboboxProps) {
    const [inputText, setInputText] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Sync input text when value changes externally
    useEffect(() => {
        setInputText(value);
    }, [value]);

    const filteredOptions = inputText === value
        ? options
        : options.filter(opt => opt.includes(inputText));

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputText(e.target.value);
        setIsOpen(true);
        setHighlightedIndex(-1);
    }

    function handleSelect(option: string) {
        onChange(option);
        setInputText(option);
        setIsOpen(false);
        setHighlightedIndex(-1);
    }

    function handleFocus() {
        setIsOpen(true);
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
            const highlighted = filteredOptions[highlightedIndex];
            if (highlighted !== undefined) {
                handleSelect(highlighted);
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

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && e.target instanceof Node && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setInputText(value);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, [value]);

    return (
        <div className="combobox" ref={containerRef}>
            <input
                className="combobox-input"
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onFocus={handleFocus}
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
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

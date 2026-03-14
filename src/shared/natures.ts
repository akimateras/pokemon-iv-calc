import type { Nature, NatureStatKey } from "./types";

// Default nature (がんばりや - neutral)
export const DEFAULT_NATURE: Nature = { name: "がんばりや", increased: "attack", decreased: "attack" };

export const ALL_NATURES: readonly Nature[] = [
    // Neutral natures (same stat increased and decreased)
    DEFAULT_NATURE,
    { name: "すなお", increased: "defense", decreased: "defense" },
    { name: "てれや", increased: "spAttack", decreased: "spAttack" },
    { name: "きまぐれ", increased: "spDefense", decreased: "spDefense" },
    { name: "まじめ", increased: "speed", decreased: "speed" },

    // Attack-increasing natures
    { name: "さみしがり", increased: "attack", decreased: "defense" },
    { name: "いじっぱり", increased: "attack", decreased: "spAttack" },
    { name: "やんちゃ", increased: "attack", decreased: "spDefense" },
    { name: "ゆうかん", increased: "attack", decreased: "speed" },

    // Defense-increasing natures
    { name: "ずぶとい", increased: "defense", decreased: "attack" },
    { name: "わんぱく", increased: "defense", decreased: "spAttack" },
    { name: "のうてんき", increased: "defense", decreased: "spDefense" },
    { name: "のんき", increased: "defense", decreased: "speed" },

    // SpAttack-increasing natures
    { name: "ひかえめ", increased: "spAttack", decreased: "attack" },
    { name: "おっとり", increased: "spAttack", decreased: "defense" },
    { name: "うっかりや", increased: "spAttack", decreased: "spDefense" },
    { name: "れいせい", increased: "spAttack", decreased: "speed" },

    // SpDefense-increasing natures
    { name: "おだやか", increased: "spDefense", decreased: "attack" },
    { name: "おとなしい", increased: "spDefense", decreased: "defense" },
    { name: "しんちょう", increased: "spDefense", decreased: "spAttack" },
    { name: "なまいき", increased: "spDefense", decreased: "speed" },

    // Speed-increasing natures
    { name: "おくびょう", increased: "speed", decreased: "attack" },
    { name: "せっかち", increased: "speed", decreased: "defense" },
    { name: "ようき", increased: "speed", decreased: "spAttack" },
    { name: "むじゃき", increased: "speed", decreased: "spDefense" },
];

export function findNatureByFactors(increased: NatureStatKey, decreased: NatureStatKey): Nature {
    return ALL_NATURES.find(n => n.increased === increased && n.decreased === decreased) ?? DEFAULT_NATURE;
}

export function findNatureByName(name: string): Nature | undefined {
    return ALL_NATURES.find(n => n.name === name);
}

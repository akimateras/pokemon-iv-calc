export const STAT_KEYS = ["hp", "attack", "defense", "spAttack", "spDefense", "speed"] as const;
export type StatKey = typeof STAT_KEYS[number];
export type StatRecord = Readonly<Record<StatKey, number>>;

export const STAT_LABELS: Readonly<Record<StatKey, string>> = {
    hp: "HP",
    attack: "こうげき",
    defense: "ぼうぎょ",
    spAttack: "とくこう",
    spDefense: "とくぼう",
    speed: "すばやさ",
};

export const NATURE_STAT_KEYS = ["attack", "defense", "spAttack", "spDefense", "speed"] as const;
export type NatureStatKey = typeof NATURE_STAT_KEYS[number];

export const NATURE_TABLE_LABELS: Readonly<Record<NatureStatKey, string>> = {
    attack: "こうげき",
    defense: "ぼうぎょ",
    spAttack: "とくしゅ",
    spDefense: "とくぼう",
    speed: "すばやさ",
};

export interface Nature {
    readonly name: string;
    readonly increased: NatureStatKey;
    readonly decreased: NatureStatKey;
}

export interface PokemonSpecies {
    readonly dexNumber: number;
    readonly name: string;
    readonly baseStats: StatRecord;
}

export interface IvRange {
    readonly min: number;
    readonly max: number;
}

export interface StatRange {
    readonly min: number;
    readonly max: number;
}

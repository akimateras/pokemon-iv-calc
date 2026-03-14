import type { IvRange, Nature, PokemonSpecies, StatKey, StatRange, StatRecord } from "./types";

/**
 * Get the nature modifier for a specific stat.
 * HP is never affected by nature. Neutral natures return 1.0.
 */
export function getNatureModifier(nature: Nature, statKey: StatKey): number {
    if (statKey === "hp") return 1.0;
    if (nature.increased === statKey && nature.decreased === statKey) return 1.0;
    if (nature.increased === statKey) return 1.1;
    if (nature.decreased === statKey) return 0.9;
    return 1.0;
}

/**
 * Calculate HP stat value.
 * Formula: floor((base * 2 + iv) * level / 100) + level + 10
 */
export function calculateHp(baseStat: number, iv: number, level: number): number {
    return Math.floor((baseStat * 2 + iv) * level / 100) + level + 10;
}

/**
 * Calculate non-HP stat value.
 * Formula: floor((floor((base * 2 + iv) * level / 100) + 5) * natureModifier)
 */
export function calculateStat(baseStat: number, iv: number, level: number, natureModifier: number): number {
    return Math.floor((Math.floor((baseStat * 2 + iv) * level / 100) + 5) * natureModifier);
}

/**
 * Calculate a single stat value given all parameters.
 */
export function calculateStatValue(
    baseStat: number,
    iv: number,
    level: number,
    natureModifier: number,
    isHp: boolean,
): number {
    if (isHp) {
        return calculateHp(baseStat, iv, level);
    }
    return calculateStat(baseStat, iv, level, natureModifier);
}

/**
 * Get the range of possible stat values (IV 0 to IV 31).
 */
export function getStatRange(
    baseStat: number,
    level: number,
    natureModifier: number,
    isHp: boolean,
): StatRange {
    const min = calculateStatValue(baseStat, 0, level, natureModifier, isHp);
    const max = calculateStatValue(baseStat, 31, level, natureModifier, isHp);
    return { min, max };
}

/**
 * Estimate IV range from an actual stat value.
 * Iterates over all possible IVs (0-31) and finds which ones produce the given stat.
 */
export function estimateIv(
    actualStat: number,
    baseStat: number,
    level: number,
    natureModifier: number,
    isHp: boolean,
): IvRange {
    let min = 32;
    let max = -1;

    for (let iv = 0; iv <= 31; iv++) {
        const calculated = calculateStatValue(baseStat, iv, level, natureModifier, isHp);
        if (calculated === actualStat) {
            if (iv < min) min = iv;
            if (iv > max) max = iv;
        }
    }

    if (max === -1) {
        return { min: 0, max: 0 };
    }

    return { min, max };
}

/**
 * Calculate all stat ranges for a Pokemon at a given level and nature.
 */
export function getAllStatRanges(
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): Readonly<Record<StatKey, StatRange>> {
    return {
        hp: getStatRange(pokemon.baseStats.hp, level, getNatureModifier(nature, "hp"), true),
        attack: getStatRange(pokemon.baseStats.attack, level, getNatureModifier(nature, "attack"), false),
        defense: getStatRange(pokemon.baseStats.defense, level, getNatureModifier(nature, "defense"), false),
        spAttack: getStatRange(pokemon.baseStats.spAttack, level, getNatureModifier(nature, "spAttack"), false),
        spDefense: getStatRange(pokemon.baseStats.spDefense, level, getNatureModifier(nature, "spDefense"), false),
        speed: getStatRange(pokemon.baseStats.speed, level, getNatureModifier(nature, "speed"), false),
    };
}

/**
 * Estimate all IVs from actual stats.
 */
export function estimateAllIvs(
    actualStats: StatRecord,
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): Readonly<Record<StatKey, IvRange>> {
    return {
        hp: estimateIv(actualStats.hp, pokemon.baseStats.hp, level, getNatureModifier(nature, "hp"), true),
        attack: estimateIv(actualStats.attack, pokemon.baseStats.attack, level, getNatureModifier(nature, "attack"), false),
        defense: estimateIv(actualStats.defense, pokemon.baseStats.defense, level, getNatureModifier(nature, "defense"), false),
        spAttack: estimateIv(actualStats.spAttack, pokemon.baseStats.spAttack, level, getNatureModifier(nature, "spAttack"), false),
        spDefense: estimateIv(actualStats.spDefense, pokemon.baseStats.spDefense, level, getNatureModifier(nature, "spDefense"), false),
        speed: estimateIv(actualStats.speed, pokemon.baseStats.speed, level, getNatureModifier(nature, "speed"), false),
    };
}

/**
 * Calculate all stats from IVs.
 */
export function calculateAllStats(
    ivs: StatRecord,
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): StatRecord {
    return {
        hp: calculateHp(pokemon.baseStats.hp, ivs.hp, level),
        attack: calculateStat(pokemon.baseStats.attack, ivs.attack, level, getNatureModifier(nature, "attack")),
        defense: calculateStat(pokemon.baseStats.defense, ivs.defense, level, getNatureModifier(nature, "defense")),
        spAttack: calculateStat(pokemon.baseStats.spAttack, ivs.spAttack, level, getNatureModifier(nature, "spAttack")),
        spDefense: calculateStat(pokemon.baseStats.spDefense, ivs.spDefense, level, getNatureModifier(nature, "spDefense")),
        speed: calculateStat(pokemon.baseStats.speed, ivs.speed, level, getNatureModifier(nature, "speed")),
    };
}

/**
 * Clamp stat inputs to valid ranges when pokemon/level/nature changes.
 */
export function clampStatInputs(
    currentInputs: StatRecord,
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): StatRecord {
    const ranges = getAllStatRanges(pokemon, level, nature);

    function clamp(value: number, range: StatRange): number {
        if (value < range.min) return range.min;
        if (value > range.max) return range.max;
        return value;
    }

    return {
        hp: clamp(currentInputs.hp, ranges.hp),
        attack: clamp(currentInputs.attack, ranges.attack),
        defense: clamp(currentInputs.defense, ranges.defense),
        spAttack: clamp(currentInputs.spAttack, ranges.spAttack),
        spDefense: clamp(currentInputs.spDefense, ranges.spDefense),
        speed: clamp(currentInputs.speed, ranges.speed),
    };
}

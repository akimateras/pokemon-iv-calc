import type { IvRange, Nature, PokemonSpecies, StatKey, StatRecord } from "./types";

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
 * Estimate IV range from an actual stat value.
 * Iterates over all possible IVs (0-31) and finds which ones produce the given stat.
 */
export function estimateIv(
    actualStat: number,
    baseStat: number,
    level: number,
    natureModifier: number,
    isHp: boolean,
): IvRange | undefined {
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
        return undefined;
    }

    return { min, max };
}

/**
 * Get sorted unique achievable stat values for a single stat (IV 0-31).
 */
export function getAchievableStatValues(
    baseStat: number,
    level: number,
    natureModifier: number,
    isHp: boolean,
): readonly number[] {
    const seen = new Set<number>();
    for (let iv = 0; iv <= 31; iv++) {
        seen.add(calculateStatValue(baseStat, iv, level, natureModifier, isHp));
    }
    return [...seen].sort((a, b) => a - b);
}

/**
 * Get achievable stat values for all stats.
 */
export function getAllAchievableStatValues(
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): Readonly<Record<StatKey, readonly number[]>> {
    return {
        hp: getAchievableStatValues(pokemon.baseStats.hp, level, getNatureModifier(nature, "hp"), true),
        attack: getAchievableStatValues(pokemon.baseStats.attack, level, getNatureModifier(nature, "attack"), false),
        defense: getAchievableStatValues(pokemon.baseStats.defense, level, getNatureModifier(nature, "defense"), false),
        spAttack: getAchievableStatValues(pokemon.baseStats.spAttack, level, getNatureModifier(nature, "spAttack"), false),
        spDefense: getAchievableStatValues(pokemon.baseStats.spDefense, level, getNatureModifier(nature, "spDefense"), false),
        speed: getAchievableStatValues(pokemon.baseStats.speed, level, getNatureModifier(nature, "speed"), false),
    };
}

/**
 * Snap a value to the nearest value in a sorted array.
 * The array must be non-empty.
 */
export function snapToNearestValue(value: number, sortedValues: readonly number[]): number {
    let closest = value;
    let minDiff = Infinity;
    for (const v of sortedValues) {
        const diff = Math.abs(value - v);
        if (diff < minDiff) {
            minDiff = diff;
            closest = v;
        }
    }
    return closest;
}

/**
 * Estimate all IVs from actual stats.
 */
export function estimateAllIvs(
    actualStats: StatRecord,
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): Readonly<Record<StatKey, IvRange | undefined>> {
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
 * Snap stat inputs to nearest achievable values when pokemon/level/nature changes.
 */
export function clampStatInputs(
    currentInputs: StatRecord,
    pokemon: PokemonSpecies,
    level: number,
    nature: Nature,
): StatRecord {
    const achievable = getAllAchievableStatValues(pokemon, level, nature);
    return {
        hp: snapToNearestValue(currentInputs.hp, achievable.hp),
        attack: snapToNearestValue(currentInputs.attack, achievable.attack),
        defense: snapToNearestValue(currentInputs.defense, achievable.defense),
        spAttack: snapToNearestValue(currentInputs.spAttack, achievable.spAttack),
        spDefense: snapToNearestValue(currentInputs.spDefense, achievable.spDefense),
        speed: snapToNearestValue(currentInputs.speed, achievable.speed),
    };
}

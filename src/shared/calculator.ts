import type { IvRange, Nature, PokemonSpecies, StatKey, StatRecord } from "./types";

const ZERO_EVS: StatRecord = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 };

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
 * Formula: floor((base * 2 + iv + floor(ev / 4)) * level / 100) + level + 10
 */
export function calculateHp(baseStat: number, iv: number, level: number, ev = 0): number {
    return Math.floor((baseStat * 2 + iv + Math.floor(ev / 4)) * level / 100) + level + 10;
}

/**
 * Calculate non-HP stat value.
 * Formula: floor((floor((base * 2 + iv + floor(ev / 4)) * level / 100) + 5) * natureModifier)
 */
export function calculateStat(baseStat: number, iv: number, level: number, natureModifier: number, ev = 0): number {
    return Math.floor((Math.floor((baseStat * 2 + iv + Math.floor(ev / 4)) * level / 100) + 5) * natureModifier);
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
    ev = 0,
): number {
    if (isHp) {
        return calculateHp(baseStat, iv, level, ev);
    }
    return calculateStat(baseStat, iv, level, natureModifier, ev);
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
    ev = 0,
): IvRange | undefined {
    let min = 32;
    let max = -1;

    for (let iv = 0; iv <= 31; iv++) {
        const calculated = calculateStatValue(baseStat, iv, level, natureModifier, isHp, ev);
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
    ev = 0,
): readonly number[] {
    const seen = new Set<number>();
    for (let iv = 0; iv <= 31; iv++) {
        seen.add(calculateStatValue(baseStat, iv, level, natureModifier, isHp, ev));
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
    evs: StatRecord = ZERO_EVS,
): Readonly<Record<StatKey, readonly number[]>> {
    return {
        hp: getAchievableStatValues(pokemon.baseStats.hp, level, getNatureModifier(nature, "hp"), true, evs.hp),
        attack: getAchievableStatValues(pokemon.baseStats.attack, level, getNatureModifier(nature, "attack"), false, evs.attack),
        defense: getAchievableStatValues(pokemon.baseStats.defense, level, getNatureModifier(nature, "defense"), false, evs.defense),
        spAttack: getAchievableStatValues(pokemon.baseStats.spAttack, level, getNatureModifier(nature, "spAttack"), false, evs.spAttack),
        spDefense: getAchievableStatValues(pokemon.baseStats.spDefense, level, getNatureModifier(nature, "spDefense"), false, evs.spDefense),
        speed: getAchievableStatValues(pokemon.baseStats.speed, level, getNatureModifier(nature, "speed"), false, evs.speed),
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
    evs: StatRecord = ZERO_EVS,
): Readonly<Record<StatKey, IvRange | undefined>> {
    return {
        hp: estimateIv(actualStats.hp, pokemon.baseStats.hp, level, getNatureModifier(nature, "hp"), true, evs.hp),
        attack: estimateIv(actualStats.attack, pokemon.baseStats.attack, level, getNatureModifier(nature, "attack"), false, evs.attack),
        defense: estimateIv(actualStats.defense, pokemon.baseStats.defense, level, getNatureModifier(nature, "defense"), false, evs.defense),
        spAttack: estimateIv(actualStats.spAttack, pokemon.baseStats.spAttack, level, getNatureModifier(nature, "spAttack"), false, evs.spAttack),
        spDefense: estimateIv(actualStats.spDefense, pokemon.baseStats.spDefense, level, getNatureModifier(nature, "spDefense"), false, evs.spDefense),
        speed: estimateIv(actualStats.speed, pokemon.baseStats.speed, level, getNatureModifier(nature, "speed"), false, evs.speed),
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
    evs: StatRecord = ZERO_EVS,
): StatRecord {
    return {
        hp: calculateHp(pokemon.baseStats.hp, ivs.hp, level, evs.hp),
        attack: calculateStat(pokemon.baseStats.attack, ivs.attack, level, getNatureModifier(nature, "attack"), evs.attack),
        defense: calculateStat(pokemon.baseStats.defense, ivs.defense, level, getNatureModifier(nature, "defense"), evs.defense),
        spAttack: calculateStat(pokemon.baseStats.spAttack, ivs.spAttack, level, getNatureModifier(nature, "spAttack"), evs.spAttack),
        spDefense: calculateStat(pokemon.baseStats.spDefense, ivs.spDefense, level, getNatureModifier(nature, "spDefense"), evs.spDefense),
        speed: calculateStat(pokemon.baseStats.speed, ivs.speed, level, getNatureModifier(nature, "speed"), evs.speed),
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
    evs: StatRecord = ZERO_EVS,
): StatRecord {
    const achievable = getAllAchievableStatValues(pokemon, level, nature, evs);
    return {
        hp: snapToNearestValue(currentInputs.hp, achievable.hp),
        attack: snapToNearestValue(currentInputs.attack, achievable.attack),
        defense: snapToNearestValue(currentInputs.defense, achievable.defense),
        spAttack: snapToNearestValue(currentInputs.spAttack, achievable.spAttack),
        spDefense: snapToNearestValue(currentInputs.spDefense, achievable.spDefense),
        speed: snapToNearestValue(currentInputs.speed, achievable.speed),
    };
}

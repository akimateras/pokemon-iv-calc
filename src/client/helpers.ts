import type { Nature, StatKey } from "../shared/types";

/**
 * Returns a CSS class name for a stat label based on nature modifier.
 * Increased stat → "stat-label-increased" (red)
 * Decreased stat → "stat-label-decreased" (blue)
 * Neutral / HP   → ""
 */
export function statNatureClassName(nature: Nature, key: StatKey): string {
    if (key === "hp") return "";
    if (nature.increased === key && nature.decreased !== key) return "stat-label-increased";
    if (nature.decreased === key && nature.increased !== key) return "stat-label-decreased";
    return "";
}

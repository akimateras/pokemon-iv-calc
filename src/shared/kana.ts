// Kana/romaji prefix matching for Japanese IME-style input.
// Supports hiragana, katakana (full/half-width), romaji, and mixed input.

// ---------------------------------------------------------------------------
// Half-width katakana → full-width katakana mapping
// ---------------------------------------------------------------------------

const HW_KANA = new Map<number, string>([
    [0xFF66, "ヲ"],
    [0xFF67, "ァ"],
    [0xFF68, "ィ"],
    [0xFF69, "ゥ"],
    [0xFF6A, "ェ"],
    [0xFF6B, "ォ"],
    [0xFF6C, "ャ"],
    [0xFF6D, "ュ"],
    [0xFF6E, "ョ"],
    [0xFF6F, "ッ"],
    [0xFF70, "ー"],
    [0xFF71, "ア"],
    [0xFF72, "イ"],
    [0xFF73, "ウ"],
    [0xFF74, "エ"],
    [0xFF75, "オ"],
    [0xFF76, "カ"],
    [0xFF77, "キ"],
    [0xFF78, "ク"],
    [0xFF79, "ケ"],
    [0xFF7A, "コ"],
    [0xFF7B, "サ"],
    [0xFF7C, "シ"],
    [0xFF7D, "ス"],
    [0xFF7E, "セ"],
    [0xFF7F, "ソ"],
    [0xFF80, "タ"],
    [0xFF81, "チ"],
    [0xFF82, "ツ"],
    [0xFF83, "テ"],
    [0xFF84, "ト"],
    [0xFF85, "ナ"],
    [0xFF86, "ニ"],
    [0xFF87, "ヌ"],
    [0xFF88, "ネ"],
    [0xFF89, "ノ"],
    [0xFF8A, "ハ"],
    [0xFF8B, "ヒ"],
    [0xFF8C, "フ"],
    [0xFF8D, "ヘ"],
    [0xFF8E, "ホ"],
    [0xFF8F, "マ"],
    [0xFF90, "ミ"],
    [0xFF91, "ム"],
    [0xFF92, "メ"],
    [0xFF93, "モ"],
    [0xFF94, "ヤ"],
    [0xFF95, "ユ"],
    [0xFF96, "ヨ"],
    [0xFF97, "ラ"],
    [0xFF98, "リ"],
    [0xFF99, "ル"],
    [0xFF9A, "レ"],
    [0xFF9B, "ロ"],
    [0xFF9C, "ワ"],
    [0xFF9D, "ン"],
]);

// Half-width kana base → dakuten (゛) combined form
const HW_DAKUTEN = new Map<number, string>([
    [0xFF76, "ガ"],
    [0xFF77, "ギ"],
    [0xFF78, "グ"],
    [0xFF79, "ゲ"],
    [0xFF7A, "ゴ"],
    [0xFF7B, "ザ"],
    [0xFF7C, "ジ"],
    [0xFF7D, "ズ"],
    [0xFF7E, "ゼ"],
    [0xFF7F, "ゾ"],
    [0xFF80, "ダ"],
    [0xFF81, "ヂ"],
    [0xFF82, "ヅ"],
    [0xFF83, "デ"],
    [0xFF84, "ド"],
    [0xFF8A, "バ"],
    [0xFF8B, "ビ"],
    [0xFF8C, "ブ"],
    [0xFF8D, "ベ"],
    [0xFF8E, "ボ"],
    [0xFF73, "ヴ"],
]);

// Half-width kana base → handakuten (゜) combined form
const HW_HANDAKUTEN = new Map<number, string>([
    [0xFF8A, "パ"], [0xFF8B, "ピ"], [0xFF8C, "プ"], [0xFF8D, "ペ"], [0xFF8E, "ポ"],
]);

// ---------------------------------------------------------------------------
// Input normalization
// ---------------------------------------------------------------------------

export function normalizeInput(input: string): string {
    let result = "";
    for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);

        // Full-width uppercase romaji (Ａ-Ｚ) → lowercase ascii
        if (code >= 0xFF21 && code <= 0xFF3A) {
            result += String.fromCharCode(code - 0xFEE0 + 32); // to lowercase
            continue;
        }
        // Full-width lowercase romaji (ａ-ｚ) → lowercase ascii
        if (code >= 0xFF41 && code <= 0xFF5A) {
            result += String.fromCharCode(code - 0xFEE0);
            continue;
        }
        // ASCII uppercase → lowercase
        if (code >= 0x41 && code <= 0x5A) {
            result += String.fromCharCode(code + 32);
            continue;
        }
        // Hiragana (ぁ-ゖ) → katakana
        if (code >= 0x3041 && code <= 0x3096) {
            result += String.fromCharCode(code + 0x60);
            continue;
        }
        // Half-width katakana
        if (code >= 0xFF65 && code <= 0xFF9F) {
            const nextCode = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
            // Dakuten combining mark follows
            if (nextCode === 0xFF9E) {
                const combined = HW_DAKUTEN.get(code);
                if (combined !== undefined) {
                    result += combined;
                    i++; // skip the combining mark
                    continue;
                }
            }
            // Handakuten combining mark follows
            if (nextCode === 0xFF9F) {
                const combined = HW_HANDAKUTEN.get(code);
                if (combined !== undefined) {
                    result += combined;
                    i++; // skip the combining mark
                    continue;
                }
            }
            // Plain half-width kana
            const fw = HW_KANA.get(code);
            if (fw !== undefined) {
                result += fw;
                continue;
            }
        }

        // Pass through everything else (ascii lowercase, katakana, symbols, etc.)
        result += input.charAt(i);
    }
    return result;
}

// ---------------------------------------------------------------------------
// Romaji tables
// ---------------------------------------------------------------------------

// Single kana → romaji options
const SINGLE_TABLE: ReadonlyMap<string, readonly string[]> = new Map([
    // Vowels
    ["ア", ["a"]],
    ["イ", ["i", "yi"]],
    ["ウ", ["u", "wu"]],
    ["エ", ["e"]],
    ["オ", ["o"]],
    // K row
    ["カ", ["ka", "ca"]],
    ["キ", ["ki"]],
    ["ク", ["ku", "cu", "qu"]],
    ["ケ", ["ke"]],
    ["コ", ["ko", "co"]],
    // S row
    ["サ", ["sa"]],
    ["シ", ["si", "shi", "ci"]],
    ["ス", ["su"]],
    ["セ", ["se", "ce"]],
    ["ソ", ["so"]],
    // T row
    ["タ", ["ta"]],
    ["チ", ["ti", "chi"]],
    ["ツ", ["tu", "tsu"]],
    ["テ", ["te"]],
    ["ト", ["to"]],
    // N row
    ["ナ", ["na"]],
    ["ニ", ["ni"]],
    ["ヌ", ["nu"]],
    ["ネ", ["ne"]],
    ["ノ", ["no"]],
    // H row
    ["ハ", ["ha"]],
    ["ヒ", ["hi"]],
    ["フ", ["hu", "fu"]],
    ["ヘ", ["he"]],
    ["ホ", ["ho"]],
    // M row
    ["マ", ["ma"]],
    ["ミ", ["mi"]],
    ["ム", ["mu"]],
    ["メ", ["me"]],
    ["モ", ["mo"]],
    // Y row
    ["ヤ", ["ya"]],
    ["ユ", ["yu"]],
    ["ヨ", ["yo"]],
    // R row (l = ra-row per project requirement)
    ["ラ", ["ra", "la"]],
    ["リ", ["ri", "li"]],
    ["ル", ["ru", "lu"]],
    ["レ", ["re", "le"]],
    ["ロ", ["ro", "lo"]],
    // W row
    ["ワ", ["wa"]],
    ["ヲ", ["wo"]],
    // N (context-dependent "n" handled in getChunks)
    ["ン", ["nn", "xn"]],
    // G row
    ["ガ", ["ga"]],
    ["ギ", ["gi"]],
    ["グ", ["gu"]],
    ["ゲ", ["ge"]],
    ["ゴ", ["go"]],
    // Z row
    ["ザ", ["za"]],
    ["ジ", ["zi", "ji"]],
    ["ズ", ["zu"]],
    ["ゼ", ["ze"]],
    ["ゾ", ["zo"]],
    // D row
    ["ダ", ["da"]],
    ["ヂ", ["di"]],
    ["ヅ", ["du"]],
    ["デ", ["de"]],
    ["ド", ["do"]],
    // B row
    ["バ", ["ba"]],
    ["ビ", ["bi"]],
    ["ブ", ["bu"]],
    ["ベ", ["be"]],
    ["ボ", ["bo"]],
    // P row
    ["パ", ["pa"]],
    ["ピ", ["pi"]],
    ["プ", ["pu"]],
    ["ペ", ["pe"]],
    ["ポ", ["po"]],
    // Small kana (x = small marker, l = also small per project requirement)
    ["ァ", ["xa", "la"]],
    ["ィ", ["xi", "li"]],
    ["ゥ", ["xu", "lu"]],
    ["ェ", ["xe", "le"]],
    ["ォ", ["xo", "lo"]],
    ["ャ", ["xya", "lya"]],
    ["ュ", ["xyu", "lyu"]],
    ["ョ", ["xyo", "lyo"]],
    ["ッ", ["xtu", "ltu", "xtsu", "ltsu"]],
    // Special
    ["ー", ["-"]],
    ["ヴ", ["vu"]],
    // Symbols with readings
    ["♂", ["osu"]],
    ["♀", ["mesu"]],
]);

// Digraph (2-char kana) → romaji options
const DIGRAPH_TABLE: ReadonlyMap<string, readonly string[]> = new Map([
    // K + small ya/yu/yo
    ["キャ", ["kya"]],
    ["キュ", ["kyu"]],
    ["キョ", ["kyo"]],
    // S + small ya/yu/yo
    ["シャ", ["sha", "sya"]],
    ["シュ", ["shu", "syu"]],
    ["ショ", ["sho", "syo"]],
    ["シェ", ["she", "sye"]],
    // T + small ya/yu/yo
    ["チャ", ["cha", "tya", "cya"]],
    ["チュ", ["chu", "tyu", "cyu"]],
    ["チョ", ["cho", "tyo", "cyo"]],
    ["チェ", ["che", "tye"]],
    // N + small ya/yu/yo
    ["ニャ", ["nya"]],
    ["ニュ", ["nyu"]],
    ["ニョ", ["nyo"]],
    // H + small ya/yu/yo
    ["ヒャ", ["hya"]],
    ["ヒュ", ["hyu"]],
    ["ヒョ", ["hyo"]],
    // M + small ya/yu/yo
    ["ミャ", ["mya"]],
    ["ミュ", ["myu"]],
    ["ミョ", ["myo"]],
    // R + small ya/yu/yo (l = ra-row)
    ["リャ", ["rya", "lya"]],
    ["リュ", ["ryu", "lyu"]],
    ["リョ", ["ryo", "lyo"]],
    // G + small ya/yu/yo
    ["ギャ", ["gya"]],
    ["ギュ", ["gyu"]],
    ["ギョ", ["gyo"]],
    // Z/J + small ya/yu/yo
    ["ジャ", ["ja", "zya", "jya"]],
    ["ジュ", ["ju", "zyu", "jyu"]],
    ["ジョ", ["jo", "zyo", "jyo"]],
    ["ジェ", ["je", "zye", "jye"]],
    // B + small ya/yu/yo
    ["ビャ", ["bya"]],
    ["ビュ", ["byu"]],
    ["ビョ", ["byo"]],
    // P + small ya/yu/yo
    ["ピャ", ["pya"]],
    ["ピュ", ["pyu"]],
    ["ピョ", ["pyo"]],
    // Modern digraphs (foreign sounds)
    ["ティ", ["thi"]],
    ["テュ", ["thu"]],
    ["ディ", ["dhi"]],
    ["デュ", ["dhu"]],
    ["トゥ", ["twu"]],
    ["ドゥ", ["dwu"]],
    ["ファ", ["fa"]],
    ["フィ", ["fi"]],
    ["フェ", ["fe"]],
    ["フォ", ["fo"]],
    ["ヴァ", ["va"]],
    ["ヴィ", ["vi"]],
    ["ヴェ", ["ve"]],
    ["ヴォ", ["vo"]],
    ["ウィ", ["wi"]],
    ["ウェ", ["we"]],
    ["ウォ", ["who"]],
]);

// ---------------------------------------------------------------------------
// Katakana readings for non-kana characters.
// Used to match kana input (e.g., おす → ♂) via reading expansion.
// ---------------------------------------------------------------------------

const READING_TABLE = new Map<string, string>([
    ["♂", "オス"],
    ["♀", "メス"],
]);

// ---------------------------------------------------------------------------
// Kana that forbid single "n" for preceding ン
// If ン is followed by one of these, single "n" is ambiguous and not allowed.
// ---------------------------------------------------------------------------

const N_AMBIGUOUS_FOLLOWERS = new Set([
    // Vowels (na → ナ, not ン+ア)
    "ア",
    "イ",
    "ウ",
    "エ",
    "オ",
    // Na row (nna could be ンア via nn+a, not ン+ナ)
    "ナ",
    "ニ",
    "ヌ",
    "ネ",
    "ノ",
    // Ya row (nya → ニャ, not ン+ヤ)
    "ヤ",
    "ユ",
    "ヨ",
    // ン itself (nn → ン, so n before ン is ambiguous)
    "ン",
]);

// ---------------------------------------------------------------------------
// Character classification helpers
// ---------------------------------------------------------------------------

function isKatakana(code: number): boolean {
    return (code >= 0x30A0 && code <= 0x30FF) || code === 0x30FC; // katakana block + ー
}

function isAsciiLower(code: number): boolean {
    return code >= 0x61 && code <= 0x7A; // a-z
}

function isConsonant(ch: string): boolean {
    const c = ch.charCodeAt(0);
    return isAsciiLower(c) && ch !== "a" && ch !== "i" && ch !== "u" && ch !== "e" && ch !== "o";
}

// ---------------------------------------------------------------------------
// Chunk generation
// ---------------------------------------------------------------------------

interface Chunk {
    readonly kanaLength: number;
    readonly romajiOptions: readonly string[];
}

function getChunks(target: string, pos: number): readonly Chunk[] {
    const results: Chunk[] = [];
    const ch = target[pos];
    if (ch === undefined) return results;

    const next = pos + 1 < target.length ? target[pos + 1] : undefined;

    // 1. Digraph (2-char kana combination)
    if (next !== undefined) {
        const digraphRomaji = DIGRAPH_TABLE.get(ch + next);
        if (digraphRomaji !== undefined) {
            results.push({ kanaLength: 2, romajiOptions: digraphRomaji });
        }
    }

    // 2. ッ (sokuon / geminate consonant)
    if (ch === "ッ" && next !== undefined) {
        const nextChunks = getChunks(target, pos + 1);
        for (const nextChunk of nextChunks) {
            const doubled: string[] = [];
            for (const r of nextChunk.romajiOptions) {
                const first = r.charAt(0);
                if (first !== "" && isConsonant(first)) {
                    doubled.push(first + r);
                }
            }
            if (doubled.length > 0) {
                results.push({ kanaLength: 1 + nextChunk.kanaLength, romajiOptions: doubled });
            }
        }
    }

    // 3. ン with context-dependent single "n"
    if (ch === "ン") {
        const base = SINGLE_TABLE.get("ン");
        if (base !== undefined) {
            const singleNAllowed = next === undefined || !N_AMBIGUOUS_FOLLOWERS.has(next);
            if (singleNAllowed) {
                results.push({ kanaLength: 1, romajiOptions: ["n", ...base] });
            } else {
                results.push({ kanaLength: 1, romajiOptions: base });
            }
        }
        return results; // ン has no other single-kana interpretation
    }

    // 4. Single kana
    const singleRomaji = SINGLE_TABLE.get(ch);
    if (singleRomaji !== undefined) {
        results.push({ kanaLength: 1, romajiOptions: singleRomaji });
    }

    // 5. Literal fallback (♀, ♂, numbers, etc.)
    if (results.length === 0) {
        results.push({ kanaLength: 1, romajiOptions: [ch] });
    }

    return results;
}

// ---------------------------------------------------------------------------
// Recursive prefix matching
// ---------------------------------------------------------------------------

// Match input against a reading expansion of a target character.
// reading = the katakana reading (e.g., "オス" for ♂), rPos = position within reading.
// Once the reading is fully consumed, continues matching the rest of the target.
function matchAtReading(
    input: string, target: string,
    iPos: number, tPos: number,
    reading: string, rPos: number,
): boolean {
    if (rPos >= reading.length) {
        return matchAt(input, target, iPos, tPos + 1);
    }
    if (iPos >= input.length) return true; // input consumed mid-reading = valid prefix

    const code = input.charCodeAt(iPos);

    if (isKatakana(code)) {
        return input.charAt(iPos) === reading.charAt(rPos)
            && matchAtReading(input, target, iPos + 1, tPos, reading, rPos + 1);
    }

    if (isAsciiLower(code) || input.charAt(iPos) === "-") {
        const chunks = getChunks(reading, rPos);
        const remaining = input.length - iPos;

        for (const chunk of chunks) {
            for (const romaji of chunk.romajiOptions) {
                if (remaining >= romaji.length) {
                    let match = true;
                    for (let k = 0; k < romaji.length; k++) {
                        if (input.charAt(iPos + k) !== romaji.charAt(k)) {
                            match = false;
                            break;
                        }
                    }
                    if (match && matchAtReading(input, target, iPos + romaji.length, tPos, reading, rPos + chunk.kanaLength)) {
                        return true;
                    }
                } else {
                    let prefixMatch = true;
                    for (let k = 0; k < remaining; k++) {
                        if (input.charAt(iPos + k) !== romaji.charAt(k)) {
                            prefixMatch = false;
                            break;
                        }
                    }
                    if (prefixMatch) return true;
                }
            }
        }
        return false;
    }

    return false;
}

function matchAt(input: string, target: string, iPos: number, tPos: number): boolean {
    if (iPos >= input.length) return true;  // all input consumed = valid prefix
    if (tPos >= target.length) return false; // target exhausted, input remains

    const code = input.charCodeAt(iPos);

    // Direct katakana match
    if (isKatakana(code)) {
        if (input.charAt(iPos) === target.charAt(tPos)) {
            return matchAt(input, target, iPos + 1, tPos + 1);
        }
        // Try reading-based match (e.g., input オス against target ♂)
        const reading = READING_TABLE.get(target.charAt(tPos));
        if (reading !== undefined) {
            return matchAtReading(input, target, iPos, tPos, reading, 0);
        }
        return false;
    }

    // Romaji match
    if (isAsciiLower(code) || input[iPos] === "-") {
        const chunks = getChunks(target, tPos);
        const remaining = input.length - iPos;

        for (const chunk of chunks) {
            for (const romaji of chunk.romajiOptions) {
                if (remaining >= romaji.length) {
                    // Input has enough chars — check full romaji match
                    let match = true;
                    for (let k = 0; k < romaji.length; k++) {
                        if (input[iPos + k] !== romaji[k]) {
                            match = false;
                            break;
                        }
                    }
                    if (match && matchAt(input, target, iPos + romaji.length, tPos + chunk.kanaLength)) {
                        return true;
                    }
                } else {
                    // Input is shorter — check if input is a prefix of this romaji
                    let prefixMatch = true;
                    for (let k = 0; k < remaining; k++) {
                        if (input[iPos + k] !== romaji[k]) {
                            prefixMatch = false;
                            break;
                        }
                    }
                    if (prefixMatch) return true;
                }
            }
        }
        return false;
    }

    // Literal match (♀, ♂, digits, etc.)
    return input[iPos] === target[tPos] && matchAt(input, target, iPos + 1, tPos + 1);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function matchesKanaRomaji(input: string, target: string): boolean {
    if (input.length === 0) return true;
    const normalizedInput = normalizeInput(input);
    if (normalizedInput.length === 0) return true;
    const normalizedTarget = normalizeInput(target);
    return matchAt(normalizedInput, normalizedTarget, 0, 0);
}

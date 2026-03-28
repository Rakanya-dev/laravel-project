// --- TABLES ---

// ORDER: 0:GrossMotor, 1:FineMotor, 2:SelfHelp, 3:Expressive, 4:Cognitive, 5:SocioEmotional, 6:Receptive

// Age Group 3.1 - 4.0 Years
const TABLE_3_4: Record<number, (number[] | null)[]> = {
    1: [[0, 3], null, [0, 9], [0, 2], null, [0, 9], null],
    2: [[4, 4], [0, 3], [10, 10], null, null, [10, 11], null],
    3: [[5, 5], null, [11, 11], [3, 3], [0, 0], [12, 12], [0, 1]],
    4: [null, [4, 4], [12, 12], [4, 4], [1, 1], [13, 13], null],
    5: [[6, 6], [5, 5], [13, 14], null, [2, 3], [14, 14], [2, 2]],
    6: [[7, 7], null, [15, 15], [5, 5], [4, 4], [15, 15], null],
    7: [[8, 8], [6, 6], [16, 16], null, [5, 5], [16, 16], [3, 3]],
    8: [[9, 9], null, [17, 17], [6, 6], [6, 6], [17, 18], null],
    9: [null, [7, 7], [18, 19], null, [7, 7], [19, 19], null],
    10: [
        [10, 10],
        [8, 8],
        [20, 20],
        [7, 7],
        [8, 9],
        [20, 20],
        [4, 4],
    ],
    11: [[11, 11], null, [21, 21], null, [10, 10], [21, 21], null],
    // 👇 Fixed: Socio-Emotional (Col 5) Raw 22 is now 13 (Moved from 12)
    12: [[12, 12], [9, 9], [22, 22], [8, 8], [11, 11], null, [5, 5]],
    13: [null, null, [23, 24], null, [12, 12], [22, 23], null],
    14: [[13, 13], [10, 10], [25, 25], null, [13, 14], [24, 24], null],
    15: [null, [11, 11], [26, 26], null, [15, 15], null, null],
    16: [null, null, [27, 27], null, [16, 16], null, null],
    17: [null, null, null, null, [17, 17], null, null],
    18: [null, null, null, null, [18, 18], null, null],
    19: [null, null, null, null, [19, 21], null, null],
};

// Age Group 4.1 - 5.0 Years
// Reordered: GM, FM, SH, EL, Cog, SE, RL
const TABLE_4_5: Record<number, (number[] | null)[]> = {
    1: [
        [0, 5],
        [0, 3],
        [0, 15],
        [0, 0],
        [0, 0],
        [0, 13],
        [0, 1],
    ],
    2: [[6, 6], [4, 4], [16, 16], [1, 5], [1, 1], [14, 14], null],
    3: [[7, 7], [5, 5], [17, 17], null, [2, 3], [15, 15], [2, 2]],
    4: [[8, 8], [6, 6], [18, 18], [6, 6], [4, 4], [16, 16], null],
    5: [[9, 9], [7, 7], [19, 19], null, [5, 5], [17, 17], [3, 3]],
    6: [[10, 10], null, [20, 20], [7, 7], [6, 7], [18, 18], null],
    7: [null, [8, 8], [21, 21], null, [8, 8], [19, 19], null],
    8: [
        [11, 11],
        [9, 9],
        [22, 22],
        [8, 8],
        [9, 10],
        [20, 20],
        [4, 4],
    ],
    9: [[12, 12], null, [23, 23], null, [11, 11], [21, 21], [5, 5]],
    10: [[13, 13], [10, 10], [24, 24], null, [12, 12], [22, 22], null],
    11: [null, [11, 11], [25, 25], null, [13, 14], [23, 23], null],
    12: [null, null, [26, 26], null, [15, 15], [24, 24], null],
    13: [null, null, [27, 27], null, [16, 17], null, null],
    14: [null, null, null, null, [18, 18], null, null],
    15: [null, null, null, null, [19, 20], null, null],
    16: [null, null, null, null, [21, 21], null, null],
};

// Maps messy strings ("Socio-Emotional", "socio emotional", "Receptive Language") to the correct column index
const NORMALIZED_DOMAIN_INDEX: Record<string, number> = {
    grossmotor: 0,
    finemotor: 1,
    selfhelp: 2,
    expressivelanguage: 3, // Moved to 3 to match image
    cognitive: 4, // Moved to 4
    socioemotional: 5, // Moved to 5 (Fixed!)
    socialemotional: 5, // Alias
    receptivelanguage: 6, // Moved to last
};

// Standard Score Table (Sum -> Standard)
const STANDARD_SCORE_MAP: Record<number, number> = {
    64: 88,
    65: 89,
    66: 91,
    67: 92,
    68: 94,
    69: 95,
    70: 97,
    71: 98,
    72: 100,
    73: 101,
    74: 103,
    75: 104,
    76: 105,
    77: 106,
    78: 107,
    79: 110,
    80: 111,
    81: 113,
    82: 114,
    83: 116,
    84: 117,
    85: 119,
    86: 120,
    87: 122,
    88: 123,
    89: 124,
    90: 126,
    91: 127,
    92: 129,
    93: 130,
    94: 132,
    95: 133,
    96: 135,
    97: 136,
    98: 138,
};

// --- LOGIC ---

export function getScaledScore(domainName: string, rawScore: number, ageYears: number, ageMonths: number): number {
    const totalMonths = ageYears * 12 + ageMonths;

    // 🚀 ITED Logic: Under 36 months
    if (totalMonths < 36) {
        // For ITED, the "Scaled Score" is simply the raw count of milestones passed.
        return rawScore;
    }

    // 🚀 ECCD Logic: 36 months and above
    const table = totalMonths >= 49 ? TABLE_4_5 : TABLE_3_4;
    const cleanName = domainName.toLowerCase().replace(/[^a-z]/g, '');
    const colIndex = NORMALIZED_DOMAIN_INDEX[cleanName];

    if (colIndex === undefined) return 0;

    const scaledKeys = Object.keys(table)
        .map(Number)
        .sort((a, b) => a - b);
    let lastKnownScaled = 0;
    let maxRawInTable = 0;

    for (const sScore of scaledKeys) {
        const range = table[sScore][colIndex];
        if (!range) continue;
        if (rawScore >= range[0] && rawScore <= range[1]) return sScore;
        lastKnownScaled = sScore;
        maxRawInTable = range[1];
    }

    return rawScore > maxRawInTable ? lastKnownScaled : 1;
}

export function getStandardScore(sumOfScaled: number): number {
    if (sumOfScaled === 0) return 0;
    if (sumOfScaled < 29) return 69;
    if (sumOfScaled > 98) return 138;

    return STANDARD_SCORE_MAP[sumOfScaled] || 69;
}

// Update the Overall Interpretation to be robust
export function getOverallInterpretation(score: number, ageYears: number, ageMonths: number, totalMax: number = 0): string {
    const totalMonths = ageYears * 12 + ageMonths;

    if (totalMonths < 36) {
        if (totalMax === 0) return 'Incomplete';
        const percentage = (score / totalMax) * 100;

        // ITED Overall Phrasing
        if (percentage >= 90) return 'Advanced Development';
        if (percentage >= 75) return 'On Track';
        if (percentage >= 50) return 'Monitor Progress';
        return 'Needs Intervention';
    }

    // ECCD Overall Logic (Standard Score)
    if (score === 0) return 'Not Started';
    if (score <= 69) return 'Monitor (3mo)';
    if (score <= 79) return 'Monitor (6mo)';
    if (score <= 119) return 'Average';
    if (score <= 129) return 'Slightly Adv.';
    return 'Highly Adv.';
}

/**
 * 📊 ECCD (3-5y) Domain-Level Interpretation
 * Based on the 1-19 Scaled Score standard.
 */
export function getEccdDomainInterpretation(scaledScore: number): string {
    if (scaledScore === 0) return 'N/A';
    if (scaledScore <= 3) return 'Significant Delay';
    if (scaledScore <= 6) return 'Slight Delay';
    if (scaledScore <= 13) return 'Average';
    if (scaledScore <= 16) return 'Slightly Advanced';
    return 'Highly Advanced';
}

/**
 * 👶 ITED (0-3y) Domain-Level Interpretation
 * Based on percentage of milestones achieved.
 */
export function getItedDomainInterpretation(score: number, max: number): string {
    if (max <= 0) return 'N/A';
    const percentage = (score / max) * 100;

    if (percentage >= 90) return 'Highly Proficient';
    if (percentage >= 75) return 'Proficient';
    if (percentage >= 50) return 'Developing';
    return 'Needs Monitoring';
}

export function getNextDueDate(standardScore: number, dateCreated: string): string {
    if (!standardScore || !dateCreated) return '';
    const date = new Date(dateCreated);

    if (standardScore === 0) return '';

    if (standardScore <= 69) date.setMonth(date.getMonth() + 3);
    else if (standardScore <= 79) date.setMonth(date.getMonth() + 6);
    else date.setFullYear(date.getFullYear() + 1);

    return date.toISOString().split('T')[0];
}

export function getItedSummary(scores: { score: number; max_score: number }[]) {
    const totalRaw = scores.reduce((sum, s) => sum + s.score, 0);
    const totalMax = scores.reduce((sum, s) => sum + s.max_score, 0);

    // Calculate overall percentage
    const percentage = totalMax > 0 ? (totalRaw / totalMax) * 100 : 0;

    return {
        totalScore: totalRaw,
        percentage: Math.round(percentage),
        interpretation: percentage >= 90 ? 'On Track' : percentage >= 70 ? 'Monitor' : 'At Risk',
    };
}

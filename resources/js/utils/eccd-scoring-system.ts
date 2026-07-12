// --- TABLES ---
export interface ScaleRule {
    domain_id: number;
    min_months_age: number;
    max_months_age: number;
    min_raw_score: number;
    max_raw_score: number;
    scaled_score: number;
}

export interface StandardRule {
    sum_scaled_score: number;
    standard_score: number;
}

export function getScaledScore(
    domainId: number,
    rawScore: number,
    ageYears: number,
    ageMonths: number,
    scaleRules: ScaleRule[]
): number {
    const totalMonths = ageYears * 12 + ageMonths;

    // ITED Logic: Under 36 months
    if (totalMonths < 36) {
        return rawScore;
    }

    const applicableRules = scaleRules.filter(r =>
        r.domain_id === domainId &&
        totalMonths >= r.min_months_age &&
        totalMonths <= r.max_months_age
    );

    if (applicableRules.length === 0) {
        return rawScore;
    }

    const match = applicableRules.find(r => rawScore >= r.min_raw_score && rawScore <= r.max_raw_score);
    if (match) return match.scaled_score;

    const maxRule = applicableRules.reduce((prev, current) => (prev.max_raw_score > current.max_raw_score) ? prev : current);
    if (rawScore > maxRule.max_raw_score) return maxRule.scaled_score;

    return 1;
}

export function getStandardScore(sumOfScaled: number, standardRules: StandardRule[]): number {
    if (sumOfScaled === 0) return 0;

    const match = standardRules.find(r => r.sum_scaled_score === sumOfScaled);
    if (match) return match.standard_score;

    if (standardRules.length > 0) {
        const minSum = Math.min(...standardRules.map(r => r.sum_scaled_score));
        const maxSum = Math.max(...standardRules.map(r => r.sum_scaled_score));

        const minStandard = standardRules.find(r => r.sum_scaled_score === minSum)?.standard_score || 69;
        const maxStandard = standardRules.find(r => r.sum_scaled_score === maxSum)?.standard_score || 138;

        if (sumOfScaled < minSum) return minStandard;
        if (sumOfScaled > maxSum) return maxStandard;
    }

    return 69;
}

// Update the Overall Interpretation to be robust
export function getOverallInterpretation(score: number, ageYears: number, ageMonths: number, totalMax: number = 0): string {
    const totalMonths = ageYears * 12 + ageMonths;

    // ITED (0-3 years)
    if (totalMonths < 36) {
        if (totalMax === 0) return 'Incomplete';
        const percentage = (score / totalMax) * 100;

        if (percentage >= 90) return 'Advanced Development';
        if (percentage >= 75) return 'On Track';
        if (percentage >= 50) return 'Monitor Progress';
        return 'Needs Intervention';
    }

    // ECCD (3-5 years)
    if (score === 0) return 'Not Started';
    if (score <= 69) return 'Significant Delay in Development';
    if (score <= 79) return 'Slight Delay in Development';
    if (score <= 119) return 'Average Development';
    if (score <= 129) return 'Slightly Advanced Development';
    return 'Highly Advanced Development';
}

/**
 * 📊 ECCD (3-5y) Domain-Level Interpretation
 */
export function getEccdDomainInterpretation(scaledScore: number): string {
    if (scaledScore === 0) return 'N/A';
    if (scaledScore <= 3) return 'Significant Delay in Development';
    if (scaledScore <= 6) return 'Slight Delay in Development';
    if (scaledScore <= 13) return 'Average Development';
    if (scaledScore <= 16) return 'Slightly Advanced Development';
    return 'Highly Advanced Development';
}

/**
 * 👶 ITED (0-3y) Domain-Level Interpretation
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

    const percentage = totalMax > 0 ? (totalRaw / totalMax) * 100 : 0;

    return {
        totalScore: totalRaw,
        percentage: Math.round(percentage),
        interpretation: percentage >= 90 ? 'On Track' : percentage >= 70 ? 'Monitor' : 'At Risk',
    };
}

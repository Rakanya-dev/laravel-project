// @/utils/date.ts

/**
 * For displaying on the screen (e.g., "March 16, 2026")
 * This safely converts UTC database timestamps into accurate Philippine Time.
 */
export const formatPHDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Not specified';

    // Let the browser parse the full timestamp (e.g., 2026-03-15T16:00:00.000000Z)
    const date = new Date(dateStr);

    // If it's an invalid date format, just return the raw string
    if (isNaN(date.getTime())) return dateStr;

    // Force the output specifically to Philippine Time
    return date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * For putting data back into an <input type="date"> (e.g., "2026-03-16")
 * This guarantees the input box will show the exact correct Philippine date.
 */
export const formatForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    // Safely extract the exact YYYY, MM, and DD in Philippine time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;

    return `${year}-${month}-${day}`;
};

/**
 * For calculating Age safely
 */
export const calculateAge = (dateStr?: string | null) => {
    if (!dateStr) return 0;

    const dob = new Date(dateStr);
    if (isNaN(dob.getTime())) return 0;

    // Get "today" locked to Philippine time
    const today = new Date();
    const phTodayString = today.toLocaleString('en-US', { timeZone: 'Asia/Manila' });
    const phToday = new Date(phTodayString);

    let age = phToday.getFullYear() - dob.getFullYear();
    const monthDiff = phToday.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && phToday.getDate() < dob.getDate())) {
        age--;
    }

    return age;
};

// 🚀 UPDATED: Helper to format age cleanly into "X years, Y months"
export const formatAgeString = (ageMonths?: number | string, dob?: string, assessDate?: string) => {
    let totalMonths = 0;

    // 1. Prioritize the database value, but FORCE it to be a clean, whole number
    if (ageMonths !== null && ageMonths !== undefined) {
        totalMonths = Math.floor(Number(ageMonths));
    }
    // 2. Fallback dynamic calculation
    else if (dob && assessDate) {
        const bDate = new Date(dob);
        const aDate = new Date(assessDate);
        if (!isNaN(bDate.getTime()) && !isNaN(aDate.getTime())) {
            totalMonths = (aDate.getFullYear() - bDate.getFullYear()) * 12;
            totalMonths -= bDate.getMonth();
            totalMonths += aDate.getMonth();
            if (aDate.getDate() < bDate.getDate()) totalMonths--;
        }
    }

    if (totalMonths <= 0) return '';

    // Calculate the clean integers
    const y = Math.floor(totalMonths / 12);
    const m = Math.floor(totalMonths % 12);

    // Handle proper singular/plural grammar
    const yearStr = y === 1 ? '1 year' : `${y} years`;
    const monthStr = m === 1 ? '1 month' : `${m} months`;

    if (y === 0) return monthStr;
    if (m === 0) return yearStr;

    return `${yearStr}, ${monthStr}`;
};

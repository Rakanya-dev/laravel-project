import { useCallback } from 'react';

export function useInitials() {
    const getInitials = useCallback((first?: string, middle?: string, last?: string): string => {
        const safeFirst = first?.trim() ?? '';
        const safeLast = last?.trim() ?? '';

        if (!safeFirst && !safeLast) return '';
        if (!safeLast) return safeFirst.charAt(0).toUpperCase();
        if (!safeFirst) return safeLast.charAt(0).toUpperCase();

        return `${safeFirst.charAt(0)}${safeLast.charAt(0)}`.toUpperCase();
    }, []);

    return getInitials;
}

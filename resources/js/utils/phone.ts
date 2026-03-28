export const formatPhoneNumber = (value?: string | null): string => {
    if (!value) return '';

    let clean = value.replace(/\D/g, '');

    if (clean.startsWith('63')) {
        clean = clean.substring(2);
    } else if (clean.startsWith('0')) {
        clean = clean.substring(1);
    }

    if (clean.length === 0) return '';

    // 🚀 Changed to 63+
    if (clean.length <= 3) return `63+ ${clean}`;
    if (clean.length <= 6) return `63+ ${clean.slice(0, 3)} ${clean.slice(3)}`;
    if (clean.length <= 10) return `63+ ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;

    return `63+ ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
};

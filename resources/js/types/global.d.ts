import type { route as routeFn } from 'ziggy-js';

declare global {
    const route: typeof routeFn;

    // 👇 Add this interface merge
    interface Window {
        Echo: any;
    }
}

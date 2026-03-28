import { Link } from '@inertiajs/react';

export default function Pagination({ links }: { links: any[] }) {
    // If there's only 1 page (Prev, 1, Next), don't show the bar
    if (!links || links.length <= 3) return null;

    return (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
            {links.map((link, index) => {
                // If the link is null (e.g., clicking "Previous" on Page 1)
                if (link.url === null) {
                    return (
                        <div
                            key={index}
                            className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-400"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                // Clickable active/inactive links
                return (
                    <Link
                        key={index}
                        href={link.url}
                        preserveScroll // 🚀 Keeps the screen from jumping to the top!
                        preserveState // Keeps your current tab active!
                        className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                            link.active
                                ? 'border-black bg-black text-white'
                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}

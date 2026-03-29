import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: route('profile.edit'), // Changed from hardcoded string
    },
    {
        title: 'Password',
        href: route('password.edit'), // Changed from hardcoded string
    },
    {
        title: 'Appearance',
        href: route('appearance'), // Changed from hardcoded string
    },
    {
        title: 'Two-Factor Authentication',
        href: route('two-factor.show'),
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    // Standard Inertia way to check the current route
    if (typeof window === 'undefined') {
        return null;
    }

    // Use window.location.pathname to match the hrefs exactly
    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav className="flex flex-col space-y-1">
                        {sidebarNavItems.map((item) => {
                            // Helper to check if this item is active
                            const isActive = currentPath === item.href;

                            return (
                                <Button
                                    key={item.href}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted font-medium': isActive,
                                        'hover:bg-transparent hover:underline': !isActive,
                                    })}
                                >
                                    <Link href={item.href}>
                                        {item.title}
                                    </Link>
                                </Button>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}

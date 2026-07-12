import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';

// 🚀 IMPORT THE NOTIFICATION POPOVER
import { NotificationPopover } from '@/components/shared/notification-popover';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    // Grab the global auth data from Inertia
    const { auth } = usePage().props as any;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6 bg-white dark:bg-zinc-950">

            {/* Left Side: Sidebar Toggle & Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" />
                <div className="hidden sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Right Side: Notifications */}
            <div className="flex items-center gap-3">
                <NotificationPopover
                    userId={auth.user?.id}
                    initialNotifications={auth?.notifications}
                    unreadCount={auth?.unreadNotificationsCount}
                />
            </div>

        </header>
    );
}

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';

// 🚀 IMPORT THE NOTIFICATION POPOVER
import { NotificationPopover } from '@/components/shared/notification-popover';

// Removed mainNavItems since this is a single-page view
const rightNavItems: NavItem[] = [
    // Keep this array empty but available if you ever want to add external links
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();

    // Safely construct the user's name from first/last since Laravel's default 'name' isn't used
    const userName = auth.user.full_name
        || [auth.user.first_name, auth.user.last_name].filter(Boolean).join(' ')
        || auth.user.name
        || 'User';

    return (
        <>
            <div className="border-sidebar-border/80 border-b bg-white dark:bg-zinc-950 transition-colors">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">

                    {/* Logo - Pushed to the left */}
                    <Link href="/parent/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Right Side - Profile, Notifications & Optional Tooltip Links */}
                    <div className="ml-auto flex items-center gap-3 sm:gap-4">
                        <div className="relative flex items-center">
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={item.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group text-accent-foreground ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>

                        {/* 🚀 NOTIFICATION POPOVER */}
                        <NotificationPopover
                            userId={auth.user?.id}
                            initialNotifications={auth?.notifications}
                            unreadCount={auth?.unreadNotificationsCount}
                        />

                        {/* USER PROFILE DROPDOWN */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-12 rounded-full p-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all shadow-sm">
                                    <Avatar className="size-full overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={userName} />
                                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-bold dark:bg-indigo-500/20 dark:text-indigo-400">
                                            {getInitials(userName)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 rounded-2xl dark:bg-zinc-900 dark:border-slate-800 shadow-xl" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b bg-slate-50/50 dark:bg-zinc-950/50 transition-colors">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-slate-500 dark:text-slate-400 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}

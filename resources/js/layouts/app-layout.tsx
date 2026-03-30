import AppHeaderLayout from '@/layouts/app/app-header-layout';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage, usePoll } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs, ...props }: AppLayoutProps) {

    // 1. Get the authenticated user from Inertia props
    const { auth } = usePage().props as any;

    // 2. Extract the role (ensure your User model has this field)
    const role = auth?.user?.role;

    // 3. Conditional Rendering
    if (role === 'parent') {
        // Parents get the Header-only layout (Top Navigation)
        return (
            <AppHeaderLayout breadcrumbs={breadcrumbs} {...props}>
                {children}
            </AppHeaderLayout>
        );
    }
    // Admins and Teachers get the Sidebar layout
    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppSidebarLayout>
    );
}

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, ClipboardList, FileBarChart2, GraduationCap, LayoutGrid, MessageSquareText, User, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Users Management',
            href: '/admin/users-management',
            icon: Users,
        },
        {
            title: 'Daycare Management',
            href: '/admin/daycare-management',
            icon: Building2,
        },
        {
            title: 'Student Management',
            href: '/admin/student-management',
            icon: GraduationCap,
        },
        {
            title: 'Assessment Overview',
            href: '/admin/assessments-overview',
            icon: ClipboardList,
        },
        {
            title: 'Reports & Analytics',
            href: '/admin/reports',
            icon: FileBarChart2,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            // 👇 Updated to wildcard '*' so it stays active if you view a specific message later
            isActive: route().current('messages.*'),
            icon: MessageSquareText,
        },
    ];

    const teacherNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/teacher/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'My Students',
            href: '/teacher/my-students',
            icon: Users,
        },
        {
            title: 'My Assessments',
            href: '/teacher/assessments',
            icon: ClipboardList,
        },
        {
            title: 'Reports',
            href: '/teacher/reports',
            icon: FileBarChart2,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            // 👇 Updated to wildcard '*' so it stays active if you view a specific message later
            isActive: route().current('messages.*'),
            icon: MessageSquareText,
        },
    ];

    const parentNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/parent/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Child Profile',
            href: '/parent/child-profile',
            icon: User,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            // 👇 Updated to wildcard '*' so it stays active if you view a specific message later
            isActive: route().current('messages.*'),
            icon: MessageSquareText,
        },
    ];
    const footerNavItems: NavItem[] = [];

    let mainNavItems: NavItem[] = [];

    if (role === 'admin') mainNavItems = adminNavItems;
    else if (role === 'teacher') mainNavItems = teacherNavItems;
    else if (role === 'parent') mainNavItems = parentNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={`/${role}/dashboard`} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

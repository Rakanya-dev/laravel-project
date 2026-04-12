import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Building2, ClipboardList, FileBarChart2, GraduationCap, LayoutGrid, MessageSquareText, Settings2, User, Users } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('admin.dashboard'),
            isActive: route().current('admin.dashboard*'),
            icon: LayoutGrid,
        },
        {
            title: 'Users Management',
            href: route('admin.users-management'),
            isActive: route().current('admin.users-management*'),
            icon: Users,
        },
        {
            title: 'Daycare Management',
            href: route('admin.daycare-management'),
            isActive: route().current('admin.daycare-management*'),
            icon: Building2,
        },
        {
            title: 'Student Management',
            href: route('admin.student-management'),
            isActive: route().current('admin.student-management*'),
            icon: GraduationCap,
        },
        {
            title: 'Reports',
            href: route('admin.reports'),
            isActive: route().current('admin.reports*'),
            icon: FileBarChart2,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            isActive: route().current('messages.*'),
            icon: MessageSquareText,
        },
    ];

    const teacherNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('teacher.dashboard'),
            isActive: route().current('teacher.dashboard*'),
            icon: LayoutGrid,
        },
        {
            title: 'My Students',
            href: route('teacher.my-students'),
            isActive: route().current('teacher.my-students*'),
            icon: Users,
        },
        {
            title: 'My Assessments',
            href: route('teacher.assessments-management'),
            isActive: route().current('teacher.assessments-management*'),
            icon: ClipboardList,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
            isActive: route().current('messages.*'),
            icon: MessageSquareText,
        },
    ];

    const parentNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('parent.dashboard'),
            isActive: route().current('parent.dashboard*'),
            icon: LayoutGrid,
        },
        {
            title: 'Child Profile',
            href: route('parent.child-profile'),
            isActive: route().current('parent.child-profile*'),
            icon: User,
        },
        {
            title: 'Messages',
            href: route('messages.index'),
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
                            <Link href={role ? route(`${role}.dashboard`) : '/'} prefetch>
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

import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Baby, BookOpen, Building2, ClipboardList, FileBarChart2, FileText, Folder, LayoutGrid, MessageSquareText, Users, User } from 'lucide-react';
import AppLogo from './app-logo';
export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.account_type;

    const adminNavItems: NavItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
        { title: 'Users Management', href: '/admin/users-management', icon: Users },
        { title: 'Daycare Management', href: '/admin/daycare-management', icon: Building2 },
        { title: 'Child Management', href: '/admin/child-management', icon: Baby },
        { title: 'Reports', href: '/admin/reports', icon: FileBarChart2 },
        { title: 'Messages', href: '/admin/messages', icon: MessageSquareText },
    ];

    const teacherNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/teacher/dashboard',
            icon: LayoutGrid, // 🧭 Overview
        },
        {
            title: 'Assessments',
            href: '/teacher/assessment-management',
            icon: ClipboardList, // 📝 Assessment management
        },
        {
            title: 'Children',
            href: '/teacher/students',
            icon: Users, // 👶👧 List of children
        },
        {
            title: 'Reports',
            href: '/teacher/reports',
            icon: FileText, // 📄 Generated reports
        },
        {
            title: 'Messages',
            href: '/teacher/messages',
            icon: MessageSquareText, // 💬 Communication
        },
    ];

    const parentNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/parent/dashboard',
            icon: LayoutGrid, // 📊 Parent overview
        },
        {
            title: 'Child Profile',
            href: '/parent/child-profile',
            icon: User, // 👦👧 Child info
        },
        {
            title: 'Assessment Results',
            href: '/parent/assessment',
            icon: FileBarChart2, // 📈 Reports/Results
        },
        {
            title: 'Messages',
            href: '/parent/messages',
            icon: MessageSquareText, // 💬 Communication
        },
    ];
    const footerNavItems: NavItem[] = [

    ];

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

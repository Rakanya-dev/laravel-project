import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';
import { type Notification } from '@/components/shared/notification-popover';

export interface Auth {
    user: User;
    notifications?: Notification[];
    unreadNotificationsCount?: number;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    [key: string]: unknown;
}

export interface User {
    id: number;
    daycare_id: number | null;
    email: string;
    role: 'admin' | 'teacher' | 'parent';
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    phone: string;
    address?: string | null;
    city?: string | null;
    province?: string | null;
    postal_code?: string | null;
    date_of_birth?: string | null;
    profile_photo?: string | null;
    status: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    daycare?: Daycare;
    students?: Child[];

    [key: string]: any;
}

export interface Child {
    id: number;
    daycare_id: number;
    student_id?: string | null;
    first_name: string;
    last_name: string;
    middle_name?: string | null;
    nickname?: string | null;
    date_of_birth: string;
    gender: 'Male' | 'Female';
    admission_date: string;
    profile_photo?: string | null;
    section_id?: number | null; // 🚀 NEW: Add section_id to Child interface
    special_needs?: string | null;

    notes?: string | null;

    archive_reason?: string | null;

    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;

    // Status
    status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred' | 'Completed';
    deleted_at?: string | null;

    // Relationships
    parents?: User[];
    daycare?: Daycare;

    // Assessment Data
    latest_assessment?: {
        date: string;
        type: string;
        overall_score: number | null;
    } | null;

    progress_report?: Array<{
        name: string;
        score: number;
        max: number;
        percentage: number;
    }>;

    [key: string]: any;
}

export interface Daycare {
    id: number;
    teacher: string;
    name: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    phone: string;
    email: string;
    principal_name: string;
    license_number?: string | null;
    capacity: number;
    status: string;
    established_date?: string | null;
    description?: string | null;
    created_at: string;
    updated_at: string;

    // Relationships
    children?: Child[];
    students?: Child[];
}

export interface Assessment {
    id: number;
    student_id: number;
    teacher_id: number;
    daycare_id: number;
    assessment_date: string;

    assessment_type: '1st Assessment' | '2nd Assessment' | '3rd Assessment';
    scores?: AssessmentScore[];
    areas_for_improvement?: string | null;
    status: string;
    overall_score?: number | null;

    // 🚀 THE FIX: Add these 3 lines here
    sum_of_scaled?: number | null;
    evaluation_number?: string;
    form_version?: string;

    overall_notes?: string | null;
    next_assessment_date?: string | null;
    created_at: string;

    student?: Child;
    teacher?: User;
}

import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
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
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
    role: string; // 👈 ADD THIS LINE
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    daycare?: {
        id: number;
        name: string;
    };
    [key: string]: unknown;
}
export interface Child {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  birthdate: string;
  daycare_id: number;
  daycare?: {
    id: number;
    name: string;
  };
}

export interface Daycare {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  contact_number: string;
  children: Child[];
}


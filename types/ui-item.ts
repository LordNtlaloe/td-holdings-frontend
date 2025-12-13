import { ComponentType } from 'react';

export interface NavItem {
    title: string;
    href: string;
    icon?: ComponentType | null;
    isActive?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}
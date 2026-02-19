// app/(pos)/layout.tsx
import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface POSLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// Next.js layout component
export default function POSLayout({ children, breadcrumbs }: POSLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}

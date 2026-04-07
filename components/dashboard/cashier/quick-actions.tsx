'use client';

import { Button } from '@/components/ui/button';
import {
    ShoppingCart, RotateCcw, Search, Users,
    Package, Receipt, Printer, Banknote,
} from 'lucide-react';
import Link from 'next/link';

interface QuickActionsProps {
    storeId?: string;
}

interface Action {
    icon: React.ElementType;
    label: string;
    href?: string;
    variant: 'default' | 'outline';
    onClick?: () => void;
}

export function QuickActions({ storeId }: QuickActionsProps) {
    const actions: Action[] = [
        {
            icon: ShoppingCart,
            label: 'New Sale',
            href: '/pos',
            variant: 'default',
        },
        {
            icon: RotateCcw,
            label: 'Process Return',
            href: '/sales/returns',
            variant: 'outline',
        },
        {
            icon: Search,
            label: 'Lookup Product',
            href: '/products?search=',
            variant: 'outline',
        },
        {
            icon: Users,
            label: 'Customer Lookup',
            href: '/customers',
            variant: 'outline',
        },
        {
            icon: Package,
            label: 'Check Stock',
            href: `/inventory${storeId ? `?storeId=${storeId}` : ''}`,
            variant: 'outline',
        },
        {
            icon: Receipt,
            label: 'Void Transaction',
            href: '/sales/void',
            variant: 'outline',
        },
        {
            icon: Printer,
            label: 'Print Receipt',
            variant: 'outline',
            onClick: () => window.print(),
        },
        {
            icon: Banknote,
            label: 'Cash Drawer',
            variant: 'outline',
            onClick: () => { },
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-2">
            {actions.map((action, i) =>
                action.onClick ? (
                    <Button
                        key={i}
                        variant={action.variant}
                        className="h-16 flex-col gap-1.5 text-xs"
                        onClick={action.onClick}
                    >
                        <action.icon className="h-5 w-5" />
                        {action.label}
                    </Button>
                ) : (
                    <Button
                        key={i}
                        variant={action.variant}
                        className="h-16 flex-col gap-1.5 text-xs"
                        asChild
                    >
                        <Link href={action.href!}>
                            <action.icon className="h-5 w-5" />
                            {action.label}
                        </Link>
                    </Button>
                )
            )}
        </div>
    );
}
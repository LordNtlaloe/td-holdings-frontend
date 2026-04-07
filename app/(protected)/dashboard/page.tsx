
'use client';


import { AdminDashboard } from '@/components/dashboard/admin/admin-dashboard';
import { CashierDashboard } from '@/components/dashboard/cashier/cashier-dashboard';
import { ManagerDashboard } from '@/components/dashboard/manager/manager-dashboard';
import { useAuth } from '@/contexts/auth-context';
import { Role } from '@/types';
import { Loader2 } from 'lucide-react';


export default function Dashboard() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    switch (user?.role) {
        case Role.CASHIER:
            return <CashierDashboard />;
        case Role.MANAGER:
            return <ManagerDashboard />;
        case Role.ADMIN:
            return <AdminDashboard />;
        default:
            return <div>Unauthorized</div>;
    }
}

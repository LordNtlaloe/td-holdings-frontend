// app/(dashboard)/sales/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@/types';
import { TeamSalesView } from '@/components/sales/manager/team-sales-view';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { EmployeeSalesView } from '@/components/sales/employees/employee-sales-view';
import { useAuth } from '@/contexts/auth-context';
import { AdminSalesDashboard } from '@/components/sales/admin/admin-sales-dashboard';
import StoreAPI from '@/lib/api/stores';
import { toast } from 'sonner';

export default function SalesPage() {
    const { user, accessToken, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [managedStores, setManagedStores] = useState<string[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/sign-in');
        }
    }, [isLoading, isAuthenticated, router]);

    // Fetch managed stores for managers
    useEffect(() => {
        const fetchManagedStores = async () => {
            if (user?.role === Role.MANAGER && accessToken) {
                setLoadingStores(true);
                try {
                    // Fetch all stores and filter by manager
                    // This depends on your API structure
                    const response = await StoreAPI.getStores(accessToken, {
                        limit: 100,
                    });
                    
                    // If your API returns stores managed by this manager
                    // You might need to filter based on user.id
                    const stores = response.data || [];
                    
                    // Option 1: If the API returns manager's stores directly
                    // const managerStoreIds = stores.map(store => store.id);
                    
                    // Option 2: If stores have a managerId field
                    const managerStoreIds = stores
                        .map(store => store.id);
                    
                    // Option 3: Fallback to user's primary store
                    if (managerStoreIds.length === 0 && user.storeId) {
                        setManagedStores([user.storeId]);
                    } else {
                        setManagedStores(managerStoreIds);
                    }
                } catch (error) {
                    console.error('Failed to fetch managed stores:', error);
                    toast.error('Failed to load stores', {
                        description: error instanceof Error ? error.message : 'Unknown error occurred',
                    });
                    // Fallback to user's primary store
                    if (user.storeId) {
                        setManagedStores([user.storeId]);
                    }
                } finally {
                    setLoadingStores(false);
                }
            }
        };

        fetchManagedStores();
    }, [user, accessToken]);

    if (isLoading || (user?.role === Role.MANAGER && loadingStores)) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-62.5" />
                    <Skeleton className="h-4 w-87.5" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-100 w-full" />
            </div>
        );
    }

    if (!isAuthenticated || !user || !accessToken) {
        return null; // Will redirect to sign-in
    }

    // Check if user has permission to access sales page
    const hasSalesPermission = () => {
        switch (user.role) {
            case Role.ADMIN:
            case Role.MANAGER:
            case Role.CASHIER:
                return true;
            default:
                return false;
        }
    };

    if (!hasSalesPermission()) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You don't have permission to access the sales page.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Render different views based on role
    if (user.role === Role.ADMIN) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <AdminSalesDashboard
                    token={accessToken}
                    user={user}
                />
            </div>
        );
    }

    if (user.role === Role.MANAGER) {
        if (managedStores.length === 0) {
            return (
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>No Stores Assigned</AlertTitle>
                        <AlertDescription>
                            You don't have any stores assigned to manage. Please contact an administrator.
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <TeamSalesView
                    managerId={user.id}
                    storeIds={managedStores}
                    token={accessToken}
                    managerName={user.firstName}
                />
            </div>
        );
    }

    // Cashier/Employee view
    if (!user.storeId) {
        return (
            <div className="flex-1 space-y-4 p-8 pt-6">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Store Assigned</AlertTitle>
                    <AlertDescription>
                        You don't have a store assigned. Please contact your manager.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <EmployeeSalesView
                employeeId={user.id}
                storeId={user.storeId}
                token={accessToken}
                employeeName={user.firstName}
            />
        </div>
    );
}
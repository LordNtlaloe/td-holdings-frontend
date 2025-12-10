// hooks/usePermissions.ts
'use client';

import { useUserRole } from './use-current-role';

export const usePermissions = () => {
    const { role, isAdmin, isManager, isCashier } = useUserRole();

    const can = (action: string): boolean => {
        if (!role) return false;

        const permissions: Record<string, string[]> = {
            // User management
            'create:user': ['ADMIN'],
            'view:users': ['ADMIN', 'MANAGER'],
            'edit:user': ['ADMIN', 'MANAGER'],
            'delete:user': ['ADMIN'],

            // Store management
            'create:store': ['ADMIN'],
            'view:stores': ['ADMIN', 'MANAGER'],
            'edit:store': ['ADMIN'],
            'delete:store': ['ADMIN'],

            // Product management
            'create:product': ['ADMIN', 'MANAGER'],
            'view:products': ['ADMIN', 'MANAGER', 'CASHIER'],
            'edit:product': ['ADMIN', 'MANAGER'],
            'delete:product': ['ADMIN', 'MANAGER'],

            // Sale management
            'create:sale': ['ADMIN', 'MANAGER', 'CASHIER'],
            'view:sales': ['ADMIN', 'MANAGER', 'CASHIER'],
            'edit:sale': ['ADMIN', 'MANAGER'],
            'delete:sale': ['ADMIN', 'MANAGER'],

            // Inventory
            'view:inventory': ['ADMIN', 'MANAGER', 'CASHIER'],
            'update:inventory': ['ADMIN', 'MANAGER'],

            // Reports
            'view:reports': ['ADMIN', 'MANAGER'],
            'export:reports': ['ADMIN', 'MANAGER'],

            // Settings
            'manage:settings': ['ADMIN'],
        };

        const allowedRoles = permissions[action];
        return allowedRoles ? allowedRoles.includes(role) : false;
    };

    // Quick permission shortcuts
    const canManageUsers = isAdmin;
    const canManageStores = isAdmin;
    const canManageProducts = isAdmin || isManager;
    const canManageSales = isAdmin || isManager || isCashier;
    const canViewReports = isAdmin || isManager;

    return {
        can,
        canManageUsers,
        canManageStores,
        canManageProducts,
        canManageSales,
        canViewReports,
        // Role info
        role,
        isAdmin,
        isManager,
        isCashier,
    };
};
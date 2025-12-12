// hooks/usePermissions.ts
'use client';

import { useCurrentRole } from './use-current-role';

export const usePermissions = () => {
    const { role } = useCurrentRole();

    enum userRole {
        ADMIN = "ADMIN",
        MANAGER = "MANAGER",
        CASHIER = "CASHIER"
    }

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
    const canManageUsers = userRole.ADMIN;
    const canManageStores = userRole.ADMIN
    const canManageProducts = userRole.ADMIN || userRole.MANAGER;
    const canManageSales = userRole.ADMIN || userRole.MANAGER || userRole.CASHIER;
    const canViewReports = userRole.ADMIN || userRole.MANAGER;

    return {
        can,
        canManageUsers,
        canManageStores,
        canManageProducts,
        canManageSales,
        canViewReports,
        // Role info
        role,
    };
};
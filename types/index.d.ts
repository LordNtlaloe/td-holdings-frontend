export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
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

// types/index.ts
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    avatar?: string;
    emailVerified?: Date;
    isActive?: boolean;
    employee?: {
        id: string;
        position: string;
        storeId?: string;  // Make optional if not always present
        store?: {
            id: string;
            name: string;
            address: string;
            phone: string;
            isActive: boolean;
        };
    };
    store?: {
        id: string;
        name: string;
        address: string;
        phone: string;
        isActive: boolean;
    };
}

// Or create separate types for different contexts
export interface BasicUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    avatar?: string;
    emailVerified?: Date;
    isActive?: boolean;
}

export interface FullUser extends BasicUser {
    employee?: {
        id: string;
        storeId: string;
        position: string;
        store?: {
            id: string;
            name: string;
            address: string;
            phone: string;
            isActive: boolean;
        };
    };
    store?: {
        id: string;
        name: string;
        address: string;
        phone: string;
        isActive: boolean;
    };
}

// types/store.ts
export interface Store {
    id: string;
    name: string;
    location: string;
    createdAt: Date;
    updatedAt: Date;
    employeeCount?: number;
    productCount?: number;
    saleCount?: number;
    _count?: {
        employees: number;
        products: number;
        sales: number;
    };
}

export interface StoreStats {
    stats: {
        employeeCount: number;
        productCount: number;
        saleCount: number;
    };
    salesSummary: {
        totalRevenue: number;
        totalSales: number;
        averageSale: number;
    };
    recentSales: any[];
    topProducts: any[];
    lowStock: any[];
}

export interface StoreEmployee {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    position: string;
    storeId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        emailVerified: Date | null;
        createdAt: Date;
    };
    _count?: {
        sales: number;
    };
}

export interface CreateStoreRequest {
    name: string;
    location: string;
}

export interface UpdateStoreRequest {
    name?: string;
    location?: string;
}

export interface AddEmployeeRequest {
    userId: string;
    position?: string;
}

export interface StoreFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export type StoreFormData = {
    name: string;
    location: string;
};
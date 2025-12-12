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
    isActive: any;
    isActive: any;
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

// app/lib/types/products.ts
export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: 'TIRE' | 'BALE';
    grade: 'A' | 'B' | 'C';
    commodity: string;
    storeId: string;
    store?: {
        id: string;
        name: string;
        location: string;
    };

    // Tire fields
    tireCategory?: string | null;
    tireUsage?: string | null;
    tireSize?: string | null;
    loadIndex?: string | null;
    speedRating?: string | null;
    warrantyPeriod?: string | null;

    // Bale fields
    baleWeight?: number | null;
    baleCategory?: string | null;
    originCountry?: string | null;
    importDate?: Date | null;
    baleCount?: number | null;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

export interface ProductMetrics {
    totalProducts: number;
    totalValue: number;
    totalQuantity: number;
    byType: {
        tire: number;
        bale: number;
    };
    valueByType: {
        tire: number;
        bale: number;
    };
    stockStatus: {
        outOfStock: number;
        lowStock: number;
        inStock: number;
    };
    tireCategories: Record<string, number>;
    grades: Record<string, number>;
    topProductsByValue: Array<{
        id: string;
        name: string;
        type: string;
        quantity: number;
        price: number;
        totalValue: number;
        store: string;
    }>;
    recentAdditions: number;
    recentValueAdded: number;
    byStore: Record<string, { count: number; value: number; quantity: number }>;
    priceRanges: {
        under100: number;
        '100-500': number;
        '501-1000': number;
        over1000: number;
    };
    quantityRanges: {
        '1-10': number;
        '11-50': number;
        '51-100': number;
        over100: number;
    };
    topCommodities: Record<string, { count: number; value: number; products: string[] }>;
    alerts: {
        zeroStockProducts: number;
        lowStockProducts: number;
        highValueProducts: number;
    };
}

export interface ProductFilters {
    storeId?: string;
    type?: 'TIRE' | 'BALE';
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface ProductFormData {
    name: string;
    price: number;
    quantity: number;
    type: 'TIRE' | 'BALE';
    grade: 'A' | 'B' | 'C';
    commodity: string;
    storeId?: string;

    // Optional tire fields
    tireCategory?: string;
    tireUsage?: string;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Optional bale fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: Date;
    baleCount?: number;
}
// Enums
export enum ProductType {
    TIRE = 'TIRE',
    BALE = 'BALE'
}

export enum ProductGrade {
    A = 'A',
    B = 'B',
    C = 'C'
}

export enum TireCategory {
    NEW = 'NEW',
    SECOND_HAND = 'SECOND_HAND'
}

export enum TireUsage {
    FOUR_BY_FOUR = 'FOUR_BY_FOUR',
    REGULAR = 'REGULAR',
    TRUCK = 'TRUCK'
}

// Main Product Interface
export interface Product {
    id: string;
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // Tire-specific fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale-specific fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    // Metadata
    createdAt: string;
    updatedAt: string;

    // Relations
    inventories?: ProductInventory[];
    storeProducts?: StoreProduct[];
    _count?: {
        saleItems: number;
        transfers: number;
    };
}

export interface ProductInventory {
    productId: string;
    storeId: string;
    quantity: number;
    storePrice?: number;
    reorderLevel?: number;
    optimalLevel?: number;
    store?: {
        id: string;
        name: string;
        location: string;
        isMainStore: boolean;
    };
}

export interface StoreProduct {
    productId: string;
    storeId: string;
    store?: {
        id: string;
        name: string;
    };
    createdAt: string;
}

// API Response Types
export interface PaginatedProductsResponse {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ProductCategoryStats {
    category: string;
    count: number;
    totalInventory: number;
    averagePrice: number;
}

export interface ProductPriceStatistics {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    priceByType: Record<string, { min: number; max: number; avg: number }>;
    priceByGrade: Record<string, { min: number; max: number; avg: number }>;
}

export interface LowStockProduct {
    product: {
        id: string;
        name: string;
        type: ProductType;
        grade: ProductGrade;
        basePrice: number;
    };
    inventories: Array<{
        storeId: string;
        storeName: string;
        quantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
    }>;
}

export interface ProductAttribute {
    productTypes: string[];
    productGrades: string[];
    tireCategories: string[];
    tireUsages: string[];
    roles: string[];
    paymentMethods: string[];
    transferStatuses: string[];
    inventoryChangeTypes: string[];
}

// Filter Types
export interface ProductFilters {
    search: string | undefined;
    name?: string;
    type?: ProductType;
    grade?: ProductGrade;
    commodity?: string;
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    storeId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Form Value Types
export interface CreateProductFormValues {
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    tireSpecific?: {
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        tireSize?: string;
        loadIndex?: string;
        speedRating?: string;
        warrantyPeriod?: string;
    };
    baleSpecific?: {
        baleWeight?: number;
        baleCategory?: string;
        originCountry?: string;
        importDate?: string;
    };
    storeAssignments?: Array<{
        storeId: string;
        initialQuantity?: number;
        storePrice?: number;
    }>;
}

export interface UpdateProductFormValues {
    name?: string;
    basePrice?: number;
    grade?: ProductGrade;
    commodity?: string;
    tireSpecific?: {
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        tireSize?: string;
        loadIndex?: string;
        speedRating?: string;
        warrantyPeriod?: string;
    };
    baleSpecific?: {
        baleWeight?: number;
        baleCategory?: string;
        originCountry?: string;
        importDate?: string;
    };
}

export interface AssignProductToStoresFormValues {
    storeIds: string[];
    initialQuantities?: Record<string, number>;
}
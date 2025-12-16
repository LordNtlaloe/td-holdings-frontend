// /types/index.ts (or wherever your types are)
export interface Store {
    id: string;
    name: string;
    location: string;
    phone: string;
    email: string;
    isMainStore: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        employees: number;
        inventories: number;
        sales: number;
        storeProducts: number;
    };
}

export interface CreateStoreData {
    name: string;
    location: string;
    phone: string;
    email: string;
    isMainStore?: boolean;
}

export interface UpdateStoreData {
    name?: string;
    location?: string;
    phone?: string;
    email?: string;
    isMainStore?: boolean;
}

export interface StoreStatistics {
    inventory: {
        totalItems: number;
        averagePrice: number;
    };
    sales: {
        last30Days: {
            totalRevenue: number;
            transactionCount: number;
            averageTransaction: number;
        };
    };
}

export interface InventorySummary {
    store: Store;
    summary: {
        totalProducts: number;
        totalQuantity: number;
        totalValue: number;
        lowStockProducts: number;
        outOfStockProducts: number;
    };
    categories: Array<{
        type: string;
        count: number;
        quantity: number;
        value: number;
    }>;
}

export interface StorePerformance {
    store: Store;
    period: string;
    sales: {
        revenue: number;
        transactions: number;
        averageTransaction: number;
        bestSellingProducts: Array<{
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }>;
        topEmployees: Array<{
            employeeId: string;
            employeeName: string;
            sales: number;
            revenue: number;
        }>;
    };
    inventory: {
        turnoverRate: number;
        daysOfInventory: number;
        stockOutRate: number;
    };
}

export interface StoreFilters {
    isMainStore?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    stores: T[];
    total: number;
    page: number;
    totalPages: number;
}

// Alias for stores specifically
export type PaginatedStoresResponse = PaginatedResponse<Store>;
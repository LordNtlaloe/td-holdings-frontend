import { StoreType } from "./enums";
import { Sale } from "./sales";
import { StoreProduct } from "./products";
import { User } from "./users";
import { EmployeeTransfer, Employee } from "./employees";
import { Inventory, ProductTransfer } from "./inventory";

export interface Store {
    id: string;
    name: string;
    city: string;
    type: StoreType;
    latitude?: number;
    longitude?: number;
    address: string;
    phone: string;
    email: string;
    isMainStore: boolean;
    weekdayHours: string;
    saturdayHours?: string;
    sundayHours?: string;
    services: string[];
    features: string[];
    distanceInfo?: string;
    createdAt: string;
    updatedAt: string;

    // Relationships
    employees?: Employee[];
    inventories?: Inventory[];
    sales?: Sale[];
    storeProducts?: StoreProduct[];
    sentTransfers?: ProductTransfer[];
    receivedTransfers?: ProductTransfer[];
    users?: User[];
    employeeTransfersFrom?: EmployeeTransfer[];
    employeeTransfersTo?: EmployeeTransfer[];

    // Counts
    _count?: {
        employees: number;
        inventories: number;
        sales: number;
        storeProducts: number;
    };
}

export interface CreateStoreData {
    name: string;
    city: string;
    type?: StoreType;
    latitude?: number;
    longitude?: number;
    address: string;
    phone: string;
    email: string;
    isMainStore?: boolean;
    weekdayHours?: string;
    saturdayHours?: string;
    sundayHours?: string;
    services?: string[];
    features?: string[];
    distanceInfo?: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
    id?: string;
}

export interface StorePerformance {
    storeId: string;
    storeName: string;
    sales: {
        revenue: number;
        transactions: number;
        averageOrderValue: number;
        bestSellingProducts: {
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }[];
        topEmployees: {
            employeeId: string;
            employeeName: string;
            sales: number;
            revenue: number;
        }[];
    };
    inventory: {
        totalProducts: number;
        totalValue: number;
        turnoverRate: number;
        daysOfInventory: number;
        stockOutRate: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

export interface StoreStats {
    totalStores: number;
    mainStore?: string;
    totalEmployees: number;
    totalProducts: number;
    totalSales: number;
    lowStockItems: number;
    outOfStockItems: number;
    storesByType: {
        type: StoreType;
        count: number;
    }[];
}

// Form Values
export interface CreateStoreFormValues {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    type?: StoreType;
    isMainStore?: boolean;
    latitude?: number;
    longitude?: number;
    weekdayHours?: string;
    saturdayHours?: string;
    sundayHours?: string;
    services?: string[];
    features?: string[];
}

export interface UpdateStoreFormValues extends Partial<CreateStoreFormValues> { }

// Add this to your store types file (where Store is defined)
export interface PaginatedStoresResponse {
    data: Store[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface StoreFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    storeId?: string;
    position?: string;
    activeOnly?: boolean;
    hireDateFrom?: Date;
    hireDateTo?: Date;
    isMainStore?: boolean
}

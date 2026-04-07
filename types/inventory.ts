import { Product } from "./products";
import { Store } from "./store";
import { User } from "./users";
import { InventoryChangeType, TransferStatus, SortOrder, ProductGrade, ProductType } from "./enums";

export interface Inventory {
    id: string;
    productId: string;
    quantity: number;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
    createdAt: string;
    updatedAt: string;

    // Relationships
    product?: Product;
    store?: Store;
    sentTransfers?: ProductTransfer[];
    receivedTransfers?: ProductTransfer[];
    histories?: InventoryHistory[];
}

export interface ProductTransfer {
    id: string;
    quantity: number;
    fromInventoryId: string;
    toInventoryId: string;
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    transferredBy: string;
    status: TransferStatus;
    reason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;

    // Relationships
    fromInventory?: Inventory;
    toInventory?: Inventory;
    product?: Product;
    fromStore?: Store;
    toStore?: Store;
    transferredByUser?: User;
}

export interface InventoryHistory {
    id: string;
    inventoryId: string;
    changeType: InventoryChangeType;
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId?: string;
    referenceType?: string;
    notes?: string;
    createdBy: string;
    createdAt: string;

    // Relationships
    inventory?: Inventory;
    user?: User;
}

export interface StockReceipt {
    id: string;
    productId: string;
    quantity: number;
    receivedBy: string;
    receivedAt: string;
    supplier?: string;
    invoiceNumber?: string;
    costPerUnit?: number;
    totalCost?: number;
    notes?: string;
    createdAt: string;

    // Relationships
    product?: Product;
    user?: User;
}

export interface LowStockProduct {
    store: Store;
    product: Product;
    inventories: Array<{
        storeId: string;
        storeName: string;
        quantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
        storePrice?: number;
    }>;
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

// Inventory Filters
export interface InventoryFilters {
    productId?: string;
    productName?: string;
    storeId?: string;
    storeName?: string;
    type?: ProductType;
    grade?: ProductGrade;
    lowStock?: boolean;
    outOfStock?: boolean;
    hasReorderLevel?: boolean;
    minQuantity?: number;
    maxQuantity?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface ProductTransferFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    productId?: string;
    fromStoreId?: string;
    toStoreId?: string;
    status?: TransferStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface InventoryHistoryFilters {
    productId?: string;
    storeId?: string;
    changeType?: InventoryChangeType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

// Inventory Form Values
export interface AdjustInventoryFormValues {
    productId: string;
    storeId: string;
    quantity: number;
    changeType: InventoryChangeType;
    notes?: string;
    referenceId?: string;
    referenceType?: string;
}

export interface SetInventoryLevelsFormValues {
    productId: string;
    storeId: string;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
}

export interface CreateProductTransferFormValues {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason?: string;
    notes?: string;
}

export interface CompleteProductTransferFormValues {
    notes?: string;
}

export interface CancelProductTransferFormValues {
    reason?: string;
}

export interface StockReceiptFormValues {
    productId: string;
    quantity: number;
    supplier?: string;
    invoiceNumber?: string;
    costPerUnit?: number;
    notes?: string;
}

// Inventory API Types
export interface CreateProductTransferRequest {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason?: string;
    notes?: string;
}

export interface PaginatedInventoryResponse {
    inventory: Inventory[];
    total: number;
    page: number;
    totalPages: number;
    summary: {
        totalProducts: number;
        totalQuantity: number;
        totalValue: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

export interface StoreInventoryResponse {
    inventory: Inventory[];
    total: number;
    page: number;
    totalPages: number;
    store: Store;
}

export interface StoreInventoryFilters {
    productId?: string;
    productName?: string;
    type?: ProductType;
    grade?: ProductGrade;
    lowStock?: boolean;
    page?: number;
    limit?: number;
}
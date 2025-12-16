import { Employee } from './employees';
import {
    Role,
    ProductType,
    TireCategory,
    TireUsage,
    ProductGrade,
    PaymentMethodType,
    TransferStatus,
    InventoryChangeType,
    SortOrder
} from './enums';

import { Store } from './stores';
import { User } from './users';

// ========== Base Models ==========

export interface BaseModel {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Timestamps {
    createdAt: Date;
    updatedAt: Date;
}

// ========== User & Authentication ==========



export interface RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    revoked: boolean;
    createdAt: Date;
    expiresAt: Date;
    replacedById: string | null;

    // Relationships
    user: User;
    replacedBy?: RefreshToken;
    replacementTokens?: RefreshToken[];
}

export interface VerificationCode {
    id: string;
    userId: string;
    code: string;
    createdAt: Date;
    expiresAt: Date;
    used: boolean;

    // Relationships
    user: User;
}

export interface PasswordReset {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    used: boolean;
    createdAt: Date;

    // Relationships
    user: User;
}


// ========== Product ==========

export interface Product extends BaseModel {
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity: string | null;

    // Tire-specific fields
    tireCategory: TireCategory | null;
    tireUsage: TireUsage | null;
    tireSize: string | null;
    loadIndex: string | null;
    speedRating: string | null;
    warrantyPeriod: string | null;

    // Bale-specific fields
    baleWeight: number | null;
    baleCategory: string | null;
    originCountry: string | null;
    importDate: Date | null;

    // Relationships
    inventories?: Inventory[];
    saleItems?: SaleItem[];
    transfers?: ProductTransfer[];
    storeProducts?: StoreProduct[];
}

// ========== Inventory ==========

export interface Inventory extends BaseModel {
    productId: string;
    storeId: string;
    quantity: number;
    reorderLevel: number | null;
    optimalLevel: number | null;
    storePrice: number | null;

    // Relationships
    product: Product;
    store: Store;
    sentTransfers?: ProductTransfer[];
    receivedTransfers?: ProductTransfer[];
    histories?: InventoryHistory[];
}

// ========== Product Transfer ==========

export interface ProductTransfer extends BaseModel {
    quantity: number;

    // Foreign keys
    fromInventoryId: string;
    toInventoryId: string;
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    transferredBy: string;

    // Status
    status: TransferStatus;
    reason: string | null;
    notes: string | null;

    // Relationships
    fromInventory: Inventory;
    toInventory: Inventory;
    product: Product;
    fromStore: Store;
    toStore: Store;
    transferredByUser: User;
}

// ========== Inventory History ==========

export interface InventoryHistory {
    id: string;
    inventoryId: string;
    changeType: InventoryChangeType;
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId: string | null;
    referenceType: string | null;
    notes: string | null;
    createdBy: string;
    createdAt: Date;

    // Relationships
    inventory: Inventory;
    user: User;
}

// ========== Store Product ==========

export interface StoreProduct {
    id: string;
    productId: string;
    storeId: string;
    createdAt: Date;

    // Relationships
    product: Product;
    store: Store;
}

// ========== Sales ==========

export interface Sale extends BaseModel {
    employeeId: string;
    storeId: string;
    userId: string | null;
    total: number;
    subtotal: number;
    tax: number;
    paymentMethod: PaymentMethodType;

    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;

    // Relationships
    employee: Employee;
    store: Store;
    user?: User;
    saleItems: SaleItem[];
    voidedSale?: VoidedSale;
}

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    price: number;

    // Relationships
    sale: Sale;
    product: Product;
}

export interface VoidedSale {
    id: string;
    saleId: string;
    voidedBy: string;
    reason: string | null;
    originalTotal: number;
    createdAt: Date;

    // Relationships
    sale: Sale;
}

// ========== Employees ==========


// ========== Activity Logs ==========

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: any; // JSON type
    createdAt: Date;

    // Relationships
    user: User;
}

// ========== Utility Types ==========


export interface FilterParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
    search?: string;
    [key: string]: any;
}

export interface SelectOptions {
    value: string;
    label: string;
}
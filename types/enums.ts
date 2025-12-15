// Role enums
export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    CASHIER = 'CASHIER'
}

// Product enums
export enum ProductType {
    TIRE = 'TIRE',
    BALE = 'BALE'
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

export enum ProductGrade {
    A = 'A',
    B = 'B',
    C = 'C'
}

// Payment method enums
export enum PaymentMethodType {
    MOBILE = 'MOBILE',
    CASH = 'CASH',
    CARD = 'CARD'
}

// Transfer status enums
export enum TransferStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

// Inventory change type enums
export enum InventoryChangeType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    TRANSFER_OUT = 'TRANSFER_OUT',
    TRANSFER_IN = 'TRANSFER_IN',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
    DAMAGE = 'DAMAGE'
}

// Sort order enums
export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}
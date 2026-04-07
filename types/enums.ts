export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    SUPERVISOR = 'SUPERVISOR',
    CASHIER = 'CASHIER',
    WAREHOUSE = 'WAREHOUSE'
}

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ON_LEAVE = 'ON_LEAVE',
    TERMINATED = 'TERMINATED'
}

export enum ReviewPeriod {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

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

export enum PaymentMethodType {
    MOBILE = 'MOBILE',
    CASH = 'CASH',
    CARD = 'CARD',
    CREDIT = 'CREDIT'
}

export enum TransferStatus {
    PENDING = 'PENDING',
    IN_TRANSIT = 'IN_TRANSIT',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

export enum InventoryChangeType {
    STOCK_RECEIVED = 'STOCK_RECEIVED',
    SALE = 'SALE',
    TRANSFER_OUT = 'TRANSFER_OUT',
    TRANSFER_IN = 'TRANSFER_IN',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
    DAMAGE = 'DAMAGE',
    INITIAL_SETUP = 'INITIAL_SETUP'
}

export enum StoreType {
    MAIN = 'MAIN',
    BRANCH = 'BRANCH',
    WAREHOUSE = 'WAREHOUSE'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}
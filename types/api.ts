import { Role, ProductType, TransferStatus, PaymentMethodType } from './enums';
import {
    User,
    Store,
    Product,
    Inventory,
    ProductTransfer,
    Sale,
    Employee,
    ActivityLog,
    PaginatedResponse
} from './models';

// ========== Auth API Types ==========

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: Role;
    storeId?: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
    verificationCode?: string;
}

export interface VerifyAccountRequest {
    email: string;
    code: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirmRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

// ========== Store API Types ==========

export interface CreateStoreRequest {
    name: string;
    location: string;
    phone: string;
    email: string;
    isMainStore?: boolean;
}

export interface UpdateStoreRequest {
    name?: string;
    location?: string;
    phone?: string;
    email?: string;
    isMainStore?: boolean;
}

export interface StoreFilters {
    search?: string;
    isMainStore?: boolean;
}

// ========== Product API Types ==========

export interface CreateProductRequest {
    name: string;
    basePrice: number;
    type: ProductType;
    grade: string;
    commodity?: string;

    // Tire-specific
    tireCategory?: string;
    tireUsage?: string;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale-specific
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: Date;
}

export interface UpdateProductRequest {
    name?: string;
    basePrice?: number;
    grade?: string;
    commodity?: string;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: Date;
}

export interface ProductFilters {
    search?: string;
    type?: ProductType;
    grade?: string;
    tireCategory?: string;
    tireUsage?: string;
    baleCategory?: string;
}

// ========== Inventory API Types ==========

export interface CreateInventoryRequest {
    productId: string;
    storeId: string;
    quantity: number;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
}

export interface UpdateInventoryRequest {
    quantity?: number;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
}

export interface InventoryAdjustmentRequest {
    quantityChange: number;
    changeType: string;
    notes?: string;
}

export interface InventoryFilters {
    storeId?: string;
    productId?: string;
    minQuantity?: number;
    maxQuantity?: number;
    search?: string;
}

// ========== Transfer API Types ==========

export interface CreateTransferRequest {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason?: string;
    notes?: string;
}

export interface UpdateTransferRequest {
    status?: TransferStatus;
    reason?: string;
    notes?: string;
}

export interface TransferFilters {
    fromStoreId?: string;
    toStoreId?: string;
    productId?: string;
    status?: TransferStatus;
    startDate?: Date;
    endDate?: Date;
}

// ========== Sales API Types ==========

export interface CreateSaleRequest {
    employeeId: string;
    storeId: string;
    items: SaleItemRequest[];
    paymentMethod: PaymentMethodType;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
}

export interface SaleItemRequest {
    productId: string;
    quantity: number;
    price: number;
}

export interface VoidSaleRequest {
    reason: string;
}

export interface SaleFilters {
    storeId?: string;
    employeeId?: string;
    paymentMethod?: PaymentMethodType;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
}

// ========== Employee API Types ==========

export interface CreateEmployeeRequest {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
}

export interface UpdateEmployeeRequest {
    position?: string;
    role?: Role;
    storeId?: string;
}

export interface EmployeeFilters {
    storeId?: string;
    role?: Role;
    search?: string;
}

// ========== User API Types ==========

export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: Role;
    storeId?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: Role;
    storeId?: string;
    isActive?: boolean;
}

export interface UserFilters {
    role?: Role;
    storeId?: string;
    isActive?: boolean;
    search?: string;
}

// ========== Report API Types ==========

export interface SalesReportRequest {
    storeId?: string;
    startDate: Date;
    endDate: Date;
    groupBy?: 'day' | 'week' | 'month' | 'product' | 'employee';
}

export interface InventoryReportRequest {
    storeId?: string;
    lowStock?: boolean;
    category?: string;
}

export interface TransferReportRequest {
    fromStoreId?: string;
    toStoreId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: TransferStatus;
}

// ========== Response Types ==========

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginatedResponse<T>> { }

// ========== Query Types ==========

export interface PaginationQuery {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface DateRangeQuery {
    startDate?: string;
    endDate?: string;
}
import { Role } from "./enums";
import { Employee } from "./employees";
import { EmployeeTransfer, PerformanceReview } from "./employees";
import { ProductTransfer, InventoryHistory, StockReceipt } from "./inventory";
import { ProductReview } from "./products";
import { Sale } from "./sales";
import { Store } from "./store";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    role: Role;
    avatar: string;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    storeId?: string;
    store?: Store;
    createdAt: string;
    updatedAt: string;

    // Relationships
    employee?: Employee;
    refreshTokens?: RefreshToken[];
    verificationCodes?: VerificationCode[];
    passwordResets?: PasswordReset[];
    activities?: ActivityLog[];
    sales?: Sale[];
    productTransfers?: ProductTransfer[];
    inventoryHistories?: InventoryHistory[];
    employeeTransfers?: EmployeeTransfer[];
    performanceReviews?: PerformanceReview[];
    stockReceipts?: StockReceipt[];
    productReviews?: ProductReview[];
}

export interface RefreshToken {
    id: string;
    userId: string;
    tokenHash: string;
    revoked: boolean;
    createdAt: string;
    expiresAt: string;
    replacedById?: string;
    user?: User;
    replacedBy?: RefreshToken;
    replacementTokens?: RefreshToken[];
}

export interface VerificationCode {
    id: string;
    userId: string;
    code: string;
    createdAt: string;
    expiresAt: string;
    used: boolean;
    user?: User;
}

export interface PasswordReset {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: string;
    used: boolean;
    createdAt: string;
    user?: User;
}

export interface ActivityLog {
    id: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    details: any;
    createdAt: string;
    user?: User;
}

// Auth Types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: Role;
    storeId?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    storeId?: string;
    store?: Store;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    permissions: string[];
}

// Form Values
export interface LoginFormValues {
    email: string;
    password: string;
}

export interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: Role;
    storeId?: string;
}

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ProfileFormValues {
    firstName: string;
    lastName: string;
    phone: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordRequestData {
    email: string;
}

export interface ResetPasswordData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserFilters {
    role?: string;
    isActive?: string;
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    byRole: Array<{ role: string; count: number }>;
    recentLogins: number;
    newUsersThisMonth: number;
}

export interface UserSession {
    id: string;
    userId: string;
    token: string;
    device?: string;
    browser?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
    lastActive: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

export interface BulkOperationResult {
    success: boolean;
    successful: string[];
    failed: Array<{
        id: string;
        error: string;
    }>;
    message: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// types/index.ts

import { Employee } from "./employees";
import { Role } from "./enums";
import { RefreshToken, VerificationCode, PasswordReset, ActivityLog, Sale, ProductTransfer, InventoryHistory } from "./models";
import { Store } from "./stores";

// ============ AUTH TYPES ============

export interface User {
    createdAt: string | number | Date;
    updatedAt: string | number | Date;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    avatar: string;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    lastLogin: Date | null;
    storeId: string | null;

    // Relationships
    employee?: Employee;
    store?: Store;
    refreshTokens?: RefreshToken[];
    verificationCodes?: VerificationCode[];
    passwordResets?: PasswordReset[];
    activities?: ActivityLog[];
    sales?: Sale[];
    productTransfers?: ProductTransfer[];
    inventoryHistories?: InventoryHistory[];
}

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'EMPLOYEE';
    storeId?: string;
    permissions: string[];
}

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
    role?: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'EMPLOYEE';
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

export interface VerificationData {
    email: string;
    code: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetData {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

// ============ SESSION TYPES ============

export interface UserSession {
    id: string;
    userId: string;
    deviceInfo?: string;
    lastActivity: Date;
    createdAt: Date;
    isActive: boolean;
}

// ============ PAGINATION & FILTERS ============

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface UserFilters {
    role?: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'EMPLOYEE';
    storeId?: string;
    isActive?: boolean;
    search?: string;
}

export interface PaginatedUsersResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


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

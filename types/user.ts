import { ActivityLog, ProductTransfer, Store } from '.';
import { Employee } from './employees';
import { Role } from './enums';
import { Sale } from './sales';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;

    // Relationships
    employee: Employee[]
    refreshTokens: RefreshToken[];
    verificationCodes: VerificationCode[];
    passwordResets: PasswordReset[];
    store: Store;
    activities: ActivityLog[];
    sales: Sale[];
    productTransfers: ProductTransfer[];
}

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
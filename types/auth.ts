// types/auth.ts
import { Role } from './enums';
import { User } from './users';

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: Role;
    phoneNumber?: string;
    storeId?: string;
}

export interface RegisterResponse {
    message: string;
    userId: string;
    email: string;
    requiresVerification?: boolean;
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
    phoneNumber?: string;
    profilePicture?: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken?: string;
    user?: User;
}

export interface Session {
    id: string;
    tokenId: string;
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
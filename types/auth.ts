// types/auth.ts
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    emailVerified?: Date;
    store?: {
        id: string;
        name: string;
        address: string;
        phone: string;
    };
    employee?: {
        id: string;
        position: string;
    };
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export interface ApiError {
    error: string;
    code?: string;
    details?: any;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role?: string;
    storeId?: string;
    position?: string;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
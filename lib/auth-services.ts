import apiClient, { API_ENDPOINTS } from './api-client-v2';
import { User } from '@/types';

interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    user: User;
    accessToken: string;
    message: string;
}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    storeId?: string;
}

interface RegisterResponse {
    user?: User;
    accessToken?: string;
    autoLogin?: boolean;
    message: string;
}

interface RefreshTokenResponse {
    accessToken: string;
}

interface UpdateProfileResponse {
    user: User;
    message: string;
}

interface MessageResponse {
    message: string;
}

interface VerifyEmailResponse {
    user?: User;
    accessToken?: string;
    message: string;
}

export const authService = {
    /**
     * Login with email and password
     */
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.login, credentials);
        return data;
    },

    /**
     * Register a new user
     */
    register: async (userData: RegisterData): Promise<RegisterResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.register, userData);
        return data;
    },

    /**
     * Logout current user
     */
    logout: async (): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.auth.logout);
    },

    /**
     * Refresh access token
     */
    refreshToken: async (): Promise<RefreshTokenResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.refresh);
        return data;
    },

    /**
     * Get current user profile
     */
    getProfile: async (): Promise<User> => {
        const { data } = await apiClient.get(API_ENDPOINTS.auth.profile);
        return data;
    },

    /**
     * Update user profile
     */
    updateProfile: async (updates: Partial<User>): Promise<UpdateProfileResponse> => {
        const { data } = await apiClient.put(API_ENDPOINTS.auth.profile, updates);
        return data;
    },

    /**
     * Change password
     */
    changePassword: async (
        currentPassword: string,
        newPassword: string
    ): Promise<MessageResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.changePassword, {
            currentPassword,
            newPassword,
        });
        return data;
    },

    /**
     * Request password reset
     */
    requestPasswordReset: async (email: string): Promise<MessageResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.requestPasswordReset, {
            email,
        });
        return data;
    },

    /**
     * Reset password with token
     */
    resetPassword: async (
        email: string,
        resetToken: string,
        newPassword: string
    ): Promise<MessageResponse> => {
        const { data } = await apiClient.post(API_ENDPOINTS.auth.resetPassword, {
            email,
            resetToken,
            newPassword,
        });
        return data;
    },

    /**
     * Verify email with code
     */
    verifyEmail: async (email: string, code: string): Promise<VerifyEmailResponse> => {
        const { data } = await apiClient.post(
            `${API_ENDPOINTS.auth.login.replace('/login', '/verify')}`,
            { email, code }
        );
        return data;
    },

    /**
     * Resend verification code
     */
    resendVerificationCode: async (email: string): Promise<MessageResponse> => {
        const { data } = await apiClient.post(
            `${API_ENDPOINTS.auth.login.replace('/login', '/verification/resend')}`,
            { email }
        );
        return data;
    },
};
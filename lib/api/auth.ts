// lib/api/auth.ts
import { User, LoginCredentials, RegisterData, AuthResponse, UserProfile } from '@/types';

const API_BASE = '/api';

class AuthAPI {
    private static async fetchAPI<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Authentication failed');
        }

        return data;
    }

    // ============ AUTHENTICATION ============

    static async register(data: RegisterData): Promise<AuthResponse> {
        return this.fetchAPI('/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return this.fetchAPI('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    static async verify(email: string, code: string): Promise<AuthResponse> {
        return this.fetchAPI('/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });
    }

    static async logout(token: string, refreshToken: string): Promise<void> {
        return this.fetchAPI('/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ PASSWORD MANAGEMENT ============

    static async forgotPassword(email: string): Promise<void> {
        return this.fetchAPI('/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    static async resetPassword(
        email: string,
        resetToken: string,
        newPassword: string
    ): Promise<void> {
        return this.fetchAPI('/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, resetToken, newPassword }),
        });
    }

    static async changePassword(
        token: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        return this.fetchAPI('/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ PROFILE MANAGEMENT ============

    static async getProfile(token: string): Promise<UserProfile> {
        return this.fetchAPI('/profile', {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateProfile(token: string, updates: Partial<UserProfile>): Promise<UserProfile> {
        return this.fetchAPI('/profile', {
            method: 'PUT',
            body: JSON.stringify(updates),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ TOKEN MANAGEMENT ============

    static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
        return this.fetchAPI('/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });
    }

    static async resendVerification(email: string): Promise<void> {
        return this.fetchAPI('/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    // ============ ADMIN FUNCTIONS ============

    static async logoutAllSessions(token: string, userId: string): Promise<void> {
        return this.fetchAPI(`/logout-all/${userId}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getUserSessions(token: string): Promise<any[]> {
        return this.fetchAPI('/sessions', {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async revokeSession(token: string, sessionId: string): Promise<void> {
        return this.fetchAPI(`/sessions/${sessionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ USER MANAGEMENT (ADMIN/MANAGER) ============

    static async getAllUsers(
        token: string,
        filters?: {
            role?: string;
            storeId?: string;
            isActive?: boolean;
            search?: string;
        },
        pagination?: {
            page?: number;
            limit?: number;
        }
    ): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();

        if (filters?.role) query.append('role', filters.role);
        if (filters?.storeId) query.append('storeId', filters.storeId);
        if (filters?.isActive !== undefined) query.append('isActive', filters.isActive.toString());
        if (filters?.search) query.append('search', filters.search);
        if (pagination?.page) query.append('page', pagination.page.toString());
        if (pagination?.limit) query.append('limit', pagination.limit.toString());

        return this.fetchAPI(`/users?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getUserById(token: string, userId: string): Promise<User> {
        return this.fetchAPI(`/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

export default AuthAPI;
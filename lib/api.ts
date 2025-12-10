// lib/api.ts
import { storage } from '@/utils/storage';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    code?: string;
    status?: number;
    details?: any; // Add this line
}

class ApiClient {
    private async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const token = storage.getAccessToken();
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
                ...options.headers,
            };

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle token expiration
                if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                    // Try to refresh token
                    const refreshed = await this.refreshToken();
                    if (refreshed.data) {
                        // Retry the original request with new token
                        return this.request(endpoint, options);
                    }
                }

                return {
                    error: data.error || 'Request failed',
                    code: data.code,
                    details: data.details,
                    status: response.status,
                };
            }

            return { data, status: response.status };
        } catch (error) {
            console.error('API request error:', error);
            return {
                error: error instanceof Error ? error.message : 'Network error',
                code: 'NETWORK_ERROR',
            };
        }
    }

    private async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
        try {
            const refreshToken = storage.getRefreshToken();

            if (!refreshToken) {
                return { error: 'No refresh token available', code: 'NO_REFRESH_TOKEN' };
            }

            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.error || 'Token refresh failed',
                    code: data.code,
                    status: response.status,
                    details: data.details,
                };
            }

            // Update stored token
            storage.setAccessToken(data.accessToken);

            return { data: { accessToken: data.accessToken } };
        } catch (error) {
            console.error('Token refresh error:', error);
            return { error: 'Token refresh failed', code: 'REFRESH_FAILED' };
        }
    }

    // Auth methods
    async login(email: string, password: string): Promise<ApiResponse<any>> {
        const result = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (result.data) {
            storage.setAccessToken(result.data.accessToken);
            if (result.data.refreshToken) {
                storage.setRefreshToken(result.data.refreshToken);
            }
            if (result.data.user) {
                storage.setUser(result.data.user);
            }
        }

        return result;
    }

    async register(userData: any): Promise<ApiResponse> {
        const result = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        return result;
    }

    async logout(): Promise<ApiResponse> {
        const refreshToken = storage.getRefreshToken();
        const result = await this.request('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken }),
        });

        // Clear local storage regardless of server response
        storage.clearAll();

        return result;
    }

    async getProfile(): Promise<ApiResponse<any>> {
        const result = await this.request('/auth/profile');

        if (result.data) {
            storage.setUser(result.data);
        }

        return result;
    }

    async updateProfile(profileData: any): Promise<ApiResponse<any>> {
        const result = await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });

        if (result.data?.user) {
            storage.setUser(result.data.user);
        }

        return result;
    }

    async verifyEmail(email: string, code: string): Promise<ApiResponse> {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email, code }),
        });
    }

    async forgotPassword(email: string): Promise<ApiResponse> {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    }

    async resetPassword(email: string, token: string, newPassword: string): Promise<ApiResponse> {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, token, newPassword }),
        });
    }

    // Generic request methods
    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient();
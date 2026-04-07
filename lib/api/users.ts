// app/users/utils/api.ts

import { UserFormData } from "@/components/users/users-form";
import { ChangePasswordData, ResetPasswordData, ResetPasswordRequestData, User, UserFilters, UsersResponse } from "@/types";


const API_BASE = '/api';

class UsersAPI {
    private static async fetchAPI<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
        try {
            console.log(`📤 Fetching: ${API_BASE}${endpoint}`);

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            console.log(`📥 Response status:`, response.status);

            let responseData;
            try {
                responseData = await response.json();
                console.log(`📥 Response data:`, responseData);
            } catch (e) {
                // If response is not JSON, get text
                const text = await response.text();
                console.error(`❌ Non-JSON response:`, text.substring(0, 200));
                throw new Error(text || 'API request failed');
            }

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || 'API request failed');
            }

            return responseData as T;
        } catch (error) {
            console.error(`❌ fetchAPI error for ${endpoint}:`, error);
            throw error;
        }
    }

    // ============ USER CRUD OPERATIONS ============

    static async getUsers(token: string, params?: UserFilters): Promise<UsersResponse> {
        try {
            const query = new URLSearchParams();

            if (params?.role) query.append('role', params.role);
            if (params?.isActive) query.append('isActive', params.isActive);
            if (params?.search) query.append('search', params.search);
            if (params?.page) query.append('page', params.page.toString());
            if (params?.limit) query.append('limit', params.limit.toString());

            const queryString = query.toString();
            const response = await this.fetchAPI<any>(`/users${queryString ? `?${queryString}` : ''}`, token, {
                cache: 'no-store',
            });

            console.log('📥 API Response in getUsers:', response);

            // Handle different response formats
            if (response && typeof response === 'object') {
                // If response has users array and pagination meta
                if (response.users && (response.total !== undefined || response.meta)) {
                    return {
                        users: response.users,
                        total: response.total || response.meta?.total || 0,
                        page: response.page || response.meta?.page || 1,
                        limit: response.limit || response.meta?.limit || 10,
                        totalPages: response.totalPages || response.meta?.totalPages || 1
                    };
                }

                // If response has data property (like some APIs format)
                if (response.data && Array.isArray(response.data)) {
                    return {
                        users: response.data,
                        total: response.meta?.total || response.data.length,
                        page: response.meta?.page || 1,
                        limit: response.meta?.limit || 10,
                        totalPages: response.meta?.totalPages || 1
                    };
                }

                // If it's an array directly
                if (Array.isArray(response)) {
                    return {
                        users: response,
                        total: response.length,
                        page: 1,
                        limit: response.length,
                        totalPages: 1
                    };
                }
            }

            // Return default empty response
            return {
                users: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 1
            };
        } catch (error) {
            console.error('❌ Error in getUsers:', error);
            // Return default empty response on error
            return {
                users: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 1
            };
        }
    }

    static async getUser(token: string, userId: string): Promise<User> {
        try {
            const response = await this.fetchAPI<any>(`/users/${userId}`, token, {
                cache: 'no-store',
            });

            return response.user || response;
        } catch (error) {
            console.error('❌ Error in getUser:', error);
            throw error;
        }
    }

    static async createUser(token: string, data: UserFormData): Promise<User> {
        try {
            const response = await this.fetchAPI<any>('/users', token, {
                method: 'POST',
                body: JSON.stringify(data),
            });

            return response.user || response;
        } catch (error) {
            console.error('❌ Error in createUser:', error);
            throw error;
        }
    }

    static async updateUser(token: string, userId: string, data: Partial<UserFormData>): Promise<User> {
        try {
            const response = await this.fetchAPI<any>(`/users/${userId}`, token, {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            return response.user || response;
        } catch (error) {
            console.error('❌ Error in updateUser:', error);
            throw error;
        }
    }

    static async deactivateUser(token: string, userId: string, reason?: string): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchAPI(`/users/${userId}/deactivate`, token, {
                method: 'POST',
                body: JSON.stringify({ reason }),
            });
        } catch (error) {
            console.error('❌ Error in deactivateUser:', error);
            throw error;
        }
    }

    static async activateUser(token: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchAPI(`/users/${userId}/activate`, token, {
                method: 'POST',
            });
        } catch (error) {
            console.error('❌ Error in activateUser:', error);
            throw error;
        }
    }

    static async deleteUser(token: string, userId: string): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchAPI(`/users/${userId}`, token, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('❌ Error in deleteUser:', error);
            throw error;
        }
    }

    // ============ PASSWORD MANAGEMENT ============

    static async changePassword(token: string, data: ChangePasswordData & { userId?: string }): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchAPI('/users/change-password', token, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('❌ Error in changePassword:', error);
            throw error;
        }
    }

    static async requestPasswordReset(data: ResetPasswordRequestData): Promise<{ success: boolean; message: string }> {
        try {
            // This endpoint doesn't require authentication
            const response = await fetch(`${API_BASE}/users/reset-password/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || 'Failed to request password reset');
            }

            return responseData;
        } catch (error) {
            console.error('❌ Error in requestPasswordReset:', error);
            throw error;
        }
    }

    static async resetPassword(data: ResetPasswordData): Promise<{ success: boolean; message: string }> {
        try {
            // This endpoint doesn't require authentication
            const response = await fetch(`${API_BASE}/users/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || 'Failed to reset password');
            }

            return responseData;
        } catch (error) {
            console.error('❌ Error in resetPassword:', error);
            throw error;
        }
    }

    // ============ BULK OPERATIONS ============

    static async bulkCreateUsers(token: string, users: UserFormData[]): Promise<{ success: boolean; created: User[]; errors: any[] }> {
        try {
            return await this.fetchAPI('/users/bulk', token, {
                method: 'POST',
                body: JSON.stringify({ users }),
            });
        } catch (error) {
            console.error('❌ Error in bulkCreateUsers:', error);
            throw error;
        }
    }

    static async bulkDeactivateUsers(token: string, userIds: string[], reason?: string): Promise<{ success: boolean; results: any[] }> {
        try {
            return await this.fetchAPI('/users/bulk/deactivate', token, {
                method: 'POST',
                body: JSON.stringify({ userIds, reason }),
            });
        } catch (error) {
            console.error('❌ Error in bulkDeactivateUsers:', error);
            throw error;
        }
    }

    // ============ ROLE MANAGEMENT ============

    static async updateUserRole(token: string, userId: string, role: string): Promise<User> {
        try {
            const response = await this.fetchAPI<any>(`/users/${userId}/role`, token, {
                method: 'PATCH',
                body: JSON.stringify({ role }),
            });

            return response.user || response;
        } catch (error) {
            console.error('❌ Error in updateUserRole:', error);
            throw error;
        }
    }

    static async getAvailableRoles(token: string): Promise<string[]> {
        try {
            const response = await this.fetchAPI<any>('/users/roles', token, {
                cache: 'no-store',
            });

            return response.roles || response || [];
        } catch (error) {
            console.error('❌ Error in getAvailableRoles:', error);
            return [];
        }
    }

    // ============ USER SESSION MANAGEMENT ============

    static async getUserSessions(token: string, userId: string): Promise<any[]> {
        try {
            const response = await this.fetchAPI<any>(`/users/${userId}/sessions`, token, {
                cache: 'no-store',
            });

            return response.sessions || response || [];
        } catch (error) {
            console.error('❌ Error in getUserSessions:', error);
            return [];
        }
    }

    static async revokeUserSession(token: string, userId: string, sessionId: string): Promise<{ success: boolean }> {
        try {
            return await this.fetchAPI(`/users/${userId}/sessions/${sessionId}`, token, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('❌ Error in revokeUserSession:', error);
            throw error;
        }
    }

    static async revokeAllUserSessions(token: string, userId: string): Promise<{ success: boolean }> {
        try {
            return await this.fetchAPI(`/users/${userId}/sessions`, token, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('❌ Error in revokeAllUserSessions:', error);
            throw error;
        }
    }

    // ============ STATISTICS ============

    static async getUserStats(token: string): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        byRole: Array<{ role: string; count: number }>;
        recentLogins: number;
        newUsersThisMonth: number;
    }> {
        try {
            const response = await this.fetchAPI<any>('/users/stats', token, {
                cache: 'no-store',
            });

            return {
                totalUsers: response.totalUsers || 0,
                activeUsers: response.activeUsers || 0,
                inactiveUsers: response.inactiveUsers || 0,
                byRole: response.byRole || [],
                recentLogins: response.recentLogins || 0,
                newUsersThisMonth: response.newUsersThisMonth || 0
            };
        } catch (error) {
            console.error('❌ Error in getUserStats:', error);
            return {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                byRole: [],
                recentLogins: 0,
                newUsersThisMonth: 0
            };
        }
    }

    // ============ HELPER METHODS ============

    static formatUserName(user: User): string {
        return `${user.firstName} ${user.lastName}`.trim();
    }

    static getUserInitials(user: User): string {
        return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }

    static getRoleBadgeVariant(role: string): 'default' | 'secondary' | 'destructive' | 'outline' {
        switch (role) {
            case 'admin':
                return 'destructive';
            case 'manager':
                return 'default';
            case 'staff':
                return 'secondary';
            default:
                return 'outline';
        }
    }

    static getRoleColor(role: string): string {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'manager':
                return 'bg-blue-100 text-blue-800';
            case 'staff':
                return 'bg-green-100 text-green-800';
            case 'customer':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    static getStatusInfo(isActive: boolean): { color: string; label: string; badgeVariant: 'default' | 'secondary' | 'destructive' } {
        if (isActive) {
            return { 
                color: 'bg-green-100 text-green-800', 
                label: 'Active', 
                badgeVariant: 'default' 
            };
        }
        return { 
            color: 'bg-gray-100 text-gray-800', 
            label: 'Inactive', 
            badgeVariant: 'secondary' 
        };
    }

    static formatLastLogin(lastLogin?: string): string {
        if (!lastLogin) return 'Never';
        
        const date = new Date(lastLogin);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static validateUserData(data: Partial<UserFormData>): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.email) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Invalid email format');
        }

        if (!data.firstName) {
            errors.push('First name is required');
        } else if (data.firstName.length < 2) {
            errors.push('First name must be at least 2 characters');
        }

        if (!data.lastName) {
            errors.push('Last name is required');
        } else if (data.lastName.length < 2) {
            errors.push('Last name must be at least 2 characters');
        }

        if (!data.role) {
            errors.push('Role is required');
        }

        // Only validate password for new users or when changing password
        if (data.password) {
            if (data.password.length < 6) {
                errors.push('Password must be at least 6 characters');
            }
            if (data.password !== data.confirmPassword) {
                errors.push('Passwords do not match');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static filterUsersBySearch(users: User[], searchTerm: string): User[] {
        if (!searchTerm) return users;
        
        const term = searchTerm.toLowerCase();
        return users.filter(user => 
            user.firstName.toLowerCase().includes(term) ||
            user.lastName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term)
        );
    }

    // static sortUsers(users: User[], sortBy: keyof User = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): User[] {
    //     return [...users].sort((a, b) => {
    //         let aVal = a[sortBy];
    //         let bVal = b[sortBy];

    //         if (sortBy === 'lastLogin' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
    //             aVal = aVal ? new Date(aVal as string).getTime() : 0;
    //             bVal = bVal ? new Date(bVal as string).getTime() : 0;
    //         }

    //         if (typeof aVal === 'string' && typeof bVal === 'string') {
    //             return sortOrder === 'asc' 
    //                 ? aVal.localeCompare(bVal)
    //                 : bVal.localeCompare(aVal);
    //         }

    //         if (typeof aVal === 'number' && typeof bVal === 'number') {
    //             return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    //         }

    //         if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
    //             return sortOrder === 'asc' 
    //                 ? (aVal === bVal ? 0 : aVal ? -1 : 1)
    //                 : (aVal === bVal ? 0 : aVal ? 1 : -1);
    //         }

    //         return 0;
    //     });
    // }

    static paginateUsers(users: User[], page: number = 1, limit: number = 10): { users: User[]; total: number; totalPages: number } {
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return {
            users: users.slice(start, end),
            total: users.length,
            totalPages: Math.ceil(users.length / limit)
        };
    }
}

export default UsersAPI;
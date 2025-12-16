'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
    User,
    Role,
    LoginResponse as ApiLoginResponse,
    RegisterRequest,
    RegisterResponse,
    VerifyAccountRequest,
    PasswordResetRequest,
    PasswordResetConfirmRequest,
    ChangePasswordRequest,
    UpdateProfileRequest
} from '@/types';

export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    refreshAccessToken: () => Promise<void>;
    verifyAccount: (email: string, code: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (email: string, resetToken: string, newPassword: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    updateProfile: (updates: UpdateProfileRequest) => Promise<void>;
    logoutAllSessions: (userId: string) => Promise<void>;
    getSessions: () => Promise<any>;
    revokeSession: (tokenId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based route permissions based on your backend routes
const routePermissions: Record<Role, string[]> = {
    [Role.ADMIN]: [
        '/dashboard',
        '/dashboard/*',  // Allow all dashboard subroutes for admin
        '/users',
        '/users/*',
        '/employees',
        '/employees/*',
        '/branches',
        '/branches/*',
        '/products',
        '/products/*',
        '/inventory',
        '/inventory/*',
        '/transfers',
        '/transfers/*',
        '/sales',
        '/sales/*',
        '/reports',
        '/reports/*'
    ],
    [Role.MANAGER]: [
        '/dashboard',
        '/dashboard/*',  // Allow all dashboard subroutes for manager
        '/branches',
        '/branches/*',
        '/products',
        '/products/*',
        '/inventory',
        '/inventory/*',
        '/transfers',
        '/transfers/*',
        '/sales',
        '/sales/*',
        '/reports',
        '/reports/*'
    ],
    [Role.CASHIER]: [
        '/dashboard',
        '/dashboard/*',  // Allow all dashboard subroutes for cashier
        '/products',
        '/products/*',
        '/inventory',
        '/inventory/*',
        '/sales',
        '/sales/*',
        '/customers',
        '/customers/*'
    ]
};

// All roles that can access the system
const SYSTEM_ROLES: Role[] = [Role.ADMIN, Role.MANAGER, Role.CASHIER];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/sign-in',
    '/sign-up',
    '/verify',
    '/forgot-password',
    '/reset-password'
];

// Safe function to get allowed routes with fallback
const getAllowedRoutes = (role: Role): string[] => {
    return routePermissions[role] || ['/dashboard'];
};

// Validate if a role is a valid system role
const isValidSystemRole = (role: string): role is Role => {
    return SYSTEM_ROLES.includes(role.toUpperCase() as Role);
};

// Normalize role to ensure consistent casing
const normalizeUserRole = (role: string): Role => {
    const normalizedRole = role.toUpperCase() as Role;
    if (isValidSystemRole(normalizedRole)) {
        return normalizedRole;
    }
    throw new Error('Invalid user role');
};

// Store keys for localStorage
const STORAGE_KEYS = {
    ACCESS_TOKEN: 'inventory_accessToken',
    REFRESH_TOKEN: 'inventory_refreshToken',
    USER: 'inventory_user'
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: true,
        isAuthenticated: false,
    });

    const router = useRouter();
    const pathname = usePathname();

    // Safe route permission check
    const hasRoutePermission = (user: User | null, path: string): boolean => {
        if (!user) return false;

        // Allow access to public routes for all authenticated users
        if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
            return true;
        }

        // Allow access to dashboard home for all authenticated users
        if (path === '/dashboard') {
            return true;
        }

        const allowedRoutes = getAllowedRoutes(user.role);
        return allowedRoutes.some(route =>
            path === route || path.startsWith(route + '/')
        );
    };

    // Check if route is public
    const isPublicRoute = (path: string): boolean => {
        return PUBLIC_ROUTES.some(route => path.startsWith(route));
    };

    // Initialize auth state from localStorage with validation
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                const userData = localStorage.getItem(STORAGE_KEYS.USER);

                if (accessToken && refreshToken && userData) {
                    const user = JSON.parse(userData) as User;

                    // Validate user data structure
                    if (user && user.id && user.email && user.role) {
                        try {
                            const normalizedUser: User = {
                                ...user,
                                role: normalizeUserRole(user.role),
                                lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
                                createdAt: new Date(user.createdAt),
                                updatedAt: new Date(user.updatedAt)
                            };

                            setAuthState({
                                user: normalizedUser,
                                accessToken,
                                refreshToken,
                                isLoading: false,
                                isAuthenticated: true,
                            });
                        } catch (roleError) {
                            console.warn('Invalid user role detected, clearing auth:', roleError);
                            await logout();
                        }
                    } else {
                        console.warn('Invalid user data in localStorage, clearing auth');
                        await logout();
                    }
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                await logout();
            }
        };

        initializeAuth();
    }, []);

    // Route protection with safe checks
    useEffect(() => {
        if (authState.isLoading) return;
        if (!pathname) return;

        if (authState.isAuthenticated && authState.user) {
            // Redirect to dashboard if trying to access auth pages while logged in
            if (isPublicRoute(pathname)) {
                router.push('/dashboard');
                return;
            }

            // Check route permissions for protected routes
            if (!hasRoutePermission(authState.user, pathname)) {
                console.warn(`User ${authState.user.role} attempted to access unauthorized route: ${pathname}`);
                router.push('/dashboard');
                return;
            }
        } else {
            // Redirect to login if trying to access protected routes while not authenticated
            if (!isPublicRoute(pathname) && pathname.startsWith('/dashboard')) {
                router.push('/sign-in');
                return;
            }
        }
    }, [authState.isAuthenticated, authState.isLoading, authState.user, pathname, router]);

    const refreshAccessToken = async (): Promise<void> => {
        try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
                setAuthState(prev => ({
                    ...prev,
                    accessToken: data.accessToken,
                }));
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            await logout();
        }
    };

    const login = async (email: string, password: string): Promise<void> => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                const { accessToken, refreshToken, user } = data as ApiLoginResponse;

                // Validate user has system role
                if (!user.role) {
                    throw new Error('No user role received from server');
                }

                try {
                    const normalizedUser: User = {
                        ...user,
                        role: normalizeUserRole(user.role),
                        lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
                        createdAt: new Date(user.createdAt),
                        updatedAt: new Date(user.updatedAt)
                    };

                    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
                    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(normalizedUser));

                    setAuthState({
                        user: normalizedUser,
                        accessToken,
                        refreshToken,
                        isLoading: false,
                        isAuthenticated: true,
                    });

                    router.push('/dashboard');
                } catch (roleError) {
                    throw new Error('Invalid user role');
                }
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const register = async (userData: RegisterRequest): Promise<void> => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json() as RegisterResponse;

            if (response.ok) {
                // Registration successful, redirect to verification page if needed
                if (userData.role === Role.CASHIER) {
                    router.push(`/auth/verify?email=${encodeURIComponent(userData.email)}`);
                } else {
                    // For admin/manager, redirect to login
                    router.push(`/sign-in?registered=true&email=${encodeURIComponent(userData.email)}`);
                }
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setAuthState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            // Call logout API if we have tokens
            if (authState.accessToken && authState.refreshToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authState.accessToken}`,
                    },
                    body: JSON.stringify({ refreshToken: authState.refreshToken }),
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);

            setAuthState({
                user: null,
                accessToken: null,
                refreshToken: null,
                isLoading: false,
                isAuthenticated: false,
            });

            router.push('/sign-in');
        }
    };

    const verifyAccount = async (email: string, code: string): Promise<void> => {
        try {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const request: VerifyAccountRequest = { email, code };
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/?verified=true');
            } else {
                throw new Error(data.error || 'Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            throw error;
        } finally {
            setAuthState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const requestPasswordReset = async (email: string): Promise<void> => {
        try {
            const request: PasswordResetRequest = { email };
            const response = await fetch('/api/auth/password/reset-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset request failed');
            }
        } catch (error) {
            console.error('Password reset request error:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string, resetToken: string, newPassword: string): Promise<void> => {
        try {
            const request: PasswordResetConfirmRequest = { email, resetToken, newPassword };
            const response = await fetch('/api/auth/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
        try {
            const request: ChangePasswordRequest = { currentPassword, newPassword };
            const response = await fetch('/api/auth/password/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.accessToken}`,
                },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password change failed');
            }
        } catch (error) {
            console.error('Password change error:', error);
            throw error;
        }
    };

    const updateProfile = async (updates: UpdateProfileRequest): Promise<void> => {
        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authState.accessToken}`,
                },
                body: JSON.stringify(updates),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local user data
                const updatedUser = { ...authState.user, ...data } as User;
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
                setAuthState(prev => ({ ...prev, user: updatedUser }));
            } else {
                throw new Error(data.error || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    };

    const logoutAllSessions = async (userId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/auth/logout-all/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Logout all sessions failed');
            }
        } catch (error) {
            console.error('Logout all sessions error:', error);
            throw error;
        }
    };

    const getSessions = async (): Promise<any> => {
        try {
            const response = await fetch('/api/auth/sessions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                return data;
            } else {
                throw new Error(data.error || 'Failed to get sessions');
            }
        } catch (error) {
            console.error('Get sessions error:', error);
            throw error;
        }
    };

    const revokeSession = async (tokenId: string): Promise<void> => {
        try {
            const response = await fetch(`/api/auth/sessions/${tokenId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authState.accessToken}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to revoke session');
            }
        } catch (error) {
            console.error('Revoke session error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        refreshAccessToken,
        verifyAccount,
        requestPasswordReset,
        resetPassword,
        changePassword,
        updateProfile,
        logoutAllSessions,
        getSessions,
        revokeSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
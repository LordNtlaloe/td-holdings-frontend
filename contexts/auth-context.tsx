// context/auth-context.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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
    refreshAccessToken: () => Promise<boolean>;
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

// Role-based route permissions
const routePermissions: Record<Role, string[]> = {
    [Role.ADMIN]: [
        '/dashboard',
        '/dashboard/*',
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
        '/reports/*',
        '/store-locations'
    ],
    [Role.MANAGER]: [
        '/dashboard',
        '/dashboard/*',
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
        '/dashboard/*',
        '/products',
        '/products/*',
        '/inventory',
        '/inventory/*',
        '/sales',
        '/sales/*',
        '/customers',
        '/customers/*'
    ],
};

const SYSTEM_ROLES: Role[] = [Role.ADMIN, Role.MANAGER, Role.CASHIER];

const PUBLIC_ROUTES = [
    '/sign-in',
    '/sign-up',
    '/verify',
    '/forgot-password',
    '/reset-password',
    '/store-locations'
];

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'inventory_accessToken',
    REFRESH_TOKEN: 'inventory_refreshToken',
    USER: 'inventory_user'
};

const getAllowedRoutes = (role: Role): string[] => {
    return routePermissions[role] || ['/dashboard'];
};

const isValidSystemRole = (role: string): role is Role => {
    return SYSTEM_ROLES.includes(role.toUpperCase() as Role);
};

const normalizeUserRole = (role: string): Role => {
    const normalizedRole = role.toUpperCase() as Role;
    if (isValidSystemRole(normalizedRole)) {
        return normalizedRole;
    }
    throw new Error('Invalid user role');
};

const safeParseDate = (dateString: string | Date | null | undefined): string | undefined => {
    if (!dateString) return undefined;
    if (typeof dateString === 'string') return dateString;
    if (dateString instanceof Date) return dateString.toISOString();
    return undefined;
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('Invalid JWT format');
            return true;
        }

        const payload = JSON.parse(atob(parts[1]));

        if (!payload.exp) {
            console.warn('Token has no expiration');
            return true;
        }

        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();

        // Add 5 minute buffer to refresh before actual expiration
        const bufferTime = 5 * 60 * 1000;

        return currentTime >= (expirationTime - bufferTime);
    } catch (error) {
        console.error('Error parsing token:', error);
        return true;
    }
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
    const isRefreshingRef = useRef(false);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hasRoutePermission = (user: User | null, path: string): boolean => {
        if (!user) return false;
        if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
            return true;
        }
        if (path === '/dashboard') {
            return true;
        }
        const allowedRoutes = getAllowedRoutes(user.role);
        return allowedRoutes.some(route =>
            path === route || path.startsWith(route + '/')
        );
    };

    const isPublicRoute = (path: string): boolean => {
        return PUBLIC_ROUTES.some(route => path.startsWith(route));
    };

    // Clear auth function
    const clearAuth = () => {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }

        setAuthState({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            isAuthenticated: false,
        });
        isRefreshingRef.current = false;
    };

    // Schedule automatic token refresh
    const scheduleTokenRefresh = (token: string) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) return;

            const payload = JSON.parse(atob(parts[1]));
            if (!payload.exp) return;

            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // Refresh 5 minutes before expiry
            const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);

            console.log(`🔄 Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);

            refreshTimeoutRef.current = setTimeout(async () => {
                console.log('🔄 Scheduled token refresh triggered');
                try {
                    await refreshAccessToken();
                } catch (error) {
                    console.error('🔄 Scheduled refresh failed:', error);
                }
            }, refreshTime);
        } catch (error) {
            console.error('Error scheduling token refresh:', error);
        }
    };

    // Refresh access token
    const refreshAccessToken = async (): Promise<boolean> => {
        // Prevent multiple simultaneous refresh attempts
        if (isRefreshingRef.current) {
            console.log('[REFRESH] Refresh already in progress, skipping...');
            return false;
        }

        try {
            isRefreshingRef.current = true;

            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            console.log('[REFRESH] Attempting to refresh access token...');

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            const data = await response.json();

            if (response.ok && data.accessToken) {
                console.log('[REFRESH SUCCESS] Token refreshed successfully');

                const newAccessToken = data.accessToken;
                const newRefreshToken = data.refreshToken;
                const userData = data.user;

                // Update storage
                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

                if (userData) {
                    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
                }

                // Update state
                setAuthState(prev => ({
                    ...prev,
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                    user: userData || prev.user,
                    isAuthenticated: true,
                    isLoading: false,
                }));

                // Schedule next refresh
                scheduleTokenRefresh(newAccessToken);

                return true;
            } else {
                console.error('[REFRESH ERROR] Token refresh failed:', data.error || 'Unknown error');
                throw new Error(data.error || 'Token refresh failed');
            }
        } catch (error) {
            console.error('[REFRESH ERROR] Token refresh error:', error);

            // If refresh fails, clear auth
            clearAuth();

            return false;
        } finally {
            isRefreshingRef.current = false;
        }
    };

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
                const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
                const userData = localStorage.getItem(STORAGE_KEYS.USER);

                if (accessToken && refreshToken && userData) {
                    // Check if token is expired
                    if (isTokenExpired(accessToken)) {
                        console.log('[AUTH] Access token expired on init, attempting refresh...');

                        const refreshSuccess = await refreshAccessToken();
                        if (!refreshSuccess) {
                            console.log('[AUTH] Refresh failed, clearing auth');
                            clearAuth();
                            return;
                        }
                    } else {
                        // Token is still valid
                        const user = JSON.parse(userData) as User;

                        if (user && user.id && user.email && user.role) {
                            try {
                                const normalizedUser: User = {
                                    ...user,
                                    role: normalizeUserRole(user.role),
                                    lastLogin: safeParseDate(user.lastLogin),
                                    createdAt: safeParseDate(user.createdAt) || '',
                                    updatedAt: safeParseDate(user.updatedAt) || ''
                                };

                                setAuthState({
                                    user: normalizedUser,
                                    accessToken,
                                    refreshToken,
                                    isLoading: false,
                                    isAuthenticated: true,
                                });

                                // Schedule token refresh
                                scheduleTokenRefresh(accessToken);
                            } catch (roleError) {
                                console.warn('Invalid user role detected, clearing auth:', roleError);
                                clearAuth();
                            }
                        } else {
                            console.warn('Invalid user data in localStorage, clearing auth');
                            clearAuth();
                        }
                    }
                } else {
                    setAuthState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                clearAuth();
            }
        };

        initializeAuth();

        // Cleanup timeout on unmount
        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    // Route protection
    useEffect(() => {
        if (authState.isLoading) return;
        if (!pathname) return;

        if (authState.isAuthenticated && authState.user) {
            if (isPublicRoute(pathname)) {
                router.push('/dashboard');
                return;
            }

            if (!hasRoutePermission(authState.user, pathname)) {
                console.warn(`User ${authState.user.role} attempted to access unauthorized route: ${pathname}`);
                router.push('/dashboard');
                return;
            }
        } else {
            if (!isPublicRoute(pathname) && pathname.startsWith('/dashboard')) {
                router.push('/sign-in');
                return;
            }
        }
    }, [authState.isAuthenticated, authState.isLoading, authState.user, pathname, router]);

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
                const responseData = data.data || data;
                const { accessToken, refreshToken, user } = responseData;

                if (!user.role) {
                    throw new Error('No user role received from server');
                }

                try {
                    const normalizedUser: User = {
                        ...user,
                        role: normalizeUserRole(user.role),
                        lastLogin: safeParseDate(user.lastLogin),
                        createdAt: safeParseDate(user.createdAt) || '',
                        updatedAt: safeParseDate(user.updatedAt) || ''
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

                    // Schedule token refresh
                    scheduleTokenRefresh(accessToken);

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
                if (userData.role === Role.CASHIER) {
                    router.push(`/auth/verify?email=${encodeURIComponent(userData.email)}`);
                } else {
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
            clearAuth();
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

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
// providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, AuthState } from '@/types/auth';
import { api } from '@/lib/api';
import { storage } from '@/utils/storage';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (userData: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>;
    verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    refreshUser: () => Promise<void>;
    hasRole: (roles: string | string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// Public routes that don't require authentication
const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
];

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });

    const router = useRouter();
    const pathname = usePathname();

    // Load user from storage and validate token
    const loadUser = useCallback(async () => {
        try {
            const storedUser = storage.getUser();
            const token = storage.getAccessToken();

            if (!token || !storedUser) {
                setState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
                return;
            }

            // Validate token by fetching profile
            const result = await api.getProfile();

            if (result.data) {
                setState({
                    user: result.data,
                    isLoading: false,
                    isAuthenticated: true,
                });
            } else {
                // Token is invalid, clear storage
                storage.clearAll();
                setState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            storage.clearAll();
            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Handle route protection
    useEffect(() => {
        if (state.isLoading) return;

        const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

        if (!state.isAuthenticated && !isPublicRoute) {
            // Redirect to login if not authenticated on protected route
            router.push('/login');
        } else if (state.isAuthenticated && isPublicRoute) {
            // Redirect to dashboard if authenticated on public route
            router.push('/dashboard');
        }
    }, [state.isAuthenticated, state.isLoading, pathname, router]);

    const login = async (email: string, password: string) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const result = await api.login(email, password);

            if (result.error) {
                setState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: result.error };
            }

            await loadUser();
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: 'Login failed' };
        }
    };

    const register = async (userData: any) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const result = await api.register(userData);

            if (result.error) {
                setState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: result.error };
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            storage.clearAll();
            setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
            router.push('/login');
        }
    };

    const updateProfile = async (profileData: any) => {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const result = await api.updateProfile(profileData);

            if (result.error) {
                setState(prev => ({ ...prev, isLoading: false }));
                return { success: false, error: result.error };
            }

            await loadUser();
            return { success: true };
        } catch (error) {
            console.error('Update profile error:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: 'Update failed' };
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const result = await api.verifyEmail(email, code);

            if (result.error) {
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            console.error('Verify email error:', error);
            return { success: false, error: 'Verification failed' };
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const result = await api.forgotPassword(email);

            if (result.error) {
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            console.error('Forgot password error:', error);
            return { success: false, error: 'Request failed' };
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string) => {
        try {
            const result = await api.resetPassword(email, token, newPassword);

            if (result.error) {
                return { success: false, error: result.error };
            }

            return { success: true };
        } catch (error) {
            console.error('Reset password error:', error);
            return { success: false, error: 'Reset failed' };
        }
    };

    const refreshUser = async () => {
        await loadUser();
    };

    const hasRole = (roles: string | string[]): boolean => {
        if (!state.user) return false;

        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(state.user.role);
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        forgotPassword,
        resetPassword,
        refreshUser,
        hasRole,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
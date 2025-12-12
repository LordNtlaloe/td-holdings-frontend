'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_MANAGER';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phoneNumber?: string;
    emailVerified?: Date | null;
}

export interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userData: any) => Promise<void>;
    updateProfile: (profileData: any) => Promise<void>;
    verifyEmail: (email: string, code: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
    hasRole: (roles: UserRole | UserRole[]) => boolean;
    hasRoutePermission: (path: string) => boolean;
    checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isLoading: true,
        isAuthenticated: false,
    });

    const router = useRouter();
    const pathname = usePathname();

    // Check authentication status
    const checkAuth = useCallback(async (): Promise<boolean> => {
        try {
            console.log('Checking authentication status...');

            const response = await fetch('/api/auth/profile', {
                credentials: 'include',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            console.log('Profile check response status:', response.status);

            if (response.ok) {
                const user = await response.json();
                console.log('User authenticated:', user.email);

                setAuthState({
                    user,
                    isLoading: false,
                    isAuthenticated: true,
                });
                return true;
            } else {
                const error = await response.json();
                console.log('Not authenticated:', error.error);

                setAuthState({
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
                return false;
            }
        } catch (error) {
            console.error('Failed to check auth:', error);
            setAuthState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
            return false;
        }
    }, []);

    // Load initial auth state
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email: string, password: string): Promise<void> => {
        try {
            console.log('Logging in user:', email);
            setAuthState(prev => ({ ...prev, isLoading: true }));

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            console.log('Login response status:', response.status);

            if (!response.ok) {
                const error = await response.json();
                console.error('Login failed:', error);
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            console.log('Login successful, received data:', data);

            // The response contains { user: {...} }
            if (data.user) {
                console.log('Setting authenticated user:', data.user.email);
                setAuthState({
                    user: data.user,
                    isLoading: false,
                    isAuthenticated: true,
                });

                // Small delay to ensure cookies are set
                await new Promise(resolve => setTimeout(resolve, 100));

                console.log('Redirecting to dashboard...');
                router.push('/dashboard');
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                isAuthenticated: false,
                user: null
            }));
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('Logging out...');
            setAuthState(prev => ({ ...prev, isLoading: true }));

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAuthState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
            });
            router.push('/sign-in');
        }
    };

    const register = async (userData: any): Promise<void> => {
        try {
            console.log('Registering user:', userData.email);

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            console.log('Registration successful');

            if (userData.email) {
                router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`);
            }
        } catch (error: any) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const updateProfile = async (profileData: any): Promise<void> => {
        try {
            console.log('Updating profile...');

            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(profileData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Update failed');
            }

            const data = await response.json();
            console.log('Profile updated successfully');

            // Update local state
            if (data.user) {
                setAuthState(prev => ({
                    ...prev,
                    user: data.user
                }));
            } else {
                // If the response doesn't have user, fetch profile again
                await checkAuth();
            }
        } catch (error: any) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const verifyEmail = async (email: string, code: string): Promise<void> => {
        try {
            console.log('Verifying email:', email);

            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Verification failed');
            }

            console.log('Email verified successfully');
            await checkAuth();
        } catch (error: any) {
            console.error('Verify email error:', error);
            throw error;
        }
    };

    const forgotPassword = async (email: string): Promise<void> => {
        try {
            console.log('Requesting password reset for:', email);

            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }

            console.log('Password reset email sent');
        } catch (error: any) {
            console.error('Forgot password error:', error);
            throw error;
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string): Promise<void> => {
        try {
            console.log('Resetting password for:', email);

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, token, newPassword }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Reset failed');
            }

            console.log('Password reset successful');
        } catch (error: any) {
            console.error('Reset password error:', error);
            throw error;
        }
    };

    const hasRole = (roles: UserRole | UserRole[]): boolean => {
        if (!authState.user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(authState.user.role);
    };

    const hasRoutePermission = (path: string): boolean => {
        // Public routes
        const publicRoutes = ['/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/verify-email'];
        if (publicRoutes.includes(path)) return true;

        // Require authentication for all other routes
        return authState.isAuthenticated;
    };

    const value: AuthContextType = {
        ...authState,
        login,
        logout,
        register,
        updateProfile,
        verifyEmail,
        forgotPassword,
        resetPassword,
        hasRole,
        hasRoutePermission,
        checkAuth,
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
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authService } from '@/lib/auth-services';
import { User } from '@/types';

// Define User role type
type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'USER';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData extends LoginCredentials {
    firstName: string;
    lastName: string;
    phone?: string;
    role?: string;
    storeId?: string;
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<{ message: string }>;
    forgotPassword: (email: string) => Promise<{ message: string }>;
    resetPassword: (email: string, token: string, newPassword: string) => Promise<{ message: string }>;
    verifyEmail: (email: string, code: string) => Promise<{ message: string; user?: User }>;
    resendVerificationCode: (email: string) => Promise<{ message: string }>;
    clearError: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// ============ ROUTE CONFIGURATION ============
// Public routes (accessible without authentication)
const PUBLIC_ROUTES = [
    '/',                    // Home page
    '/public/products',     // Public product catalog
    '/public/stores',       // Public store directory
];

// Authentication routes (should NOT be accessible when logged in)
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
];

// Protected routes (require authentication)
const PROTECTED_ROUTES: Record<UserRole, string[]> = {
    ADMIN: ['/admin', '/admin/*', '/users', '/settings', '/reports', '/audit'],
    MANAGER: ['/manager', '/manager/*', '/inventory', '/employees', '/transfers'],
    CASHIER: ['/cashier', '/cashier/*', '/sales', '/pos', '/products'],
    USER: ['/dashboard', '/profile', '/orders'],
};

// Default redirect paths for each role after login
const ROLE_REDIRECTS: Record<UserRole, string> = {
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    CASHIER: '/sales/pos',
    USER: '/dashboard',
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
    });
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const pathname = usePathname();

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    // Route protection logic
    useEffect(() => {
        if (!authState.isLoading && authState.isInitialized) {
            handleRouteProtection();
        }
    }, [pathname, authState.isLoading, authState.isInitialized, authState.isAuthenticated]);

    const initializeAuth = async () => {
        try {
            // Check if user data exists in localStorage (for SSR persistence)
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('td_user');
                const storedToken = localStorage.getItem('td_token');

                if (storedUser && storedToken) {
                    const user = JSON.parse(storedUser);
                    setAuthState(prev => ({
                        ...prev,
                        user,
                        token: storedToken,
                        isAuthenticated: true,
                    }));
                }
            }

            // Try to refresh token silently
            await refreshTokenSilently();
        } catch (error) {
            console.error('Auth initialization failed:', error);
            // Clear invalid stored data
            clearStoredAuth();
        } finally {
            setAuthState(prev => ({
                ...prev,
                isLoading: false,
                isInitialized: true,
            }));
        }
    };

    const refreshTokenSilently = async () => {
        try {
            const data = await authService.refreshToken();

            // Update auth state with new token
            setAuthState(prev => ({
                ...prev,
                token: data.accessToken,
                isAuthenticated: true,
            }));

            // Store new token
            if (typeof window !== 'undefined') {
                localStorage.setItem('td_token', data.accessToken);
            }

            // Optionally fetch fresh user data
            if (authState.user) {
                await fetchUserProfile();
            }

            return true;
        } catch (error) {
            console.error('Silent token refresh failed:', error);
            return false;
        }
    };

    const fetchUserProfile = async () => {
        try {
            const user = await authService.getProfile();
            setAuthState(prev => ({ ...prev, user }));

            if (typeof window !== 'undefined') {
                localStorage.setItem('td_user', JSON.stringify(user));
            }
            return user;
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    };

    const handleRouteProtection = () => {
        const { isAuthenticated, user } = authState;

        // Skip protection during loading or initialization
        if (authState.isLoading || !authState.isInitialized) {
            return;
        }

        // Check if current route is an auth route
        const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

        // Check if current route is a public route
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

        // Check if current route is a protected route
        const isProtectedRoute = Object.values(PROTECTED_ROUTES).some(routes =>
            routes.some(route => {
                if (route.endsWith('/*')) {
                    const baseRoute = route.slice(0, -2);
                    return pathname.startsWith(baseRoute);
                }
                return pathname === route;
            })
        );

        // ============ LOGIC ============
        // 1. If user is authenticated AND trying to access auth routes → redirect to dashboard
        if (isAuthenticated && isAuthRoute && user) {
            const redirectPath = ROLE_REDIRECTS[user.role as UserRole];
            router.push(redirectPath);
            return;
        }

        // 2. If user is NOT authenticated AND trying to access protected route → redirect to login
        if (!isAuthenticated && isProtectedRoute) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
            return;
        }

        // 3. If user is authenticated AND trying to access protected route → check role permissions
        if (isAuthenticated && isProtectedRoute && user) {
            const userRole = user.role as UserRole;
            const allowedRoutes = PROTECTED_ROUTES[userRole];

            const isRouteAllowed = allowedRoutes.some(route => {
                if (route.endsWith('/*')) {
                    const baseRoute = route.slice(0, -2);
                    return pathname.startsWith(baseRoute);
                }
                return pathname === route;
            });

            if (!isRouteAllowed && pathname !== '/unauthorized') {
                router.push('/unauthorized');
            }
        }

        // 4. Public routes are always accessible (no action needed)
    };

    const login = async (credentials: LoginCredentials) => {
        setError(null);
        try {
            const data = await authService.login(credentials);

            // Update auth state
            setAuthState({
                user: data.user,
                token: data.accessToken,
                isAuthenticated: true,
                isLoading: false,
                isInitialized: true,
            });

            // Store in localStorage for persistence
            if (typeof window !== 'undefined') {
                localStorage.setItem('td_user', JSON.stringify(data.user));
                localStorage.setItem('td_token', data.accessToken);
            }

            // Redirect based on role
            const redirectPath = ROLE_REDIRECTS[data.user.role as UserRole];
            router.push(redirectPath);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (data: RegisterData) => {
        setError(null);
        try {
            const result = await authService.register(data);

            // Check if auto-login is enabled
            if (result.autoLogin && result.user && result.accessToken) {
                // Auto-login after registration
                setAuthState({
                    user: result.user,
                    token: result.accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                });

                // Store in localStorage
                if (typeof window !== 'undefined') {
                    localStorage.setItem('td_user', JSON.stringify(result.user));
                    localStorage.setItem('td_token', result.accessToken);
                }

                // Redirect based on role
                const redirectPath = ROLE_REDIRECTS[result.user.role as UserRole];
                router.push(redirectPath);
            } else {
                // Redirect to verification page
                router.push('/verify-email');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all auth state
            clearAuthState();

            // Redirect to login page
            router.push('/login');
        }
    };

    const clearAuthState = () => {
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
        });

        clearStoredAuth();
    };

    const clearStoredAuth = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('td_user');
            localStorage.removeItem('td_token');
        }
    };

    const refreshToken = async () => {
        try {
            await refreshTokenSilently();
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        setError(null);
        try {
            const data = await authService.updateProfile(updates);

            // Update auth state with new user data
            setAuthState(prev => ({
                ...prev,
                user: data.user,
            }));

            // Update localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('td_user', JSON.stringify(data.user));
            }

            return data.user;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        setError(null);
        try {
            const data = await authService.changePassword(currentPassword, newPassword);
            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const forgotPassword = async (email: string) => {
        setError(null);
        try {
            const data = await authService.requestPasswordReset(email);
            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to request password reset';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const resetPassword = async (email: string, token: string, newPassword: string) => {
        setError(null);
        try {
            const data = await authService.resetPassword(email, token, newPassword);
            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to reset password';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        setError(null);
        try {
            const data = await authService.verifyEmail(email, code);

            // If verification includes user data (auto-login scenario)
            if (data.user && data.accessToken) {
                setAuthState({
                    user: data.user,
                    token: data.accessToken,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                });

                if (typeof window !== 'undefined') {
                    localStorage.setItem('td_user', JSON.stringify(data.user));
                    localStorage.setItem('td_token', data.accessToken);
                }

                // Redirect based on role
                const redirectPath = ROLE_REDIRECTS[data.user.role as UserRole];
                router.push(redirectPath);
            }

            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Email verification failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const resendVerificationCode = async (email: string) => {
        setError(null);
        try {
            const data = await authService.resendVerificationCode(email);
            return data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to resend verification code';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const clearError = () => setError(null);

    const value: AuthContextType = {
        ...authState,
        login,
        register,
        logout,
        refreshToken,
        updateProfile,
        changePassword,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerificationCode,
        clearError,
        error,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// In your auth context or custom hook
export function useExtendedAuth() {
    const { login, ...rest } = useAuth();

    const extendedLogin = async (credentials: { email: string; password: string }, remember?: boolean) => {
        const response = await login(credentials);

        if (remember) {
            // Extend token expiration
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('authToken');
                if (token) {
                    // Your logic to extend token expiration
                    localStorage.setItem('tokenExtended', 'true');
                    localStorage.setItem('rememberedEmail', credentials.email);
                }
            }
        }

        return response;
    };

    return { ...rest, login: extendedLogin };
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper hook to check if current route should be protected
export function useRouteProtection() {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();

    return {
        shouldRedirectToLogin: !isAuthenticated &&
            !isLoading &&
            !PUBLIC_ROUTES.some(route => pathname.startsWith(route)) &&
            !AUTH_ROUTES.some(route => pathname.startsWith(route)),
        shouldRedirectToDashboard: isAuthenticated &&
            AUTH_ROUTES.some(route => pathname.startsWith(route)),
    };
}

// Custom hooks for common auth checks
export function useUser() {
    const { user } = useAuth();
    return user;
}

export function useIsAuthenticated() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}

export function useHasRole(requiredRole: string | string[]) {
    const { user } = useAuth();

    if (!user) return false;

    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(user.role);
    }

    return user.role === requiredRole;
}

export function useIsLoading() {
    const { isLoading } = useAuth();
    return isLoading;
}

// Hook to get redirect path for authenticated users
export function useAuthRedirect() {
    const { user } = useAuth();

    if (!user) return '/login';

    return ROLE_REDIRECTS[user.role as UserRole];
}
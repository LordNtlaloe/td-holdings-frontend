import { useState, useCallback } from 'react';
import apiClient, { API_ENDPOINTS } from '@/lib/api-client-v2';

interface UseApiOptions {
    manual?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
}

export function useApi<T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    options: UseApiOptions = {}
) {
    const { manual = false, onSuccess, onError } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!manual);
    const [error, setError] = useState<any>(null);

    const execute = useCallback(
        async (body?: any, params?: Record<string, any>) => {
            setLoading(true);
            setError(null);

            try {
                let url = endpoint;

                // Replace URL params if needed
                if (params) {
                    Object.entries(params).forEach(([key, value]) => {
                        url = url.replace(`:${key}`, value);
                    });
                }

                const response = await apiClient({
                    method,
                    url,
                    data: body,
                    params: method === 'GET' ? body : undefined,
                });

                setData(response.data);
                onSuccess?.(response.data);
                return response.data;
            } catch (err: any) {
                setError(err.response?.data || err.message);
                onError?.(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [endpoint, method, onSuccess, onError]
    );

    // Auto-execute if not manual
    if (!manual) {
        execute();
    }

    return { data, loading, error, execute, setData };
}

// Convenience hooks for common operations
export function useLogin() {
    return useApi(API_ENDPOINTS.auth.login, 'POST', { manual: true });
}

export function useProducts(params?: any) {
    return useApi(API_ENDPOINTS.products.list, 'GET', {
        manual: true,
        ...params
    });
}

export function useEmployeePerformance(employeeId?: string) {
    const endpoint = employeeId ? API_ENDPOINTS.employees.performance(employeeId) : '';
    return useApi(endpoint, 'GET', { manual: true });
}

export function useCreateSale() {
    return useApi(API_ENDPOINTS.sales.create, 'POST', { manual: true });
}
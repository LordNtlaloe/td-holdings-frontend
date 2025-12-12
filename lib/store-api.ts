// lib/api/stores.ts
import { StoreFormValues } from '@/schema';
import { Store } from '@/types';

export async function getAllStores(): Promise<Store[]> {
    try {
        const response = await fetch('/api/stores', {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Prevent caching for fresh data
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch stores');
        }

        const stores = await response.json();

        // Transform the data if needed to match Store type
        return stores.map((store: any) => ({
            id: store.id,
            name: store.name,
            location: store.location,
            createdAt: store.createdAt,
            updatedAt: store.updatedAt,
            _count: {
                employees: store._count?.employees || 0,
                products: store._count?.products || 0,
                sales: store._count?.sales || 0,
            },
        }));

    } catch (error) {
        console.error('Error fetching stores:', error);

        // Return empty array instead of throwing to prevent UI crashes
        return [];
    }
}

export async function getAllStoresWithParams(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}): Promise<{
    stores: Store[];
    total: number;
    page: number;
    totalPages: number;
}> {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = queryString ? `/api/stores?${queryString}` : '/api/stores';

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch stores');
        }

        const data = await response.json();

        // Check if response is paginated or just an array
        if (Array.isArray(data)) {
            return {
                stores: data,
                total: data.length,
                page: 1,
                totalPages: 1,
            };
        }

        // If response is paginated
        return {
            stores: data.stores || data.data || [],
            total: data.total || data.count || 0,
            page: data.page || 1,
            totalPages: data.totalPages || Math.ceil((data.total || 0) / (params?.limit || 10)),
        };

    } catch (error) {
        console.error('Error fetching stores:', error);

        // Return empty result instead of throwing
        return {
            stores: [],
            total: 0,
            page: 1,
            totalPages: 0,
        };
    }
}

// Enhanced version with error handling wrapper
export async function safeGetAllStores(): Promise<{
    data: Store[];
    error: string | null;
}> {
    try {
        const stores = await getAllStores();
        return {
            data: stores,
            error: null,
        };
    } catch (error) {
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Your existing functions below...

export async function createStore(storeData: StoreFormValues): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> {
    try {
        const response = await fetch('/api/stores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(storeData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to create store'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error creating store:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

export async function updateStore(id: string, storeData: StoreFormValues): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> {
    try {
        const response = await fetch(`/api/stores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(storeData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update store'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating store:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

export async function deleteStore(id: string): Promise<{
    success: boolean;
    error?: string
}> {
    try {
        const response = await fetch(`/api/stores/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to delete store'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting store:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

export async function getStoreById(id: string): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> {
    try {
        const response = await fetch(`/api/stores/${id}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store'
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching store:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Additional helper functions you might need:

export async function getStoreStats(storeId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/stores/${storeId}/stats`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store stats',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching store stats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}


export async function searchStores(searchTerm: string): Promise<Store[]> {
    try {
        const response = await fetch(`/api/stores?search=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to search stores');
        }

        const stores = await response.json();
        return stores;
    } catch (error) {
        console.error('Error searching stores:', error);
        return [];
    }
}


// Add to existing lib/api/stores.ts
export async function getStoreEmployees(storeId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/stores/${storeId}/employees`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store employees',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching store employees:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

export async function getStoreProducts(storeId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/stores/${storeId}/products`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store products',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching store products:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

export async function getStoreSales(storeId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/stores/${storeId}/sales`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store sales',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching store sales:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}
// /lib/api/stores.ts
import {
    Store,
    CreateStoreData,
    UpdateStoreData,
    InventorySummary,
    StorePerformance,
    StoreFilters,
    PaginatedStoresResponse
} from '@/types';

const API_BASE = '/api';

class StoreAPI {
    private static async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    }

    // Public endpoints
    static async getPublicStores(params?: StoreFilters): Promise<PaginatedStoresResponse> {
        const query = new URLSearchParams();
        if (params?.isMainStore !== undefined) query.append('isMainStore', params.isMainStore.toString());
        if (params?.search) query.append('search', params.search);
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        return this.fetchAPI(`/stores/public?${query.toString()}`);
    }

    // Authenticated endpoints
    static async getStores(token: string, params?: StoreFilters): Promise<PaginatedStoresResponse> {
        const query = new URLSearchParams();
        if (params?.isMainStore !== undefined) query.append('isMainStore', params.isMainStore.toString());
        if (params?.search) query.append('search', params.search);
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        return this.fetchAPI(`/stores?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getStore(token: string, storeId: string): Promise<Store> {
        return this.fetchAPI(`/stores/${storeId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async createStore(token: string, data: CreateStoreData): Promise<{ store: Store }> {
        return this.fetchAPI('/stores', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateStore(token: string, storeId: string, data: UpdateStoreData): Promise<{ store: Store; changes: string[] }> {
        return this.fetchAPI(`/stores/${storeId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async setMainStore(token: string, storeId: string): Promise<{ newMainStore: Store; oldMainStore?: Store }> {
        return this.fetchAPI(`/stores/${storeId}/set-main`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getMainStore(token: string): Promise<Store> {
        return this.fetchAPI('/stores/main/store', {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getStoreInventorySummary(token: string, storeId: string): Promise<InventorySummary> {
        return this.fetchAPI(`/stores/${storeId}/inventory-summary`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getStorePerformance(token: string, storeId: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<StorePerformance> {
        return this.fetchAPI(`/stores/${storeId}/performance?period=${period}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    }
}

export default StoreAPI;
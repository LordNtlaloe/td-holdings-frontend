// /api/sales-dashboard.ts
const API_BASE = '/api';

export interface DashboardSummary {
    today: {
        sales: number;
        revenue: number;
        transactions: number;
        averageTicket: number;
    };
    week: {
        sales: number;
        revenue: number;
        growth: number; // percentage compared to last week
    };
    month: {
        sales: number;
        revenue: number;
        growth: number; // percentage compared to last month
    };
    pendingVoids: number;
    lowStockAlerts: number;
}

export interface RecentActivity {
    id: string;
    type: 'SALE' | 'VOID' | 'RETURN';
    amount: number;
    customer?: string;
    employee: string;
    timestamp: Date;
    store: string;
}

export interface TopSellingProduct {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    image?: string;
}

export interface StorePerformance {
    storeId: string;
    storeName: string;
    sales: number;
    revenue: number;
    transactions: number;
    employees: number;
    target?: number;
    achievement: number; // percentage
}

class SalesDashboardAPI {
    private static async fetchAPI<T>(
        endpoint: string,
        token: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response.json();
        } catch (error: any) {
            console.error('🔴 SalesDashboardAPI Error:', error.message);
            throw error;
        }
    }

    /**
     * Get dashboard summary statistics
     */
    static async getSummary(
        token: string,
        params?: {
            storeId?: string;
            date?: Date;
        }
    ): Promise<DashboardSummary> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.date) query.append('date', params.date.toISOString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/dashboard/summary${queryString ? `?${queryString}` : ''}`,
            token
        );
    }

    /**
     * Get recent sales activity
     */
    static async getRecentActivity(
        token: string,
        params?: {
            storeId?: string;
            limit?: number;
        }
    ): Promise<RecentActivity[]> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        const activities = await this.fetchAPI<any[]>(
            `/sales/dashboard/recent-activity${queryString ? `?${queryString}` : ''}`,
            token
        );

        // Transform dates
        return activities.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
        }));
    }

    /**
     * Get top selling products
     */
    static async getTopProducts(
        token: string,
        params?: {
            storeId?: string;
            period?: 'today' | 'week' | 'month';
            limit?: number;
        }
    ): Promise<TopSellingProduct[]> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.period) query.append('period', params.period);
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/dashboard/top-products${queryString ? `?${queryString}` : ''}`,
            token
        );
    }

    /**
     * Get store performance metrics
     */
    static async getStorePerformance(
        token: string,
        params?: {
            date?: Date;
        }
    ): Promise<StorePerformance[]> {
        const query = new URLSearchParams();
        if (params?.date) query.append('date', params.date.toISOString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/dashboard/store-performance${queryString ? `?${queryString}` : ''}`,
            token
        );
    }

    /**
     * Get real-time sales updates (for live dashboard)
     */
    static async getRealtimeUpdates(
        token: string,
        params?: {
            storeId?: string;
            since?: Date;
        }
    ): Promise<{
        newSales: number;
        updatedSales: number[];
        revenue: number;
        timestamp: Date;
    }> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.since) query.append('since', params.since.toISOString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/dashboard/realtime${queryString ? `?${queryString}` : ''}`,
            token
        );

        return {
            ...response,
            timestamp: new Date(response.timestamp)
        };
    }

    /**
     * Get sales by hour (for traffic analysis)
     */
    static async getSalesByHour(
        token: string,
        params?: {
            storeId?: string;
            date?: Date;
        }
    ): Promise<Array<{
        hour: number;
        sales: number;
        revenue: number;
        transactions: number;
    }>> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.date) query.append('date', params.date.toISOString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/dashboard/sales-by-hour${queryString ? `?${queryString}` : ''}`,
            token
        );
    }
}

export default SalesDashboardAPI;
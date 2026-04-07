// lib/api/sales-dashboard.ts
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
        growth: number;
    };
    month: {
        sales: number;
        revenue: number;
        growth: number;
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
    activeEmployees?: number;
    target?: number;
    achievement: number;
}

export interface RealtimeUpdates {
    newSales: number;
    updatedSales: number[];
    revenue: number;
    timestamp: Date;
    sales?: Array<{
        id: string;
        total: number;
        employee: string;
        createdAt: Date;
    }>;
}

export interface SalesByHour {
    hour: number;
    sales: number;
    revenue: number;
    transactions: number;
}

export interface SalesByDay {
    date: string;
    sales: number;
    revenue: number;
    transactions: number;
    averageTicket: number;
}

export interface SalesByDayResponse {
    period: {
        start: string;
        end: string;
        days: number;
    };
    data: SalesByDay[];
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageDailyRevenue: number;
        averageDailyTransactions: number;
        averageTicket: number;
        growth: {
            revenue: number;
            transactions: number;
        };
    };
}

export interface SalesByWeek {
    weekStart: string;
    weekEnd: string;
    weekNumber: number;
    sales: number;
    revenue: number;
    transactions: number;
    activeEmployees: number;
    averageTicket: number;
    weekOverWeekGrowth: number;
}

export interface SalesByWeekResponse {
    period: {
        start: string;
        end: string;
        weeks: number;
    };
    data: SalesByWeek[];
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageWeeklyRevenue: number;
        averageWeeklyTransactions: number;
        averageTicket: number;
        yearOverYearGrowth: number;
    };
}

export interface SalesByMonth {
    month: string;
    year: number;
    monthNumber: number;
    monthName: string;
    sales: number;
    revenue: number;
    transactions: number;
    activeEmployees: number;
    uniqueCustomers: number;
    averageTicket: number;
    monthOverMonthGrowth: number;
    movingAverage3Months: number;
}

export interface SalesByMonthResponse {
    period: {
        start: string;
        end: string;
        months: number;
        years: number;
    };
    data: SalesByMonth[];
    yearlyComparison: Array<{
        year: number;
        revenue: number;
        transactions: number;
        months: number;
        averageMonthlyRevenue: number;
        averageTicket: number;
    }>;
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageMonthlyRevenue: number;
        averageMonthlyTransactions: number;
        averageTicket: number;
    };
}

export interface SalesByYear {
    year: number;
    sales: number;
    revenue: number;
    transactions: number;
    uniqueCustomers: number;
    activeEmployees: number;
    activeMonths: number;
    averageMonthlyRevenue: number;
    averageTicket: number;
    yearOverYearGrowth: number;
}

export interface SalesByYearResponse {
    period: {
        start: number;
        end: number;
        years: number;
    };
    data: SalesByYear[];
    summary: {
        totalRevenue: number;
        totalTransactions: number;
        averageAnnualRevenue: number;
        averageAnnualTransactions: number;
        averageTicket: number;
        cagr: number;
        bestYear: {
            year: number;
            revenue: number;
        };
        worstYear: {
            year: number;
            revenue: number;
        };
    };
}

class SalesDashboardAPI {
    private static async fetchAPI<T>(endpoint: string, token: string): Promise<T> {
        const url = `${API_BASE}${endpoint}`;
        console.log(`🟦 SalesDashboardAPI: GET ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        const responseText = await response.text();
        let data: any;

        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch {
            throw new Error('Invalid JSON response from server');
        }

        if (!response.ok) {
            throw new Error(data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data as T;
    }

    /**
     * GET /api/sales-dashboard/summary
     */
    static async getSummary(
        token: string,
        params?: { storeId?: string; date?: Date }
    ): Promise<DashboardSummary> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.date) query.append('date', params.date.toISOString());

        const qs = query.toString();
        return this.fetchAPI(`/sales-dashboard/summary${qs ? `?${qs}` : ''}`, token);
    }

    /**
     * GET /api/sales-dashboard/recent-activity
     */
    static async getRecentActivity(
        token: string,
        params?: { storeId?: string; limit?: number }
    ): Promise<RecentActivity[]> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.limit) query.append('limit', params.limit.toString());

        const qs = query.toString();
        const activities = await this.fetchAPI<any[]>(
            `/sales-dashboard/recent-activity${qs ? `?${qs}` : ''}`,
            token
        );

        return activities.map(a => ({ ...a, timestamp: new Date(a.timestamp) }));
    }

    /**
     * GET /api/sales-dashboard/top-products
     */
    static async getTopProducts(
        token: string,
        params?: { storeId?: string; period?: 'today' | 'week' | 'month'; limit?: number }
    ): Promise<TopSellingProduct[]> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.period) query.append('period', params.period);
        if (params?.limit) query.append('limit', params.limit.toString());

        const qs = query.toString();
        return this.fetchAPI(`/sales-dashboard/top-products${qs ? `?${qs}` : ''}`, token);
    }

    /**
     * GET /api/sales-dashboard/store-performance
     */
    static async getStorePerformance(
        token: string,
        params?: { date?: Date }
    ): Promise<StorePerformance[]> {
        const query = new URLSearchParams();
        if (params?.date) query.append('date', params.date.toISOString());

        const qs = query.toString();
        return this.fetchAPI(`/sales-dashboard/store-performance${qs ? `?${qs}` : ''}`, token);
    }

    /**
     * GET /api/sales-dashboard/realtime
     */
    static async getRealtimeUpdates(
        token: string,
        params?: { storeId?: string; since?: Date }
    ): Promise<RealtimeUpdates> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.since) query.append('since', params.since.toISOString());

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales-dashboard/realtime${qs ? `?${qs}` : ''}`,
            token
        );

        // Convert timestamp strings to Date objects
        if (response.sales) {
            response.sales = response.sales.map((sale: any) => ({
                ...sale,
                createdAt: new Date(sale.createdAt)
            }));
        }

        return { ...response, timestamp: new Date(response.timestamp) };
    }

    /**
     * GET /api/sales-dashboard/sales-by-hour
     */
    static async getSalesByHour(
        token: string,
        params?: { storeId?: string; date?: Date }
    ): Promise<SalesByHour[]> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.date) query.append('date', params.date.toISOString());

        const qs = query.toString();
        return this.fetchAPI(`/sales-dashboard/sales-by-hour${qs ? `?${qs}` : ''}`, token);
    }

    /**
     * GET /api/sales-dashboard/sales-by-day
     */
    static async getSalesByDay(
        token: string,
        params?: {
            storeId?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<SalesByDayResponse> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales-dashboard/sales-by-day${qs ? `?${qs}` : ''}`,
            token
        );

        // Convert date strings in data array
        if (response.data) {
            response.data = response.data.map((item: any) => ({
                ...item,
                date: new Date(item.date)
            }));
        }

        return response;
    }

    /**
     * GET /api/sales-dashboard/sales-by-week
     */
    static async getSalesByWeek(
        token: string,
        params?: {
            storeId?: string;
            year?: number;
            month?: number;
        }
    ): Promise<SalesByWeekResponse> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.year) query.append('year', params.year.toString());
        if (params?.month) query.append('month', params.month.toString());

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales-dashboard/sales-by-week${qs ? `?${qs}` : ''}`,
            token
        );

        // Convert date strings in data array
        if (response.data) {
            response.data = response.data.map((item: any) => ({
                ...item,
                weekStart: new Date(item.weekStart),
                weekEnd: new Date(item.weekEnd)
            }));
        }

        return response;
    }

    /**
     * GET /api/sales-dashboard/sales-by-month
     */
    static async getSalesByMonth(
        token: string,
        params?: {
            storeId?: string;
            years?: number;
        }
    ): Promise<SalesByMonthResponse> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.years) query.append('years', params.years.toString());

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales-dashboard/sales-by-month${qs ? `?${qs}` : ''}`,
            token
        );

        // Convert date strings in data array
        if (response.data) {
            response.data = response.data.map((item: any) => ({
                ...item,
                month: new Date(item.month)
            }));
        }

        return response;
    }

    /**
     * GET /api/sales-dashboard/sales-by-year
     */
    static async getSalesByYear(
        token: string,
        params?: {
            storeId?: string;
            startYear?: number;
            endYear?: number;
        }
    ): Promise<SalesByYearResponse> {
        const query = new URLSearchParams();
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.startYear) query.append('startYear', params.startYear.toString());
        if (params?.endYear) query.append('endYear', params.endYear.toString());

        const qs = query.toString();
        return this.fetchAPI(`/sales-dashboard/sales-by-year${qs ? `?${qs}` : ''}`, token);
    }

    /**
     * GET /api/sales-dashboard/all-metrics
     * Convenience method to fetch multiple dashboard metrics at once
     */
    static async getAllMetrics(
        token: string,
        params?: {
            storeId?: string;
            date?: Date;
        }
    ): Promise<{
        summary: DashboardSummary;
        salesByHour: SalesByHour[];
        topProducts: TopSellingProduct[];
        recentActivity: RecentActivity[];
    }> {
        const [summary, salesByHour, topProducts, recentActivity] = await Promise.all([
            this.getSummary(token, params),
            this.getSalesByHour(token, params),
            this.getTopProducts(token, { ...params, limit: 5 }),
            this.getRecentActivity(token, { ...params, limit: 10 })
        ]);

        return {
            summary,
            salesByHour,
            topProducts,
            recentActivity
        };
    }
}

export default SalesDashboardAPI;
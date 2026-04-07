import {
    SalesReportParams,
    SalesReportResponse,
    SalesTrendData,
    PaymentDistributionItem,
} from '@/types/sales';

const API_BASE = '/api';

class SalesReportsAPI {
    private static async fetchAPI<T>(endpoint: string, token: string): Promise<T> {
        const url = `${API_BASE}${endpoint}`;
        console.log(`🟦 SalesReportsAPI: GET ${url}`);

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
     * GET /api/sales/reports/summary
     */
    static async getSalesReport(
        token: string,
        params: SalesReportParams
    ): Promise<SalesReportResponse> {
        const query = new URLSearchParams();

        if (params.storeId) query.append('storeId', params.storeId);
        if (params.employeeId) query.append('employeeId', params.employeeId);
        if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
        if (params.startDate) query.append('startDate', params.startDate.toString());
        if (params.endDate) query.append('endDate', params.endDate.toString());
        if (params.groupBy) query.append('groupBy', params.groupBy);

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/summary${qs ? `?${qs}` : ''}`,
            token
        );

        if (response.summary?.dateRange) {
            response.summary.dateRange.start = new Date(response.summary.dateRange.start);
            response.summary.dateRange.end = new Date(response.summary.dateRange.end);
        }

        return response;
    }

    /**
     * GET /api/sales/reports/trend
     */
    static async getSalesTrend(
        token: string,
        params?: { storeId?: string; period?: '7d' | '30d' | '90d' | '1y' }
    ): Promise<SalesTrendData> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.period) query.append('period', params.period);

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/trend${qs ? `?${qs}` : ''}`,
            token
        );

        if (response.period?.startDate) response.period.startDate = new Date(response.period.startDate);
        if (response.period?.endDate) response.period.endDate = new Date(response.period.endDate);
        if (response.dailyTrend) {
            response.dailyTrend = response.dailyTrend.map((d: any) => ({ ...d, date: new Date(d.date) }));
        }
        if (response.peakDay?.date) response.peakDay.date = new Date(response.peakDay.date);

        return response;
    }

    /**
     * GET /api/sales/reports/summary (date range convenience wrapper)
     */
    static async getSalesSummary(
        token: string,
        params: { storeId?: string; startDate: Date; endDate: Date }
    ): Promise<{
        totalSales: number;
        totalRevenue: number;
        totalTax: number;
        averageSale: number;
        byDay: Array<{ date: Date; sales: number; revenue: number }>;
    }> {
        const query = new URLSearchParams();

        if (params.storeId) query.append('storeId', params.storeId);
        query.append('startDate', params.startDate.toISOString());
        query.append('endDate', params.endDate.toISOString());

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/summary${qs ? `?${qs}` : ''}`,
            token
        );

        if (response.byDay) {
            response.byDay = response.byDay.map((d: any) => ({ ...d, date: new Date(d.date) }));
        }

        return response;
    }

    /**
     * Export as blob — calls backend directly since Next.js can't stream blobs cleanly
     */
    static async exportSalesReport(
        token: string,
        params: SalesReportParams & { format: 'csv' | 'pdf' }
    ): Promise<Blob> {
        const query = new URLSearchParams();

        if (params.storeId) query.append('storeId', params.storeId);
        if (params.employeeId) query.append('employeeId', params.employeeId);
        if (params.paymentMethod) query.append('paymentMethod', params.paymentMethod);
        if (params.startDate) query.append('startDate', params.startDate.toString());
        if (params.endDate) query.append('endDate', params.endDate.toString());
        if (params.groupBy) query.append('groupBy', params.groupBy);
        query.append('format', params.format);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        const qs = query.toString();

        const response = await fetch(
            `${API_BASE_URL}/sales/reports/export${qs ? `?${qs}` : ''}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error(`Export failed: ${response.statusText}`);
        return response.blob();
    }

    /**
     * GET /api/sales/reports/payment-analytics
     */
    static async getPaymentAnalytics(
        token: string,
        params?: { storeId?: string; startDate?: Date; endDate?: Date }
    ): Promise<{
        distribution: PaymentDistributionItem[];
        trends: Array<{ date: Date; payments: Record<string, number> }>;
    }> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());

        const qs = query.toString();
        return this.fetchAPI(
            `/sales/reports/payment-analytics${qs ? `?${qs}` : ''}`,
            token
        );
    }
}

export default SalesReportsAPI;
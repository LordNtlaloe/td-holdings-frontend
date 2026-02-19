// /api/sales-reports.ts
import {
    SalesReportParams,
    SalesReportResponse,
    SalesTrendData,
    DailyTrendItem,
    TopProductItem,
    TopEmployeeItem,
    PaymentDistributionItem
} from '@/types/sales';

const API_BASE = '/api';

class SalesReportsAPI {
    private static async fetchAPI<T>(
        endpoint: string,
        token: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            console.log(`🟦 SalesReportsAPI: Fetching ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
                cache: 'no-store',
            });

            const responseText = await response.text();

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch (e) { }

                throw new Error(
                    errorData['error' as keyof typeof errorData] ||
                    errorData['message' as keyof typeof errorData] ||
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('🟦 SalesReportsAPI: Failed to parse response:', parseError);
                throw new Error('Invalid JSON response from server');
            }

            return result;
        } catch (error: any) {
            console.error('🔴 SalesReportsAPI Error:', error.message, 'for endpoint:', endpoint);
            throw error;
        }
    }

    /**
     * Get sales report with grouping options
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

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/sales${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );

        // Transform date fields if needed
        if (response.summary?.dateRange) {
            response.summary.dateRange.start = new Date(response.summary.dateRange.start);
            response.summary.dateRange.end = new Date(response.summary.dateRange.end);
        }

        return response;
    }

    /**
     * Get sales trend analysis
     */
    static async getSalesTrend(
        token: string,
        params?: {
            storeId?: string;
            period?: '7d' | '30d' | '90d' | '1y';
        }
    ): Promise<SalesTrendData> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.period) query.append('period', params.period);

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/trend${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );

        // Transform date fields
        if (response.period) {
            response.period.startDate = new Date(response.period.startDate);
            response.period.endDate = new Date(response.period.endDate);
        }

        if (response.dailyTrend) {
            response.dailyTrend = response.dailyTrend.map((day: any) => ({
                ...day,
                date: new Date(day.date)
            }));
        }

        if (response.peakDay) {
            response.peakDay.date = new Date(response.peakDay.date);
        }

        return response;
    }

    /**
     * Export sales report (CSV/PDF)
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

        const queryString = query.toString();
        const response = await fetch(`${API_BASE}/sales/reports/export${queryString ? `?${queryString}` : ''}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to export report: ${response.statusText}`);
        }

        return response.blob();
    }

    /**
     * Get sales summary by date range
     */
    static async getSalesSummary(
        token: string,
        params: {
            storeId?: string;
            startDate: Date;
            endDate: Date;
        }
    ): Promise<{
        totalSales: number;
        totalRevenue: number;
        totalTax: number;
        averageSale: number;
        byDay: Array<{
            date: Date;
            sales: number;
            revenue: number;
        }>;
    }> {
        const query = new URLSearchParams();

        if (params.storeId) query.append('storeId', params.storeId);
        query.append('startDate', params.startDate.toISOString());
        query.append('endDate', params.endDate.toISOString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/summary${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );

        // Transform dates
        if (response.byDay) {
            response.byDay = response.byDay.map((day: any) => ({
                ...day,
                date: new Date(day.date)
            }));
        }

        return response;
    }

    /**
     * Get payment method analytics
     */
    static async getPaymentAnalytics(
        token: string,
        params?: {
            storeId?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<{
        distribution: PaymentDistributionItem[];
        trends: Array<{
            date: Date;
            payments: Record<string, number>;
        }>;
    }> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/reports/payment-analytics${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );
    }
}

export default SalesReportsAPI;
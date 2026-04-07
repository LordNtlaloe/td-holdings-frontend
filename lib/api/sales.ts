import {
    Sale,
    SaleFilters,
    PaginatedSalesResponse,
    PaginatedVoidedSalesResponse,
    SalesMetrics,
    SalesReportParams,
    SalesReportResponse,
    SalesTrendData,
    CreateSaleFormValues,
    VoidSaleFormValues,
    VoidedSaleFilters,
} from '@/types';

const API_BASE = '/api';

class SalesAPI {
    private static async fetchAPI<T>(
        endpoint: string,
        token: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE}${endpoint}`;
        console.log(`🟦 SalesAPI: ${options.method || 'GET'} ${url}`);

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

    // ── Date helper ────────────────────────────────────────────────────────────
    private static toISO(date: Date | string | undefined): string | undefined {
        if (!date) return undefined;
        if (date instanceof Date) return date.toISOString();
        // Already an ISO string
        if (String(date).includes('T')) return date as string;
        // Fallback — try to parse
        return new Date(date).toISOString();
    }

    // ─── SALES CRUD ────────────────────────────────────────────────────────────

    /**
     * GET /api/sales
     */
    static async getSales(token: string, params?: SaleFilters): Promise<PaginatedSalesResponse> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('search', params.search);
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.employeeId) query.append('employeeId', params.employeeId);
        if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
        if (params?.minTotal !== undefined) query.append('minTotal', params.minTotal.toString());
        if (params?.maxTotal !== undefined) query.append('maxTotal', params.maxTotal.toString());
        if (params?.voided !== undefined) query.append('voided', params.voided.toString());
        if (params?.customerEmail) query.append('customerEmail', params.customerEmail);
        if (params?.customerPhone) query.append('customerPhone', params.customerPhone);
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

        // ✅ Always send ISO strings for dates
        const startISO = this.toISO(params?.startDate);
        const endISO = this.toISO(params?.endDate);
        if (startISO) query.append('startDate', startISO);
        if (endISO) query.append('endDate', endISO);

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales${qs ? `?${qs}` : ''}`,
            token,
            { method: 'GET' }
        );

        return {
            data: response.data || response.sales || [],
            metrics: response.metrics,
            meta: response.meta || {
                total: response.total || 0,
                page: response.page || params?.page || 1,
                limit: response.limit || params?.limit || 20,
                totalPages: response.totalPages || 1,
                hasNextPage: response.hasNext || false,
                hasPrevPage: response.hasPrev || false,
            },
        };
    }

    /**
     * GET /api/sales/[id]
     */
    static async getSaleById(token: string, saleId: string): Promise<Sale> {
        const response = await this.fetchAPI<any>(`/sales/${saleId}`, token, { method: 'GET' });
        return response.data || response.sale || response;
    }

    /**
     * POST /api/sales
     */
    static async createSale(token: string, data: CreateSaleFormValues): Promise<{
        success: boolean;
        message: string;
        data: { sale: Sale; receipt: string };
    }> {
        if (!data.employeeId) throw new Error('Employee ID is required');
        if (!data.storeId) throw new Error('Store ID is required');
        if (!data.items || data.items.length === 0) throw new Error('At least one item is required');
        if (!data.paymentMethod) throw new Error('Payment method is required');

        const subtotal = data.subtotal ?? data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const tax = data.tax ?? subtotal * 0.15;
        const total = data.total ?? subtotal + tax;

        return this.fetchAPI('/sales', token, {
            method: 'POST',
            body: JSON.stringify({ ...data, subtotal, tax, total }),
        });
    }

    /**
     * POST /api/sales/[id]/void
     */
    static async voidSale(token: string, saleId: string, data: VoidSaleFormValues): Promise<{
        success: boolean;
        message: string;
        data: { sale: Sale; voidedSale: any };
    }> {
        return this.fetchAPI(`/sales/${saleId}/void`, token, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // ─── VOIDED SALES ──────────────────────────────────────────────────────────

    /**
     * GET /api/sales/voided
     */
    static async getVoidedSales(
        token: string,
        params?: VoidedSaleFilters
    ): Promise<PaginatedVoidedSalesResponse> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.storeId) query.append('storeId', params.storeId);

        const startISO = this.toISO(params?.startDate);
        const endISO = this.toISO(params?.endDate);
        if (startISO) query.append('startDate', startISO);
        if (endISO) query.append('endDate', endISO);

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/voided${qs ? `?${qs}` : ''}`,
            token,
            { method: 'GET' }
        );

        return {
            data: response.data || response.voided || [],
            summary: response.summary || {
                totalVoided: 0,
                totalAmount: 0,
                averageVoidAmount: 0,
                byStore: {},
            },
            meta: response.meta || {
                total: response.total || 0,
                page: response.page || params?.page || 1,
                limit: response.limit || params?.limit || 20,
                totalPages: response.totalPages || 1,
                hasNextPage: response.hasNext || false,
                hasPrevPage: response.hasPrev || false,
            },
        };
    }

    // ─── REPORTS ──────────────────────────────────────────────────────────────

    /**
     * GET /api/sales/reports/summary
     */
    static async getSalesReport(
        token: string,
        params?: SalesReportParams
    ): Promise<SalesReportResponse> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.employeeId) query.append('employeeId', params.employeeId);
        if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
        if (params?.groupBy) query.append('groupBy', params.groupBy);

        const startISO = this.toISO(params?.startDate);
        const endISO = this.toISO(params?.endDate);
        if (startISO) query.append('startDate', startISO);
        if (endISO) query.append('endDate', endISO);

        const qs = query.toString();
        return this.fetchAPI(
            `/sales/reports/summary${qs ? `?${qs}` : ''}`,
            token,
            { method: 'GET' }
        );
    }

    /**
     * GET /api/sales/reports/trend
     */
    static async getSalesTrend(
        token: string,
        params?: { storeId?: string; period?: 'day' | 'week' | 'month' | 'year' }
    ): Promise<SalesTrendData> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.period) query.append('period', params.period);

        const qs = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales/reports/trend${qs ? `?${qs}` : ''}`,
            token,
            { method: 'GET' }
        );

        if (response.dailyTrend) {
            response.dailyTrend = response.dailyTrend.map((i: any) => ({
                ...i,
                date: new Date(i.date),
            }));
        }
        if (response.peakDay?.date) response.peakDay.date = new Date(response.peakDay.date);
        if (response.period?.startDate) response.period.startDate = new Date(response.period.startDate);
        if (response.period?.endDate) response.period.endDate = new Date(response.period.endDate);

        return response;
    }

    // ─── HELPERS ──────────────────────────────────────────────────────────────

    static calculateTotals(items: Array<{ price: number; quantity: number; discount?: number }>) {
        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity - (i.discount || 0), 0);
        const tax = subtotal * 0.15;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }

    static getPaymentMethodInfo(method: string): { label: string; color: string; icon: string } {
        const methods: Record<string, { label: string; color: string; icon: string }> = {
            CASH: { label: 'Cash', color: 'bg-green-100 text-green-800', icon: '💰' },
            CARD: { label: 'Card', color: 'bg-blue-100 text-blue-800', icon: '💳' },
            MOBILE_MONEY: { label: 'Mobile Money', color: 'bg-purple-100 text-purple-800', icon: '📱' },
            BANK_TRANSFER: { label: 'Bank Transfer', color: 'bg-orange-100 text-orange-800', icon: '🏦' },
            CREDIT: { label: 'Credit', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
        };
        return methods[method] || { label: method, color: 'bg-gray-100 text-gray-800', icon: '💰' };
    }

    static formatReceipt(sale: Sale): string {
        const lines = [
            '='.repeat(40),
            '      STORE RECEIPT',
            '='.repeat(40),
            `Store:    ${sale.store?.name || 'N/A'}`,
            `Date:     ${new Date(sale.createdAt).toLocaleString()}`,
            `Cashier:  ${sale.employee?.user?.firstName || ''} ${sale.employee?.user?.lastName || ''}`.trim(),
            `Customer: ${sale.customerName || 'Walk-in'}`,
            '-'.repeat(40),
            'Items:',
            ...(sale.saleItems?.map(item =>
                `${(item.product?.name ?? '').substring(0, 20).padEnd(20)} ${item.quantity} x ${item.price.toFixed(2)}`
            ) || []),
            '-'.repeat(40),
            `Subtotal: ${sale.subtotal.toFixed(2).padStart(29)}`,
            `Tax:      ${sale.tax.toFixed(2).padStart(29)}`,
            `Total:    ${sale.total.toFixed(2).padStart(29)}`,
            `Payment:  ${this.getPaymentMethodInfo(sale.paymentMethod).label}`,
            '='.repeat(40),
            '   THANK YOU FOR YOUR BUSINESS',
            '='.repeat(40),
        ];
        return lines.join('\n');
    }

    static validateSaleData(data: CreateSaleFormValues): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!data.employeeId) errors.push('Employee is required');
        if (!data.storeId) errors.push('Store is required');
        if (!data.items || data.items.length === 0) errors.push('At least one item is required');
        if (!data.paymentMethod) errors.push('Payment method is required');

        data.items?.forEach((item, i) => {
            if (!item.productId) errors.push(`Item ${i + 1}: Product is required`);
            if (!item.quantity || item.quantity <= 0) errors.push(`Item ${i + 1}: Quantity must be > 0`);
            if (!item.price || item.price <= 0) errors.push(`Item ${i + 1}: Price must be > 0`);
        });

        const { subtotal, total } = this.calculateTotals(data.items || []);
        if (Math.abs(subtotal - data.subtotal) > 0.01) warnings.push('Subtotal does not match calculated value');
        if (Math.abs(total - data.total) > 0.01) warnings.push('Total does not match calculated value');

        return { isValid: errors.length === 0, errors, warnings };
    }

    static canVoidSale(sale: Sale): { canVoid: boolean; reasons: string[] } {
        const reasons: string[] = [];
        if (sale.voidedSale) reasons.push('Sale has already been voided');
        const daysDiff = (Date.now() - new Date(sale.createdAt).getTime()) / 86_400_000;
        if (daysDiff > 30) reasons.push('Sale is older than 30 days');
        return { canVoid: reasons.length === 0, reasons };
    }

    static calculateMetrics(sales: Sale[]): SalesMetrics {
        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalTax = sales.reduce((sum, s) => sum + s.tax, 0);
        const byPaymentMethod: Record<string, { count: number; total: number }> = {};

        sales.forEach(s => {
            if (!byPaymentMethod[s.paymentMethod]) {
                byPaymentMethod[s.paymentMethod] = { count: 0, total: 0 };
            }
            byPaymentMethod[s.paymentMethod].count++;
            byPaymentMethod[s.paymentMethod].total += s.total;
        });

        return {
            totalSales: sales.length,
            totalRevenue,
            totalTax,
            averageSaleValue: sales.length > 0 ? totalRevenue / sales.length : 0,
            byPaymentMethod,
        };
    }
}

export default SalesAPI;
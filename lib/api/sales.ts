// /api/sales.ts
import {
    Sale,
    SaleFilters,
    PaginatedSalesResponse,
    CreateSaleFormValues,
    VoidSaleFormValues,
    SalesMetrics
} from '@/types/sales';

const API_BASE = '/api';

class SalesAPI {
    private static async fetchAPI<T>(
        endpoint: string,
        token: string,
        options: RequestInit = {}
    ): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            console.log(`🟦 SalesAPI: Fetching ${options.method || 'GET'} ${url}`);

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
            console.log(`🟦 SalesAPI: Response status ${response.status}`);

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch (e) {
                    console.error('🟦 SalesAPI: Failed to parse error response');
                }

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
                console.error('🟦 SalesAPI: Failed to parse response:', parseError);
                throw new Error('Invalid JSON response from server');
            }

            return result;
        } catch (error: any) {
            console.error('🔴 SalesAPI Error:', error.message, 'for endpoint:', endpoint);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network error: Unable to connect to server. Please check if backend is running.');
            }

            throw error;
        }
    }

    // ============ SALES CRUD OPERATIONS ============

    /**
     * Get paginated list of sales with filters
     */
    // lib/api/sales.ts
    // In the getSales method, ensure you're handling the response correctly:

    static async getSales(token: string, params?: SaleFilters): Promise<PaginatedSalesResponse> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
        if (params?.search) query.append('search', params.search);
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.employeeId) query.append('employeeId', params.employeeId);
        if (params?.paymentMethod) query.append('paymentMethod', params.paymentMethod);
        if (params?.minTotal !== undefined) query.append('minTotal', params.minTotal.toString());
        if (params?.maxTotal !== undefined) query.append('maxTotal', params.maxTotal.toString());
        if (params?.startDate) query.append('startDate', params.startDate.toString());
        if (params?.endDate) query.append('endDate', params.endDate.toString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/sales${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );

        // Handle different response structures
        let salesArray: Sale[] = [];
        let metrics: SalesMetrics | undefined;
        let paginationMeta: any = {};

        if (response && typeof response === 'object') {
            // If response is an array directly
            if (Array.isArray(response)) {
                salesArray = response;
                paginationMeta = {
                    total: response.length,
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            }
            // If response has data property
            else if (Array.isArray(response.data)) {
                salesArray = response.data;
                metrics = response.metrics;
                paginationMeta = response.meta || {
                    total: salesArray.length,
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            }
            // If response is wrapped in another object
            else if (response.sales && Array.isArray(response.sales)) {
                salesArray = response.sales;
                metrics = response.metrics;
                paginationMeta = response.meta || {
                    total: salesArray.length,
                    page: params?.page || 1,
                    limit: params?.limit || 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                };
            }
        }

        // Transform sales data to ensure consistent format
        const transformedSales = salesArray.map(sale => ({
            ...sale,
            // Ensure saleItems exists
            saleItems: sale.saleItems || [],
            // Convert date strings to Date objects
            createdAt: sale.createdAt ? new Date(sale.createdAt) : new Date(),
            updatedAt: sale.updatedAt ? new Date(sale.updatedAt) : undefined,
        }));

        return {
            data: transformedSales,
            metrics,
            meta: paginationMeta
        } as PaginatedSalesResponse;
    }

    /**
     * Get a single sale by ID
     */
    static async getSaleById(
        token: string,
        saleId: string
    ): Promise<Sale> {
        const sale = await this.fetchAPI<any>(
            `/sales/${saleId}`,
            token,
            { method: 'GET' }
        );

        // Convert date strings to Date objects
        return {
            ...sale,
            createdAt: new Date(sale.createdAt),
            updatedAt: new Date(sale.updatedAt),
        };
    }

    /**
     * Create a new sale
     */
    static async createSale(
        token: string,
        data: CreateSaleFormValues
    ): Promise<{
        message: string;
        sale: Sale;
        items: any[];
    }> {
        console.log('🟦 SalesAPI.createSale called');
        console.log('🟦 Data received:', JSON.stringify(data, null, 2));

        // Validate required fields
        if (!data.employeeId) throw new Error('Employee ID is required');
        if (!data.storeId) throw new Error('Store ID is required');
        if (!data.paymentMethod) throw new Error('Payment method is required');
        if (!data.items || data.items.length === 0) throw new Error('At least one item is required');

        // Calculate totals if not provided
        const subtotal = data.subtotal || data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = data.tax || subtotal * 0.15; // Default 15% tax if not provided
        const total = data.total || subtotal + tax;

        const requestData = {
            employeeId: data.employeeId,
            storeId: data.storeId,
            userId: data.userId,
            subtotal,
            tax,
            total,
            paymentMethod: data.paymentMethod,
            customerName: data.customerName || null,
            customerEmail: data.customerEmail || null,
            customerPhone: data.customerPhone || null,
            items: data.items.map(item => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                price: Number(item.price)
            }))
        };

        console.log('🟦 Final request data:', JSON.stringify(requestData, null, 2));

        const response = await this.fetchAPI<any>(
            '/sales',
            token,
            {
                method: 'POST',
                body: JSON.stringify(requestData)
            }
        );

        // Transform dates in response
        if (response.sale) {
            response.sale.createdAt = new Date(response.sale.createdAt);
            response.sale.updatedAt = new Date(response.sale.updatedAt);
        }

        return response;
    }

    /**
     * Void a sale
     */
    static async voidSale(
        token: string,
        saleId: string,
        data: VoidSaleFormValues
    ): Promise<{
        message: string;
        voidedSale: any;
    }> {
        if (!data.reason || data.reason.trim().length < 5) {
            throw new Error('Reason is required and must be at least 5 characters');
        }

        return this.fetchAPI(
            `/sales/${saleId}/void`,
            token,
            {
                method: 'POST',
                body: JSON.stringify({ reason: data.reason })
            }
        );
    }

    /**
     * Get voided sales
     */
    static async getVoidedSales(
        token: string,
        params?: {
            page?: number;
            limit?: number;
            startDate?: string | Date;
            endDate?: string | Date;
            storeId?: string;
        }
    ): Promise<any> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.startDate) query.append('startDate', params.startDate.toString());
        if (params?.endDate) query.append('endDate', params.endDate.toString());
        if (params?.storeId) query.append('storeId', params.storeId);

        const queryString = query.toString();
        return this.fetchAPI(
            `/sales/voided${queryString ? `?${queryString}` : ''}`,
            token,
            { method: 'GET' }
        );
    }
}

export default SalesAPI;
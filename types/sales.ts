import { SortOrder } from './enums';
import { Store, User, Employee, Product } from './index';

// Use PaymentMethodType from enums instead of redefining
// Remove the duplicate PaymentMethod enum and import from enums
import { PaymentMethodType } from './enums';

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt?: Date;
    updatedAt?: Date;

    // Relationships
    sale?: Sale;
    product?: Product;
}

export interface Sale {
    id: string;
    employeeId: string;
    storeId: string;
    userId: string;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethodType; // Use PaymentMethodType
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    createdAt: Date;
    updatedAt: Date;

    // Relations
    employee?: Employee & { user?: User };
    store?: Store;
    user?: User;
    saleItems?: SaleItem[];
    voidedSale?: VoidedSale;

    // Computed
    _count?: {
        saleItems: number;
    };
}

export interface VoidedSale {
    id: string;
    saleId: string;
    voidedBy: string;
    reason?: string;
    originalTotal: number;
    createdAt: Date;

    // Relations
    sale?: Sale;
    voidedByUser?: User;
}

export interface CreateSaleItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface CreateSaleFormValues {
    employeeId: string;
    storeId: string;
    userId?: string;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethodType; // Use PaymentMethodType
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: CreateSaleItem[];
}

export interface UpdateSaleFormValues {
    paymentMethod?: PaymentMethodType; // Use PaymentMethodType
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
}

export interface VoidSaleFormValues {
    reason?: string;
}

export interface SaleFilters {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder; // Use SortOrder enum
    search?: string;
    storeId?: string;
    employeeId?: string;
    paymentMethod?: PaymentMethodType | string;
    minTotal?: number;
    maxTotal?: number;
    startDate?: string | Date;
    endDate?: string | Date;
    voided?: boolean;
    customerEmail?: string;
    customerPhone?: string;
}

export interface VoidedSaleFilters {
    page?: number;
    limit?: number;
    startDate?: string | Date;
    endDate?: string | Date;
    storeId?: string;
}

export interface SalesMetrics {
    totalSales: number;
    totalRevenue: number;
    totalTax: number;
    averageSaleValue: number;
    byPaymentMethod: Record<string, {
        count: number;
        total: number;
    }>;
}

export interface PaginatedSalesResponse {
    data: Sale[];
    metrics?: SalesMetrics;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export interface PaginatedVoidedSalesResponse {
    data: VoidedSale[];
    summary: {
        totalVoided: number;
        totalAmount: number;
        averageVoidAmount: number;
        byStore: Record<string, number>;
    };
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Report Types
export interface SalesReportParams {
    storeId?: string;
    employeeId?: string;
    paymentMethod?: PaymentMethodType | string;
    startDate?: string | Date;
    endDate?: string | Date;
    groupBy?: 'day' | 'week' | 'month' | 'year' | 'product' | 'employee' | 'store';
}

export interface DailyTrendItem {
    date: Date;
    sales_count: number;
    total_revenue: number;
    avg_sale_amount: number;
    active_employees: number;
    unique_customers: number;
    total_tax: number;
}

export interface TopProductItem {
    id: string;
    name: string;
    type: string;
    grade: string;
    total_quantity: number;
    total_revenue: number;
    sales_count: number;
    avg_price: number;
}

export interface TopEmployeeItem {
    id: string;
    employee_name: string;
    position: string;
    sales_count: number;
    total_revenue: number;
    avg_sale_amount: number;
    unique_customers: number;
}

export interface PaymentDistributionItem {
    paymentMethod: string;
    transaction_count: number;
    total_revenue: number;
    avg_transaction: number;
}

export interface SalesTrendData {
    period: {
        startDate: Date;
        endDate: Date;
        days: number;
    };
    dailyTrend: DailyTrendItem[];
    topProducts: TopProductItem[];
    topEmployees: TopEmployeeItem[];
    paymentDistribution: PaymentDistributionItem[];
    metrics: {
        totalSales: number;
        totalRevenue: number;
        totalTax: number;
        avgDailySales: number;
        avgSaleAmount: number;
        peakDay: DailyTrendItem | null;
    };
}

export interface SalesReportResponse {
    report: any[]; // Varies based on groupBy
    summary: {
        totalSales: number;
        totalRevenue: number;
        totalTax: number;
        averageSale: number;
        dateRange: {
            start: string | Date;
            end: string | Date;
        };
    };
    parameters: {
        storeId?: string;
        employeeId?: string;
        paymentMethod?: string;
        groupBy?: string;
    };
}

// Customer types
export interface CustomerSummary {
    name?: string;
    email?: string;
    phone?: string;
    totalPurchases: number;
    totalSpent: number;
    averagePurchaseValue: number;
    lastPurchaseDate?: Date;
    preferredPaymentMethod?: string;
}

// Sale Statistics
export interface SaleStats {
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    totalTax: number;
    byPaymentMethod: Record<PaymentMethodType, number>;
    byHour?: Array<{ hour: number; sales: number; revenue: number }>;
    byDay?: Array<{ date: string; sales: number; revenue: number }>;
    topProducts?: Array<{
        productId: string;
        productName: string;
        quantity: number;
        revenue: number;
    }>;
}

// Sale API Types
export interface CreateSaleRequest {
    employeeId: string;
    storeId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    paymentMethod: PaymentMethodType;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    subtotal: number;
    tax: number;
    total: number;
}

export interface VoidSaleRequest {
    reason?: string;
}
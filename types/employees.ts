import { Role } from './enums';
import { User } from './user';

export interface Employee {
    user: User;
    position: string;
    role: Role;
    storeId: string;
    password: string;
}

export interface EmployeeFormData {
    user: User;
    position: string;
    role: Role;
    storeId: string;
    password: string;
}

export interface EmployeeFilters {
    storeId?: string;
    role?: Role;
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface EmployeePerformance {
    employee: Employee;
    period: string;
    summary?: {
        totalSales: number;
        transactionCount: number;
        averageTransactionValue: number;
        salesGrowth: number;
        performanceScore: number;
        averageDailySales: number;
        workDays: number;
        currentSales: number;
        salesTarget: number;
        customerSatisfaction: number;
        returnRate: number;
        achievements?: string[];
    };
    dailySales?: Array<{
        date: Date;
        sales: number;
        transactions: number;
    }>;
    topProducts?: Array<{
        productId: string;
        productName: string;
        productType?: string;
        quantity: number;
        sales: number;
        averagePrice: number;
    }>;
    recentSales?: Array<{
        id: string;
        date: Date;
        totalAmount: number;
        quantity: number;
        customerName?: string;
    }>;
}
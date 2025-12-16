import { Role } from "./enums";
import { Sale } from "./models";
import { Store } from "./stores";
import { User } from "./users";

// Employee Types
export interface Employee {
    id: string;
    userId: string;
    user: User;
    storeId: string;
    store: Store;
    position: string;
    role: Role;
    hireDate: string;
    terminationDate?: string;
    performanceScore?: number; // Calculated field, not in DB
    createdBy: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    _count?: {
        sales?: number;
        transfers?: number;
        performanceReviews?: number;
    };
    transfers?: EmployeeTransfer[];
    performanceReviews?: PerformanceReview[];
    sales?: Sale[]; // For performance data
    createdByUser?: User; // Reference to the user who created this employee
}

export interface EmployeeTransfer {
    id: string;
    employeeId: string;
    employee: Employee;
    fromStoreId: string;
    toStoreId: string;
    reason: string;
    transferredBy: string;
    transferredByUser: User;
    transferDate: string;
    fromStore: Store;
    toStore: Store;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employee: Employee;
    reviewerId: string;
    reviewer: User;
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
    createdAt: string;
}

// export interface Sale {
//     id: string;
//     employeeId: string;
//     storeId: string;
//     total: number;
//     subtotal: number;
//     tax: number;
//     createdAt: string;
//     paymentMethod: 'MOBILE' | 'CASH' | 'CARD';
//     customerName?: string;
//     customerEmail?: string;
//     customerPhone?: string;
//     saleItems?: SaleItem[];
// }

// export interface SaleItem {
//     id: string;
//     saleId: string;
//     productId: string;
//     productName: string;
//     quantity: number;
//     price: number;
// }

// For API request/response data
export interface CreateEmployeeData {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
    hireDate?: string; // Optional, defaults to now
}

export interface UpdateEmployeeData {
    position?: string;
    role?: Role;
    status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    terminationDate?: string;
}

export interface TransferEmployeeData {
    newStoreId: string;
    reason: string;
}

export interface PerformanceReviewData {
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
}

// For form values (with explicit undefined for discriminated union)
export interface CreateEmployeeFormValues {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
    hireDate: string;
    // Explicit undefined for other forms
    newStoreId?: undefined;
    reason?: undefined;
    period?: undefined;
    score?: undefined;
    feedback?: undefined;
    goals?: undefined;
    strengths?: undefined;
    areasForImprovement?: undefined;
    status?: undefined;
    terminationDate?: undefined;
}

export interface EditEmployeeFormValues {
    position: string;
    role: Role;
    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    terminationDate?: string;
    // Explicit undefined for other forms
    userId?: undefined;
    storeId?: undefined;
    hireDate?: undefined;
    newStoreId?: undefined;
    reason?: undefined;
    period?: undefined;
    score?: undefined;
    feedback?: undefined;
    goals?: undefined;
    strengths?: undefined;
    areasForImprovement?: undefined;
}

export interface TransferEmployeeFormValues {
    newStoreId: string;
    reason: string;
    // Explicit undefined for other forms
    userId?: undefined;
    storeId?: undefined;
    position?: undefined;
    role?: undefined;
    hireDate?: undefined;
    status?: undefined;
    period?: undefined;
    score?: undefined;
    feedback?: undefined;
    goals?: undefined;
    strengths?: undefined;
    areasForImprovement?: undefined;
    terminationDate?: undefined;
}

export interface PerformanceReviewFormValues {
    period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
    // Explicit undefined for other forms
    userId?: undefined;
    storeId?: undefined;
    position?: undefined;
    role?: undefined;
    hireDate?: undefined;
    status?: undefined;
    newStoreId?: undefined;
    reason?: undefined;
    terminationDate?: undefined;
}

export type EmployeeFormValues =
    | CreateEmployeeFormValues
    | EditEmployeeFormValues
    | TransferEmployeeFormValues
    | PerformanceReviewFormValues;

// Employee performance report interface
export interface EmployeePerformanceReport {
    employee: Employee;
    period: 'day' | 'week' | 'month' | 'year';
    sales: {
        revenue: number;
        transactions: number;
        averageTransaction: number;
        bestSellingProducts: Array<{
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }>;
        salesByHour?: Array<{
            hour: number;
            sales: number;
            revenue: number;
        }>;
    };
    comparison?: {
        storeAverage: number;
        employeeRank: number;
        topPerformer: { name: string; revenue: number };
    };
}

// Store staff summary
export interface StoreStaffSummary {
    storeId: string;
    storeName: string;
    period: 'current' | 'month' | 'quarter' | 'year';
    summary: {
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        terminated: number;
        averageTenure: number; // in months
        averagePerformanceScore: number;
    };
    byRole: Array<{
        role: Role;
        count: number;
        percentage: number;
    }>;
    byPosition: Array<{
        position: string;
        count: number;
        percentage: number;
    }>;
    performanceDistribution: Array<{
        range: '0-60' | '61-70' | '71-80' | '81-90' | '91-100';
        count: number;
        percentage: number;
    }>;
    topPerformers: Array<{
        employeeId: string;
        name: string;
        role: string;
        position: string;
        performanceScore: number;
        salesRevenue: number;
    }>;
    recentHires: Array<{
        employeeId: string;
        name: string;
        position: string;
        hireDate: string;
    }>;
    turnover: {
        monthlyTurnoverRate: number;
        quarterlyTurnoverRate: number;
        yearlyTurnoverRate: number;
        voluntaryTurnovers: number;
        involuntaryTurnovers: number;
    };
}

// Employee statistics
export interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    terminated: number;
    averagePerformanceScore: number;
    turnoverRate: number;
    byRole: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
    byStore: Array<{
        storeId: string;
        storeName: string;
        count: number;
        percentage: number;
    }>;
    recentHires: number;
    upcomingReviews: number;
}

// Paginated response
export interface PaginatedEmployeesResponse {
    employees: Employee[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Filters for employee queries
export interface EmployeeFilters {
    storeId?: string;
    role?: Role;
    position?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    search?: string;
    activeOnly?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'hireDate' | 'performanceScore' | 'role' | 'position' | 'status';
    sortOrder?: 'asc' | 'desc';
}

// Paginated transfers response
export interface PaginatedTransfersResponse {
    transfers: EmployeeTransfer[];
    total: number;
    page: number;
    totalPages: number;
}

// Paginated reviews response
export interface PaginatedReviewsResponse {
    reviews: PerformanceReview[];
    averageScore: number;
    total: number;
    page: number;
    totalPages: number;
}

// Transfer response from API
export interface TransferEmployeeResponse {
    employee: Employee;
    transfer: EmployeeTransfer;
    oldStore: Store;
    newStore: Store;
}

// Performance review response from API
export interface PerformanceReviewResponse {
    review: PerformanceReview;
    employee: Employee;
}

// Helper types for dropdowns and selectors
export interface EmployeeOption {
    id: string;
    label: string;
    value: string;
    role: Role;
    position: string;
    storeName: string;
}

export interface EmployeeStatusOption {
    value: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
    label: string;
    color: string;
}

export interface RoleOption {
    value: Role;
    label: string;
    description: string;
}

// Employee export data
export interface EmployeeExportData {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    store: string;
    hireDate: string;
    terminationDate?: string;
    status: string;
    performanceScore?: number;
    salesCount?: number;
    transferCount?: number;
    reviewCount?: number;
}

// Employee creation/update validation result
export interface EmployeeValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
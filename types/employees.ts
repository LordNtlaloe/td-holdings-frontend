import { User } from "./users";
import { Store } from "./store";
import { Sale } from "./sales";
import { Role, EmployeeStatus, ReviewPeriod, SortOrder } from "./enums";

export interface Employee {
    id: string;
    userId: string;
    storeId: string;
    position: string;
    role: Role;
    hireDate: string;
    terminationDate?: string;
    status: EmployeeStatus;
    createdAt: string;
    updatedAt: string;
    createdById: string;

    // Relationships
    user?: User;
    store?: Store;
    sales?: Sale[];
    transfers?: EmployeeTransfer[];
    performanceReviews?: PerformanceReview[];
    createdBy?: User;

    // Computed
    fullName?: string;
    email?: string;
    phone?: string;
    tenure?: number; // in days

    // Counts
    _count?: {
        sales?: number;
        transfers?: number;
        performanceReviews?: number;
    };
}

export interface EmployeeTransfer {
    id: string;
    employeeId: string;
    fromStoreId: string;
    toStoreId: string;
    reason: string;
    transferredBy: string;
    transferDate: string;

    // Relationships
    employee?: Employee;
    fromStore?: Store;
    toStore?: Store;
    transferredByUser?: User;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    reviewerId: string;
    period: ReviewPeriod;
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
    createdAt: string;

    // Relationships
    employee?: Employee;
    reviewer?: User;
}

// Employee Statistics
export interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    terminated: number;
    averagePerformanceScore: number;
    turnoverRate: number;
    byRole: Array<{
        role: Role;
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

export interface EmployeePerformanceReport {
    employee: Employee;
    period: 'day' | 'week' | 'month' | 'year' | 'quarter';
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

export interface StoreStaffSummary {
    storeId: string;
    storeName: string;
    period: 'current' | 'month' | 'quarter' | 'year';
    summary: {
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        terminated: number;
        averageTenure: number;
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

// Employee Filters
export interface EmployeeFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
    storeId?: string;
    role?: Role;
    position?: string;
    status?: EmployeeStatus;
    activeOnly?: boolean;
    hireDateFrom?: Date;
    hireDateTo?: Date;
}

// Employee Form Values
export interface CreateEmployeeFormValues {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
    hireDate: string;
}

export interface UpdateEmployeeFormValues {
    position?: string;
    role?: Role;
    status?: EmployeeStatus;
    terminationDate?: string;
    storeId?: string;
}

export interface TransferEmployeeFormValues {
    toStoreId: string;
    reason: string;
    transferDate?: string;
}

export interface PerformanceReviewFormValues {
    period: ReviewPeriod;
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
}

// Employee API Types
export interface CreateEmployeeRequest {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
    hireDate: string;
}

export interface UpdateEmployeeRequest {
    position?: string;
    role?: Role;
    status?: EmployeeStatus;
    terminationDate?: string;
    storeId?: string;
}

export interface TransferEmployeeRequest {
    toStoreId: string;
    reason: string;
    transferDate?: string;
}

export interface CreatePerformanceReviewRequest {
    employeeId: string;
    period: ReviewPeriod;
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
}

export interface PaginatedEmployeesResponse {
    data: Employee[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    summary?: {
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        terminated: number;
        byRole: Array<{
            role: Role;
            count: number;
            percentage: number;
        }>;
        byStore: Array<{
            storeId: string;
            storeName: string;
            count: number;
            percentage: number;
        }>;
    };
}
import {
    Employee,
    StoreStaffSummary,
    EmployeeFilters,
    PaginatedEmployeesResponse,
    EmployeeStats,
    PerformanceReview,
    EmployeeTransfer,
    User,
    PerformanceReviewFormValues,
    CreateEmployeeFormValues,
    EditEmployeeFormValues,
    TransferEmployeeFormValues
} from '@/types';

const API_BASE = '/api';

class EmployeeAPI {
    private static async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'API request failed');
        }

        const result = await response.json();
        // Handle consistent response format { success, data, error }
        if (result.success === false) {
            throw new Error(result.error || 'API request failed');
        }
        return result.data || result;
    }

    // ============ EMPLOYEE CRUD OPERATIONS ============

    static async getEmployees(token: string, params?: EmployeeFilters): Promise<PaginatedEmployeesResponse> {
        const query = new URLSearchParams();

        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.role) query.append('role', params.role);
        if (params?.position) query.append('position', params.position);
        if (params?.status) query.append('status', params.status);
        if (params?.search) query.append('search', params.search);
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

        const queryString = query.toString();
        return this.fetchAPI(`/employees${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getEmployee(token: string, employeeId: string): Promise<Employee> {
        return this.fetchAPI(`/employees/${employeeId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async createEmployee(token: string, data: CreateEmployeeFormValues): Promise<Employee> {
        return this.fetchAPI('/employees', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateEmployee(token: string, employeeId: string, data: EditEmployeeFormValues): Promise<Employee> {
        return this.fetchAPI(`/employees/${employeeId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async terminateEmployee(
        token: string,
        employeeId: string,
        terminationDate: string,
        reason?: string
    ): Promise<{ success: boolean; message: string }> {
        return this.fetchAPI(`/employees/${employeeId}`, {
            method: 'DELETE',
            body: JSON.stringify({ terminationDate, reason }),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getEmployeeByUserId(token: string, userId: string): Promise<Employee> {
        return this.fetchAPI(`/employees/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ EMPLOYEE TRANSFER OPERATIONS ============

    static async transferEmployee(token: string, employeeId: string, data: TransferEmployeeFormValues): Promise<{
        employee: Employee;
        transfer: EmployeeTransfer;
        oldStore: any;
        newStore: any;
    }> {
        return this.fetchAPI(`/employees/${employeeId}/transfers`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async getEmployeeTransfers(
        token: string,
        employeeId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        transfers: EmployeeTransfer[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('limit', limit.toString());

        return this.fetchAPI(`/employees/${employeeId}/transfers?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ PERFORMANCE REVIEW OPERATIONS ============

    static async getPerformanceReviews(
        token: string,
        employeeId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{
        reviews: PerformanceReview[];
        averageScore: number;
        total: number;
        page: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();
        query.append('page', page.toString());
        query.append('limit', limit.toString());

        return this.fetchAPI(`/employees/${employeeId}/reviews?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async createPerformanceReview(
        token: string,
        employeeId: string,
        data: PerformanceReviewFormValues
    ): Promise<{ review: PerformanceReview; employee: Employee }> {
        return this.fetchAPI(`/employees/${employeeId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ STATISTICS & REPORTS ============

    static async getEmployeePerformance(
        token: string,
        employeeId: string,
        period: 'day' | 'week' | 'month' | 'year' = 'month'
    ): Promise<{
        employee: any;
        period: string;
        sales: {
            revenue: number;
            transactions: number;
            averageTransaction: number;
            bestSellingProducts: Array<{ productId: string; productName: string; quantity: number; revenue: number }>;
            salesByHour?: Array<{ hour: number; sales: number; revenue: number }>;
        };
        comparison?: {
            storeAverage: number;
            employeeRank: number;
            topPerformer: { name: string; revenue: number };
        };
    }> {
        const query = new URLSearchParams();
        query.append('period', period);

        return this.fetchAPI(`/employees/${employeeId}/performance?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getStoreStaffSummary(
        token: string,
        storeId: string,
        period: 'current' | 'month' | 'quarter' | 'year' = 'current'
    ): Promise<StoreStaffSummary> {
        const query = new URLSearchParams();
        query.append('period', period);

        return this.fetchAPI(`/employees/store/${storeId}/summary?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getEmployeeStats(
        token: string,
        storeId?: string
    ): Promise<EmployeeStats> {
        const query = new URLSearchParams();
        if (storeId) query.append('storeId', storeId);

        const queryString = query.toString();
        return this.fetchAPI(`/employees/stats/overview${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ UTILITY METHODS ============

    static async getAvailableUsers(token: string): Promise<User[]> {
        return this.fetchAPI('/users/available', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ EXPORT METHODS (if implemented) ============

    static async exportEmployees(token: string, params?: EmployeeFilters): Promise<Blob> {
        const query = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined) query.append(key, value.toString());
            });
        }

        const response = await fetch(`${API_BASE}/employees/export?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Export failed');
        }

        return response.blob();
    }

    static async exportEmployeePerformance(
        token: string,
        employeeId: string,
        period: 'day' | 'week' | 'month' | 'year' = 'month'
    ): Promise<Blob> {
        const query = new URLSearchParams();
        query.append('period', period);

        const response = await fetch(`${API_BASE}/employees/${employeeId}/performance/export?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Export failed');
        }

        return response.blob();
    }

    // ============ HELPER METHODS ============

    /**
     * Calculate employee tenure in readable format
     */
    static calculateTenure(hireDate: string): { years: number; months: number; display: string } {
        const hire = new Date(hireDate);
        const now = new Date();

        let months = (now.getFullYear() - hire.getFullYear()) * 12;
        months += now.getMonth() - hire.getMonth();

        if (now.getDate() < hire.getDate()) {
            months--;
        }

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let display = '';
        if (years > 0) display += `${years}y `;
        if (remainingMonths > 0) display += `${remainingMonths}m`;
        if (!display) display = '0m';

        return { years, months, display: display.trim() };
    }

    /**
     * Get performance category based on score
     */
    static getPerformanceCategory(score: number): {
        category: string;
        color: string;
        description: string;
    } {
        if (score >= 90) return {
            category: 'Excellent',
            color: 'bg-green-100 text-green-800',
            description: 'Top performer'
        };
        if (score >= 80) return {
            category: 'Good',
            color: 'bg-blue-100 text-blue-800',
            description: 'Meets expectations'
        };
        if (score >= 70) return {
            category: 'Average',
            color: 'bg-yellow-100 text-yellow-800',
            description: 'Needs improvement'
        };
        if (score >= 60) return {
            category: 'Below Average',
            color: 'bg-orange-100 text-orange-800',
            description: 'Requires attention'
        };
        return {
            category: 'Poor',
            color: 'bg-red-100 text-red-800',
            description: 'Immediate action required'
        };
    }

    /**
     * Format employee name
     */
    static formatEmployeeName(employee: Employee): string {
        return `${employee.user.firstName} ${employee.user.lastName}`;
    }

    /**
     * Get employee status color and text
     */
    static getStatusInfo(status: string): { color: string; label: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' } {
        switch (status) {
            case 'ACTIVE':
                return { color: 'bg-green-100 text-green-800', label: 'Active', badgeVariant: 'default' };
            case 'INACTIVE':
                return { color: 'bg-gray-100 text-gray-800', label: 'Inactive', badgeVariant: 'secondary' };
            case 'ON_LEAVE':
                return { color: 'bg-blue-100 text-blue-800', label: 'On Leave', badgeVariant: 'outline' };
            case 'TERMINATED':
                return { color: 'bg-red-100 text-red-800', label: 'Terminated', badgeVariant: 'destructive' };
            default:
                return { color: 'bg-gray-100 text-gray-800', label: 'Unknown', badgeVariant: 'secondary' };
        }
    }

    /**
     * Validate employee data before submission
     */
    static validateEmployeeData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.userId) errors.push('User ID is required');
        if (!data.storeId) errors.push('Store ID is required');
        if (!data.position || data.position.trim().length < 2) errors.push('Position must be at least 2 characters');
        if (!data.role) errors.push('Role is required');
        if (data.hireDate && new Date(data.hireDate) > new Date()) errors.push('Hire date cannot be in the future');

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default EmployeeAPI;
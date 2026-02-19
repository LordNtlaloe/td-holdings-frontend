import {
    Employee,
    EmployeeFilters,
    PaginatedEmployeesResponse,
    EmployeeStats,
    PerformanceReview,
    EmployeeTransfer,
    User,
    PerformanceReviewFormValues,
    CreateEmployeeFormValues,
    UpdateEmployeeFormValues,
    TransferEmployeeFormValues
} from '@/types';

const API_BASE = '/api';

class EmployeeAPI {

    private static async fetchAPI<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
        try {
            console.log(`📤 Fetching: ${API_BASE}${endpoint}`);

            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            console.log(`📥 Response status:`, response.status);

            let responseData;
            try {
                responseData = await response.json();
                console.log(`📥 Response data:`, responseData);
            } catch (e) {
                // If response is not JSON, get text
                const text = await response.text();
                console.error(`❌ Non-JSON response:`, text.substring(0, 200));
                throw new Error(text || 'API request failed');
            }

            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || 'API request failed');
            }

            return responseData as T;
        } catch (error) {
            console.error(`❌ fetchAPI error for ${endpoint}:`, error);
            throw error;
        }
    }
    static async getEmployees(token: string, params?: EmployeeFilters): Promise<PaginatedEmployeesResponse> {
        try {
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
            const response = await this.fetchAPI<any>(`/employees${queryString ? `?${queryString}` : ''}`, token, {
                cache: 'no-store',
            });

            console.log('📥 API Response in getEmployees:', response);

            // Handle the response from your API route
            if (response && typeof response === 'object') {
                // If response has data and meta (our new format)
                if (response.data && response.meta) {
                    return {
                        data: response.data,
                        meta: response.meta,
                        summary: response.summary
                    };
                }

                // If it's an array directly
                if (Array.isArray(response)) {
                    return {
                        data: response,
                        meta: {
                            total: response.length,
                            page: 1,
                            limit: response.length,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPrevPage: false
                        }
                    };
                }

                // If it has employees property
                if (response.employees) {
                    return {
                        data: response.employees,
                        meta: {
                            total: response.total || response.employees.length,
                            page: response.page || 1,
                            limit: response.limit || 20,
                            totalPages: response.totalPages || 1,
                            hasNextPage: response.hasNext || false,
                            hasPrevPage: response.hasPrev || false
                        },
                        summary: response.summary
                    };
                }
            }

            // Return default empty response
            return {
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            };
        } catch (error) {
            console.error('❌ Error in getEmployees:', error);
            // Return default empty response on error
            return {
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    limit: 20,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            };
        }
    }

    static async getEmployee(token: string, employeeId: string): Promise<Employee> {
        try {
            const response = await this.fetchAPI<any>(`/employees/${employeeId}`, token, {
                cache: 'no-store',
            });

            return response.employee || response;
        } catch (error) {
            console.error('❌ Error in getEmployee:', error);
            throw error;
        }
    }

    static async createEmployee(token: string, data: CreateEmployeeFormValues): Promise<{ user: User; employee: Employee }> {
        try {
            return await this.fetchAPI('/employees', token, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('❌ Error in createEmployee:', error);
            throw error;
        }
    }

    static async updateEmployee(token: string, employeeId: string, data: UpdateEmployeeFormValues): Promise<Employee> {
        try {
            return await this.fetchAPI(`/employees/${employeeId}`, token, {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('❌ Error in updateEmployee:', error);
            throw error;
        }
    }

    static async terminateEmployee(
        token: string,
        employeeId: string,
        terminationDate: string,
        reason?: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            return await this.fetchAPI(`/employees/${employeeId}`, token, {
                method: 'DELETE',
                body: JSON.stringify({ terminationDate, reason }),
            });
        } catch (error) {
            console.error('❌ Error in terminateEmployee:', error);
            throw error;
        }
    }

    static async getEmployeeByUserId(token: string, userId: string): Promise<Employee> {
        try {
            return await this.fetchAPI(`/employees/users/${userId}`, token, {
                cache: 'no-store',
            });
        } catch (error) {
            console.error('❌ Error in getEmployeeByUserId:', error);
            throw error;
        }
    }

    // ============ EMPLOYEE TRANSFER OPERATIONS ============

    static async transferEmployee(token: string, employeeId: string, data: TransferEmployeeFormValues): Promise<{
        employee: Employee;
        transfer: EmployeeTransfer;
        oldStore: any;
        newStore: any;
    }> {
        try {
            return await this.fetchAPI(`/employees/${employeeId}/transfers`, token, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('❌ Error in transferEmployee:', error);
            throw error;
        }
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
        try {
            const query = new URLSearchParams();
            query.append('page', page.toString());
            query.append('limit', limit.toString());

            const response = await this.fetchAPI<any>(`/employees/${employeeId}/transfers?${query.toString()}`, token, {
                cache: 'no-store',
            });

            return {
                transfers: response.data || response.transfers || [],
                total: response.meta?.total || response.total || 0,
                page: response.meta?.page || response.page || page,
                totalPages: response.meta?.totalPages || response.totalPages || 1,
            };
        } catch (error) {
            console.error('❌ Error in getEmployeeTransfers:', error);
            return {
                transfers: [],
                total: 0,
                page: page,
                totalPages: 1,
            };
        }
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
        try {
            const query = new URLSearchParams();
            query.append('page', page.toString());
            query.append('limit', limit.toString());

            return await this.fetchAPI(`/employees/${employeeId}/reviews?${query.toString()}`, token, {
                cache: 'no-store',
            });
        } catch (error) {
            console.error('❌ Error in getPerformanceReviews:', error);
            return {
                reviews: [],
                averageScore: 0,
                total: 0,
                page: page,
                totalPages: 1,
            };
        }
    }

    static async createPerformanceReview(
        token: string,
        employeeId: string,
        data: PerformanceReviewFormValues
    ): Promise<{ review: PerformanceReview; employee: Employee }> {
        try {
            return await this.fetchAPI(`/employees/${employeeId}/reviews`, token, {
                method: 'POST',
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error('❌ Error in createPerformanceReview:', error);
            throw error;
        }
    }

    // ============ STATISTICS & REPORTS ============

    static async getEmployeePerformance(
        token: string,
        employeeId: string,
        period: 'day' | 'week' | 'month' | 'year' = 'month'
    ): Promise<any> {
        try {
            const query = new URLSearchParams();
            query.append('period', period);

            return await this.fetchAPI(`/employees/${employeeId}/performance?${query.toString()}`, token, {
                cache: 'no-store',
            });
        } catch (error) {
            console.error('❌ Error in getEmployeePerformance:', error);
            throw error;
        }
    }

    static async getStoreStaffSummary(
        token: string,
        storeId: string,
        period: 'current' | 'month' | 'quarter' | 'year' = 'current'
    ): Promise<any> {
        try {
            const query = new URLSearchParams();
            query.append('period', period);

            return await this.fetchAPI(`/employees/store/${storeId}/summary?${query.toString()}`, token, {
                cache: 'no-store',
            });
        } catch (error) {
            console.error('❌ Error in getStoreStaffSummary:', error);
            throw error;
        }
    }

    static async getEmployeeStats(
        token: string,
        storeId?: string
    ): Promise<EmployeeStats> {
        try {
            const query = new URLSearchParams();
            if (storeId) query.append('storeId', storeId);

            const queryString = query.toString();
            const response = await this.fetchAPI<any>(`/employees/stats/overview${queryString ? `?${queryString}` : ''}`, token, {
                cache: 'no-store',
            });

            // Transform the response to match EmployeeStats type
            return {
                totalEmployees: response.total || 0,
                activeEmployees: response.activeEmployees || 0,
                onLeave: response.onLeaveEmployees || 0, // Map onLeaveEmployees to onLeave
                terminated: response.terminatedEmployees || 0, // Map terminatedEmployees to terminated
                averagePerformanceScore: response.averagePerformanceScore || 0,
                turnoverRate: response.turnoverRate || 0,
                byRole: Array.isArray(response.byRole) ? response.byRole : [],
                byStore: Array.isArray(response.byStore) ? response.byStore : [],
                recentHires: response.newHiresLast30Days || 0, // Map newHiresLast30Days to recentHires
                upcomingReviews: response.upcomingReviews || 0
            };
        } catch (error) {
            console.error('❌ Error in getEmployeeStats:', error);
            // Return default stats on error with correct types
            return {
                totalEmployees: 0,
                activeEmployees: 0,
                onLeave: 0,
                terminated: 0,
                averagePerformanceScore: 0,
                turnoverRate: 0,
                byRole: [],
                byStore: [],
                recentHires: 0,
                upcomingReviews: 0
            };
        }
    }
    // ============ UTILITY METHODS ============

    static async getAvailableUsers(token: string): Promise<User[]> {
        try {
            return await this.fetchAPI('/users/available', token, {
                cache: 'no-store',
            });
        } catch (error) {
            console.error('❌ Error in getAvailableUsers:', error);
            return [];
        }
    }

    // ============ EXPORT METHODS ============

    static async exportEmployees(token: string, params?: EmployeeFilters): Promise<Blob> {
        try {
            const query = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) query.append(key, value.toString());
                });
            }

            const response = await fetch(`${API_BASE}/employees/export?${query.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || 'Export failed');
            }

            return response.blob();
        } catch (error) {
            console.error('❌ Error in exportEmployees:', error);
            throw error;
        }
    }

    // ============ HELPER METHODS ============

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

    static formatEmployeeName(employee: Employee): string {
        return `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim();
    }

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

    static validateEmployeeData(data: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.email) errors.push('Email is required');
        if (!data.password) errors.push('Password is required');
        if (data.password && data.password.length < 6) errors.push('Password must be at least 6 characters');
        if (!data.firstName) errors.push('First name is required');
        if (!data.lastName) errors.push('Last name is required');
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
// lib/api/employees.ts

import { Employee, EmployeeFilters, EmployeeFormData, EmployeePerformance } from "@/types";

// Get all employees with parameters
export async function getAllEmployeesWithParams(params?: EmployeeFilters): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
}> {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params?.storeId) queryParams.append('storeId', params.storeId);
        if (params?.role) queryParams.append('role', params.role);
        if (params?.position) queryParams.append('position', params.position);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = queryString ? `/api/employees?${queryString}` : '/api/employees';

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // Try to parse error as JSON, fall back to text if it fails
            let errorMessage = 'Failed to fetch employees';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                // If response is not JSON, try to get text
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();

        // Transform employees data
        const employees = (data.employees || data || []).map((employee: any) => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            phone: employee.phone,
            position: employee.position,
            storeId: employee.storeId,
            store: employee.store ? {
                id: employee.store.id,
                name: employee.store.name,
                location: employee.store.location,
            } : undefined,
            user: employee.user ? {
                id: employee.user.id,
                email: employee.user.email,
                role: employee.user.role,
                emailVerified: employee.user.emailVerified,
                isActive: employee.user.isActive,
                createdAt: new Date(employee.user.createdAt),
                updatedAt: new Date(employee.user.updatedAt),
            } : undefined,
            salesCount: employee.salesCount || employee._count?.sales || 0,
            performance: employee.performance,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
        }));

        // Check if response is paginated or just an array
        if (Array.isArray(data)) {
            return {
                employees: employees,
                total: data.length,
                page: 1,
                totalPages: 1,
            };
        }

        // If response is paginated
        return {
            employees: employees,
            total: data.pagination?.total || data.total || 0,
            page: data.pagination?.page || params?.page || 1,
            totalPages: data.pagination?.pages || Math.ceil((data.total || 0) / (params?.limit || 20)),
        };

    } catch (error) {
        console.error('Error fetching employees:', error);

        // Return empty result instead of throwing
        return {
            employees: [],
            total: 0,
            page: 1,
            totalPages: 0,
        };
    }
}

// Get all employees (simple version)
export async function getAllEmployees(): Promise<Employee[]> {
    try {
        const response = await fetch('/api/employees', {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            let errorMessage = 'Failed to fetch employees';
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch {
                const errorText = await response.text();
                if (errorText) {
                    errorMessage = errorText;
                }
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        const employees = data.employees || data || [];

        // Transform the data to match Employee type
        return employees.map((employee: any) => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            phone: employee.phone,
            position: employee.position,
            storeId: employee.storeId,
            store: employee.store ? {
                id: employee.store.id,
                name: employee.store.name,
                location: employee.store.location,
            } : undefined,
            user: employee.user ? {
                id: employee.user.id,
                email: employee.user.email,
                role: employee.user.role,
                emailVerified: employee.user.emailVerified,
                isActive: employee.user.isActive,
                createdAt: new Date(employee.user.createdAt),
                updatedAt: new Date(employee.user.updatedAt),
            } : undefined,
            salesCount: employee.salesCount || 0,
            performance: employee.performance,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
        }));

    } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
    }
}

// Enhanced version with error handling wrapper
export async function safeGetAllEmployees(): Promise<{
    data: Employee[];
    error: string | null;
}> {
    try {
        const employees = await getAllEmployees();
        return {
            data: employees,
            error: null,
        };
    } catch (error) {
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Create employee
export async function createEmployee(employeeData: EmployeeFormData): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to create employee'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error creating employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Update employee
export async function updateEmployee(id: string, employeeData: Partial<EmployeeFormData>): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update employee'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Delete employee
export async function deleteEmployee(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to delete employee'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee by ID
export async function getEmployeeById(id: string): Promise<{
    success: boolean;
    data?: Employee;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employee'
            };
        }

        const data = await response.json();

        // Transform the employee data
        const employee: Employee = {
            id: data.employee?.id || data.id,
            firstName: data.employee?.firstName || data.firstName,
            lastName: data.employee?.lastName || data.lastName,
            fullName: `${data.employee?.firstName || data.firstName} ${data.employee?.lastName || data.lastName}`,
            phoneNumber: data.employee?.phone || data.phone,
            position: data.employee?.position || data.position,
            storeId: data.employee?.storeId || data.storeId,
            store: (data.employee?.store || data.store) ? {
                id: (data.employee?.store || data.store).id,
                name: (data.employee?.store || data.store).name,
                location: (data.employee?.store || data.store).location,
            } : undefined,
            user: (data.employee?.user || data.user) ? {
                id: (data.employee?.user || data.user).id,
                email: (data.employee?.user || data.user).email,
                role: (data.employee?.user || data.user).role,
                emailVerified: (data.employee?.user || data.user).emailVerified,
                isActive: (data.employee?.user || data.user).isActive,
                createdAt: new Date((data.employee?.user || data.user).createdAt),
                updatedAt: new Date((data.employee?.user || data.user).updatedAt),
            } : undefined,
            salesCount: data.employee?._count?.sales || data._count?.sales || data.salesCount || 0,
            performance: data.employee?.performance || data.performance,
            recentSales: data.employee?.recentSales || data.recentSales,
            createdAt: new Date(data.employee?.createdAt || data.createdAt),
            updatedAt: new Date(data.employee?.updatedAt || data.updatedAt),
        };

        return { success: true, data: employee };
    } catch (error) {
        console.error('Error fetching employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Deactivate employee
export async function deactivateEmployee(id: string, reason: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}/deactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to deactivate employee'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error deactivating employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Reactivate employee (assuming you'll add this route)
export async function reactivateEmployee(id: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}/reactivate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to reactivate employee'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error reactivating employee:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Reset employee password
export async function resetEmployeePassword(id: string, sendEmail: boolean = true): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sendEmail }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to reset password'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error resetting employee password:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee performance
export async function getEmployeePerformance(id: string, period: string = 'month'): Promise<{
    success: boolean;
    data?: EmployeePerformance;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}/performance?period=${period}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employee performance'
            };
        }

        const data = await response.json();

        // Transform performance data
        const performance: EmployeePerformance = {
            employee: data.employee,
            period: data.period,
            summary: data.performance?.summary,
            dailySales: data.performance?.dailySales || [],
            topProducts: data.performance?.topProducts || [],
            recentSales: data.performance?.recentSales || [],
        };

        return { success: true, data: performance };
    } catch (error) {
        console.error('Error fetching employee performance:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee activities
export async function getEmployeeActivities(
    id: string,
    params?: {
        startDate?: string;
        endDate?: string;
        action?: string;
        page?: number;
        limit?: number;
    }
): Promise<{
    success: boolean;
    data?: {
        activities: any[];
        summary: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    };
    error?: string;
}> {
    try {
        // Build query string
        const queryParams = new URLSearchParams();

        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.action) queryParams.append('action', params.action);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const url = queryString ? `/api/employees/${id}/activities?${queryString}` : `/api/employees/${id}/activities`;

        const response = await fetch(url);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employee activities'
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching employee activities:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get current employee data (my data)
export async function getMyEmployeeData(): Promise<{
    success: boolean;
    data?: Employee;
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees/my-data');

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employee data'
            };
        }

        const data = await response.json();

        // Transform the employee data
        const employee: Employee = {
            id: data.employee?.id,
            firstName: data.employee?.firstName,
            lastName: data.employee?.lastName,
            fullName: `${data.employee?.firstName} ${data.employee?.lastName}`,
            phoneNumber: data.employee?.phone,
            position: data.employee?.position,
            storeId: data.employee?.storeId,
            store: data.employee?.store ? {
                id: data.employee.store.id,
                name: data.employee.store.name,
                location: data.employee.store.location,
            } : undefined,
            user: data.employee?.user ? {
                id: data.employee.user.id,
                email: data.employee.user.email,
                role: data.employee.user.role,
                emailVerified: data.employee.user.emailVerified,
                isActive: data.employee.user.isActive,
                phoneNumber: data.employee.user.phoneNumber,
                createdAt: new Date(data.employee.user.createdAt),
                updatedAt: new Date(data.employee.user.updatedAt),
            } : undefined,
            performance: data.employee?.performance,
            createdAt: new Date(data.employee?.createdAt),
            updatedAt: new Date(data.employee?.updatedAt),
        };

        return { success: true, data: employee };
    } catch (error) {
        console.error('Error fetching my employee data:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Search employees
export async function searchEmployees(searchTerm: string): Promise<{
    success: boolean;
    data?: Employee[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees?search=${encodeURIComponent(searchTerm)}&limit=50`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to search employees',
            };
        }

        const data = await response.json();

        // Transform the employees data
        const employees = (data.employees || data || []).map((employee: any) => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            phone: employee.phone,
            position: employee.position,
            storeId: employee.storeId,
            store: employee.store ? {
                id: employee.store.id,
                name: employee.store.name,
                location: employee.store.location,
            } : undefined,
            user: employee.user ? {
                id: employee.user.id,
                email: employee.user.email,
                role: employee.user.role,
                emailVerified: employee.user.emailVerified,
                isActive: employee.user.isActive,
                createdAt: new Date(employee.user.createdAt),
                updatedAt: new Date(employee.user.updatedAt),
            } : undefined,
            salesCount: employee.salesCount || 0,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
        }));

        return { success: true, data: employees };
    } catch (error) {
        console.error('Error searching employees:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Get employees by store
export async function getEmployeesByStore(storeId: string): Promise<{
    success: boolean;
    data?: Employee[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees?storeId=${storeId}&limit=1000`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store employees',
            };
        }

        const data = await response.json();

        // Transform the employees data
        const employees = (data.employees || data || []).map((employee: any) => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            phone: employee.phone,
            position: employee.position,
            storeId: employee.storeId,
            store: employee.store ? {
                id: employee.store.id,
                name: employee.store.name,
                location: employee.store.location,
            } : undefined,
            user: employee.user ? {
                id: employee.user.id,
                email: employee.user.email,
                role: employee.user.role,
                emailVerified: employee.user.emailVerified,
                isActive: employee.user.isActive,
                createdAt: new Date(employee.user.createdAt),
                updatedAt: new Date(employee.user.updatedAt),
            } : undefined,
            salesCount: employee.salesCount || 0,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
        }));

        return { success: true, data: employees };
    } catch (error) {
        console.error('Error fetching store employees:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Get employees by role
export async function getEmployeesByRole(role: string): Promise<{
    success: boolean;
    data?: Employee[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees?role=${role}&limit=1000`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employees by role',
            };
        }

        const data = await response.json();

        // Transform the employees data
        const employees = (data.employees || data || []).map((employee: any) => ({
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            fullName: `${employee.firstName} ${employee.lastName}`,
            phone: employee.phone,
            position: employee.position,
            storeId: employee.storeId,
            store: employee.store ? {
                id: employee.store.id,
                name: employee.store.name,
                location: employee.store.location,
            } : undefined,
            user: employee.user ? {
                id: employee.user.id,
                email: employee.user.email,
                role: employee.user.role,
                emailVerified: employee.user.emailVerified,
                isActive: employee.user.isActive,
                createdAt: new Date(employee.user.createdAt),
                updatedAt: new Date(employee.user.updatedAt),
            } : undefined,
            salesCount: employee.salesCount || 0,
            createdAt: new Date(employee.createdAt),
            updatedAt: new Date(employee.updatedAt),
        }));

        return { success: true, data: employees };
    } catch (error) {
        console.error('Error fetching employees by role:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Export employees data
export async function exportEmployees(format: 'csv' | 'json' | 'excel' = 'json'): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/export?format=${format}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to export employees',
            };
        }

        let data;
        if (format === 'json') {
            data = await response.json();
        } else if (format === 'csv') {
            data = await response.text();
        } else {
            data = await response.blob();
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error exporting employees:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Bulk import employees
export async function bulkImportEmployees(file: File): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/employees/bulk-import', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to import employees',
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error importing employees:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Update employee profile (for employee themselves)
export async function updateMyProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    phoneNumber?: string;
}): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees/my-profile/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update profile'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating profile:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Change employee password
export async function changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to change password'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error changing password:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee dashboard statistics
export async function getEmployeeDashboardStats(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees/dashboard/stats');

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch dashboard statistics'
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Upload employee photo
export async function uploadEmployeePhoto(id: string, file: File): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const formData = new FormData();
        formData.append('photo', file);

        const response = await fetch(`/api/employees/${id}/upload-photo`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to upload photo'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error uploading employee photo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee documents
export async function getEmployeeDocuments(id: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/employees/${id}/documents`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch employee documents'
            };
        }

        const data = await response.json();
        return { success: true, data: data.documents || data || [] };
    } catch (error) {
        console.error('Error fetching employee documents:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get employee notifications
export async function getEmployeeNotifications(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    try {
        const response = await fetch('/api/employees/my-notifications');

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch notifications'
            };
        }

        const data = await response.json();
        return { success: true, data: data.notifications || data || [] };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}
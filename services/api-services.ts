import { API_ENDPOINTS } from '@/lib/api-client-v2';

export class ApiService {
    // Authentication
    static async login(email: string, password: string) {
        const response = await fetch(API_ENDPOINTS.auth.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        return response.json();
    }

    // Products
    static async getProducts(filters?: any) {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_ENDPOINTS.products.list}${queryParams ? `?${queryParams}` : ''}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }

    static async createProduct(productData: any) {
        const response = await fetch(API_ENDPOINTS.products.create, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
            credentials: 'include',
        });
        return response.json();
    }

    // Sales
    static async createSale(saleData: any) {
        const response = await fetch(API_ENDPOINTS.sales.create, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(saleData),
            credentials: 'include',
        });
        return response.json();
    }

    // Employees
    static async getEmployeePerformance(employeeId: string, period: string = 'month') {
        const url = `${API_ENDPOINTS.employees.performance(employeeId)}?period=${period}`;
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',
        });
        return response.json();
    }

    // Convenience methods for UI
    static async searchProducts(term: string, storeId?: string) {
        const filters: any = { search: term };
        if (storeId) filters.storeId = storeId;
        return this.getProducts(filters);
    }

    static async getDashboardData(storeId?: string) {
        // Combine multiple API calls for dashboard
        const [sales, inventory, employees] = await Promise.all([
            fetch(`${API_ENDPOINTS.reports.sales}?storeId=${storeId || ''}`, {
                credentials: 'include',
            }).then(r => r.json()),
            fetch(`${API_ENDPOINTS.reports.inventoryMovement}?storeId=${storeId || ''}`, {
                credentials: 'include',
            }).then(r => r.json()),
            storeId ?
                fetch(API_ENDPOINTS.employees.storeSummary(storeId), {
                    credentials: 'include',
                }).then(r => r.json()) :
                Promise.resolve(null),
        ]);

        return { sales, inventory, employees };
    }
}
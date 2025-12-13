import axios, { AxiosInstance } from 'axios';

const API_PREFIX = '/api';

// Define API endpoints with TypeScript
export const API_ENDPOINTS = {
    // Authentication
    auth: {
        login: `${API_PREFIX}/v1/auth/login`,
        register: `${API_PREFIX}/v1/auth/register`,
        logout: `${API_PREFIX}/v1/auth/logout`,
        refresh: `${API_PREFIX}/v1/auth/refresh`,
        profile: `${API_PREFIX}/v1/auth/profile`,
        changePassword: `${API_PREFIX}/v1/auth/password/change`,
        resetPassword: `${API_PREFIX}/v1/auth/password/reset`,
        requestPasswordReset: `${API_PREFIX}/v1/auth/password/reset-request`,
    },

    // Users
    users: {
        list: `${API_PREFIX}/v1/users`,
        get: (id: string) => `${API_PREFIX}/v1/users/${id}`,
        update: (id: string) => `${API_PREFIX}/v1/users/${id}`,
        deactivate: (id: string) => `${API_PREFIX}/v1/users/${id}/deactivate`,
        reactivate: (id: string) => `${API_PREFIX}/v1/users/${id}/reactivate`,
    },

    // Employees
    employees: {
        list: `${API_PREFIX}/v1/employees`,
        get: (id: string) => `${API_PREFIX}/v1/employees/${id}`,
        update: (id: string) => `${API_PREFIX}/v1/employees/${id}`,
        transfer: (id: string) => `${API_PREFIX}/v1/employees/${id}/transfer`,
        performance: (id: string) => `${API_PREFIX}/v1/employees/${id}/performance`,
        storeSummary: (storeId: string) =>
            `${API_PREFIX}/v1/employees/store/${storeId}/summary`,
    },

    // Stores
    stores: {
        list: `${API_PREFIX}/v1/stores`,
        publicList: `${API_PREFIX}/v1/stores/public`,
        get: (id: string) => `${API_PREFIX}/v1/stores/${id}`,
        update: (id: string) => `${API_PREFIX}/v1/stores/${id}`,
        setMain: (id: string) => `${API_PREFIX}/v1/stores/${id}/set-main`,
        inventorySummary: (id: string) =>
            `${API_PREFIX}/v1/stores/${id}/inventory-summary`,
        performance: (id: string) => `${API_PREFIX}/v1/stores/${id}/performance`,
        mainStore: `${API_PREFIX}/v1/stores/main/store`,
    },

    // Products
    products: {
        list: `${API_PREFIX}/v1/products`,
        publicCatalog: `${API_PREFIX}/v1/products/public/catalog`,
        publicAttributes: `${API_PREFIX}/v1/products/public/attributes`,
        get: (id: string) => `${API_PREFIX}/v1/products/${id}`,
        create: `${API_PREFIX}/v1/products`,
        update: (id: string) => `${API_PREFIX}/v1/products/${id}`,
        assignStores: (id: string) => `${API_PREFIX}/v1/products/${id}/assign-stores`,
        removeFromStore: (productId: string, storeId: string) =>
            `${API_PREFIX}/v1/products/${productId}/stores/${storeId}`,
        lowStockReport: `${API_PREFIX}/v1/products/reports/low-stock`,
    },

    // Sales
    sales: {
        list: `${API_PREFIX}/v1/sales`,
        create: `${API_PREFIX}/v1/sales`,
        get: (id: string) => `${API_PREFIX}/v1/sales/${id}`,
        processReturn: (id: string) => `${API_PREFIX}/v1/sales/${id}/return`,
        voidSale: (id: string) => `${API_PREFIX}/v1/sales/${id}/void`,
        statistics: (period: string) =>
            `${API_PREFIX}/v1/sales/reports/statistics/${period}`,
    },

    // Inventory
    inventory: {
        allocate: `${API_PREFIX}/v1/inventory/allocate`,
        reserve: `${API_PREFIX}/v1/inventory/reserve`,
        adjust: (id: string) => `${API_PREFIX}/v1/inventory/${id}/adjust`,
        availability: (productId: string) =>
            `${API_PREFIX}/v1/inventory/availability/${productId}`,
        productAcrossStores: (productId: string) =>
            `${API_PREFIX}/v1/inventory/product/${productId}/across-stores`,
    },

    // Transfers
    transfers: {
        list: `${API_PREFIX}/v1/transfers`,
        create: `${API_PREFIX}/v1/transfers`,
        get: (id: string) => `${API_PREFIX}/v1/transfers/${id}`,
        complete: (id: string) => `${API_PREFIX}/v1/transfers/${id}/complete`,
        cancel: (id: string) => `${API_PREFIX}/v1/transfers/${id}/cancel`,
        storePending: (storeId: string) =>
            `${API_PREFIX}/v1/transfers/store/${storeId}/pending`,
    },

    // Reports
    reports: {
        sales: `${API_PREFIX}/v1/reports/sales`,
        inventoryMovement: `${API_PREFIX}/v1/reports/inventory/movement`,
        employeePerformance: `${API_PREFIX}/v1/reports/employees/performance`,
        storePerformance: (storeId: string) =>
            `${API_PREFIX}/v1/reports/stores/performance/${storeId}`,
        storeInventorySummary: (storeId: string) =>
            `${API_PREFIX}/v1/reports/stores/inventory-summary/${storeId}`,
    },

    // Status
    status: `${API_PREFIX}/status`,
} as const;

// Create axios instance with defaults
const apiClient: AxiosInstance = axios.create({
    baseURL: '',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        // const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;
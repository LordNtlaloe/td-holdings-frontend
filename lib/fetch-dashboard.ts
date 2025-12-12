// /lib/fetch-dashboard.ts

export async function fetchDashboardData(endpoint: string) {
    try {
        // Get token from storage
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

        console.log('🔍 [fetchDashboardData] Debug:', {
            endpoint,
            hasToken: !!token,
            tokenLength: token?.length,
            localStorageKeys: Object.keys(localStorage)
        });

        if (!token) {
            console.error('❌ No token found in localStorage');
            throw new Error('No authentication token found. Please log in again.');
        }

        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('🔍 [fetchDashboardData] Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ [fetchDashboardData] API Error:', {
                status: response.status,
                data,
                endpoint
            });

            // Handle specific error cases
            if (response.status === 401) {
                console.warn('⚠️ Token expired or invalid - clearing storage');
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                throw new Error('Session expired. Please log in again.');
            }
            throw new Error(data.error || `Failed to fetch data: ${response.statusText}`);
        }

        console.log('✅ [fetchDashboardData] Success:', {
            endpoint,
            hasData: !!data,
            success: data.success
        });

        return data;
    } catch (error) {
        console.error(`❌ [fetchDashboardData] Error fetching ${endpoint}:`, error);
        throw error;
    }
}

// Convenience functions for specific dashboard endpoints
export const dashboardAPI = {
    getStats: () => fetchDashboardData('/api/dashboard/stats'),
    getStockByStore: () => fetchDashboardData('/api/dashboard/stock-by-store'),
    getSalesByStore: () => fetchDashboardData('/api/dashboard/sales-by-store'),
    getSalesGrowth: () => fetchDashboardData('/api/dashboard/sales-growth'),
    getTopProducts: () => fetchDashboardData('/api/dashboard/top-products'),
    getDeadStock: () => fetchDashboardData('/api/dashboard/dead-stock'),
};
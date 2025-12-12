// lib/api/activities.ts
export interface Activity {
    id: string;
    store: string;
    storeId?: string;
    action: string;
    actor: string;
    actorId?: string;
    timestamp: string;
    type: 'STORE' | 'EMPLOYEE' | 'PRODUCT' | 'SALE';
    details?: Record<string, any>;
}

export async function getRecentActivities(limit = 10, type = 'all'): Promise<Activity[]> {
    try {
        const response = await fetch(`/api/activities?limit=${limit}&type=${type}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch activities');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching activities:', error);

        // Return empty array instead of throwing to prevent UI crashes
        return [];
    }
}

export async function getStoreActivities(storeId: string, limit = 10): Promise<Activity[]> {
    try {
        const response = await fetch(`/api/stores/${storeId}/activities?limit=${limit}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch store activities');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching store activities:', error);
        return [];
    }
}
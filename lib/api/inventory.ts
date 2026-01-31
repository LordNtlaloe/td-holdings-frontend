// inventory-api.ts
import {
    Inventory,
    InventoryFilters,
    PaginatedInventoryResponse,
    InventorySummary,
    InventoryHistory,
    InventoryHistoryFilters,
    StoreInventory,
    StoreInventoryFilters,
    InventoryChangeType,
    AdjustInventoryFormValues,
    SetInventoryLevelsFormValues,
    ProductType,
    ProductGrade
} from '@/types';

const API_BASE = '/api';

class InventoryAPI {
    private static async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            console.log(`🟦 InventoryAPI: Fetching ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            console.log(`🟦 InventoryAPI: Response status ${response.status} for ${url}`);

            // Try to get response text first for debugging
            const responseText = await response.text();
            console.log(`🟦 InventoryAPI: Response text for ${url}:`, responseText.substring(0, 200));

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch (e) {
                    console.error('🟦 InventoryAPI: Failed to parse error response:', e);
                }

                throw new Error(
                    `HTTP ${response.status}: ${errorData || errorData || response.statusText || 'API request failed'}`
                );
            }

            // Parse the successful response
            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('🟦 InventoryAPI: Failed to parse response:', parseError);
                throw new Error('Invalid JSON response from server');
            }

            // Handle consistent response format { success, data, error }
            if (result.success === false) {
                throw new Error(result.error || 'API request failed');
            }

            // Check if response has nested data property
            if (result.data !== undefined) {
                return result.data;
            }

            return result;
        } catch (error: any) {
            console.error('🔴 InventoryAPI Error:', error.message, 'for endpoint:', endpoint);

            // Rethrow with more context
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error(`Network error: Unable to connect to server. Please check if backend is running.`);
            }

            throw error;
        }
    }

    // ============ INVENTORY CRUD OPERATIONS ============

    // In your inventory.ts file, update these methods:

    /**
     * Get all inventory across all stores
     */
    static async getAllInventory(
        token: string,
        params?: InventoryFilters
    ): Promise<PaginatedInventoryResponse> {
        const query = new URLSearchParams();

        if (params?.productId) query.append('productId', params.productId);
        if (params?.productName) query.append('productName', params.productName);
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.storeName) query.append('storeName', params.storeName);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.lowStock !== undefined) query.append('lowStock', params.lowStock.toString());
        if (params?.outOfStock !== undefined) query.append('outOfStock', params.outOfStock.toString());
        if (params?.hasReorderLevel !== undefined) query.append('hasReorderLevel', params.hasReorderLevel.toString());
        if (params?.minQuantity !== undefined) query.append('minQuantity', params.minQuantity.toString());
        if (params?.maxQuantity !== undefined) query.append('maxQuantity', params.maxQuantity.toString());
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();

        // Update this line to use /inventory instead of direct backend URL
        return this.fetchAPI(`/inventory${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    /**
     * Get inventory summary
     */
    static async getGlobalInventorySummary(token: string): Promise<any> {
        // Update this line to use /inventory/summary
        return this.fetchAPI('/inventory/summary', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    /**
     * Get inventory for a specific store
     */
    static async getStoreInventory(
        token: string,
        storeId: string,
        params?: StoreInventoryFilters
    ): Promise<StoreInventory> {
        const query = new URLSearchParams();

        if (params?.productId) query.append('productId', params.productId);
        if (params?.productName) query.append('productName', params.productName);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.lowStock !== undefined) query.append('lowStock', params.lowStock.toString());
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        return this.fetchAPI(`/stores/${storeId}/inventory${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    /**
     * Adjust inventory quantity
     */
    static async adjustInventory(
        token: string,
        data: AdjustInventoryFormValues
    ): Promise<Inventory> {
        return this.fetchAPI('/inventory/adjust', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Set inventory levels (reorder level, optimal level, store price)
     */
    static async setInventoryLevels(
        token: string,
        data: SetInventoryLevelsFormValues
    ): Promise<Inventory> {
        return this.fetchAPI('/inventory/levels', {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    /**
     * Get inventory history
     */
    static async getInventoryHistory(
        token: string,
        params?: InventoryHistoryFilters
    ): Promise<{
        history: InventoryHistory[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();

        if (params?.productId) query.append('productId', params.productId);
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.changeType) query.append('changeType', params.changeType);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        return this.fetchAPI(`/inventory/history${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    /**
     * Get inventory summary
     */


    /**
     * Get low stock products report
     */
    static async getLowStockProducts(
        token: string,
        threshold: number = 10
    ): Promise<any[]> {  // Adjust type based on your actual return type
        const query = new URLSearchParams();
        query.append('threshold', threshold.toString());

        return this.fetchAPI(`/products/reports/low-stock?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ UTILITY & HELPER METHODS ============

    /**
     * Format currency
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Get stock status color and text
     */
    static getStockStatusInfo(quantity: number, reorderLevel?: number): {
        status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
        color: string;
        label: string;
        badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
    } {
        if (quantity <= 0) {
            return {
                status: 'OUT_OF_STOCK',
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                label: 'Out of Stock',
                badgeVariant: 'destructive'
            };
        }

        if (reorderLevel && quantity <= reorderLevel) {
            return {
                status: 'LOW_STOCK',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
                label: 'Low Stock',
                badgeVariant: 'outline'
            };
        }

        return {
            status: 'IN_STOCK',
            color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            label: 'In Stock',
            badgeVariant: 'default'
        };
    }

    /**
     * Get inventory change type label and color
     */
    static getChangeTypeInfo(changeType: InventoryChangeType): {
        label: string;
        color: string;
        icon: string;
        badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
    } {
        switch (changeType) {
            case 'PURCHASE':
                return {
                    label: 'Purchase',
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                    icon: '📦',
                    badgeVariant: 'default'
                };
            case 'SALE':
                return {
                    label: 'Sale',
                    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                    icon: '💰',
                    badgeVariant: 'default'
                };
            case 'TRANSFER_IN':
                return {
                    label: 'Transfer In',
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
                    icon: '⬇️',
                    badgeVariant: 'outline'
                };
            case 'TRANSFER_OUT':
                return {
                    label: 'Transfer Out',
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
                    icon: '⬆️',
                    badgeVariant: 'outline'
                };
            case 'ADJUSTMENT':
                return {
                    label: 'Adjustment',
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
                    icon: '⚙️',
                    badgeVariant: 'secondary'
                };
            case 'RETURN':
                return {
                    label: 'Return',
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
                    icon: '↩️',
                    badgeVariant: 'outline'
                };
            case 'DAMAGE':
                return {
                    label: 'Damage',
                    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                    icon: '⚠️',
                    badgeVariant: 'destructive'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
                    icon: '❓',
                    badgeVariant: 'secondary'
                };
        }
    }

    /**
     * Calculate inventory value
     */
    static calculateInventoryValue(quantity: number, price?: number): number {
        return quantity * (price || 0);
    }

    /**
     * Format inventory value
     */
    static formatInventoryValue(quantity: number, price?: number): string {
        const value = this.calculateInventoryValue(quantity, price);
        return this.formatCurrency(value);
    }

    /**
     * Validate inventory adjustment data
     */
    static validateAdjustmentData(data: AdjustInventoryFormValues): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!data.productId) {
            errors.push('Product is required');
        }

        if (!data.storeId) {
            errors.push('Store is required');
        }

        if (!data.quantity || data.quantity === 0) {
            errors.push('Quantity cannot be 0');
        }

        if (!data.changeType) {
            errors.push('Change type is required');
        }

        // Quantity validation
        if (data.quantity < -10000 || data.quantity > 10000) {
            errors.push('Quantity must be between -10,000 and 10,000');
        }

        // Warnings for large adjustments
        if (Math.abs(data.quantity) > 1000) {
            warnings.push('Large quantity adjustment detected');
        }

        // Warnings for negative adjustments (removing stock)
        if (data.quantity < 0 && data.changeType !== 'SALE' && data.changeType !== 'TRANSFER_OUT') {
            warnings.push('Negative quantity for non-sale/transfer operations');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate inventory levels data
     */
    static validateLevelsData(data: SetInventoryLevelsFormValues): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        // Required fields
        if (!data.productId) {
            errors.push('Product is required');
        }

        if (!data.storeId) {
            errors.push('Store is required');
        }

        // Numeric validation
        if (data.reorderLevel !== undefined && data.reorderLevel < 0) {
            errors.push('Reorder level cannot be negative');
        }

        if (data.optimalLevel !== undefined && data.optimalLevel < 0) {
            errors.push('Optimal level cannot be negative');
        }

        if (data.storePrice !== undefined && data.storePrice < 0) {
            errors.push('Store price cannot be negative');
        }

        // Business logic validation
        if (data.reorderLevel !== undefined && data.optimalLevel !== undefined) {
            if (data.reorderLevel >= data.optimalLevel) {
                errors.push('Reorder level must be less than optimal level');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Get appropriate change type based on quantity
     */
    static getSuggestedChangeType(quantity: number): InventoryChangeType {
        if (quantity > 0) {
            return InventoryChangeType.PURCHASE;
        } else if (quantity < 0) {
            return InventoryChangeType.ADJUSTMENT;
        }
        return InventoryChangeType.ADJUSTMENT;
    }

    /**
     * Calculate days of supply
     */
    static calculateDaysOfSupply(
        currentQuantity: number,
        dailySalesRate: number
    ): number {
        if (dailySalesRate <= 0) return Infinity;
        return Math.floor(currentQuantity / dailySalesRate);
    }

    /**
     * Get days of supply status
     */
    static getDaysOfSupplyStatus(daysOfSupply: number): {
        status: 'CRITICAL' | 'LOW' | 'NORMAL' | 'HIGH';
        color: string;
        label: string;
    } {
        if (daysOfSupply <= 7) {
            return {
                status: 'CRITICAL',
                color: 'bg-red-100 text-red-800',
                label: 'Critical (< 7 days)'
            };
        } else if (daysOfSupply <= 14) {
            return {
                status: 'LOW',
                color: 'bg-yellow-100 text-yellow-800',
                label: 'Low (7-14 days)'
            };
        } else if (daysOfSupply <= 30) {
            return {
                status: 'NORMAL',
                color: 'bg-green-100 text-green-800',
                label: 'Normal (14-30 days)'
            };
        } else {
            return {
                status: 'HIGH',
                color: 'bg-blue-100 text-blue-800',
                label: 'High (> 30 days)'
            };
        }
    }

    /**
     * Calculate reorder quantity
     */
    static calculateReorderQuantity(
        optimalLevel: number,
        currentQuantity: number,
        leadTimeDays: number = 7,
        dailySalesRate: number = 0
    ): number {
        const leadTimeDemand = dailySalesRate * leadTimeDays;
        const safetyStock = leadTimeDemand * 0.5; // 50% of lead time demand as safety stock
        const reorderPoint = leadTimeDemand + safetyStock;

        if (currentQuantity <= reorderPoint) {
            return Math.max(optimalLevel - currentQuantity, 0);
        }

        return 0;
    }

    /**
     * Get inventory aging categories
     */
    static getInventoryAging(currentQuantity: number, monthlyTurnoverRate: number): {
        category: 'FAST_MOVING' | 'SLOW_MOVING' | 'NON_MOVING';
        color: string;
        label: string;
    } {
        if (monthlyTurnoverRate > 3) {
            return {
                category: 'FAST_MOVING',
                color: 'bg-green-100 text-green-800',
                label: 'Fast Moving'
            };
        } else if (monthlyTurnoverRate > 0.5) {
            return {
                category: 'SLOW_MOVING',
                color: 'bg-yellow-100 text-yellow-800',
                label: 'Slow Moving'
            };
        } else {
            return {
                category: 'NON_MOVING',
                color: 'bg-red-100 text-red-800',
                label: 'Non Moving'
            };
        }
    }

    /**
     * Generate inventory report data
     */
    static generateInventoryReport(
        inventory: any[],
        includeFinancials: boolean = true
    ): {
        summary: any;
        categories: any[];
        stores: any[];
        financials?: any;
    } {
        const summary = {
            totalItems: inventory.length,
            totalQuantity: inventory.reduce((sum, item) => sum + item.quantity, 0),
            totalValue: 0,
            lowStockItems: 0,
            outOfStockItems: 0
        };

        const categories: Record<string, any> = {};
        const stores: Record<string, any> = {};

        inventory.forEach(item => {
            // Calculate value
            const value = item.quantity * (item.storePrice || item.product.basePrice || 0);
            summary.totalValue += value;

            // Track low/out of stock
            if (item.quantity === 0) {
                summary.outOfStockItems++;
            } else if (item.quantity <= (item.reorderLevel || 10)) {
                summary.lowStockItems++;
            }

            // Group by product type
            const type = item.product?.type || 'Unknown';
            if (!categories[type]) {
                categories[type] = {
                    type,
                    count: 0,
                    quantity: 0,
                    value: 0
                };
            }
            categories[type].count++;
            categories[type].quantity += item.quantity;
            categories[type].value += value;

            // Group by store
            const storeName = item.store?.name || 'Unknown';
            if (!stores[storeName]) {
                stores[storeName] = {
                    storeName,
                    count: 0,
                    quantity: 0,
                    value: 0
                };
            }
            stores[storeName].count++;
            stores[storeName].quantity += item.quantity;
            stores[storeName].value += value;
        });

        const report = {
            summary,
            categories: Object.values(categories),
            stores: Object.values(stores)
        };

        if (includeFinancials) {
            (report as any).financials = {
                averageValuePerItem: summary.totalValue / (summary.totalItems || 1),
                inventoryTurnoverRatio: 0, // Would need sales data to calculate
                daysInventoryOutstanding: 0 // Would need sales data to calculate
            };
        }

        return report;
    }

    /**
     * Export inventory data to CSV
     */
    static exportToCSV(
        inventory: any[],
        includeHeaders: boolean = true
    ): string {
        const headers = [
            'Product Name',
            'Product Type',
            'Product Grade',
            'Store Name',
            'Quantity',
            'Reorder Level',
            'Optimal Level',
            'Store Price',
            'Total Value',
            'Stock Status'
        ];

        const rows = inventory.map(item => {
            const value = item.quantity * (item.storePrice || item.product.basePrice || 0);
            const stockStatus = this.getStockStatusInfo(item.quantity, item.reorderLevel).label;

            return [
                `"${item.product?.name || 'N/A'}"`,
                item.product?.type || 'N/A',
                item.product?.grade || 'N/A',
                `"${item.store?.name || 'N/A'}"`,
                item.quantity,
                item.reorderLevel || 'N/A',
                item.optimalLevel || 'N/A',
                item.storePrice || item.product.basePrice || 'N/A',
                value.toFixed(2),
                stockStatus
            ].join(',');
        });

        let csv = '';
        if (includeHeaders) {
            csv += headers.join(',') + '\n';
        }
        csv += rows.join('\n');

        return csv;
    }

    /**
     * Format quantity with unit
     */
    static formatQuantity(quantity: number, productType?: ProductType): string {
        if (productType === 'BALE') {
            return `${quantity} bales`;
        }
        return `${quantity} units`;
    }

    /**
     * Get inventory trend (increasing, decreasing, stable)
     */
    static getInventoryTrend(
        currentQuantity: number,
        previousQuantity: number
    ): {
        trend: 'INCREASING' | 'DECREASING' | 'STABLE';
        percentage: number;
        color: string;
        icon: string;
    } {
        if (previousQuantity === 0) {
            return {
                trend: 'INCREASING',
                percentage: 100,
                color: 'text-green-600',
                icon: '📈'
            };
        }

        const percentage = ((currentQuantity - previousQuantity) / previousQuantity) * 100;

        if (percentage > 10) {
            return {
                trend: 'INCREASING',
                percentage,
                color: 'text-green-600',
                icon: '📈'
            };
        } else if (percentage < -10) {
            return {
                trend: 'DECREASING',
                percentage,
                color: 'text-red-600',
                icon: '📉'
            };
        } else {
            return {
                trend: 'STABLE',
                percentage,
                color: 'text-gray-600',
                icon: '➡️'
            };
        }
    }

    /**
     * Check if inventory needs reorder
     */
    static needsReorder(
        currentQuantity: number,
        reorderLevel?: number
    ): {
        needsReorder: boolean;
        urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
        message: string;
    } {
        if (!reorderLevel) {
            return {
                needsReorder: false,
                urgency: 'NONE',
                message: 'Reorder level not set'
            };
        }

        if (currentQuantity === 0) {
            return {
                needsReorder: true,
                urgency: 'CRITICAL',
                message: 'Out of stock - immediate reorder needed'
            };
        }

        const percentage = (currentQuantity / reorderLevel) * 100;

        if (percentage <= 25) {
            return {
                needsReorder: true,
                urgency: 'CRITICAL',
                message: 'Critical low stock - reorder immediately'
            };
        } else if (percentage <= 50) {
            return {
                needsReorder: true,
                urgency: 'HIGH',
                message: 'High priority reorder needed'
            };
        } else if (percentage <= 75) {
            return {
                needsReorder: true,
                urgency: 'MEDIUM',
                message: 'Consider reordering soon'
            };
        } else if (percentage <= 100) {
            return {
                needsReorder: true,
                urgency: 'LOW',
                message: 'Reorder point approaching'
            };
        } else {
            return {
                needsReorder: false,
                urgency: 'NONE',
                message: 'Sufficient stock available'
            };
        }
    }

    /**
     * Get optimal reorder date
     */
    static getOptimalReorderDate(
        currentQuantity: number,
        dailySalesRate: number,
        leadTimeDays: number = 7
    ): Date | null {
        if (dailySalesRate <= 0) return null;

        const daysUntilReorder = Math.floor(currentQuantity / dailySalesRate) - leadTimeDays;

        if (daysUntilReorder <= 0) {
            return new Date(); // Reorder now
        }

        const reorderDate = new Date();
        reorderDate.setDate(reorderDate.getDate() + daysUntilReorder);
        return reorderDate;
    }

    /**
     * Calculate inventory carrying cost
     */
    static calculateCarryingCost(
        averageInventoryValue: number,
        carryingCostRate: number = 0.25 // 25% typical carrying cost
    ): number {
        return averageInventoryValue * carryingCostRate;
    }
}

export default InventoryAPI;
import { InventoryChangeType, TransferStatus, ProductType } from "@/types";
import { AdjustInventoryFormValues, CancelProductTransferFormValues, CompleteProductTransferFormValues, CreateProductTransferFormValues, Inventory, InventoryFilters, InventoryHistory, InventoryHistoryFilters, InventorySummary, LowStockProduct, PaginatedInventoryResponse, ProductTransfer, ProductTransferFilters, SetInventoryLevelsFormValues, StockReceipt, StockReceiptFormValues, StoreInventoryFilters, StoreInventoryResponse } from "@/types/inventory";

const API_BASE = '/api';

class InventoryAPI {
    private static async fetchAPI<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            console.log(`🟦 InventoryAPI: Fetching ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers,
                },
            });

            console.log(`🟦 InventoryAPI: Response status ${response.status} for ${url}`);

            const responseText = await response.text();
            console.log(`🟦 InventoryAPI: Response text:`, responseText.substring(0, 200));

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                }

                throw new Error(
                    (errorData as any)?.message ||
                    (errorData as any)?.error ||
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Invalid JSON response from server');
            }

            // Handle consistent response format { success, data, error }
            if (result.success === false) {
                throw new Error(result.error || 'API request failed');
            }

            // Return data if nested, otherwise return whole result
            return result.data !== undefined ? result.data : result;
        } catch (error: any) {
            console.error('🔴 InventoryAPI Error:', error.message, 'for endpoint:', endpoint);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error('Network error: Unable to connect to server');
            }

            throw error;
        }
    }

    // ============ INVENTORY CRUD OPERATIONS ============

    /**
     * Get all inventory across all stores
     * GET /api/inventory
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
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/inventory${queryString ? `?${queryString}` : ''}`,
            token,
            { cache: 'no-store' }
        );

        // Handle different response formats
        return {
            inventory: response.inventory || response.data || [],
            total: response.total || 0,
            page: response.page || params?.page || 1,
            totalPages: response.totalPages || 1,
            summary: response.summary || {
                totalProducts: 0,
                totalQuantity: 0,
                totalValue: 0,
                lowStockItems: 0,
                outOfStockItems: 0
            }
        };
    }

    /**
     * Get inventory summary
     * GET /api/inventory/summary
     */
    static async getGlobalInventorySummary(token: string): Promise<InventorySummary> {
        const response = await this.fetchAPI<any>('/inventory/summary', token, {
            cache: 'no-store'
        });

        return response.summary || response;
    }

    /**
     * Get inventory for a specific store
     * GET /api/stores/:storeId/inventory
     */
    static async getStoreInventory(
        token: string,
        storeId: string,
        params?: StoreInventoryFilters
    ): Promise<StoreInventoryResponse> {
        const query = new URLSearchParams();

        if (params?.productId) query.append('productId', params.productId);
        if (params?.productName) query.append('productName', params.productName);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.lowStock !== undefined) query.append('lowStock', params.lowStock.toString());
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/stores/${storeId}/inventory${queryString ? `?${queryString}` : ''}`,
            token,
            { cache: 'no-store' }
        );

        return {
            inventory: response.inventory || response.data || [],
            total: response.total || 0,
            page: response.page || params?.page || 1,
            totalPages: response.totalPages || 1,
            store: response.store
        };
    }

    /**
     * Adjust inventory quantity
     * POST /api/inventory/adjust
     */
    static async adjustInventory(
        token: string,
        data: AdjustInventoryFormValues
    ): Promise<Inventory> {
        const response = await this.fetchAPI<any>('/inventory/adjust', token, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response.inventory || response;
    }

    /**
     * Set inventory levels (reorder level, optimal level, store price)
     * PUT /api/inventory/levels
     */
    static async setInventoryLevels(
        token: string,
        data: SetInventoryLevelsFormValues
    ): Promise<Inventory> {
        const response = await this.fetchAPI<any>('/inventory/levels', token, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        return response.inventory || response;
    }

    /**
     * Get inventory history
     * GET /api/inventory/history
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
        const response = await this.fetchAPI<any>(
            `/inventory/history${queryString ? `?${queryString}` : ''}`,
            token,
            { cache: 'no-store' }
        );

        return {
            history: response.history || response.data || [],
            total: response.total || 0,
            page: response.page || params?.page || 1,
            totalPages: response.totalPages || 1
        };
    }

    // ============ PRODUCT TRANSFERS ============

    /**
     * Get all product transfers
     * GET /api/inventory/transfers
     */
    static async getProductTransfers(
        token: string,
        params?: ProductTransferFilters
    ): Promise<{
        transfers: ProductTransfer[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('search', params.search || '');
        if (params?.productId) query.append('productId', params.productId);
        if (params?.fromStoreId) query.append('fromStoreId', params.fromStoreId);
        if (params?.toStoreId) query.append('toStoreId', params.toStoreId);
        if (params?.status) query.append('status', params.status);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/inventory/transfers${queryString ? `?${queryString}` : ''}`,
            token,
            { cache: 'no-store' }
        );

        return {
            transfers: response.transfers || response.data || [],
            total: response.total || 0,
            page: response.page || params?.page || 1,
            totalPages: response.totalPages || 1
        };
    }

    /**
     * Create a product transfer
     * POST /api/inventory/transfers
     */
    static async createProductTransfer(
        token: string,
        data: CreateProductTransferFormValues
    ): Promise<ProductTransfer> {
        const response = await this.fetchAPI<any>('/inventory/transfers', token, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response.transfer || response;
    }

    /**
     * Get transfer by ID
     * GET /api/inventory/transfers/:transferId
     */
    static async getProductTransferById(
        token: string,
        transferId: string
    ): Promise<ProductTransfer> {
        const response = await this.fetchAPI<any>(`/inventory/transfers/${transferId}`, token, {
            cache: 'no-store'
        });

        return response.transfer || response;
    }

    /**
     * Complete a transfer
     * PUT /api/inventory/transfers/:transferId/complete
     */
    static async completeProductTransfer(
        token: string,
        transferId: string,
        data: CompleteProductTransferFormValues
    ): Promise<ProductTransfer> {
        const response = await this.fetchAPI<any>(
            `/inventory/transfers/${transferId}/complete`,
            token,
            {
                method: 'PUT',
                body: JSON.stringify(data)
            }
        );

        return response.transfer || response;
    }

    /**
     * Cancel a transfer
     * PUT /api/inventory/transfers/:transferId/cancel
     */
    static async cancelProductTransfer(
        token: string,
        transferId: string,
        data: CancelProductTransferFormValues
    ): Promise<ProductTransfer> {
        const response = await this.fetchAPI<any>(
            `/inventory/transfers/${transferId}/cancel`,
            token,
            {
                method: 'PUT',
                body: JSON.stringify(data)
            }
        );

        return response.transfer || response;
    }

    // ============ STOCK RECEIPTS ============

    /**
     * Create a stock receipt
     * POST /api/inventory/receipts
     */
    static async createStockReceipt(
        token: string,
        data: StockReceiptFormValues
    ): Promise<StockReceipt> {
        const response = await this.fetchAPI<any>('/inventory/receipts', token, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response.receipt || response;
    }

    /**
     * Get stock receipts
     * GET /api/inventory/receipts
     */
    static async getStockReceipts(
        token: string,
        params?: {
            page?: number;
            limit?: number;
            productId?: string;
            supplier?: string;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<{
        receipts: StockReceipt[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.productId) query.append('productId', params.productId);
        if (params?.supplier) query.append('supplier', params.supplier);
        if (params?.startDate) query.append('startDate', params.startDate.toISOString());
        if (params?.endDate) query.append('endDate', params.endDate.toISOString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/inventory/receipts${queryString ? `?${queryString}` : ''}`,
            token,
            { cache: 'no-store' }
        );

        return {
            receipts: response.receipts || response.data || [],
            total: response.total || 0,
            page: response.page || params?.page || 1,
            totalPages: response.totalPages || 1
        };
    }

    // ============ LOW STOCK ============

    /**
     * Get low stock products
     * GET /api/inventory/low-stock
     */
    static async getLowStockProducts(
        token: string,
        threshold: number = 10
    ): Promise<LowStockProduct[]> {
        const query = new URLSearchParams();
        query.append('threshold', threshold.toString());

        const response = await this.fetchAPI<any>(
            `/inventory/low-stock?${query.toString()}`,
            token,
            { cache: 'no-store' }
        );

        return response.lowStock || response.data || [];
    }

    // ============ UTILITY & HELPER METHODS ============

    /**
     * Format currency
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LSL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Get stock status info
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
     * Get change type info
     */
    static getChangeTypeInfo(changeType: InventoryChangeType): {
        label: string;
        color: string;
        icon: string;
        badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive'
    } {
        const types: Record<InventoryChangeType, { label: string; color: string; icon: string; badgeVariant: any }> = {
            STOCK_RECEIVED: {
                label: 'Stock Received',
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                icon: '📦',
                badgeVariant: 'default'
            },
            SALE: {
                label: 'Sale',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                icon: '💰',
                badgeVariant: 'default'
            },
            TRANSFER_OUT: {
                label: 'Transfer Out',
                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
                icon: '⬆️',
                badgeVariant: 'outline'
            },
            TRANSFER_IN: {
                label: 'Transfer In',
                color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
                icon: '⬇️',
                badgeVariant: 'outline'
            },
            ADJUSTMENT: {
                label: 'Adjustment',
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
                icon: '⚙️',
                badgeVariant: 'secondary'
            },
            RETURN: {
                label: 'Return',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
                icon: '↩️',
                badgeVariant: 'outline'
            },
            DAMAGE: {
                label: 'Damage',
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                icon: '⚠️',
                badgeVariant: 'destructive'
            },
            INITIAL_SETUP: {
                label: 'Initial Setup',
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
                icon: '🚀',
                badgeVariant: 'secondary'
            }
        };

        return types[changeType] || {
            label: 'Unknown',
            color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
            icon: '❓',
            badgeVariant: 'secondary'
        };
    }

    /**
     * Get transfer status info
     */
    static getTransferStatusInfo(status: TransferStatus): {
        label: string;
        color: string;
        badgeVariant: 'default' | 'secondary' | 'outline' | 'destructive';
    } {
        const statuses: Record<TransferStatus, { label: string; color: string; badgeVariant: any }> = {
            PENDING: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
                badgeVariant: 'outline'
            },
            IN_TRANSIT: {
                label: 'In Transit',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                badgeVariant: 'default'
            },
            COMPLETED: {
                label: 'Completed',
                color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
                badgeVariant: 'default'
            },
            CANCELLED: {
                label: 'Cancelled',
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                badgeVariant: 'destructive'
            },
            REJECTED: {
                label: 'Rejected',
                color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
                badgeVariant: 'destructive'
            }
        };

        return statuses[status];
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
     * Validate adjustment data
     */
    static validateAdjustmentData(data: AdjustInventoryFormValues): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!data.productId) errors.push('Product is required');
        if (!data.storeId) errors.push('Store is required');
        if (!data.quantity || data.quantity === 0) errors.push('Quantity cannot be 0');
        if (!data.changeType) errors.push('Change type is required');

        if (data.quantity < -10000 || data.quantity > 10000) {
            errors.push('Quantity must be between -10,000 and 10,000');
        }

        if (Math.abs(data.quantity) > 1000) {
            warnings.push('Large quantity adjustment detected');
        }

        if (data.quantity < 0 && !['SALE', 'TRANSFER_OUT', 'DAMAGE'].includes(data.changeType)) {
            warnings.push('Negative quantity for non-sale/transfer/damage operations');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validate levels data
     */
    static validateLevelsData(data: SetInventoryLevelsFormValues): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        if (!data.productId) errors.push('Product is required');
        if (!data.storeId) errors.push('Store is required');

        if (data.reorderLevel !== undefined && data.reorderLevel < 0) {
            errors.push('Reorder level cannot be negative');
        }

        if (data.optimalLevel !== undefined && data.optimalLevel < 0) {
            errors.push('Optimal level cannot be negative');
        }

        if (data.storePrice !== undefined && data.storePrice < 0) {
            errors.push('Store price cannot be negative');
        }

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
     * Format quantity with unit
     */
    static formatQuantity(quantity: number, productType?: ProductType): string {
        if (productType === ProductType.BALE) {
            return `${quantity} bales`;
        }
        return `${quantity} units`;
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
        const safetyStock = leadTimeDemand * 0.5;
        const reorderPoint = leadTimeDemand + safetyStock;

        if (currentQuantity <= reorderPoint) {
            return Math.max(optimalLevel - currentQuantity, 0);
        }

        return 0;
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
            return new Date();
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
        carryingCostRate: number = 0.25
    ): number {
        return averageInventoryValue * carryingCostRate;
    }

    /**
     * Get inventory trend
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
     * Generate inventory report
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
            const value = item.quantity * (item.storePrice || item.product?.basePrice || 0);
            summary.totalValue += value;

            if (item.quantity === 0) {
                summary.outOfStockItems++;
            } else if (item.quantity <= (item.reorderLevel || 10)) {
                summary.lowStockItems++;
            }

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
                inventoryTurnoverRatio: 0,
                daysInventoryOutstanding: 0
            };
        }

        return report;
    }

    /**
     * Export to CSV
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
            const value = item.quantity * (item.storePrice || item.product?.basePrice || 0);
            const stockStatus = this.getStockStatusInfo(item.quantity, item.reorderLevel).label;

            return [
                `"${item.product?.name || 'N/A'}"`,
                item.product?.type || 'N/A',
                item.product?.grade || 'N/A',
                `"${item.store?.name || 'N/A'}"`,
                item.quantity,
                item.reorderLevel || 'N/A',
                item.optimalLevel || 'N/A',
                item.storePrice || item.product?.basePrice || 'N/A',
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
    static getSuggestedChangeType = (quantity: number): InventoryChangeType => {
    if (quantity > 0) return InventoryChangeType.STOCK_RECEIVED;
    if (quantity < 0) return InventoryChangeType.ADJUSTMENT;
    return InventoryChangeType.ADJUSTMENT;
};
}

export default InventoryAPI;
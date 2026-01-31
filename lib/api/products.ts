import {
    Product,
    ProductFilters,
    PaginatedProductsResponse,
    ProductCategoryStats,
    ProductPriceStatistics,
    LowStockProduct,
    ProductAttribute,
    CreateProductFormValues,
    UpdateProductFormValues,
    ProductType,
    ProductGrade,
    TireCategory,
    TireUsage,
    Store
} from '@/types';

const API_BASE = '/api';

class ProductAPI {
    private static async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        try {
            const url = `${API_BASE}${endpoint}`;
            console.log(`🟦 ProductAPI: Fetching ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            console.log(`🟦 ProductAPI: Response status ${response.status} for ${url}`);

            const responseText = await response.text();
            console.log(`🟦 ProductAPI: Raw response text:`, responseText.substring(0, 1000));

            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = responseText ? JSON.parse(responseText) : {};
                } catch (e) {
                    console.error('🟦 ProductAPI: Failed to parse error response:', e);
                }

                throw new Error(
                    `HTTP ${response.status}: ${errorData || response.statusText || 'API request failed'}`
                );
            }

            let result;
            try {
                result = responseText ? JSON.parse(responseText) : {};
            } catch (parseError) {
                console.error('🟦 ProductAPI: Failed to parse response:', parseError);
                throw new Error('Invalid JSON response from server');
            }

            return result;

        } catch (error: any) {
            console.error('🔴 ProductAPI Error:', error.message, 'for endpoint:', endpoint);

            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                throw new Error(`Network error: Unable to connect to server. Please check if backend is running.`);
            }

            throw error;
        }
    }

    // ============ PRODUCT CRUD OPERATIONS ============


    static async getProducts(token: string, params?: ProductFilters): Promise<PaginatedProductsResponse> {
        const query = new URLSearchParams();

        // Match backend query parameters
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.sortBy) query.append('sortBy', params.sortBy);
        if (params?.sortOrder) query.append('sortOrder', params.sortOrder);
        if (params?.search) query.append('search', params.search as string);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());

        const queryString = query.toString();
        const response = await this.fetchAPI<PaginatedProductsResponse>(
            `/products${queryString ? `?${queryString}` : ''}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        );

        // FIX: Properly handle different response structures
        // The backend might return data in different formats:
        // 1. Direct array: [product1, product2, ...]
        // 2. Paginated: { data: [...], total: 100, page: 1, ... }
        // 3. Wrapped: { success: true, data: { data: [...], total: 100 } }

        let productsArray: Product[] = [];
        let paginationInfo: any = {};

        // Check if response is already an array
        if (Array.isArray(response)) {
            productsArray = response;
            paginationInfo = {
                total: response.length,
                page: params?.page || 1,
                limit: params?.limit || 50,
                totalPages: 1
            };
        }
        // Check if response has a 'data' property that is an array
        else if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
                productsArray = response.data;
                // Preserve pagination info if it exists
                total: response.total || productsArray.length,
                    paginationInfo = {
                        page: response.page || params?.page || 1,
                        limit: response.limit || params?.limit || 50,
                        totalPages: response.totalPages || Math.ceil((response.total || productsArray.length) / (params?.limit || 50))
                    };
            }
            // Handle nested data structure
            else if (response.data && typeof response.data === 'object' && Array.isArray(response.data)) {
                productsArray = response.data;
                paginationInfo = {
                    total: response.total || productsArray.length,
                    page: response.page || params?.page || 1,
                    limit: response.limit || params?.limit || 50,
                    totalPages: response.totalPages || 1
                };
            }
        }

        // Log for debugging
        console.log('🟦 ProductAPI: Extracted products array length:', productsArray.length);

        // Transform the products to ensure proper inventory format
        const transformedProducts = productsArray.map(product => {
            // Calculate inventory from inventories array if needed
            const inventory = product.inventory || {
                total: product.inventories?.reduce((sum, inv) => sum + inv.quantity, 0) || 0,
                mainStore: product.inventories?.find(inv => inv.store?.isMainStore)?.quantity || 0,
                branches: 0 // Will be calculated below
            };

            // Calculate branches inventory
            const branches = inventory.total - inventory.mainStore;

            return {
                ...product,
                inventory: {
                    ...inventory,
                    branches
                }
            };
        });

        // Return properly structured response
        return {
            data: transformedProducts,
            ...paginationInfo
        } as PaginatedProductsResponse;
    }

    static async getProduct(token: string, productId: string): Promise<Product> {
        return this.fetchAPI(`/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

// SIMPLIFIED ProductAPI.createProduct 
// This works with the FLAT structure from the fixed ProductForm
//
// Replace your existing createProduct method with this one

static async createProduct(token: string, data: CreateProductFormValues): Promise<{
    success: boolean;
    message: string;
    data: {
        product: Product;
        assignedStores: number;
        inventory: {
            mainStore: number;
            branches: number;
            total: number;
        };
    };
}> {
    console.log('🟦 ProductAPI.createProduct called');
    console.log('🟦 Data received:', JSON.stringify(data, null, 2));

    // Data is already in correct flat format from the form!
    // Just need to ensure numbers and clean up undefined values
    
    const requestData: any = {
        name: data.name,
        description: data.description || '',
        basePrice: Number(data.basePrice),
        type: data.type,
        grade: data.grade,
        commodity: data.commodity || null,
        isActive: data.isActive !== false,
        
        // Inventory
        warehouseQuantity: Number(data.warehouseQuantity || 0),
        warehouseReorderLevel: data.warehouseReorderLevel ? Number(data.warehouseReorderLevel) : null,
        warehouseOptimalLevel: data.warehouseOptimalLevel ? Number(data.warehouseOptimalLevel) : null,
        
        // Store assignments
        storeAssignments: (data.storeAssignments || [])
            .filter(sa => sa.isAssigned)
            .map(sa => ({
                storeId: sa.storeId,
                storeName: sa.storeName,
                isMainStore: sa.isMainStore || false,
                isAssigned: true,
                existingQuantity: Number(sa.existingQuantity || 0),
                reorderLevel: sa.reorderLevel ? Number(sa.reorderLevel) : null,
                optimalLevel: sa.optimalLevel ? Number(sa.optimalLevel) : null,
                storePrice: sa.storePrice ? Number(sa.storePrice) : null
            }))
    };

    // Add type-specific fields based on product type
    if (data.type === ProductType.TIRE) {
        console.log('🟦 Adding TIRE fields');
        
        requestData.tireCategory = data.tireCategory || null;
        requestData.tireUsage = data.tireUsage || null;
        requestData.tireSize = data.tireSize || null;
        requestData.loadIndex = data.loadIndex || null;
        requestData.speedRating = data.speedRating || null;
        requestData.warrantyPeriod = data.warrantyPeriod || null;
        
        // Explicitly null for bale fields
        requestData.baleWeight = null;
        requestData.baleCategory = null;
        requestData.originCountry = null;
        requestData.importDate = null;
        
        console.log('🟦 TIRE fields added:', {
            tireCategory: requestData.tireCategory,
            tireUsage: requestData.tireUsage
        });
    } 
    else if (data.type === ProductType.BALE) {
        console.log('🟦 Adding BALE fields');
        console.log('🟦 data.baleWeight from form:', data.baleWeight);
        
        // CRITICAL: Validate baleWeight is present
        if (!data.baleWeight || data.baleWeight <= 0) {
            console.error('🔴 CRITICAL: baleWeight is missing or invalid!');
            console.error('🔴 data.baleWeight:', data.baleWeight);
            throw new Error('Bale weight is required and must be greater than 0 for bale products');
        }
        
        requestData.baleWeight = Number(data.baleWeight);
        requestData.baleCategory = data.baleCategory || null;
        requestData.originCountry = data.originCountry || null;
        requestData.importDate = data.importDate || null;
        
        // Explicitly null for tire fields
        requestData.tireCategory = null;
        requestData.tireUsage = null;
        requestData.tireSize = null;
        requestData.loadIndex = null;
        requestData.speedRating = null;
        requestData.warrantyPeriod = null;
        
        console.log('🟦 BALE fields added:', {
            baleWeight: requestData.baleWeight,
            baleCategory: requestData.baleCategory,
            originCountry: requestData.originCountry
        });
    }

    console.log('🟦 ========================================');
    console.log('🟦 FINAL REQUEST DATA TO BACKEND');
    console.log('🟦 ========================================');
    console.log('🟦 Request body:', JSON.stringify(requestData, null, 2));

    // Final validation before sending
    if (requestData.type === ProductType.BALE && !requestData.baleWeight) {
        console.error('🔴 CRITICAL: baleWeight is still null before API call!');
        throw new Error('Internal error: Bale weight is missing');
    }

    return this.fetchAPI('/products', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    });
}
    static async updateProduct(token: string, productId: string, data: UpdateProductFormValues): Promise<Product> {
        // Transform data to match backend expectations
        const requestData: any = {};

        if (data.name !== undefined) requestData.name = data.name;
        if (data.description !== undefined) requestData.description = data.description;
        if (data.basePrice !== undefined) requestData.basePrice = data.basePrice;
        if (data.type !== undefined) requestData.type = data.type;
        if (data.grade !== undefined) requestData.grade = data.grade;
        if (data.commodity !== undefined) requestData.commodity = data.commodity;
        if (data.originCountry !== undefined) requestData.originCountry = data.originCountry;
        if (data.importDate !== undefined) requestData.importDate = data.importDate;
        if (data.isActive !== undefined) requestData.isActive = data.isActive;

        // Handle type-specific fields
        if (data.tireSpecific?.tireCategory !== undefined) requestData.tireCategory = data.tireSpecific?.tireCategory;
        if (data.tireSpecific?.tireUsage !== undefined) requestData.tireUsage = data.tireSpecific?.tireUsage;
        if (data.tireSpecific?.tireSize !== undefined) requestData.tireSize = data.tireSpecific?.tireSize;
        if (data.tireSpecific?.loadIndex !== undefined) requestData.loadIndex = data.tireSpecific?.loadIndex;
        if (data.tireSpecific?.speedRating !== undefined) requestData.speedRating = data.tireSpecific?.speedRating;
        if (data.tireSpecific?.warrantyPeriod !== undefined) requestData.warrantyPeriod = data.tireSpecific?.warrantyPeriod;

        if (data.baleSpecific?.baleWeight !== undefined) requestData.baleWeight = data.baleSpecific?.baleWeight;
        if (data.baleSpecific?.baleCategory !== undefined) requestData.baleCategory = data.baleSpecific?.baleCategory;

        return this.fetchAPI(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(requestData),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async deleteProduct(
        token: string,
        productId: string
    ): Promise<{ message: string }> {
        return this.fetchAPI(`/products/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ NEW PRODUCT ENDPOINTS ============

    static async getProductsWithInventory(
        token: string,
        params?: {
            page?: number;
            limit?: number;
            search?: string;
            type?: ProductType;
            grade?: ProductGrade;
            minPrice?: number;
            maxPrice?: number;
            minStock?: number;
            maxStock?: number;
        }
    ): Promise<any> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('search', params.search);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
        if (params?.minStock !== undefined) query.append('minStock', params.minStock.toString());
        if (params?.maxStock !== undefined) query.append('maxStock', params.maxStock.toString());

        const queryString = query.toString();
        return this.fetchAPI(
            `/products/inventory/summary${queryString ? `?${queryString}` : ''}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        );
    }

    static async getProductsByStore(
        token: string,
        storeId: string,
        params?: {
            page?: number;
            limit?: number;
            search?: string;
        }
    ): Promise<any> {
        const query = new URLSearchParams();

        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('search', params.search || '');

        const queryString = query.toString();
        return this.fetchAPI(
            `/products/store/${storeId}${queryString ? `?${queryString}` : ''}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        );
    }

    // ============ PRODUCT REPORTS & STATISTICS ============

    static async getProductAttributes(): Promise<ProductAttribute> {
        return this.fetchAPI('/products/attributes', {
            cache: 'no-store',
        });
    }

    static async getProductStatistics(
        token: string,
        groupBy: 'type' | 'grade' | 'tireCategory' | 'tireUsage' = 'type'
    ): Promise<{ success: boolean; data: ProductCategoryStats[] }> {
        const query = new URLSearchParams();
        query.append('groupBy', groupBy);

        return this.fetchAPI(`/products/statistics/categories?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getPriceStatistics(token: string): Promise<ProductPriceStatistics> {
        return this.fetchAPI('/products/statistics/prices', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getLowStockProducts(
        token: string,
        threshold: number = 10
    ): Promise<LowStockProduct[]> {
        const query = new URLSearchParams();
        query.append('threshold', threshold.toString());

        return this.fetchAPI(`/products/reports/low-stock?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async searchProducts(
        token: string,
        query: string,
        params?: {
            type?: ProductType;
            grade?: ProductGrade;
            limit?: number;
        }
    ): Promise<Product[]> {
        const searchParams = new URLSearchParams();
        searchParams.append('q', query);

        if (params?.type) searchParams.append('type', params.type);
        if (params?.grade) searchParams.append('grade', params.grade);
        if (params?.limit) searchParams.append('limit', params.limit.toString());

        return this.fetchAPI(`/products/search?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getProductStockAnalysis(
        token: string,
        productId: string,
        period?: string
    ): Promise<any> {
        const query = new URLSearchParams();
        if (period) query.append('period', period);

        const queryString = query.toString();
        return this.fetchAPI(`/products/${productId}/stock-analysis${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getProductAvailability(
        token: string,
        productId: string
    ): Promise<{
        productId: string;
        mainStore: {
            storeId: string | null;
            storeName: string | null;
            available: number;
        };
        branchStores: Array<{
            storeId: string;
            storeName: string | null;
            available: number;
            city: string | null;
            reorderLevel: number | null;
            optimalLevel: number | null;
        }>;
        totalAvailable: number;
    }> {
        return this.fetchAPI(`/products/${productId}/availability`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async bulkUpdateProducts(
        token: string,
        products: Array<{
            id: string;
            [key: string]: any;
        }>
    ): Promise<{
        message: string;
        results: Product[];
    }> {
        return this.fetchAPI('/products/bulk-update', {
            method: 'POST',
            body: JSON.stringify({ products }),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ UTILITY & HELPER METHODS ============

    /**
     * Calculate total inventory across all stores
     * Now handles both old format (product.inventories) and new format (product.inventory)
     */
    static calculateTotalInventory(product: Product): number {
        // First check for new format: product.inventory.total
        if (product.inventory && typeof product.inventory === 'object' && 'total' in product.inventory) {
            return product.inventory.total;
        }

        // Fallback to old format: product.inventories array
        if (product.inventories && Array.isArray(product.inventories)) {
            return product.inventories.reduce((total, inv) => {
                return total + (typeof inv.quantity === 'number' ? inv.quantity : 0);
            }, 0);
        }

        // If no inventory data found, return 0
        return 0;
    }

    /**
     * Get product type label and color
     */
    static getProductTypeInfo(type: ProductType): {
        label: string;
        color: string;
        badgeVariant: 'default' | 'secondary' | 'outline'
    } {
        switch (type) {
            case ProductType.TIRE:
                return {
                    label: 'Tire',
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    badgeVariant: 'default'
                };
            case ProductType.BALE:
                return {
                    label: 'Bale',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    badgeVariant: 'default'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    badgeVariant: 'secondary'
                };
        }
    }

    /**
     * Get product grade label and color
     */
    static getProductGradeInfo(grade: ProductGrade): {
        label: string;
        color: string;
        badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
    } {
        switch (grade) {
            case ProductGrade.A:
                return {
                    label: 'Grade A',
                    color: 'bg-green-100 text-green-800 border-green-200',
                    badgeVariant: 'default'
                };
            case ProductGrade.B:
                return {
                    label: 'Grade B',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    badgeVariant: 'outline'
                };
            case ProductGrade.C:
                return {
                    label: 'Grade C',
                    color: 'bg-red-100 text-red-800 border-red-200',
                    badgeVariant: 'destructive'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    badgeVariant: 'secondary'
                };
        }
    }

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
     * Get stock status color and text
     * Updated to use the new inventory format
     */
    static getStockStatusInfo(totalInventory: number, reorderLevel?: number): {
        status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
        color: string;
        label: string;
    } {
        if (totalInventory <= 0) {
            return {
                status: 'OUT_OF_STOCK',
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'Out of Stock'
            };
        }

        if (reorderLevel && totalInventory <= reorderLevel) {
            return {
                status: 'LOW_STOCK',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Low Stock'
            };
        }

        return {
            status: 'IN_STOCK',
            color: 'bg-green-100 text-green-800 border-green-200',
            label: 'In Stock'
        };
    }

    /**
     * Get tire category label
     */
    static getTireCategoryLabel(category?: string): string {
        switch (category) {
            case 'NEW': return 'New';
            case 'SECOND_HAND': return 'Second Hand';
            default: return 'Not Specified';
        }
    }

    /**
     * Get tire usage label
     */
    static getTireUsageLabel(usage?: string): string {
        switch (usage) {
            case 'FOUR_BY_FOUR': return '4x4';
            case 'REGULAR': return 'Regular';
            case 'TRUCK': return 'Truck';
            default: return 'Not Specified';
        }
    }

    /**
     * Validate product data before submission
     */
    static validateProductData(data: CreateProductFormValues | UpdateProductFormValues): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check if it's CreateProductFormValues
        const isCreateForm = 'name' in data && 'type' in data && 'grade' in data;

        if (isCreateForm) {
            const createData = data as CreateProductFormValues;

            // Required fields for creation
            if (!createData.name || createData.name.trim().length < 2) {
                errors.push('Product name must be at least 2 characters');
            }

            if (createData.basePrice === undefined || createData.basePrice < 0 || createData.basePrice > 1000000) {
                errors.push('Base price must be between 0 and 1,000,000');
            }

            if (!['A', 'B', 'C'].includes(createData.grade)) {
                errors.push('Product grade must be A, B, or C');
            }

            // Type-specific validations for creation
            if (createData.type === ProductType.TIRE) {
                if (createData.baleWeight || createData.baleCategory) {
                    errors.push('Bale-specific fields are not valid for TIRE type');
                }
            } else if (createData.type === ProductType.BALE) {
                if (createData.tireCategory || createData.tireUsage) {
                    errors.push('Tire-specific fields are not valid for BALE type');
                }
            }

            // Warnings for creation
            if (!createData.storeAssignments || createData.storeAssignments.length === 0) {
                warnings.push('Product is not assigned to any store. It will not be available for sale.');
            }
        } else {
            // For update form, check only provided fields
            const updateData = data as UpdateProductFormValues;

            if (updateData.name !== undefined && (!updateData.name || updateData.name.trim().length < 2)) {
                errors.push('Product name must be at least 2 characters');
            }

            if (updateData.basePrice !== undefined && (updateData.basePrice < 0 || updateData.basePrice > 1000000)) {
                errors.push('Base price must be between 0 and 1,000,000');
            }

            if (updateData.grade !== undefined && !['A', 'B', 'C'].includes(updateData.grade)) {
                errors.push('Product grade must be A, B, or C');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Check if product can be deleted
     */
    static canDeleteProduct(product: Product): {
        canDelete: boolean;
        reasons: string[];
    } {
        const reasons: string[] = [];

        // Check inventory
        const totalInventory = this.calculateTotalInventory(product);
        if (totalInventory > 0) {
            reasons.push(`Product has ${totalInventory} units in inventory`);
        }

        // Check recent sales (last 30 days)
        if (product._count?.saleItems && product._count.saleItems > 0) {
            reasons.push('Product has recent sales');
        }

        return {
            canDelete: reasons.length === 0,
            reasons
        };
    }

    /**
     * Generate display text for product
     */
    static getProductDisplayText(product: Product): string {
        let display = product.name;

        if (product.type === ProductType.TIRE && product.tireSize) {
            display += ` (${product.tireSize})`;
        } else if (product.type === ProductType.BALE && product.baleWeight) {
            display += ` (${product.baleWeight}kg)`;
        }

        return display;
    }

    /**
     * Get inventory by store
     */
    static getInventoryByStore(product: Product): Record<string, number> {
        if (!product.inventories) return {};

        const inventoryMap: Record<string, number> = {};
        product.inventories.forEach(inv => {
            inventoryMap[inv.storeId] = inv.quantity;
        });

        return inventoryMap;
    }

    /**
     * Check if product is available in store
     */
    static isProductAvailableInStore(product: Product, storeId: string): boolean {
        if (!product.inventories) return false;

        const storeInventory = product.inventories.find(inv => inv.storeId === storeId);
        return !!storeInventory && storeInventory.quantity > 0;
    }

    /**
     * Get inventory quantity for specific store
     */
    static getStoreInventory(product: Product, storeId: string): number {
        if (!product.inventories) return 0;

        const storeInventory = product.inventories.find(inv => inv.storeId === storeId);
        return storeInventory ? storeInventory.quantity : 0;
    }

    /**
     * Get reorder level for a product in a specific store
     */
    static getReorderLevel(product: Product, storeId: string): number {
        if (!product.inventories) return 10; // Default reorder level

        const storeInventory = product.inventories.find(inv => inv.storeId === storeId);
        return storeInventory?.reorderLevel || 10;
    }

    /**
     * Check if product is low stock in any store
     */
    static isLowStock(product: Product): boolean {
        const totalInventory = this.calculateTotalInventory(product);

        // If we have inventories array, check each store
        if (product.inventories && product.inventories.length > 0) {
            return product.inventories.some(inv => {
                const reorderLevel = inv.reorderLevel || 10;
                return inv.quantity <= reorderLevel;
            });
        }

        // Otherwise check total inventory against default reorder level
        return totalInventory <= 10;
    }

    /**
     * Get main store inventory quantity
     */
    static getMainStoreInventory(product: Product): number {
        if (product.inventory && 'mainStore' in product.inventory) {
            return product.inventory.mainStore;
        }

        // Fallback to inventories array
        if (product.inventories) {
            const mainStoreInventory = product.inventories.find(inv => inv.store?.isMainStore);
            return mainStoreInventory?.quantity || 0;
        }

        return 0;
    }

    /**
     * Get branch stores inventory quantity
     */
    static getBranchInventory(product: Product): number {
        if (product.inventory && 'branches' in product.inventory) {
            return product.inventory.branches;
        }

        // Fallback to inventories array
        if (product.inventories) {
            const branchInventories = product.inventories.filter(inv => !inv.store?.isMainStore);
            return branchInventories.reduce((sum, inv) => sum + inv.quantity, 0);
        }

        return 0;
    }
}

export default ProductAPI;
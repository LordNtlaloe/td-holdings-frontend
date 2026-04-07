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
    CreateProductRequest,
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
                    `HTTP ${response.status}: ${(errorData as any)?.message || (errorData as any)?.error || response.statusText || 'API request failed'}`
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
        if (params?.search) query.append('search', params.search);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());

        const queryString = query.toString();
        const response = await this.fetchAPI<any>(
            `/products${queryString ? `?${queryString}` : ''}`,
            {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            }
        );

        // Handle different response structures
        let productsArray: Product[] = [];
        let meta = {
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 50,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false
        };
        let summary = undefined;

        // Check if response is already an array
        if (Array.isArray(response)) {
            productsArray = response;
            meta = {
                total: response.length,
                page: params?.page || 1,
                limit: params?.limit || 50,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false
            };
        }
        // Check if response has a 'data' property that is an array
        else if (response && typeof response === 'object') {
            if (Array.isArray(response.data)) {
                productsArray = response.data;
                meta = {
                    total: response.meta?.total || response.total || productsArray.length,
                    page: response.meta?.page || response.page || params?.page || 1,
                    limit: response.meta?.limit || response.limit || params?.limit || 50,
                    totalPages: response.meta?.totalPages || response.totalPages ||
                        Math.ceil((response.meta?.total || response.total || productsArray.length) / (params?.limit || 50)),
                    hasNextPage: response.meta?.hasNextPage || response.hasNext || false,
                    hasPrevPage: response.meta?.hasPrevPage || response.hasPrev || false
                };
                summary = response.summary;
            }
        }

        console.log('🟦 ProductAPI: Extracted products array length:', productsArray.length);

        // Transform products to add computed inventory fields
        const transformedProducts = productsArray.map(product => ({
            ...product,
            totalInventory: product.inventories?.reduce((sum, inv) => sum + inv.quantity, 0) || 0,
            mainStoreInventory: product.inventories?.find(inv => inv.store?.isMainStore)?.quantity || 0,
            branchesInventory: (product.inventories?.filter(inv => !inv.store?.isMainStore)?.reduce((sum, inv) => sum + inv.quantity, 0)) || 0
        }));

        return {
            data: transformedProducts,
            meta,
            summary
        };
    }

    static async getProduct(token: string, productId: string): Promise<Product> {
        const response = await this.fetchAPI<any>(`/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });

        // Handle different response formats
        const product = response.data || response.product || response;

        // Add computed fields
        return {
            ...product,
            totalInventory: product.inventories?.reduce((sum: number, inv: any) => sum + inv.quantity, 0) || 0,
            mainStoreInventory: product.inventories?.find((inv: any) => inv.store?.isMainStore)?.quantity || 0,
            branchesInventory: (product.inventories?.filter((inv: any) => !inv.store?.isMainStore)?.reduce((sum: number, inv: any) => sum + inv.quantity, 0)) || 0
        };
    }

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

        // Transform to CreateProductRequest format
        const requestData: CreateProductRequest = {
            name: data.name,
            description: data.description,
            basePrice: Number(data.basePrice),
            type: data.type,
            grade: data.grade,
            commodity: data.commodity,
            tireCategory: data.tireCategory,
            tireUsage: data.tireUsage,
            tireSize: data.tireSize,
            loadIndex: data.loadIndex,
            speedRating: data.speedRating,
            warrantyPeriod: data.warrantyPeriod,
            baleWeight: data.baleWeight ? Number(data.baleWeight) : undefined,
            baleCategory: data.baleCategory,
            originCountry: data.originCountry,
            importDate: data.importDate,
            // Note: storeAssignments would need to come from somewhere else in your form
        };

        console.log('🟦 Request body:', JSON.stringify(requestData, null, 2));

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
        // Transform to UpdateProductRequest format
        const requestData: any = {};

        if (data.name !== undefined) requestData.name = data.name;
        if (data.description !== undefined) requestData.description = data.description;
        if (data.basePrice !== undefined) requestData.basePrice = Number(data.basePrice);
        if (data.type !== undefined) requestData.type = data.type;
        if (data.grade !== undefined) requestData.grade = data.grade;
        if (data.commodity !== undefined) requestData.commodity = data.commodity;
        if (data.tireCategory !== undefined) requestData.tireCategory = data.tireCategory;
        if (data.tireUsage !== undefined) requestData.tireUsage = data.tireUsage;
        if (data.tireSize !== undefined) requestData.tireSize = data.tireSize;
        if (data.loadIndex !== undefined) requestData.loadIndex = data.loadIndex;
        if (data.speedRating !== undefined) requestData.speedRating = data.speedRating;
        if (data.warrantyPeriod !== undefined) requestData.warrantyPeriod = data.warrantyPeriod;
        if (data.baleWeight !== undefined) requestData.baleWeight = Number(data.baleWeight);
        if (data.baleCategory !== undefined) requestData.baleCategory = data.baleCategory;
        if (data.originCountry !== undefined) requestData.originCountry = data.originCountry;
        if (data.importDate !== undefined) requestData.importDate = data.importDate;
        if (data.isActive !== undefined) requestData.isActive = data.isActive;

        const response = await this.fetchAPI<any>(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(requestData),
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data || response.product || response;
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

    // ============ PRODUCT REPORTS & STATISTICS ============

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
        try {
            const query = new URLSearchParams();
            query.append('threshold', threshold.toString());

            const response = await this.fetchAPI<any>(`/products/reports/low-stock?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
            });

            // Handle different response formats
            return response.data || response.lowStock || response;
        } catch (error: any) {
            if (error.message.includes('403')) {
                console.warn('User does not have permission to view low stock reports');
                return [];
            }
            throw error;
        }
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

        const response = await this.fetchAPI<any>(`/products/search?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });

        return response.data || response.products || response;
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

    static calculateTotalInventory(product: Product): number {
        return product.totalInventory ||
            product.inventories?.reduce((total, inv) => total + inv.quantity, 0) ||
            0;
    }

    static getProductTypeInfo(type: ProductType): {
        label: string;
        color: string;
        badgeVariant: 'default' | 'secondary' | 'outline'
    } {
        switch (type) {
            case ProductType.TIRE:
                return {
                    label: 'Tire',
                    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100',
                    badgeVariant: 'default'
                };
            case ProductType.BALE:
                return {
                    label: 'Bale',
                    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100',
                    badgeVariant: 'default'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100',
                    badgeVariant: 'secondary'
                };
        }
    }

    static getProductGradeInfo(grade: ProductGrade): {
        label: string;
        color: string;
        badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
    } {
        switch (grade) {
            case ProductGrade.A:
                return {
                    label: 'Grade A',
                    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100',
                    badgeVariant: 'default'
                };
            case ProductGrade.B:
                return {
                    label: 'Grade B',
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100',
                    badgeVariant: 'outline'
                };
            case ProductGrade.C:
                return {
                    label: 'Grade C',
                    color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100',
                    badgeVariant: 'destructive'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100',
                    badgeVariant: 'secondary'
                };
        }
    }

    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'LSL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    static getStockStatusInfo(totalInventory: number, reorderLevel?: number): {
        status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
        color: string;
        label: string;
        badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
    } {
        if (totalInventory <= 0) {
            return {
                status: 'OUT_OF_STOCK',
                color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100',
                label: 'Out of Stock',
                badgeVariant: 'destructive'
            };
        }

        if (reorderLevel && totalInventory <= reorderLevel) {
            return {
                status: 'LOW_STOCK',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100',
                label: 'Low Stock',
                badgeVariant: 'outline'
            };
        }

        return {
            status: 'IN_STOCK',
            color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100',
            label: 'In Stock',
            badgeVariant: 'default'
        };
    }

    static getTireCategoryLabel(category?: TireCategory): string {
        switch (category) {
            case TireCategory.NEW: return 'New';
            case TireCategory.SECOND_HAND: return 'Second Hand';
            default: return 'Not Specified';
        }
    }

    static getTireUsageLabel(usage?: TireUsage): string {
        switch (usage) {
            case TireUsage.FOUR_BY_FOUR: return '4x4';
            case TireUsage.REGULAR: return 'Regular';
            case TireUsage.TRUCK: return 'Truck';
            default: return 'Not Specified';
        }
    }

    static validateProductData(data: CreateProductFormValues | UpdateProductFormValues): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        const isCreateForm = 'name' in data;

        if (isCreateForm) {
            const createData = data as CreateProductFormValues;

            if (!createData.name || createData.name.trim().length < 2) {
                errors.push('Product name must be at least 2 characters');
            }

            if (createData.basePrice === undefined || createData.basePrice < 0) {
                errors.push('Base price must be a positive number');
            }

            if (!createData.type) {
                errors.push('Product type is required');
            }

            if (!createData.grade) {
                errors.push('Product grade is required');
            }

            if (createData.type === ProductType.TIRE) {
                if (createData.baleWeight || createData.baleCategory) {
                    warnings.push('Bale-specific fields will be ignored for TIRE type');
                }
            } else if (createData.type === ProductType.BALE) {
                if (createData.tireCategory || createData.tireUsage) {
                    warnings.push('Tire-specific fields will be ignored for BALE type');
                }
                if (!createData.baleWeight || createData.baleWeight <= 0) {
                    errors.push('Bale weight is required and must be greater than 0 for bale products');
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    static canDeleteProduct(product: Product): {
        canDelete: boolean;
        reasons: string[];
    } {
        const reasons: string[] = [];
        const totalInventory = this.calculateTotalInventory(product);

        if (totalInventory > 0) {
            reasons.push(`Product has ${totalInventory} units in inventory`);
        }

        if (product._count?.saleItems && product._count.saleItems > 0) {
            reasons.push('Product has recent sales');
        }

        return {
            canDelete: reasons.length === 0,
            reasons
        };
    }

    static getProductDisplayText(product: Product): string {
        let display = product.name;

        if (product.type === ProductType.TIRE && product.tireSize) {
            display += ` (${product.tireSize})`;
        } else if (product.type === ProductType.BALE && product.baleWeight) {
            display += ` (${product.baleWeight}kg)`;
        }

        return display;
    }

    static getInventoryByStore(product: Product): Record<string, number> {
        if (!product.inventories) return {};

        return product.inventories.reduce((acc, inv) => {
            if (inv.store) {
                const storeId = typeof inv.store === 'string' ? inv.store : inv.store.id;
                acc[storeId] = inv.quantity;
            }
            return acc;
        }, {} as Record<string, number>);
    }

    static isProductAvailableInStore(product: Product, storeId: string): boolean {
        if (!product.inventories) return false;

        const storeInventory = product.inventories.find(inv =>
            inv.store && (typeof inv.store === 'string' ? inv.store === storeId : inv.store.id === storeId)
        );

        return !!storeInventory && storeInventory.quantity > 0;
    }

    static getStoreInventory(product: Product, storeId: string): number {
        if (!product.inventories) return 0;

        const storeInventory = product.inventories.find(inv =>
            inv.store && (typeof inv.store === 'string' ? inv.store === storeId : inv.store.id === storeId)
        );

        return storeInventory ? storeInventory.quantity : 0;
    }

    static getReorderLevel(product: Product, storeId: string): number {
        if (!product.inventories) return 10;

        const storeInventory = product.inventories.find(inv =>
            inv.store && (typeof inv.store === 'string' ? inv.store === storeId : inv.store.id === storeId)
        );

        return storeInventory?.reorderLevel || 10;
    }

    static isLowStock(product: Product): boolean {
        if (!product.inventories || product.inventories.length === 0) {
            return false;
        }

        return product.inventories.some(inv => {
            const reorderLevel = inv.reorderLevel || 10;
            return inv.quantity <= reorderLevel;
        });
    }

    static getMainStoreInventory(product: Product): number {
        if (product.mainStoreInventory !== undefined) {
            return product.mainStoreInventory;
        }

        if (product.inventories) {
            const mainStoreInventory = product.inventories.find(inv => inv.store?.isMainStore);
            return mainStoreInventory?.quantity || 0;
        }

        return 0;
    }

    static getBranchInventory(product: Product): number {
        if (product.branchesInventory !== undefined) {
            return product.branchesInventory;
        }

        if (product.inventories) {
            return product.inventories
                .filter(inv => !inv.store?.isMainStore)
                .reduce((sum, inv) => sum + inv.quantity, 0);
        }

        return 0;
    }
    
    static async assignProductToStores(token: string, productId: string, data: any): Promise<any> {
    return this.fetchAPI(`/products/${productId}/assign-stores`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
    });
}
}

export default ProductAPI;
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
    AssignProductToStoresFormValues,
    ProductType,
    ProductGrade,
    TireCategory,
    TireUsage
} from '@/types';

const API_BASE = '/api';

class ProductAPI {
    private static async fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'API request failed');
        }

        const result = await response.json();
        // Handle consistent response format { success, data, error }
        if (result.success === false) {
            throw new Error(result.error || 'API request failed');
        }
        return result.data || result;
    }

    // ============ PRODUCT CRUD OPERATIONS ============

    static async getProducts(token: string, params?: ProductFilters): Promise<PaginatedProductsResponse> {
        const query = new URLSearchParams();

        if (params?.name) query.append('name', params.name);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.commodity) query.append('commodity', params.commodity);
        if (params?.tireCategory) query.append('tireCategory', params.tireCategory);
        if (params?.tireUsage) query.append('tireUsage', params.tireUsage);
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
        if (params?.inStock !== undefined) query.append('inStock', params.inStock.toString());
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        return this.fetchAPI(`/catalogue/products${queryString ? `?${queryString}` : ''}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getProduct(token: string, productId: string): Promise<Product> {
        return this.fetchAPI(`/catalogue/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async createProduct(token: string, data: CreateProductFormValues): Promise<{
        product: Product;
        storeAssignments: Array<{
            storeProduct: any;
            initialQuantity: number;
            storePrice?: number;
        }>;
    }> {
        return this.fetchAPI('/catalogue/products', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async updateProduct(token: string, productId: string, data: UpdateProductFormValues): Promise<Product> {
        return this.fetchAPI(`/catalogue/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async archiveProduct(
        token: string,
        productId: string,
        reason?: string
    ): Promise<{ message: string }> {
        return this.fetchAPI(`/catalogue/products/${productId}`, {
            method: 'DELETE',
            body: JSON.stringify({ reason }),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ PRODUCT STORE ASSIGNMENT OPERATIONS ============

    static async assignProductToStores(
        token: string,
        productId: string,
        data: AssignProductToStoresFormValues
    ): Promise<Array<{
        storeId: string;
        storeProduct: any;
        inventory?: any;
    }>> {
        return this.fetchAPI(`/catalogue/products/${productId}/assign-stores`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    static async removeProductFromStore(
        token: string,
        productId: string,
        storeId: string
    ): Promise<{ message: string }> {
        return this.fetchAPI(`/catalogue/products/${productId}/stores/${storeId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    }

    // ============ PRODUCT REPORTS & STATISTICS ============

    static async getLowStockProducts(
        token: string,
        threshold: number = 10
    ): Promise<LowStockProduct[]> {
        const query = new URLSearchParams();
        query.append('threshold', threshold.toString());

        return this.fetchAPI(`/catalogue/products/reports/low-stock?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getProductAttributes(token: string): Promise<ProductAttribute> {
        return this.fetchAPI('/catalogue/attributes/all', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getProductStatistics(
        token: string,
        groupBy: 'type' | 'grade' | 'tireCategory' | 'tireUsage' = 'type'
    ): Promise<ProductCategoryStats[]> {
        const query = new URLSearchParams();
        query.append('groupBy', groupBy);

        return this.fetchAPI(`/catalogue/statistics/categories?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    static async getPriceStatistics(token: string): Promise<ProductPriceStatistics> {
        return this.fetchAPI('/catalogue/statistics/prices', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
    }

    // ============ PUBLIC ENDPOINTS (no token required) ============

    static async getPublicCatalog(params?: {
        name?: string;
        type?: ProductType;
        grade?: ProductGrade;
        commodity?: string;
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
        storeId?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedProductsResponse> {
        const query = new URLSearchParams();

        if (params?.name) query.append('name', params.name);
        if (params?.type) query.append('type', params.type);
        if (params?.grade) query.append('grade', params.grade);
        if (params?.commodity) query.append('commodity', params.commodity);
        if (params?.tireCategory) query.append('tireCategory', params.tireCategory);
        if (params?.tireUsage) query.append('tireUsage', params.tireUsage);
        if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
        if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
        if (params?.inStock !== undefined) query.append('inStock', params.inStock.toString());
        if (params?.storeId) query.append('storeId', params.storeId);
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());

        const queryString = query.toString();
        return this.fetchAPI(`/catalogue/public/catalog${queryString ? `?${queryString}` : ''}`, {
            cache: 'no-store',
        });
    }

    static async getPublicAttributes(): Promise<ProductAttribute> {
        return this.fetchAPI('/catalogue/public/attributes', {
            cache: 'no-store',
        });
    }

    // ============ UTILITY & HELPER METHODS ============

    /**
     * Calculate total inventory across all stores
     */
    static calculateTotalInventory(product: Product): number {
        if (!product.inventories || product.inventories.length === 0) return 0;
        return product.inventories.reduce((total, inv) => total + inv.quantity, 0);
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
                    color: 'bg-blue-100 text-blue-800',
                    badgeVariant: 'default'
                };
            case ProductType.BALE:
                return {
                    label: 'Bale',
                    color: 'bg-green-100 text-green-800',
                    badgeVariant: 'default'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800',
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
                    color: 'bg-green-100 text-green-800',
                    badgeVariant: 'default'
                };
            case ProductGrade.B:
                return {
                    label: 'Grade B',
                    color: 'bg-yellow-100 text-yellow-800',
                    badgeVariant: 'outline'
                };
            case ProductGrade.C:
                return {
                    label: 'Grade C',
                    color: 'bg-red-100 text-red-800',
                    badgeVariant: 'destructive'
                };
            default:
                return {
                    label: 'Unknown',
                    color: 'bg-gray-100 text-gray-800',
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
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Get stock status color and text
     */
    static getStockStatusInfo(totalInventory: number, reorderLevel?: number): {
        status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
        color: string;
        label: string;
    } {
        if (totalInventory <= 0) {
            return {
                status: 'OUT_OF_STOCK',
                color: 'bg-red-100 text-red-800',
                label: 'Out of Stock'
            };
        }

        if (reorderLevel && totalInventory <= reorderLevel) {
            return {
                status: 'LOW_STOCK',
                color: 'bg-yellow-100 text-yellow-800',
                label: 'Low Stock'
            };
        }

        return {
            status: 'IN_STOCK',
            color: 'bg-green-100 text-green-800',
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
                if (createData.baleSpecific?.baleWeight || createData.baleSpecific?.baleCategory) {
                    errors.push('Bale-specific fields are not valid for TIRE type');
                }
            } else if (createData.type === ProductType.BALE) {
                if (createData.tireSpecific?.tireCategory || createData.tireSpecific?.tireUsage) {
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
     * Check if product can be archived
     */
    static canArchiveProduct(product: Product): {
        canArchive: boolean;
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

        // Check active transfers
        if (product._count?.transfers && product._count.transfers > 0) {
            reasons.push('Product has active transfers');
        }

        return {
            canArchive: reasons.length === 0,
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
}

export default ProductAPI;
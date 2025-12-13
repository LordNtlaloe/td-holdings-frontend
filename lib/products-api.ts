// lib/api/products.ts

import { Product, ProductFilters, ProductFormData, ProductMetrics } from "@/types";

// Get all products
export async function getAllProducts(): Promise<Product[]> {
    try {
        const response = await fetch('/api/products', {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // Try to parse error as JSON, fall back to text if it fails
            let errorMessage = 'Failed to fetch products';
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
        console.log('Raw API response:', data); // Debug log

        const products = data.products || data || [];
        console.log('Extracted products array:', products); // Debug log

        // Transform the data to match Product type
        return products.map((product: any) => {
            const transformed: Product = {
                id: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: Number(product.quantity),
                type: product.type,
                grade: product.grade,
                commodity: product.commodity || null,
                storeId: product.storeId,

                // Store relationship
                store: product.store ? {
                    id: product.store.id,
                    name: product.store.name,
                    location: product.store.location,
                    createdAt: new Date(product.store.createdAt),
                    updatedAt: new Date(product.store.updatedAt),
                    employees: [],
                    products: [],
                    sales: [],
                    storeProducts: [],
                    productTransfersFrom: [],
                    productTransfersTo: [],
                } : undefined as any,

                // Tire fields
                tireCategory: product.tireCategory || null,
                tireUsage: product.tireUsage || null,
                tireSize: product.tireSize || null,
                loadIndex: product.loadIndex || null,
                speedRating: product.speedRating || null,
                warrantyPeriod: product.warrantyPeriod || null,

                // Bale fields
                baleWeight: product.baleWeight || null,
                baleCategory: product.baleCategory || null,
                originCountry: product.originCountry || null,
                importDate: product.importDate ? new Date(product.importDate) : null,
                baleCount: product.baleCount || null,

                // Timestamps
                createdAt: new Date(product.createdAt),
                updatedAt: new Date(product.updatedAt),

                // Empty relationships
                saleItems: [],
                storeProducts: [],
                productTransfers: [],
            };

            console.log('Mapped product:', transformed); // Debug log
            return transformed;
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

export async function getAllProductsWithParams(params?: ProductFilters): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
}> {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params?.storeId) queryParams.append('storeId', params.storeId);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

        const queryString = queryParams.toString();
        const url = queryString ? `/api/products?${queryString}` : '/api/products';

        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            // Try to parse error as JSON, fall back to text if it fails
            let errorMessage = 'Failed to fetch products';
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

        // Transform products data
        const products = (data.products || data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Number(product.quantity),
            type: product.type,
            grade: product.grade,
            commodity: product.commodity,
            storeId: product.storeId,
            store: product.store ? {
                id: product.store.id,
                name: product.store.name,
                location: product.store.location,
                createdAt: new Date(product.store.createdAt),
                updatedAt: new Date(product.store.updatedAt),
                employees: [],
                products: [],
                sales: [],
                storeProducts: [],
                productTransfersFrom: [],
                productTransfersTo: [],
            } : undefined,

            // Tire fields
            tireCategory: product.tireCategory,
            tireUsage: product.tireUsage,
            tireSize: product.tireSize,
            loadIndex: product.loadIndex,
            speedRating: product.speedRating,
            warrantyPeriod: product.warrantyPeriod,

            // Bale fields
            baleWeight: product.baleWeight,
            baleCategory: product.baleCategory,
            originCountry: product.originCountry,
            importDate: product.importDate ? new Date(product.importDate) : null,
            baleCount: product.baleCount,

            // Timestamps
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),

            // Empty relationships
            saleItems: [],
            storeProducts: [],
            productTransfers: [],
        }));

        // Check if response is paginated or just an array
        if (Array.isArray(data)) {
            return {
                products: products,
                total: data.length,
                page: 1,
                totalPages: 1,
            };
        }

        // If response is paginated
        return {
            products: products,
            total: data.pagination?.total || data.total || 0,
            page: data.pagination?.page || params?.page || 1,
            totalPages: data.pagination?.pages || Math.ceil((data.total || 0) / (params?.limit || 20)),
        };

    } catch (error) {
        console.error('Error fetching products:', error);

        // Return empty result instead of throwing
        return {
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
        };
    }
}

// Enhanced version with error handling wrapper
export async function safeGetAllProducts(): Promise<{
    data: Product[];
    error: string | null;
}> {
    try {
        const products = await getAllProducts();
        return {
            data: products,
            error: null,
        };
    } catch (error) {
        return {
            data: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// Create product
export async function createProduct(productData: ProductFormData): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to create product'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Update product
export async function updateProduct(id: string, productData: Partial<ProductFormData>): Promise<{
    success: boolean;
    data?: any;
    error?: string
}> {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update product'
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Delete product
export async function deleteProduct(id: string): Promise<{
    success: boolean;
    error?: string
}> {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to delete product'
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get product by ID
export async function getProductById(id: string): Promise<{
    success: boolean;
    data?: Product;
    error?: string
}> {
    try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch product'
            };
        }

        const data = await response.json();

        // Transform the product data
        const product: Product = {
            id: data.id,
            name: data.name,
            price: Number(data.price),
            quantity: Number(data.quantity),
            type: data.type,
            grade: data.grade,
            commodity: data.commodity,
            storeId: data.storeId,
            store: data.store ? {
                id: data.store.id,
                name: data.store.name,
                location: data.store.location,
                createdAt: new Date(data.store.createdAt),
                updatedAt: new Date(data.store.updatedAt),
                employees: [],
                products: [],
                sales: [],
                storeProducts: [],
                productTransfersFrom: [],
                productTransfersTo: [],
            } : undefined as any,

            // Tire fields
            tireCategory: data.tireCategory,
            tireUsage: data.tireUsage,
            tireSize: data.tireSize,
            loadIndex: data.loadIndex,
            speedRating: data.speedRating,
            warrantyPeriod: data.warrantyPeriod,

            // Bale fields
            baleWeight: data.baleWeight,
            baleCategory: data.baleCategory,
            originCountry: data.originCountry,
            importDate: data.importDate ? new Date(data.importDate) : null,
            baleCount: data.baleCount,

            // Timestamps
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),

            // Empty relationships
            saleItems: [],
            storeProducts: [],
            productTransfers: [],
        };

        return { success: true, data: product };
    } catch (error) {
        console.error('Error fetching product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error'
        };
    }
}

// Get low stock products
export async function getLowStockProducts(threshold: number = 10): Promise<{
    success: boolean;
    data?: Product[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products/low-stock?threshold=${threshold}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch low stock products',
            };
        }

        const data = await response.json();

        // Transform the products data
        const products = (data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Number(product.quantity),
            type: product.type,
            grade: product.grade,
            commodity: product.commodity,
            storeId: product.storeId,
            store: product.store ? {
                id: product.store.id,
                name: product.store.name,
                location: product.store.location,
                createdAt: new Date(product.store.createdAt),
                updatedAt: new Date(product.store.updatedAt),
                employees: [],
                products: [],
                sales: [],
                storeProducts: [],
                productTransfersFrom: [],
                productTransfersTo: [],
            } : undefined,

            // Tire fields
            tireCategory: product.tireCategory,
            tireUsage: product.tireUsage,
            tireSize: product.tireSize,
            loadIndex: product.loadIndex,
            speedRating: product.speedRating,
            warrantyPeriod: product.warrantyPeriod,

            // Bale fields
            baleWeight: product.baleWeight,
            baleCategory: product.baleCategory,
            originCountry: product.originCountry,
            importDate: product.importDate ? new Date(product.importDate) : null,
            baleCount: product.baleCount,

            // Timestamps
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),

            // Empty relationships
            saleItems: [],
            storeProducts: [],
            productTransfers: [],
        }));

        return { success: true, data: products };
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Transfer product
export async function transferProduct(transferData: {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
}): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch('/api/products/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transferData),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to transfer product',
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error transferring product:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Get product metrics
export async function getProductMetrics(params?: {
    storeId?: string;
    timeRange?: string;
    type?: string;
}): Promise<{
    success: boolean;
    data?: ProductMetrics;
    error?: string;
}> {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params?.storeId) queryParams.append('storeId', params.storeId);
        if (params?.timeRange) queryParams.append('timeRange', params.timeRange);
        if (params?.type) queryParams.append('type', params.type);

        const queryString = queryParams.toString();
        const url = queryString ? `/api/products/metrics?${queryString}` : '/api/products/metrics';

        const response = await fetch(url);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch product metrics',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching product metrics:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Update product quantity
export async function updateProductQuantity(
    id: string,
    quantity: number,
    operation: 'SET' | 'ADD' | 'SUBTRACT' = 'SET'
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity, operation }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'Failed to update product quantity',
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating product quantity:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Search products
export async function searchProducts(searchTerm: string): Promise<{
    success: boolean;
    data?: Product[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&limit=50`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to search products',
            };
        }

        const data = await response.json();

        // Transform the products data
        const products = (data.products || data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Number(product.quantity),
            type: product.type,
            grade: product.grade,
            commodity: product.commodity,
            storeId: product.storeId,
            store: product.store ? {
                id: product.store.id,
                name: product.store.name,
                location: product.store.location,
                createdAt: new Date(product.store.createdAt),
                updatedAt: new Date(product.store.updatedAt),
                employees: [],
                products: [],
                sales: [],
                storeProducts: [],
                productTransfersFrom: [],
                productTransfersTo: [],
            } : undefined,

            // Tire fields
            tireCategory: product.tireCategory,
            tireUsage: product.tireUsage,
            tireSize: product.tireSize,
            loadIndex: product.loadIndex,
            speedRating: product.speedRating,
            warrantyPeriod: product.warrantyPeriod,

            // Bale fields
            baleWeight: product.baleWeight,
            baleCategory: product.baleCategory,
            originCountry: product.originCountry,
            importDate: product.importDate ? new Date(product.importDate) : null,
            baleCount: product.baleCount,

            // Timestamps
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),

            // Empty relationships
            saleItems: [],
            storeProducts: [],
            productTransfers: [],
        }));

        return { success: true, data: products };
    } catch (error) {
        console.error('Error searching products:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Get products by store
export async function getProductsByStore(storeId: string): Promise<{
    success: boolean;
    data?: Product[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products?storeId=${storeId}&limit=1000`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch store products',
            };
        }

        const data = await response.json();

        // Transform the products data
        const products = (data.products || data || []).map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            quantity: Number(product.quantity),
            type: product.type,
            grade: product.grade,
            commodity: product.commodity,
            storeId: product.storeId,
            store: product.store ? {
                id: product.store.id,
                name: product.store.name,
                location: product.store.location,
                createdAt: new Date(product.store.createdAt),
                updatedAt: new Date(product.store.updatedAt),
                employees: [],
                products: [],
                sales: [],
                storeProducts: [],
                productTransfersFrom: [],
                productTransfersTo: [],
            } : undefined,

            // Tire fields
            tireCategory: product.tireCategory,
            tireUsage: product.tireUsage,
            tireSize: product.tireSize,
            loadIndex: product.loadIndex,
            speedRating: product.speedRating,
            warrantyPeriod: product.warrantyPeriod,

            // Bale fields
            baleWeight: product.baleWeight,
            baleCategory: product.baleCategory,
            originCountry: product.originCountry,
            importDate: product.importDate ? new Date(product.importDate) : null,
            baleCount: product.baleCount,

            // Timestamps
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt),

            // Empty relationships
            saleItems: [],
            storeProducts: [],
            productTransfers: [],
        }));

        return { success: true, data: products };
    } catch (error) {
        console.error('Error fetching store products:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Get product sales history
export async function getProductSalesHistory(productId: string, limit: number = 50): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products/${productId}?sales=true`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to fetch product sales history',
            };
        }

        const data = await response.json();

        // Extract sales history from product data
        const salesHistory = data.saleItems || data.sales || [];
        return { success: true, data: salesHistory.slice(0, limit) };
    } catch (error) {
        console.error('Error fetching product sales history:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// Export products data
export async function exportProducts(format: 'csv' | 'json' | 'excel' = 'json'): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    try {
        const response = await fetch(`/api/products/export?format=${format}`);

        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.error || 'Failed to export products',
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
        console.error('Error exporting products:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}
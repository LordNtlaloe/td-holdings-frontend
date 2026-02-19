import { ProductType, ProductGrade, TireCategory, TireUsage, SortOrder } from "./enums";
import { Inventory, ProductTransfer, StockReceipt } from "./inventory";
import { SaleItem } from "./sales";
import { Store } from "./store";
import { User } from "./users";

export interface Product {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // Tire-specific fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale-specific fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    // Metadata
    isActive: boolean;
    rating?: number;
    reviewCount?: number;
    imageUrl?: any;
    createdAt: string;
    updatedAt: string;

    // Relationships
    inventories?: Inventory[];
    storeProducts?: StoreProduct[];
    saleItems?: SaleItem[];
    transfers?: ProductTransfer[];
    reviews?: ProductReview[];
    stockReceipts?: StockReceipt[];

    // Computed fields
    totalInventory?: number;
    mainStoreInventory?: number;
    branchesInventory?: number;

    // Counts
    _count?: {
        saleItems?: number;
        transfers?: number;
        reviews?: number;
    };
}

export interface StoreProduct {
    id: string;
    productId: string;
    storeId: string;
    createdAt: string;
    product?: Product;
    store?: Store;
}

export interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    rating: number; // 1-5
    comment?: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    product?: Product;
    user?: User;
}

export interface ProductAttribute {
    productTypes: ProductType[];
    productGrades: ProductGrade[];
    tireCategories: TireCategory[];
    tireUsages: TireUsage[];
}

// Product Statistics
export interface ProductCategoryStats {
    category: ProductType | string;
    count: number;
    totalInventory: number;
    averagePrice: number;
}

export interface ProductPriceStatistics {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    priceByType: Record<string, { min: number; max: number; avg: number }>;
    priceByGrade: Record<string, { min: number; max: number; avg: number }>;
}

export interface ProductExportData {
    id: string;
    name: string;
    type: string;
    grade: string;
    basePrice: number;
    commodity?: string;
    totalInventory: number;
    stores: string;
    lastUpdated: string;
}

// Product Filters
export interface ProductFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
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
    isActive?: boolean;
}

// Product Form Values
export interface CreateProductFormValues {
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // Tire fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    isActive?: boolean;
}

export interface UpdateProductFormValues extends Partial<CreateProductFormValues> {
    id: string;
}

// Product API Types
export interface CreateProductRequest {
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;
    storeAssignments?: Array<{
        storeId: string;
        initialQuantity?: number;
        storePrice?: number;
        reorderLevel?: number;
        optimalLevel?: number;
    }>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
    id: string;
}

// Add to types/product.ts
export interface ProductFormData {
    id?: string;
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // Tire-specific fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale-specific fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    // Store assignments
    storeAssignments?: Array<{
        storeId: string;
        store?: Store;
        quantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
        storePrice?: number;
        isAssigned: boolean;
    }>;

    isActive?: boolean;
}
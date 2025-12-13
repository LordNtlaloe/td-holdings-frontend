import { ProductTransfer, Store, StoreProduct } from '.';
import { ProductType, ProductGrade, TireCategory, TireUsage } from './enums';
import { SaleItem } from './sales';

export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    type: ProductType;
    grade: ProductGrade;
    commodity: string | null;
    storeId: string;

    // Tire-specific fields
    tireCategory: TireCategory | null;
    tireUsage: TireUsage | null;
    tireSize: string | null;
    loadIndex: string | null;
    speedRating: string | null;
    warrantyPeriod: string | null;

    // Bale-specific fields
    baleWeight: number | null;
    baleCategory: string | null;
    originCountry: string | null;
    importDate: Date | null;
    baleCount: number | null;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;

    // Relationships
    store: Store;
    saleItems: SaleItem[];
    storeProducts: StoreProduct[];
    productTransfers: ProductTransfer[];
}

export interface ProductFormData {
    name: string;
    price: number;
    quantity: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    storeId?: string;

    // Tire fields
    tireCategory?: string;
    tireUsage?: string;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: Date;
    baleCount?: number;
}
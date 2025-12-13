import { Product, Store } from ".";

export interface StoreProduct {
    id: string;
    productId: string;
    storeId: string;
    createdAt: Date;

    // Relationships
    product: Product;
    store: Store;
}
import { Product, Store } from ".";

export interface ProductTransfer {
    id: string;
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    transferredBy: string;
    status: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;

    // Relationships
    product: Product;
    fromStore: Store;
    toStore: Store;
}
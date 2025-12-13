import { Product, StoreProduct, ProductTransfer } from ".";
import { Employee } from "./employees";
import { Sale } from "./sales";

export interface Store {
    id: string;
    name: string;
    location: string;
    phone_number: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;

    // Relationships
    employees: Employee[];
    products: Product[];
    sales: Sale[];
    storeProducts: StoreProduct[];
    productTransfersFrom: ProductTransfer[];
    productTransfersTo: ProductTransfer[];
}

export interface StoreFormData {
    name: string;
    location: string;
}
import { Product } from "./products";

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    discount?: number;
    notes?: string;
    total?: number;
}

export interface CartDiscount {
    type: 'percentage' | 'fixed';
    value: number;
    reason?: string;
}

export interface CartTotals {
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
}

export interface CartState {
    items: CartItem[];
    discount?: CartDiscount;
    customer?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    notes?: string;
}
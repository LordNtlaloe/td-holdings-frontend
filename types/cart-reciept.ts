import { Product } from "./product";
import { Store } from "./store";

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    discount?: number;
}

export interface BranchInfo {
    name: string;
    location: string;
    phone?: string;
}

export interface ReceiptData {
    orderId: string;
    items: {
        name: string;
        price: number;
        qty: number;
        total: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    customerName: string;
    phoneNumber?: string;
    paymentMethod: string;
    branch: BranchInfo;
    cashier: string;
    timestamp: string;
}

export interface Receipt {
    id: string;
    date: Date | string;
    items: {
        product_name: string;
        quantity: number;
        price: number;
        subtotal: number;
        discount?: number;
    }[];
    subtotal: number;
    total: number;
    cashier: string;
    store: Store;
    payment_method: string;
    amount_received: number;
    change_amount: number;
    payment_reference?: string;
}
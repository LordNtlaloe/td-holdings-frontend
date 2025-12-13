import { Product, Store, } from '.';
import { ReceiptData } from './cart-reciept';
import { Employee } from './employees';
import { PaymentMethodType } from './enums';

export interface Sale {
    id: string;
    employeeId: string;
    storeId: string;
    total: number;
    subtotal: number;
    tax: number;
    createdAt: Date;
    paymentMethod: PaymentMethodType;

    // Relationships
    employee: Employee;
    store: Store;
    saleItems: SaleItem[];
    voidedSale?: VoidedSale;
}

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    price: number;

    // Relationships
    sale: Sale;
    product: Product;
}

export interface VoidedSale {
    id: string;
    saleId: string;
    voidedBy: string;
    reason: string | null;
    originalTotal: number;
    createdAt: Date;

    // Relationships
    sale: Sale;
}

export interface SaleItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export interface CustomerInfo {
    name?: string;
    email?: string;
    phone?: string;
}

export interface SaleRequest {
    items: SaleItem[];
    customerInfo?: CustomerInfo;
    paymentMethod: string;
    subtotal?: number;
    tax?: number;
    total?: number;
}

export interface SaleResponse {
    success: boolean;
    message: string;
    saleId: string;
    sale: any;
    receipt: ReceiptData;
    printResult?: any;
}
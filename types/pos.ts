import { Product, ProductType, Employee, Store } from "@/types";

export interface CartItem {
    id: string;
    product: Product;
    quantity: number;
    unitPrice?: number;
}

export interface ProductSpecs {
    mainSpec: string;
    secondarySpec: string;
    details: string;
    icon: React.ReactNode;
}

export interface CategoryFilter {
    id: "all" | ProductType;
    label: string;
    icon: React.ElementType;
    count: number;
}

export interface TireUsageFilter {
    id: "all" | string;
    label: string;
}

export interface NavItem {
    icon: React.ElementType;
    label: string;
    active: boolean;
}
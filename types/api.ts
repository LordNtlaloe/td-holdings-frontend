import { PaginationMeta } from "./filters";

// Generic API Response
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: PaginationMeta;
}

// Paginated Response
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// Error Response
export interface ApiError {
    success: false;
    error: string;
    message?: string;
    code?: string;
    details?: any;
}

// Success Response
export interface ApiSuccess<T> {
    success: true;
    data: T;
    message?: string;
    meta?: PaginationMeta;
}

// API Request Status
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

// API Hook Return Type
export interface ApiHookState<T = any> {
    data: T | null;
    loading: boolean;
    error: string | null;
    status: ApiStatus;
}

// Specific API Response Types
export type ProductsApiResponse = ApiResponse<Product[]>;
export type StoresApiResponse = ApiResponse<Store[]>;
export type EmployeesApiResponse = ApiResponse<Employee[]>;
export type SalesApiResponse = ApiResponse<Sale[]>;
export type InventoryApiResponse = ApiResponse<Inventory[]>;

// Import these types (they'll be defined in their respective files)
import { Product } from './products';
import { Store } from './store';
import { Employee } from './employees';
import { Sale } from './sales';
import { Inventory } from './inventory';
import { ProductType, Role, SortOrder } from './enums';

export interface ProductFilters {
    storeId?: string;
    type?: ProductType;
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface StoreFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface EmployeeFilters {
    storeId?: string;
    role?: Role;
    position?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: SortOrder;
}
// types/ui-filters.ts
import {
    ProductType,
    ProductGrade,
    TireCategory,
    TireUsage
} from '@/types'

export interface ProductUIFilters {
    search?: string
    type?: ProductType | 'ALL'
    grade?: ProductGrade | 'ALL'

    tireCategory?: TireCategory | 'ALL'
    tireUsage?: TireUsage | 'ALL'

    priceRange?: {
        min?: number
        max?: number
    }

    inStock?: boolean
    storeId?: string

    page?: number
    limit?: number
}

import { SortOrder } from "./enums";

export interface BaseFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface DateRangeFilter {
    startDate?: Date | string;
    endDate?: Date | string;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface FilterOption {
    label: string;
    value: string;
    count?: number;
    disabled?: boolean;
}

export interface FilterGroup {
    id: string;
    label: string;
    options: FilterOption[];
    type: 'single' | 'multiple' | 'range';
}

export interface RangeFilter {
    min?: number;
    max?: number;
}

export interface PriceRangeFilter extends RangeFilter {
    currency?: string;
}

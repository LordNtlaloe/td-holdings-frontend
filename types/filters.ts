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

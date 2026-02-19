// utils/mapUiFiltersToProductFilters.ts
import { ProductFilters } from '@/types'
import { ProductUIFilters } from '@/types/filters'

export function mapUiFiltersToProductFilters(
    ui: ProductUIFilters
): ProductFilters {
    const filters: ProductFilters = {}

    if (ui.search) filters.search = ui.search
    if (ui.page) filters.page = ui.page
    if (ui.limit) filters.limit = ui.limit

    if (ui.type && ui.type !== 'ALL') {
        filters.type = ui.type
    }

    if (ui.grade && ui.grade !== 'ALL') {
        filters.grade = ui.grade
    }

    if (ui.tireCategory && ui.tireCategory !== 'ALL') {
        filters.tireCategory = ui.tireCategory
    }

    if (ui.tireUsage && ui.tireUsage !== 'ALL') {
        filters.tireUsage = ui.tireUsage
    }

    if (ui.priceRange?.min !== undefined) {
        filters.minPrice = ui.priceRange.min
    }

    if (ui.priceRange?.max !== undefined) {
        filters.maxPrice = ui.priceRange.max
    }

    if (ui.inStock) {
        filters.inStock = true
    }

    if (ui.storeId) {
        filters.storeId = ui.storeId
    }

    return filters
}

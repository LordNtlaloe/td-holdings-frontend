import * as z from "zod";
import {
    ProductTypeSchema,
    ProductGradeSchema,
    TireCategorySchema,
    TireUsageSchema
} from "../enums";

// Common validators
export const nameValidator = z.string()
    .min(1, 'Product name is required')
    .max(200, 'Product name is too long');

export const priceValidator = z.number()
    .min(0, 'Price must be positive')
    .max(1000000, 'Price is too high');

export const quantityValidator = z.number()
    .int()
    .min(0, 'Quantity must be non-negative');

export const storeIdValidator = z.string()
    .min(1, 'Store selection is required');

// Shared field schemas
export const commonFieldsSchema = z.object({
    name: nameValidator,
    price: priceValidator,
    quantity: quantityValidator,
    type: ProductTypeSchema,
    grade: ProductGradeSchema,
    storeId: storeIdValidator,
});

export const optionalFieldsSchema = z.object({
    commodity: z.string()
        .max(100, 'Commodity is too long')
        .optional(),
});
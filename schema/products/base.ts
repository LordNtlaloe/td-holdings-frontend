import * as z from "zod";
import { commonFieldsSchema, optionalFieldsSchema } from "./shared";
import { tireFieldsSchema } from "./tire";
import { baleFieldsSchema } from "./bale";

// Base product schema with all possible fields
export const BaseProductSchema = commonFieldsSchema
    .merge(optionalFieldsSchema)
    .merge(tireFieldsSchema.partial())
    .merge(baleFieldsSchema.partial());

// Full product schema with conditional validation
export const ProductSchema = BaseProductSchema.superRefine((data, ctx) => {
    if (data.type === 'TIRE') {
        if (!data.tireCategory) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Tire category is required',
                path: ['tireCategory'],
            });
        }
        if (!data.tireUsage) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Tire usage is required',
                path: ['tireUsage'],
            });
        }
        if (!data.tireSize) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Tire size is required',
                path: ['tireSize'],
            });
        }
    } else if (data.type === 'BALE') {
        if (!data.baleWeight) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Bale weight is required',
                path: ['baleWeight'],
            });
        }
        if (!data.baleCategory) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Bale category is required',
                path: ['baleCategory'],
            });
        }
        if (!data.originCountry) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Origin country is required',
                path: ['originCountry'],
            });
        }
    }
});

// Update product schema (all fields optional)
export const UpdateProductSchema = BaseProductSchema.partial();

// Quantity update schema
export const QuantityUpdateSchema = z.object({
    quantity: z.number().int().min(0, 'Quantity must be non-negative'),
    operation: z.enum(['SET', 'ADD', 'SUBTRACT']).default('SET'),
});

export type ProductFormValues = z.infer<typeof ProductSchema>;
export type UpdateProductValues = z.infer<typeof UpdateProductSchema>;
export type QuantityUpdateValues = z.infer<typeof QuantityUpdateSchema>;
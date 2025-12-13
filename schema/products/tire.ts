import * as z from "zod";
import { TireCategorySchema, TireUsageSchema } from "../enums";

export const tireFieldsSchema = z.object({
    tireCategory: TireCategorySchema,
    tireUsage: TireUsageSchema,
    tireSize: z.string()
        .min(1, 'Tire size is required')
        .max(50, 'Tire size is too long'),
    loadIndex: z.string()
        .max(10, 'Load index is too long')
        .optional(),
    speedRating: z.string()
        .max(5, 'Speed rating is too long')
        .optional(),
    warrantyPeriod: z.string()
        .max(50, 'Warranty period is too long')
        .optional(),
});

export const tireValidationSchema = tireFieldsSchema.superRefine((data, ctx) => {
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
});
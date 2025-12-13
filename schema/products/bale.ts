import * as z from "zod";

export const baleFieldsSchema = z.object({
    baleWeight: z.number()
        .min(0, 'Bale weight must be positive')
        .max(10000, 'Bale weight is too high'),
    baleCategory: z.string()
        .min(1, 'Bale category is required')
        .max(100, 'Bale category is too long'),
    originCountry: z.string()
        .min(1, 'Origin country is required')
        .max(50, 'Origin country name is too long'),
    importDate: z.date().optional(),
    baleCount: z.number()
        .int()
        .min(1, 'Bale count must be at least 1')
        .optional(),
});

export const baleValidationSchema = baleFieldsSchema.superRefine((data, ctx) => {
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
});
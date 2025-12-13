import * as z from "zod";

export const RoleSchema = z.enum(['ADMIN', 'MANAGER', 'CASHIER']);
export type Role = z.infer<typeof RoleSchema>;

export const ProductTypeSchema = z.enum(['TIRE', 'BALE']);
export type ProductType = z.infer<typeof ProductTypeSchema>;

export const TireCategorySchema = z.enum(['NEW', 'SECOND_HAND']);
export type TireCategory = z.infer<typeof TireCategorySchema>;

export const TireUsageSchema = z.enum(['FOUR_BY_FOUR', 'REGULAR', 'TRUCK']);
export type TireUsage = z.infer<typeof TireUsageSchema>;

export const ProductGradeSchema = z.enum(['A', 'B', 'C']);
export type ProductGrade = z.infer<typeof ProductGradeSchema>;

export const QuantityOperationSchema = z.enum(['SET', 'ADD', 'SUBTRACT']);
export type QuantityOperation = z.infer<typeof QuantityOperationSchema>;
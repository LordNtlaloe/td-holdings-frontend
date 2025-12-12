// schemas.ts
import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});

export const SignUpSchema = z.object({
    first_name: z.string().min(1, {
        message: "First name is required",
    }),
    last_name: z.string().min(1, {
        message: "Last name is required",
    }),
    phone_number: z.string().optional(),
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER']),
});

export const StoreSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100, "Store name is too long"),
  location: z.string().min(1, "Location is required").max(200, "Location is too long"),
});

export type StoreFormValues = z.infer<typeof StoreSchema>;


export const ProductType = z.enum(['TIRE', 'BALE']);
export type ProductType = z.infer<typeof ProductType>;

export const ProductGrade = z.enum(['A', 'B', 'C']);
export type ProductGrade = z.infer<typeof ProductGrade>;

// Base product schema with all possible fields
export const BaseProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  type: ProductType,
  grade: ProductGrade,
  commodity: z.string().min(1, 'Commodity is required').max(100),
  storeId: z.string().optional(),
  
  // Tire fields (optional for base)
  tireCategory: z.string().optional(),
  tireUsage: z.string().optional(),
  tireSize: z.string().optional(),
  loadIndex: z.string().optional(),
  speedRating: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  
  // Bale fields (optional for base)
  baleWeight: z.number().min(0, 'Bale weight must be positive').optional(),
  baleCategory: z.string().optional(),
  originCountry: z.string().optional(),
  importDate: z.date().optional(),
  baleCount: z.number().int().min(1).optional(),
});

// Tire-specific validation schema (extends base)
const TireProductSchema = BaseProductSchema.extend({
  type: z.literal('TIRE'),
  tireCategory: z.string().min(1, 'Tire category is required'),
  tireUsage: z.string().min(1, 'Tire usage is required'),
  tireSize: z.string().min(1, 'Tire size is required'),
});

// Bale-specific validation schema (extends base)
const BaleProductSchema = BaseProductSchema.extend({
  type: z.literal('BALE'),
  baleWeight: z.number().min(0, 'Bale weight must be positive'),
  baleCategory: z.string().min(1, 'Bale category is required'),
  originCountry: z.string().min(1, 'Origin country is required'),
});

// Combined product schema for runtime validation
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

export type ProductFormValues = z.infer<typeof ProductSchema>;

// Update product schema (all fields optional)
export const UpdateProductSchema = BaseProductSchema.partial();
export type UpdateProductValues = z.infer<typeof UpdateProductSchema>;

// Quantity update schema
export const QuantityUpdateSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  operation: z.enum(['SET', 'ADD', 'SUBTRACT']).default('SET'),
});

export type QuantityUpdateValues = z.infer<typeof QuantityUpdateSchema>;

// Transfer product schema
export const TransferProductSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  fromStoreId: z.string().min(1, 'Source store ID is required'),
  toStoreId: z.string().min(1, 'Destination store ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type TransferProductValues = z.infer<typeof TransferProductSchema>;
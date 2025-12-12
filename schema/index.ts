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
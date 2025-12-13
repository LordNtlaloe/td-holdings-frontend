import * as z from "zod";
import { RoleSchema } from "./enums";
import { SignUpSchema } from ".";

export const EmployeeSchema = z.object({
    // User fields
    user: SignUpSchema,

    role: RoleSchema,

    // Employee-specific field
    position: z.string()
        .min(1, 'Position is required')
        .max(50, 'Position is too long'),

    // Store relationship
    storeId: z.string()
        .min(1, 'Store selection is required'),

    // Password for new users only
    password: z.string()
        .min(6, 'Password must be at least 6 characters')
        .optional(),
});

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>;
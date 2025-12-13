import * as z from "zod";

export const StoreSchema = z.object({
    name: z.string()
        .min(1, "Store name is required")
        .max(100, "Store name is too long"),
    location: z.string()
        .min(1, "Location is required")
        .max(200, "Location is too long"),
    phone_number: z.string()
        .min(1, "Phone Number Is Required")
        .max(15, "Phone Number Too Long"),
    email: z.string()
        .min(1, "Email Is Requied")
        .max(100, "Email To Long")
        .optional()
});

export type StoreFormValues = z.infer<typeof StoreSchema>;
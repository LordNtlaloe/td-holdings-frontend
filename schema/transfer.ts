import * as z from "zod";

export const TransferProductSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    fromStoreId: z.string().min(1, 'Source store ID is required'),
    toStoreId: z.string().min(1, 'Destination store ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type TransferProductValues = z.infer<typeof TransferProductSchema>;
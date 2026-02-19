'use client';

import { Product } from "@/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./products-form";
import { transformProductToFormData, transformStoresForForm } from "@/utils/product-transformers";

interface EditProductDialogProps {
    product: Product | null;
    stores: any[];
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: any) => Promise<void>;
}

export const EditProductDialog = ({
    product,
    stores,
    isOpen,
    onOpenChange,
    onSubmit,
}: EditProductDialogProps) => {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                    <DialogDescription>
                        Update product information
                    </DialogDescription>
                </DialogHeader>
                <ProductForm
                    mode="edit"
                    product={transformProductToFormData(product)}
                    stores={transformStoresForForm(stores)}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
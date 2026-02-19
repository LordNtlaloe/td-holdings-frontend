'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ProductForm } from "./products-form";

interface CreateProductDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    stores: any[];
    onSubmit: (data: any) => Promise<void>;
}

export const CreateProductDialog = ({
    isOpen,
    onOpenChange,
    stores,
    onSubmit,
}: CreateProductDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Add a new product to your catalog
                    </DialogDescription>
                </DialogHeader>
                <ProductForm
                    mode="create"
                    stores={stores}
                    onSubmit={onSubmit}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
};
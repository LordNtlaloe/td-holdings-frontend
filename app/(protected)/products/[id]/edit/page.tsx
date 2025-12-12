// app/(dashboard)/products/[id]/edit/page.tsx
import ProductForm from "@/components/dashboard/products/products-form"
import { Metadata } from "next";

interface EditProductPageProps {
    params: {
        id: string;
    };
}

export const metadata: Metadata = {
  title: "Edit Product",
  description: "Update Product Information",
};

export default async function EditProductPage({ params }: EditProductPageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <ProductForm productId={id} mode="edit" />
        </div>
    );
}
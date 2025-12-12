// app/(dashboard)/products/new/page.tsx
import ProductForm from '@/components/dashboard/products/products-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Add New Product",
    description: "Create New Product Page",
};

export default function CreateProductPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <ProductForm mode="create" />
        </div>
    );
}
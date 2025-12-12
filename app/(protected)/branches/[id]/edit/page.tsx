// app/(dashboard)/stores/[id]/edit/page.tsx

import StoreForm from "@/components/dashboard/stores/stores-form";
import { Metadata } from "next";

interface EditStorePageProps {
    params: {
        id: string;
    };
}

export const metadata: Metadata = {
  title: "Edit/Update Existing Branch",
  description: "Update Current Branch Page",
};


export default async function EditStorePage({ params }: EditStorePageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <StoreForm storeId={id} mode="edit" />
        </div>
    );
}
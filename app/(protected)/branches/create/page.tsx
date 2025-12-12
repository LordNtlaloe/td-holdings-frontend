import { Metadata } from 'next';

import StoreForm from '@/components/dashboard/stores/stores-form';

export const metadata: Metadata = {
  title: "Add New Branch",
  description: "Create New Branch Page",
};

export default function CreateStorePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <StoreForm mode="create" />
        </div>
    );
}
import { type PropsWithChildren } from 'react';
import { Metadata } from 'next';
import Heading from '@/components/general/heading';

export const metadata: Metadata = {
    title: 'Branches | Inventory Management',
    description: 'Manage your branches and locations',
};

export default function BranchesLayout({ children }: PropsWithChildren) {
    return (
        <div className="px-4 py-6 w-full max-w-full">
            <Heading
                title="Branches"
                description="Manage your branches and locations"
            />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 max-w-full w-full">
                <div className="flex-1 md:max-w-7xl lg:max-w-full w-full max-w-full">
                    <section className="max-w-full space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
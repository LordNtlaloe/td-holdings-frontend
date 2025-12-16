// app/(dashboard)/employees/layout.tsx
import { type PropsWithChildren } from 'react';
import Heading from '@/components/general/heading';

export default function EmployeesLayout({ children }: PropsWithChildren) {
    return (
        <div className="px-4 py-6">
            <Heading title="Employees" description="Manage your employees" />

            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}
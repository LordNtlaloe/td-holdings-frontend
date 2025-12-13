// app/(dashboard)/employees/create/page.tsx
import EmployeeForm from '@/components/dashboard/employee/employees-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Add New Employee",
    description: "Create New Employee Page",
};

export default function CreateEmployeePage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <EmployeeForm mode="create" />
        </div>
    );
}
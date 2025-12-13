// app/(dashboard)/employees/[id]/edit/page.tsx

import EmployeeForm from "@/components/dashboard/employee/employees-form";
import { Metadata } from "next";

interface EditEmployeePageProps {
    params: {
        id: string;
    };
}

export const metadata: Metadata = {
    title: "Edit Employee",
    description: "Update Employee Information",
};

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
    const { id } = await params;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <EmployeeForm employeeId={id} mode="edit" />
        </div>
    );
}
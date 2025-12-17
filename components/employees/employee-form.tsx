'use client';

import { useState, useEffect } from 'react';
import { Employee, Store, User } from '@/types';
import {
    createEmployeeSchema,
    updateEmployeeSchema,
    transferEmployeeSchema,
    performanceReviewSchema
} from '@/lib/validations/employee';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { joiResolver } from '@hookform/resolvers/joi';
import {
    Loader2,
    Save,
    X,
    UserPlus,
    ArrowRightLeft,
    Star,
} from 'lucide-react';
import { PerformanceReviewForm } from './forms/employee-performance-form';
import { CreateEmployeeForm } from './forms/employees-create-form';
import { EditEmployeeForm } from './forms/employees-edit-form';
import { TransferEmployeeForm } from './forms/employees-transfer-form';

interface BaseFormProps {
    onSubmit: (data: any) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
}

// Create Employee Form
export interface CreateEmployeeFormProps extends BaseFormProps {
    mode: 'create';
    stores?: Store[];
    users?: User[];
}

// Update Employee Form
export interface UpdateEmployeeFormProps extends BaseFormProps {
    mode: 'edit';
    employee: Employee;
}

// Transfer Employee Form
export interface TransferEmployeeFormProps extends BaseFormProps {
    mode: 'transfer';
    employee?: Employee;
    stores?: Store[];
}

// Performance Review Form
export interface PerformanceReviewFormProps extends BaseFormProps {
    mode: 'review';
    employee?: Employee;
}

export type EmployeeFormProps =
    | CreateEmployeeFormProps
    | UpdateEmployeeFormProps
    | TransferEmployeeFormProps
    | PerformanceReviewFormProps;

export function EmployeeForm(props: EmployeeFormProps) {
    const { mode, onSubmit, onCancel, isLoading = false } = props;

    const getSchema = () => {
        switch (mode) {
            case 'create': return createEmployeeSchema;
            case 'edit': return updateEmployeeSchema;
            case 'transfer': return transferEmployeeSchema;
            case 'review': return performanceReviewSchema;
            default: return createEmployeeSchema;
        }
    };

    const getDefaultValues = () => {
        switch (mode) {
            case 'edit':
                const employee = (props as UpdateEmployeeFormProps).employee;
                return {
                    position: employee.position,
                    role: employee.role,
                    status: employee.status,
                    terminationDate: employee.terminationDate || ''
                };
            case 'transfer':
                return {
                    newStoreId: '',
                    reason: ''
                };
            case 'review':
                return {
                    period: 'QUARTERLY',
                    score: 80,
                    feedback: '',
                    goals: [''],
                    strengths: [''],
                    areasForImprovement: ['']
                };
            default:
                return {
                    userId: '',
                    storeId: '',
                    position: '',
                    role: 'CASHIER',
                    hireDate: new Date().toISOString().split('T')[0]
                };
        }
    };

    const form = useForm<any>({
        resolver: joiResolver(getSchema()),
        defaultValues: getDefaultValues(),
    });

    // Reset form when mode changes
    useEffect(() => {
        form.reset(getDefaultValues());
    }, [mode, props]);

    const handleSubmit = async (data: any) => {
        try {
            await onSubmit(data);
            form.reset(getDefaultValues());
        } catch (error: any) {
            console.error('Form submission error:', error);
        }
    };

    const getTitle = () => {
        switch (mode) {
            case 'create': return 'Add New Employee';
            case 'edit': return 'Edit Employee';
            case 'transfer': return 'Transfer Employee';
            case 'review': return 'Performance Review';
            default: return 'Employee Form';
        }
    };

    const getDescription = () => {
        switch (mode) {
            case 'create': return 'Add a new employee to your workforce';
            case 'edit': return 'Update employee information';
            case 'transfer': return 'Transfer employee to another store';
            case 'review': return 'Record employee performance review';
            default: return '';
        }
    };

    const renderFormContent = () => {
        switch (mode) {
            case 'create':
                return (
                    <CreateEmployeeForm
                        control={form.control}
                        stores={(props as CreateEmployeeFormProps).stores}
                        users={(props as CreateEmployeeFormProps).users}
                    />
                );
            case 'edit':
                return <EditEmployeeForm control={form.control} />;
            case 'transfer':
                return (
                    <TransferEmployeeForm
                        control={form.control}
                        employee={(props as TransferEmployeeFormProps).employee}
                        stores={(props as TransferEmployeeFormProps).stores}
                    />
                );
            case 'review':
                return (
                    <PerformanceReviewForm
                        control={form.control}
                        employee={(props as PerformanceReviewFormProps).employee}
                    />
                );
            default:
                return null;
        }
    };

    const getSubmitIcon = () => {
        switch (mode) {
            case 'create': return <UserPlus className="h-4 w-4 mr-2" />;
            case 'edit': return <Save className="h-4 w-4 mr-2" />;
            case 'transfer': return <ArrowRightLeft className="h-4 w-4 mr-2" />;
            case 'review': return <Star className="h-4 w-4 mr-2" />;
            default: return <Save className="h-4 w-4 mr-2" />;
        }
    };

    const getSubmitText = () => {
        switch (mode) {
            case 'create': return 'Create Employee';
            case 'edit': return 'Save Changes';
            case 'transfer': return 'Transfer Employee';
            case 'review': return 'Submit Review';
            default: return 'Submit';
        }
    };

    const getLoadingText = () => {
        switch (mode) {
            case 'create': return 'Creating...';
            case 'edit': return 'Saving...';
            case 'transfer': return 'Transferring...';
            case 'review': return 'Submitting...';
            default: return 'Submitting...';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{getTitle()}</CardTitle>
                <CardDescription>{getDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            {renderFormContent()}
                        </div>

                        <div className="flex justify-end gap-3">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {getLoadingText()}
                                    </>
                                ) : (
                                    <>
                                        {getSubmitIcon()}
                                        {getSubmitText()}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
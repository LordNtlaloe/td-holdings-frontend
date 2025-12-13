// components/dashboard/employees/employee-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ArrowLeft, Upload, User } from 'lucide-react';
import { EmployeeSchema } from '@/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  getEmployeeById,
  updateEmployee,
  createEmployee,
  deleteEmployee,
  uploadEmployeePhoto
} from '@/lib/employee-api';
import { getAllStores } from '@/lib/store-api';
import { CustomAlert } from '@/components/ui/custom-alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmployeeFormProps {
  employeeId?: string;
  mode?: 'create' | 'edit';
}

export default function EmployeeForm({ employeeId, mode = 'create' }: EmployeeFormProps) {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!employeeId);
  const [fetchingStores, setFetchingStores] = useState(true);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const router = useRouter();

  let EmployeeFormData = EmployeeSchema;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      role: 'CASHIER',
      storeId: '',
      password: '',
    },
  });

  // Fetch stores
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setFetchingStores(true);
        const storesData = await getAllStores();
        setStores(storesData);
      } catch (error) {
        console.error('Failed to load stores:', error);
        setAlert({
          type: "error",
          message: "Failed to load stores. Please refresh the page."
        });
      } finally {
        setFetchingStores(false);
      }
    };

    fetchStores();
  }, []);

  // Fetch employee data if in edit mode
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId || mode !== 'edit') {
        setFetching(false);
        return;
      }

      try {
        setFetching(true);
        const result = await getEmployeeById(employeeId);

        if (result.success && result.data) {
          const employee = result.data;
          form.reset({
            first_name: employee?.user?.firstName,
            last_name: employee?.user?.lastName,
            email: employee.user?.email || '',
            phone_number: employee?.user?.phoneNumber,
            role: employee.user?.role || 'CASHIER',
            storeId: employee.storeId || '',
            password: '', // Don't show password in edit mode
          });

          // Set photo preview if available
          if (employee.user?.avatar) {
            setPhotoPreview(employee.user.avatar);
          }
        } else {
          setAlert({
            type: "error",
            message: result.error || "Failed to load employee data"
          });
          setTimeout(() => router.push('/employees'), 3000);
        }
      } catch (err) {
        setAlert({
          type: "error",
          message: `Failed to load employee data: ${err instanceof Error ? err.message : String(err)}`
        });
        setTimeout(() => router.push('/employees'), 3000);
      } finally {
        setFetching(false);
      }
    };

    if (employeeId && mode === 'edit') {
      fetchEmployeeData();
    } else {
      setFetching(false);
    }
  }, [employeeId, mode, form, router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setLoading(true);
      setAlert(null);

      // Prepare data for API
      const apiData = {
        ...data,
        // Ensure phone_number is sent if phone is empty
        phone_number: data.phone_number || '',
      };

      let result;

      if (employeeId && mode === 'edit') {
        // For edit, don't include password if it's empty
        const { password, ...updateData } = apiData;
        if (!password) {
          result = await updateEmployee(employeeId, updateData);
        } else {
          result = await updateEmployee(employeeId, apiData);
        }
      } else {
        // For create, ensure password is included
        if (!apiData.password) {
          setAlert({
            type: "error",
            message: "Password is required for new employees"
          });
          setLoading(false);
          return;
        }
        result = await createEmployee(apiData);
      }

      if (result.success) {
        const successMessage = employeeId
          ? "Employee updated successfully!"
          : "Employee created successfully!";

        setAlert({ type: "success", message: successMessage });

        // Redirect after success
        setTimeout(() => {
          router.push('/employees');
          router.refresh();
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: result.error || "An error occurred"
        });
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);
      const result = await deleteEmployee(employeeId);

      if (result.success) {
        setAlert({ type: "success", message: "Employee deleted successfully!" });
        setTimeout(() => {
          router.push("/employees");
          router.refresh();
        }, 1500);
      } else {
        setAlert({ type: "error", message: result.error || "Delete failed" });
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setAlert({
        type: "error",
        message: `Delete failed: ${err instanceof Error ? err.message : String(err)}`
      });
      setShowDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Loading skeleton
  if (fetching || fetchingStores) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>

        <div className="border rounded-lg p-6 space-y-6">
          {/* Basic Information Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {employeeId ? 'Edit Employee' : 'Create New Employee'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {employeeId
              ? 'Update employee information'
              : 'Add a new employee to your team'
            }
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-6 bg-white shadow-sm space-y-8">
            {/* Photo Upload Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(
                      form.getValues('first_name') || 'E',
                      form.getValues('last_name') || 'E'
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="employee-photo"
                    disabled={uploadingPhoto}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('employee-photo')?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {photoFile ? 'Change Photo' : 'Upload Photo'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG up to 2MB
                </p>
              </div>

              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Upload a professional photo for the employee profile. This will be used for identification and system access.
                </p>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter first name"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter last name"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="employee@example.com"
                          disabled={loading || mode === 'edit'}
                        />
                      </FormControl>
                      <FormDescription>
                        {mode === 'create' ? 'Will be used for login' : 'Cannot be changed'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="+1234567890"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password (only for create mode) */}
                {mode === 'create' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Enter password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Must be at least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Password (optional for edit mode) */}
                {mode === 'edit' && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            {...field}
                            placeholder="Leave blank to keep current password"
                            disabled={loading}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter new password to change it
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Role */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Role *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASHIER">Cashier</SelectItem>
                          <SelectItem value="MANAGER">Manager</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Determines system access permissions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Store */}
                <FormField
                  control={form.control}
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Store *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue={field.value}
                        disabled={loading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name} ({store.location})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={loading || uploadingPhoto}
                className="min-w-32"
              >
                {loading && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                {employeeId ? "Update Employee" : "Create Employee"}
              </Button>

              {employeeId && mode === 'edit' && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={loading}
                      className="min-w-32"
                    >
                      Delete Employee
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete
                        this employee and remove all associated data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={loading}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {loading ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Employee'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
          autoClose={true}
          autoCloseDuration={5000}
        />
      )}
    </div>
  );
}
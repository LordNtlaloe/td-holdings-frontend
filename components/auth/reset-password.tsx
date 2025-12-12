"use client"
import React, { useState } from 'react'
import CardWrapper from '@/components/general/card-wrapper'
import { useForm } from 'react-hook-form'
import FormErrors from '@/components/general/form-error'
import FormSuccess from '@/components/general/form-success'
import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSearchParams, useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Define schema inline or import from your schemas
const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
    confirmPassword: z.string().min(6, {
        message: "Please confirm your password",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")
    const email = searchParams.get("email")

    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            // Check if we have token and email (needed for your Express controller)
            if (!token || !email) {
                setError("Invalid reset link. Please request a new password reset.");
                return;
            }

            // Call your API route for reset password
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    token: token,
                    newPassword: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to reset password');
                return;
            }

            setSuccess(data.message || "Password reset successfully! You can now log in.");

            // Clear form
            form.reset();

            // Redirect to login after successful reset
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err) {
            console.error("Reset password error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div>
            <CardWrapper
                headerLabel='Enter Your New Password'
                backButtonLabel='Back To Login'
                backButtonHref="/login"
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <div className="space-y-4">
                            {(!token || !email) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                    <p className="text-yellow-800 text-sm">
                                        {!token && !email
                                            ? "Invalid reset link. Missing token and email."
                                            : !token
                                                ? "Invalid reset link. Missing token."
                                                : "Invalid reset link. Missing email."
                                        }
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        Please make sure you're using the correct reset link from your email.
                                    </p>
                                </div>
                            )}

                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='*********'
                                                type='password'
                                                disabled={isPending || !token || !email}
                                                autoComplete="new-password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name='confirmPassword'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='*********'
                                                type='password'
                                                disabled={isPending || !token || !email}
                                                autoComplete="new-password"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormErrors message={error} />
                        <FormSuccess message={success} />

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isPending || !token || !email}
                        >
                            {isPending ? "Resetting Password..." : "Reset Your Password"}
                        </Button>
                    </form>
                </Form>

                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Enter a new password to complete the reset process
                    </p>

                    {(!token || !email) && (
                        <div className="mt-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push('/forgot-password')}
                                className="w-full"
                            >
                                Request New Reset Link
                            </Button>
                        </div>
                    )}
                </div>
            </CardWrapper>
        </div>
    )
}
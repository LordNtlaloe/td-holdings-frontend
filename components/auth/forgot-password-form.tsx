"use client"
import React, { useState } from 'react'
import CardWrapper from '../general/card-wrapper'
import { useForm } from 'react-hook-form'
import FormErrors from '../general/form-error'
import FormSuccess from '../general/form-success'
import { Button } from '../ui/button'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '../ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { useRouter } from 'next/navigation'

// Define schema inline or import from your schemas
const PasswordResetSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
});

export default function ResetPasswordForm() {
    const router = useRouter()
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false)

    const form = useForm<z.infer<typeof PasswordResetSchema>>({
        resolver: zodResolver(PasswordResetSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = async (values: z.infer<typeof PasswordResetSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            // Call your API route for forgot password
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: values.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error response
                setError(data.error || 'Failed to send reset email');
                return;
            }

            // Success - show message even if user doesn't exist (security best practice)
            setSuccess(data.message || "If an account exists with this email, you will receive a reset link.");

            // Clear form on success
            form.reset();

            // Optional: Redirect to login after a delay
            setTimeout(() => {
                router.push('/sign-in');
            }, 5000);

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
                headerLabel='Forgot Your Password?'
                backButtonLabel='Back To Login'
                backButtonHref="/sign-in" // Updated to /sign-in
            >
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder='your.name@example.com'
                                                type='email'
                                                disabled={isPending}
                                                autoComplete="email"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="text-sm text-muted-foreground">
                            <p>Enter your email address and we'll send you a link to reset your password.</p>
                        </div>

                        <FormErrors message={error} />
                        <FormSuccess message={success} />

                        <Button
                            type='submit'
                            className='w-full'
                            disabled={isPending}
                        >
                            {isPending ? "Sending Email..." : "Send Reset Email"}
                        </Button>
                    </form>
                </Form>
            </CardWrapper>
        </div>
    )
}
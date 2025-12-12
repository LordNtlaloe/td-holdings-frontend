"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import CardWrapper from '../general/card-wrapper'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { SignUpSchema } from '@/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FormErrors from '../general/form-error';
import FormSuccess from '../general/form-success';

export default function SignUpForm() {
    const router = useRouter()
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false)

    // Fix: Explicitly type the form with z.infer
    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            phone_number: "",
            email: "",
            password: "",
            role: "CASHIER"
        }
    });

    // Cast the values explicitly
    const onSubmit = async (values: z.infer<typeof SignUpSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            // Transform data to match your Express controller's expected format
            const registerData = {
                firstName: values.first_name,
                lastName: values.last_name,
                email: values.email,
                password: values.password,
                phoneNumber: values.phone_number || '',
                role: values.role || 'CASHIER',
            };

            // Call your Next.js API route which forwards to Express
            const response = await fetch("/api/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle error response
                setError(data.error || 'Registration failed');
                return;
            }

            // Success response from your controller
            setSuccess(data.message || "Account created successfully! Please check your email for verification.");

            // Clear form on success
            form.reset();

            // Optional: Redirect to login after successful registration
            setTimeout(() => {
                router.push('/login');
            }, 3000);

        } catch (err) {
            console.error("Signup error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <CardWrapper
            headerLabel={'Create Account'}
            backButtonLabel={"Already Have An Account?"}
            backButtonHref={'/sign-in'}
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name='first_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='John'
                                            type='text'
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='last_name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='Doe'
                                            type='text'
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='phone_number'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='+266 5800 0000'
                                            type='tel'
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='john.doe@example.com'
                                            type='email'
                                            disabled={isPending}
                                            autoComplete="email"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='password'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder='*********'
                                            type='password'
                                            disabled={isPending}
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
                        disabled={isPending}
                    >
                        {isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                </form>
                <div className="text-muted-foreground text-center text-sm mt-2">
                    Already have an account?{" "}
                    <a href="/sign-in" className="text-primary hover:underline">
                        Sign in
                    </a>
                </div>
            </Form>
        </CardWrapper>
    )
}
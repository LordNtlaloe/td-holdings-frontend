"use client"
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import * as z from "zod";
import { LoginSchema } from '@/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import FormErrors from '@/components/general/form-error';
import FormSuccess from '@/components/general/form-success';
import TextLink from '@/components/general/text-link';
import { useSearchParams, useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import CardWrapper from '../general/card-wrapper';
import { useAuth } from '@/context/AuthContext';

// Extended schema to include remember field
const ExtendedLoginSchema = LoginSchema.extend({
    remember: z.boolean().optional()
});

export default function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth();
    const urlError = searchParams?.get("error") === "OAuthAccountNotLinked" ? "Email Already In Use With Different Provider" : "";
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, setIsPending] = useState(false);

    const form = useForm<z.infer<typeof ExtendedLoginSchema>>({
        resolver: zodResolver(ExtendedLoginSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false
        }
    });

    const onSubmit = async (values: z.infer<typeof ExtendedLoginSchema>) => {
        setError("");
        setSuccess("");
        setIsPending(true);

        try {
            // Use the auth context login method
            await login(values.email, values.password);

            setSuccess("Login successful!");

            // Optional: Handle "remember me"
            if (values.remember) {
                // You could extend token expiration here
                console.log('Remember me enabled');
                // If you want to implement longer token expiration,
                // you could modify the login API call to accept a remember parameter
            }

            // The redirect is handled by the AuthProvider
            // No need to manually redirect here
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || "An unexpected error occurred");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <CardWrapper headerLabel={'Sign In'} backButtonLabel={''} backButtonHref={''}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name='email'
                            render={({ field }) => (
                                <FormItem className="grid gap-2">
                                    <FormLabel htmlFor="email">Email address</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@example.com"
                                            disabled={isPending}
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
                                <FormItem className="grid gap-2">
                                    <div className="flex items-center">
                                        <FormLabel htmlFor="password">Password</FormLabel>
                                        <TextLink href="/forgot-password" className="ml-auto text-sm" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    </div>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <FormMessage className='mt-2' />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='remember'
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-3">
                                    <FormControl>
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            tabIndex={3}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <Label htmlFor="remember" className="text-sm font-normal">
                                        Remember me
                                    </Label>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={isPending}>
                            {isPending && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                            {isPending ? "Signing In..." : "Log in"}
                        </Button>
                    </div>

                    <div className="text-muted-foreground text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <TextLink href="/sign-up" tabIndex={5}>
                            Sign up
                        </TextLink>
                    </div>
                </form>
            </Form>

            {/* Error and Success Messages */}
            <FormErrors message={error || urlError} />
            <FormSuccess message={success} />
        </CardWrapper>
    );
}
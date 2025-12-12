// app/login/page.tsx
import LoginForm from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Login - TD Holdings Inventory System",
    description: "Sign in to your account",
}

export default function LoginPage() {
    return (
        // <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">TD Holdings Inventory Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your stores, products, and sales efficiently
                    </p>
                </div>

                <LoginForm />

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>
                        By continuing, you agree to our{" "}
                        <a href="/terms" className="text-primary hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </div>
        // </div>
    )
}
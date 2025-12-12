// app/register/page.tsx (if you prefer /register instead of /signup)
import SignUpForm from "@/components/auth/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Register - TD Holdings Inventory System",
    description: "Register for a new account",
}

export default function RegisterPage() {
    return (
        <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">TD Holdings Inventory Management</h1>
                <p className="text-muted-foreground mt-2">
                    Create your account to manage stores, products, and sales
                </p>
            </div>

            <SignUpForm />

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p className="mt-2">
                    By creating an account, you agree to our{" "}
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
    )
}
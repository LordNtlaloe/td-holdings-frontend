// app/verify-email/page.tsx
import VerificationForm from "@/components/auth/verify-email-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Verify Email - TD Holdings Inventory System",
    description: "Verify your email address to activate your account",
}

export default function VerifyEmailPage() {
    return (
        <div className="w-full max-w-lg">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold tracking-tight">TD Holdings Inventory Management</h1>
                <p className="text-muted-foreground mt-2">
                    Verify your email to activate your account
                </p>
            </div>

            <VerificationForm />

            <div className="mt-8 text-center text-sm text-muted-foreground">
                <p>
                    By verifying your email, you agree to our{" "}
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
"use client"
import CardWrapper from '@/components/general/card-wrapper'
import { BeatLoader } from "react-spinners"
import { useSearchParams, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import FormErrors from '@/components/general/form-error'
import FormSuccess from '@/components/general/form-success'
import { Button } from '@/components/ui/button'

export default function VerificationForm() {
    const router = useRouter()
    const [error, setError] = useState<string | undefined>()
    const [success, setSuccess] = useState<string | undefined>()
    const [isLoading, setIsLoading] = useState(true)

    const searchParams = useSearchParams()
    const token = searchParams?.get("token")
    const email = searchParams?.get("email")

    const onSubmit = useCallback(async () => {
        if (!token || !email) {
            setError(token ? "Missing email" : email ? "Missing verification token" : "Missing verification token and email")
            setIsLoading(false)
            return
        }

        try {
            setError(undefined)
            setSuccess(undefined)

            // Call your API route for email verification
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    code: token, // Note: your Express controller expects 'code', not 'token'
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Verification failed')
                return
            }

            setSuccess(data.message || "Email verified successfully!")

            // Auto-redirect to login after successful verification
            setTimeout(() => {
                router.push('/login')
            }, 3000)

        } catch (error) {
            console.error("Verification error:", error)
            setError("Something went wrong during verification. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }, [token, email, router])

    useEffect(() => {
        onSubmit()
    }, [onSubmit])

    const retryVerification = async () => {
        setIsLoading(true)
        setError(undefined)
        await onSubmit()
    }

    return (
        <CardWrapper
            headerLabel='Confirm Your Email'
            backButtonHref='/login'
            backButtonLabel='Go Back To Login'
        >
            <div className="flex items-center w-full justify-center flex-col space-y-4">
                {isLoading && (
                    <>
                        <BeatLoader />
                        <p className="text-sm text-muted-foreground">
                            Verifying your email...
                        </p>
                    </>
                )}

                {!isLoading && (
                    <>
                        <FormSuccess message={success} />
                        <FormErrors message={error} />

                        {success && (
                            <div className="text-center space-y-4">
                                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Your email has been verified! You will be redirected to login shortly.
                                </p>
                                <Button
                                    onClick={() => router.push('/login')}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Go to Login Now
                                </Button>
                            </div>
                        )}

                        {error && (
                            <div className="text-center space-y-4">
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Please try again or contact support if the problem persists.
                                    </p>

                                    {(!token || !email) && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                            <p className="text-yellow-800 text-sm">
                                                Invalid verification link. Please check your email for the correct link.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2 w-full">
                                    <Button
                                        onClick={retryVerification}
                                        variant="outline"
                                        className="w-full"
                                        disabled={!token || !email}
                                    >
                                        Retry Verification
                                    </Button>

                                    <Button
                                        onClick={() => router.push('/login')}
                                        variant="ghost"
                                        className="w-full"
                                    >
                                        Return to Login
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </CardWrapper>
    )
}
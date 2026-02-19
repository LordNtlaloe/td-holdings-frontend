import AppLogoIcon from "@/components/general/app-logo-icon";
import Link from "next/link";
import { type PropsWithChildren } from "react";

interface AuthLayoutProps {
    title?: string;
    description?: string;
    name?: string;
    quote?: {
        message: string;
        author: string;
    };
}

export default function AuthSplitLayout({
    children,
    title,
    description,
    name = "TD Holdings",
    quote,
}: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="relative grid h-dvh lg:grid-cols-2">
            {/* LEFT: Brand / Quote */}
            <div className="relative hidden h-full flex-col justify-between bg-zinc-900 p-10 text-white lg:flex">
                <Link href="/" className="z-20 flex items-center text-lg font-medium">
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {name}
                </Link>

                {quote && (
                    <blockquote className="z-20 max-w-md space-y-4 border-l-4 border-primary pl-6">
                        <p className="text-lg font-light leading-relaxed text-neutral-100">
                            “{quote.message}”
                        </p>
                        <footer className="text-sm text-neutral-400">
                            — {quote.author}
                        </footer>
                    </blockquote>
                )}

                {/* subtle background overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
            </div>

            {/* RIGHT: Auth content */}
            <div className="flex items-center justify-center px-8 lg:px-0">
                <div className="mx-auto flex w-full max-w-sm flex-col space-y-6">
                    {/* Mobile logo */}
                    <Link
                        href="/"
                        className="flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-black dark:text-white" />
                    </Link>

                    {(title || description) && (
                        <div className="space-y-1 text-left sm:text-center">
                            {title && (
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                            )}
                            {description && (
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}

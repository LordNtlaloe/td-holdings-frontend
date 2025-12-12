import AppLayout from "@/layouts/app-layout";

// import AuthSplitLayout from "@/layouts/auth/auth-split-layout";
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // <AuthSplitLayout>
        <AppLayout>
            {children}
        </AppLayout>
        // </AuthSplitLayout>
    )
}
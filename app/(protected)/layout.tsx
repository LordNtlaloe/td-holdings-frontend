// import AuthSplitLayout from "@/layouts/auth/auth-split-layout";
export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // <AuthSplitLayout>
        <div>
            {children}
        </div>
        // </AuthSplitLayout>
    )
}
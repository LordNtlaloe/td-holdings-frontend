import MainNav from "@/components/client/main-nav";
import Footer from "@/components/client/footer";
import { ReactNode } from "react";

interface AppLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: AppLayoutProps) {
    return (
        <div>
            <MainNav />
            <div>{children}</div>
            <Footer />
        </div>
    );
}
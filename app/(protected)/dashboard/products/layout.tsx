// app/(dashboard)/products/layout.tsx
import { type PropsWithChildren } from 'react';
import Heading from '@/components/general/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import StoreAPI from '@/lib/api/stores';
import { cookies } from 'next/headers';

interface Store {
    id: string;
    name: string;
    isMainStore: boolean;
}

async function getStores(): Promise<Store[]> {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return [];
        }

        const response = await StoreAPI.getStores(accessToken, { limit: 100 });
        return response.stores || [];
    } catch (error) {
        console.error('Failed to fetch stores:', error);
        return [];
    }
}

export default async function ProductsLayout({
    children
}: PropsWithChildren) {
    const stores = await getStores();

    // Check user role from cookies or token
    const cookieStore = await cookies();
    const userRole = cookieStore.get('userRole')?.value || 'USER';
    const isAdmin = userRole === 'ADMIN';

    return (
        <div className="px-4 py-6 w-full">
            <Heading
                title="Products"
                description="Manage products across branches"
            />

            <div className="flex flex-col lg:flex-row gap-6 mt-6 w-full">
                {/* Sidebar - Only show for admin users */}
                {isAdmin && (
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="sticky top-6 space-y-2">
                            <h3 className="font-semibold text-sm px-2">Filter by Store</h3>
                            <nav className="flex flex-col space-y-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className="w-full justify-start"
                                >
                                    <Link href="/products">All Products</Link>
                                </Button>

                                {stores.map((store) => (
                                    <Button
                                        key={store.id}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className="w-full justify-start"
                                    >
                                        <Link href={`/products?storeId=${store.id}`}>
                                            {store.name}
                                            {store.isMainStore && (
                                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                                    Main
                                                </span>
                                            )}
                                        </Link>
                                    </Button>
                                ))}
                            </nav>
                        </div>
                    </aside>
                )}

                {/* Separator for mobile */}
                {isAdmin && <Separator className="my-4 lg:hidden" />}

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {children}
                </div>
            </div>
        </div>
    );
}
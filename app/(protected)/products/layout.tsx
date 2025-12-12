// app/layouts/products/layout.tsx
"use client"
import { useEffect, useState, type PropsWithChildren } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Heading from '@/components/general/heading';
import { useCurrentRole } from '@/hooks/use-current-role';
import { getAllStores } from '@/lib/store-api';
import {
    Filter,
    Menu,
    Plus,
    ArrowRightLeft,
    AlertTriangle,
    X
} from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Store = {
    id: string;
    name: string;
    location?: string;
};

interface ProductsLayoutProps extends PropsWithChildren {
    title?: string;
    description?: string;
    showStoreFilter?: boolean;
}

enum userRole {
    ADMIN = "ADMIN"
}

export default function ProductsLayout({
    children,
    title = "Products",
    description = "Manage products across all stores",
    showStoreFilter = true
}: ProductsLayoutProps) {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedStoreName, setSelectedStoreName] = useState<string>('All Stores');
    const role = useCurrentRole();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const fetchedStores = await getAllStores();
                setStores(fetchedStores);
            } catch (error) {
                console.error('Failed to fetch stores:', error);
                setStores([]);
            } finally {
                setLoading(false);
            }
        };

        if (showStoreFilter) {
            fetchStores();
        } else {
            setLoading(false);
        }
    }, [showStoreFilter]);

    // Update selected store name when storeId changes
    useEffect(() => {
        const storeId = searchParams.get('storeId');
        if (!storeId) {
            setSelectedStoreName('All Stores');
        } else {
            const store = stores.find(s => s.id === storeId);
            if (store) {
                setSelectedStoreName(store.name);
            }
        }
    }, [searchParams, stores]);

    const isAdmin = userRole.ADMIN;
    const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const selectedStoreId = searchParams.get('storeId');

    if (loading) {
        return (
            <div className="px-4 py-6 w-full max-w-full">
                <Heading title={title} description={description} />
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-6 w-full max-w-full">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <Heading title={title} description={description} />

                    {/* Filter and Actions Bar */}
                    <div className="flex items-center gap-2">
                        {/* Mobile Filter Sheet Trigger */}
                        {isAdmin && showStoreFilter && stores.length > 0 && (
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="md:hidden"
                                    >
                                        <Filter className="h-4 w-4 mr-2" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                                    <SheetHeader>
                                        <SheetTitle>Filters & Actions</SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6 space-y-6">
                                        {/* Store Filter Section */}
                                        <div>
                                            <h3 className="text-sm font-semibold mb-2">Filter by Store</h3>
                                            <div className="space-y-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                    className={cn('w-full justify-start', {
                                                        'bg-muted': !selectedStoreId && currentPath === '/products',
                                                    })}
                                                    onClick={() => setIsFilterOpen(false)}
                                                >
                                                    <Link href="/products" prefetch scroll={false}>
                                                        All Stores
                                                    </Link>
                                                </Button>
                                                {stores.map((store) => (
                                                    <Button
                                                        key={store.id}
                                                        size="sm"
                                                        variant="ghost"
                                                        asChild
                                                        className={cn('w-full justify-start text-left h-auto py-2 px-3', {
                                                            'bg-muted': selectedStoreId === store.id,
                                                        })}
                                                        onClick={() => setIsFilterOpen(false)}
                                                    >
                                                        <Link
                                                            href={`/products?storeId=${store.id}`}
                                                            prefetch
                                                            scroll={false}
                                                            className="flex flex-col items-start"
                                                        >
                                                            <span className="font-medium">{store.name}</span>
                                                            {store.location && (
                                                                <span className="text-xs text-muted-foreground truncate w-full">
                                                                    {store.location}
                                                                </span>
                                                            )}
                                                        </Link>
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Quick Actions Section */}
                                        <div className="space-y-2">
                                            <h4 className="text-xs font-medium text-muted-foreground px-2">Quick Actions</h4>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath === '/products/create',
                                                })}
                                                onClick={() => setIsFilterOpen(false)}
                                            >
                                                <Link href="/products/create" prefetch scroll={false}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add New Product
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath.includes('/products/transfer'),
                                                })}
                                                onClick={() => setIsFilterOpen(false)}
                                            >
                                                <Link href="/products/transfer" prefetch scroll={false}>
                                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                    Transfer Products
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath.includes('/products/low-stock'),
                                                })}
                                                onClick={() => setIsFilterOpen(false)}
                                            >
                                                <Link href="/products/low-stock" prefetch scroll={false}>
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    View Low Stock
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        )}

                        {/* Desktop Dropdown for Store Filter */}
                        {isAdmin && showStoreFilter && stores.length > 0 && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="hidden md:flex items-center gap-2"
                                    >
                                        <Filter className="h-4 w-4" />
                                        <span className="truncate max-w-[120px]">{selectedStoreName}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>Filter by Store</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/products"
                                            className="w-full cursor-pointer flex items-center justify-between"
                                        >
                                            <span>All Stores</span>
                                            {!selectedStoreId && (
                                                <div className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </Link>
                                    </DropdownMenuItem>
                                    {stores.map((store) => (
                                        <DropdownMenuItem key={store.id} asChild>
                                            <Link
                                                href={`/products?storeId=${store.id}`}
                                                className="w-full cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className="font-medium">{store.name}</span>
                                                    {store.location && (
                                                        <span className="text-xs text-muted-foreground">
                                                            {store.location}
                                                        </span>
                                                    )}
                                                </div>
                                                {selectedStoreId === store.id && (
                                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </Link>
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Quick Actions Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <Menu className="h-4 w-4" />
                                    <span className="hidden sm:inline">Actions</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/products/create"
                                        className="w-full cursor-pointer flex items-center"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add New Product
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/products/transfer"
                                        className="w-full cursor-pointer flex items-center"
                                    >
                                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                                        Transfer Products
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/products/low-stock"
                                        className="w-full cursor-pointer flex items-center"
                                    >
                                        <AlertTriangle className="h-4 w-4 mr-2" />
                                        View Low Stock
                                    </Link>
                                </DropdownMenuItem>
                                {isAdmin && showStoreFilter && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setIsFilterOpen(true)}
                                            className="cursor-pointer md:hidden"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Store Filters
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Desktop Store Filter Button (for sidebar toggle) */}
                        {isAdmin && showStoreFilter && stores.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden lg:flex items-center gap-2"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <Filter className="h-4 w-4" />
                                Show Filters
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex flex-col lg:flex-row gap-6 max-w-full w-full">
                    {/* Desktop Sidebar (only shown when toggled) */}
                    {isAdmin && showStoreFilter && stores.length > 0 && isFilterOpen && (
                        <div className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-semibold">Filters & Actions</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsFilterOpen(false)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Filter by Store</h4>
                                        <div className="space-y-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': !selectedStoreId && currentPath === '/products',
                                                })}
                                            >
                                                <Link href="/products" prefetch scroll={false}>
                                                    All Stores
                                                </Link>
                                            </Button>
                                            {stores.map((store) => (
                                                <Button
                                                    key={store.id}
                                                    size="sm"
                                                    variant="ghost"
                                                    asChild
                                                    className={cn('w-full justify-start text-left h-auto py-2 px-3', {
                                                        'bg-muted': selectedStoreId === store.id,
                                                    })}
                                                >
                                                    <Link
                                                        href={`/products?storeId=${store.id}`}
                                                        prefetch
                                                        scroll={false}
                                                        className="flex flex-col items-start"
                                                    >
                                                        <span className="font-medium">{store.name}</span>
                                                        {store.location && (
                                                            <span className="text-xs text-muted-foreground truncate w-full">
                                                                {store.location}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h4 className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</h4>
                                        <div className="space-y-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath === '/products/create',
                                                })}
                                            >
                                                <Link href="/products/create" prefetch scroll={false}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add New Product
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath.includes('/products/transfer'),
                                                })}
                                            >
                                                <Link href="/products/transfer" prefetch scroll={false}>
                                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                                    Transfer Products
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                asChild
                                                className={cn('w-full justify-start', {
                                                    'bg-muted': currentPath.includes('/products/low-stock'),
                                                })}
                                            >
                                                <Link href="/products/low-stock" prefetch scroll={false}>
                                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                                    View Low Stock
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 w-full">
                        {/* Current Store Badge (when filtered) */}
                        {selectedStoreId && (
                            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                        Showing products for: <strong>{selectedStoreName}</strong>
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                >
                                    <Link href="/products">
                                        <X className="h-4 w-4 mr-1" />
                                        Clear Filter
                                    </Link>
                                </Button>
                            </div>
                        )}

                        <section className="max-w-full space-y-6">{children}</section>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect, useMemo } from "react";
import ProductAPI from "@/lib/api/products";
import EmployeeAPI from "@/lib/api/employees";
import { Product, ProductGrade, ProductType, TireUsage } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { usePos } from "@/contexts/cart-context";

// Components
import { POSSkeleton } from "@/components/pos/skeleton";
import { POSLeftSidebar } from "@/components/pos/left-sidebar";
import { ProductsGrid } from "@/components/pos/products-grid";
import { OrderSummary } from "@/components/pos/order-summary";
import { ErrorState, NoStoreError } from "@/components/pos/error-state";

// Dialogs
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { DiscountDialog } from "@/components/pos/discount-dialog";

// UI
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Package, Truck, Weight } from "lucide-react";
import { CategoryFilter } from "@/types/pos";
import { FiltersBar } from "@/components/pos/pos-filter-bar";
import { POSHeader } from "@/components/pos/pos-header";

export default function POSPage() {
  const { accessToken, user } = useAuth();
  const {
    cart,
    addToCart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    calculateTotals,
    discount,
    applyDiscount,
    removeDiscount,
    openPaymentDialog,
    closePaymentDialog,
    isPaymentDialogVisible,
    isLoading: cartLoading,
    store: posStore,
    employee: posEmployee,
  } = usePos();

  // ── State ─────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employeeLoading, setEmployeeLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | ProductType>("all");
  const [selectedGrade, setSelectedGrade] = useState<"all" | ProductGrade>("all");
  const [selectedTireUsage, setSelectedTireUsage] = useState<"all" | TireUsage>("all");
  const [transactionType, setTransactionType] = useState<"retail" | "wholesale" | "transfer">("retail");
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  // ── Derive store from employee record ─────────────────────────────────────
  const activeStore = employee?.store ?? posStore;
  const activeEmployee = employee ?? posEmployee;
  const storeId = activeStore?.id ?? null;

  // ── Check if anything is still loading ────────────────────────────────────
  const isEverythingLoaded = !cartLoading && !loading && !employeeLoading && accessToken && user;
  const showSkeleton = !isEverythingLoaded && !error;

  // ── Categories for filters ────────────────────────────────────────────────
  const categories: CategoryFilter[] = [
    { id: "all", label: "All Products", icon: Package, count: products.length },
    {
      id: ProductType.TIRE,
      label: "Tires",
      icon: Truck,
      count: products.filter((p) => p.type === ProductType.TIRE).length
    },
    {
      id: ProductType.BALE,
      label: "Bales",
      icon: Weight,
      count: products.filter((p) => p.type === ProductType.BALE).length
    },
  ];

  // ── Fetch employee ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!accessToken || !user?.id) {
        setEmployeeLoading(false);
        return;
      }

      try {
        setEmployeeLoading(true);
        const emp = await EmployeeAPI.getEmployeeByUserId(accessToken, user.id);
        setEmployee(emp);
      } catch (err: any) {
        console.error("Failed to fetch employee record:", err);
        setError("Could not load your employee profile. Payment processing may be unavailable.");
      } finally {
        setEmployeeLoading(false);
      }
    };

    fetchEmployee();
  }, [accessToken, user?.id]);

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      if (employeeLoading) {
        return;
      }

      if (!storeId) {
        setError('No store assigned to your employee profile');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await ProductAPI.getProductsByStore(accessToken, storeId, {
          limit: 200,
          page: 1
        });

        setProducts(response.data || []);
      } catch (err: any) {
        console.error('Error fetching products:', err);

        if (err.message.includes('401')) {
          setError('Session expired. Please login again.');
        } else if (err.message.includes('403')) {
          setError('You do not have permission to view products for this store.');
        } else if (err.message.includes('404')) {
          setError('Store not found. Please contact support.');
        } else if (err.message.includes('400')) {
          setError('Invalid request. Store ID may be incorrect.');
        } else {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [accessToken, storeId, employeeLoading, user?.role, employee, posStore]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!accessToken || !storeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductAPI.getProductsByStore(accessToken, storeId, {
        limit: 200
      });
      setProducts(response.data ?? []);
    } catch (err: any) {
      setError("Failed to refresh products.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = () => {
    if (cart.length === 0) return;
    openPaymentDialog();
  };

  const handleProcessTransfer = () => {
    if (cart.length === 0 || !activeStore) return;
    // Handle stock transfer
  };

  const getProductAvailability = (product: Product) => {
    if (storeId && product.inventories && typeof (product.inventories as any).quantity === "number") {
      return (product.inventories as any).quantity as number;
    }
    return ProductAPI.calculateTotalInventory(product);
  };

  // ── Filter products ───────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.type === selectedCategory;
      const matchesGrade = selectedGrade === "all" || product.grade === selectedGrade;
      const matchesTireUsage =
        selectedTireUsage === "all" ||
        (product.type === ProductType.TIRE && product.tireUsage === selectedTireUsage);
      return matchesSearch && matchesCategory && matchesGrade && matchesTireUsage;
    });
  }, [products, searchQuery, selectedCategory, selectedGrade, selectedTireUsage]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const { subtotal, totalDiscount, total } = calculateTotals();
  const tax = subtotal * 0.15;

  // ── Render ────────────────────────────────────────────────────────────────
  if (showSkeleton) {
    return <POSSkeleton />;
  }

  if (error && !storeId) {
    return (
      <ErrorState
        error={error}
        onRetry={() => window.location.reload()}
        onDashboard={() => window.location.href = '/dashboard'}
      />
    );
  }

  if (!storeId) {
    return <NoStoreError />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <POSLeftSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <POSHeader
          store={activeStore}
          employee={activeEmployee}
          user={user}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
        />

        {error && storeId && (
          <Alert variant="destructive" className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FiltersBar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTireUsage={selectedTireUsage}
          onTireUsageChange={setSelectedTireUsage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          loading={loading}
          showTireFilters={selectedCategory === ProductType.TIRE}
        />

        <ScrollArea className="flex-1 bg-background p-6">
          <ProductsGrid
            products={filteredProducts}
            cart={cart}
            transactionType={transactionType}
            onAddToCart={addToCart}
            getProductAvailability={getProductAvailability}
            loading={loading}
          />
        </ScrollArea>
      </div>

      <OrderSummary
        cart={cart}
        store={activeStore}
        employee={activeEmployee}
        user={user}
        transactionType={transactionType}
        subtotal={subtotal}
        tax={tax}
        totalDiscount={totalDiscount}
        total={total}
        discount={discount}
        onIncreaseQuantity={increaseQuantity}
        onDecreaseQuantity={decreaseQuantity}
        onRemoveFromCart={removeFromCart}
        onClearCart={clearCart}
        onOpenDiscountDialog={() => setShowDiscountDialog(true)}
        onRemoveDiscount={removeDiscount}
        onProcessPayment={handleProcessPayment}
        onProcessTransfer={handleProcessTransfer}
        loading={cartLoading}
      />

      <PaymentDialog
        store={activeStore}
        employee={activeEmployee}
      />

      <DiscountDialog
        isOpen={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
      />
    </div>
  );
}
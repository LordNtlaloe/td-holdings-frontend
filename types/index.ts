// ============ ENUMS ============
export enum Role {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    CASHIER = 'CASHIER',
}

export enum ProductType {
    TIRE = 'TIRE',
    BALE = 'BALE'
}

export enum ProductGrade {
    A = 'A',
    B = 'B',
    C = 'C'
}

export enum TireCategory {
    NEW = 'NEW',
    SECOND_HAND = 'SECOND_HAND'
}

export enum TireUsage {
    FOUR_BY_FOUR = 'FOUR_BY_FOUR',
    REGULAR = 'REGULAR',
    TRUCK = 'TRUCK'
}

export enum TransferStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED'
}

export enum PaymentMethodType {
    MOBILE = 'MOBILE',
    CASH = 'CASH',
    CARD = 'CARD',
    CREDIT = 'CREDIT'
}

export enum InventoryChangeType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    TRANSFER_OUT = 'TRANSFER_OUT',
    TRANSFER_IN = 'TRANSFER_IN',
    ADJUSTMENT = 'ADJUSTMENT',
    RETURN = 'RETURN',
    DAMAGE = 'DAMAGE'
}

export enum EmployeeStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    ON_LEAVE = 'ON_LEAVE',
    TERMINATED = 'TERMINATED'
}

export enum ReviewPeriod {
    MONTHLY = 'MONTHLY',
    QUARTERLY = 'QUARTERLY',
    YEARLY = 'YEARLY'
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc'
}

// ============ BASE INTERFACES ============
export interface BaseModel {
    id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// ============ STORE ============
// types/store.ts

export enum StoreType {
    MAIN = 'MAIN',
    BRANCH = 'BRANCH',
    WAREHOUSE = 'WAREHOUSE',
    POPUP = 'POPUP'
}

export interface Store {
    id: string;
    name: string;
    city: string;
    type: StoreType;

    // Location details
    latitude?: number;
    longitude?: number;
    address: string;
    phone: string;
    email: string;
    isMainStore: boolean;

    // Operating hours
    weekdayHours: string;
    saturdayHours?: string;
    sundayHours?: string;

    // Additional info
    services: string[];
    features: string[];
    distanceInfo?: string;

    // Counts from relations
    _count?: {
        employees: number;
        inventories: number;
        sales: number;
        storeProducts: number;
    };

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface CreateStoreData {
    name: string;
    city: string;
    type?: StoreType;
    latitude?: number;
    longitude?: number;
    address: string;
    phone: string;
    email: string;
    isMainStore?: boolean;
    weekdayHours?: string;
    saturdayHours?: string;
    sundayHours?: string;
    services?: string[];
    features?: string[];
    distanceInfo?: string;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
    id?: string;
}

export interface StorePerformance {
    storeId: string;
    storeName: string;
    sales: {
        revenue: number;
        transactions: number;
        averageOrderValue: number;
        bestSellingProducts: {
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }[];
        topEmployees: {
            employeeId: string;
            employeeName: string;
            sales: number;
            revenue: number;
        }[];
    };
    inventory: {
        totalProducts: number;
        totalValue: number;
        turnoverRate: number;
        daysOfInventory: number;
        stockOutRate: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

export interface StoreStats {
    totalStores: number;
    mainStore?: string;
    totalEmployees: number;
    totalProducts: number;
    totalSales: number;
    lowStockItems: number;
    outOfStockItems: number;
    storesByType: {
        type: StoreType;
        count: number;
    }[];
}

// ============ PRODUCT CORE ============
export interface Product {
    rating?: number;
    reviewCount?: number;
    description?: string;
    tireSpecific?: boolean;
    baleSpecific?: boolean;
    id: string;
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;

    // Tire-specific fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    // Bale-specific fields
    baleWeight?: number;
    baleCategory?: string;
    originCountry?: string;
    importDate?: string;

    // Inventory - NEW FORMAT from backend
    inventory?: {
        total: number;
        mainStore: number;
        branches: number;
    };

    // Old inventory format (keep for backward compatibility)
    inventories?: ProductInventory[];

    // Store assignments
    storeProducts?: StoreProduct[];

    // Metadata
    createdAt: string;
    updatedAt: string;

    // Counts
    _count?: {
        saleItems?: number;
        transfers?: number;
    };

    isActive: boolean;
}

export interface ProductInventory {
    productId: string;
    product?: Product;
    storeId: string;
    store?: Store;
    quantity: number;
    storePrice?: number;
    reorderLevel?: number;
    optimalLevel?: number;
}

export interface StoreProduct {
    id: string;
    productId: string;
    product?: Product;
    storeId: string;
    store?: Store;
    createdAt: string;
}

// ============ STORE TYPES (Add to your types file) ============

export interface InventorySummary {
    store: Store;
    summary: {
        totalProducts: number;
        totalQuantity: number;
        totalValue: number;
        lowStockProducts: number;
        outOfStockProducts: number;
    };
    categories: Array<{
        type: string;
        count: number;
        quantity: number;
        value: number;
    }>;
}

// Also update your StoreFilters interface to be more complete:

// ============ USER ============
export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone: string;
    avatar?: string;
    role: Role;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string | Date;
    storeId?: string;
    store?: Store;
    createdAt: string;
    updatedAt: string;

    // Relationships
    employee?: Employee;
    activities?: ActivityLog[];
    sales?: Sale[];
}

// ============ PRODUCT TRANSFER ============
export interface ProductTransfer {
    id: string;
    quantity: number;
    productId: string;
    product?: Product;
    fromStoreId: string;
    fromStore?: Store;
    toStoreId: string;
    toStore?: Store;
    transferredBy: string;
    transferredByUser?: User;
    status: TransferStatus;
    reason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// ============ SALES ============
export interface Sale {
    id: string;
    employeeId: string;
    employee?: Employee;
    storeId: string;
    store?: Store;
    userId?: string;
    user?: User;
    total: number;
    subtotal: number;
    tax: number;
    paymentMethod: PaymentMethodType;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    createdAt: string;

    // Relationships
    saleItems: SaleItem[];
    voidedSale?: VoidedSale;
}

export interface SaleItem {
    id: string;
    saleId: string;
    sale?: Sale;
    productId: string;
    product?: Product;
    quantity: number;
    price: number;
}

export interface VoidedSale {
    id: string;
    saleId: string;
    sale?: Sale;
    voidedBy: string;
    voidedByUser?: User;
    reason?: string;
    originalTotal: number;
    createdAt: string;
}

// ============ EMPLOYEE ============
export interface Employee {
    id: string;
    userId: string;
    user: User;
    storeId: string;
    store: Store;
    position: string;
    role: Role;
    hireDate: string;
    terminationDate?: string;
    status: EmployeeStatus;
    performanceScore?: number;
    createdBy: string;
    createdByUser?: User;
    createdAt: string;
    updatedAt: string;

    // Relationships
    transfers?: EmployeeTransfer[];
    performanceReviews?: PerformanceReview[];
    sales?: Sale[];
    _count?: {
        sales?: number;
        transfers?: number;
        performanceReviews?: number;
    };
}

export interface EmployeeTransfer {
    id: string;
    employeeId: string;
    employee: Employee;
    fromStoreId: string;
    fromStore: Store;
    toStoreId: string;
    toStore: Store;
    reason: string;
    transferredBy: string;
    transferredByUser?: User;
    transferDate: string;
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    employee: Employee;
    reviewerId: string;
    reviewer: User;
    period: ReviewPeriod;
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
    createdAt: string;
}

// ============ AUTH & ACTIVITY ============
export interface RefreshToken {
    id: string;
    userId: string;
    user?: User;
    tokenHash: string;
    revoked: boolean;
    createdAt: string;
    expiresAt: string;
    replacedById?: string;
    replacedBy?: RefreshToken;
}

export interface VerificationCode {
    id: string;
    userId: string;
    user?: User;
    code: string;
    createdAt: string;
    expiresAt: string;
    used: boolean;
}

export interface PasswordReset {
    id: string;
    userId: string;
    user?: User;
    tokenHash: string;
    expiresAt: string;
    used: boolean;
    createdAt: string;
}

export interface ActivityLog {
    id: string;
    userId: string;
    user?: User;
    action: string;
    entityType: string;
    entityId: string;
    details: any;
    createdAt: string;
}

// ============ AUTH TYPES (Add to your types file) ============

export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    storeId?: string;
    store?: Store;
    isActive: boolean;
    isVerified: boolean;
    lastLogin?: string;
    permissions: string[];
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: Role;
    storeId?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    };
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface VerificationData {
    email: string;
    code: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetData {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface PasswordChangeData {
    currentPassword: string;
    newPassword: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface UserSession {
    id: string;
    userId: string;
    deviceInfo?: string;
    lastActivity: string | Date;
    createdAt: string | Date;
    isActive: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: Role;
    storeId?: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
    verificationCode?: string;
}

export interface VerifyAccountRequest {
    email: string;
    code: string;
}

export interface PasswordResetConfirmRequest {
    email: string;
    resetToken: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

// ============ Also update your Auth API types ============

// Add these to your existing Auth Forms section
export interface LoginFormValues {
    email: string;
    password: string;
}

export interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: Role;
    storeId?: string;
}

export interface VerifyAccountFormValues {
    email: string;
    code: string;
}

export interface ForgotPasswordFormValues {
    email: string;
}

export interface ResetPasswordFormValues {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ProfileFormValues {
    firstName: string;
    lastName: string;
    phone: string;
}

// ============ API RESPONSE TYPES ============
export interface PaginatedResponse<T> {
    
    employees: never[];
    stores: never[];
    data: T[];
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export type PaginatedProductsResponse = PaginatedResponse<Product>;
export type PaginatedStoresResponse = PaginatedResponse<Store>;
export type PaginatedUsersResponse = PaginatedResponse<User>;
export type PaginatedEmployeesResponse = PaginatedResponse<Employee>;
export type PaginatedTransfersResponse = PaginatedResponse<ProductTransfer>;

// ============ STATISTICS & REPORTS ============
export interface ProductCategoryStats {
    category: any;
    count: number;
    totalInventory: number;
    averagePrice: number;
}

export interface ProductPriceStatistics {
    minPrice: number;
    maxPrice: number;
    averagePrice: number;
    priceByType: Record<string, { min: number; max: number; avg: number }>;
    priceByGrade: Record<string, { min: number; max: number; avg: number }>;
}

export interface LowStockProduct {
    product: Product;
    inventories: Array<{
        storeId: string;
        storeName: string;
        quantity: number;
        reorderLevel?: number;
        optimalLevel?: number;
    }>;
}

export interface ProductAttribute {
    productTypes: string[];
    productGrades: string[];
    tireCategories: string[];
    tireUsages: string[];
    roles: string[];
    paymentMethods: string[];
    transferStatuses: string[];
    inventoryChangeTypes: string[];
}

export interface StoreStatistics {
    inventory: {
        totalItems: number;
        averagePrice: number;
    };
    sales: {
        last30Days: {
            totalRevenue: number;
            transactionCount: number;
            averageTransaction: number;
        };
    };
}

export interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    onLeave: number;
    terminated: number;
    averagePerformanceScore: number;
    turnoverRate: number;
    byRole: Array<{
        role: string;
        count: number;
        percentage: number;
    }>;
    byStore: Array<{
        storeId: string;
        storeName: string;
        count: number;
        percentage: number;
    }>;
    recentHires: number;
    upcomingReviews: number;
}

// ============ FILTER TYPES ============
export interface BaseFilters {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: SortOrder;
}

export interface ProductFilters extends BaseFilters {
    name?: string;
    type?: ProductType;
    grade?: ProductGrade;
    commodity?: string;
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    storeId?: string;
}

export interface ProductTransferFilters extends BaseFilters {
    productId?: string;
    fromStoreId?: string;
    toStoreId?: string;
    status?: TransferStatus;
    startDate?: Date;
    endDate?: Date;
}

export interface EmployeeFilters extends BaseFilters {
    storeId?: string;
    role?: Role;
    position?: string;
    status?: EmployeeStatus;
    activeOnly?: boolean;
}

export interface StoreFilters extends BaseFilters {
    isMainStore?: boolean;
}

export interface SaleFilters extends BaseFilters {
    storeId?: string;
    employeeId?: string;
    paymentMethod?: PaymentMethodType;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
    voided?: boolean;
}

// ============ FORM VALUE TYPES ============

// Product Forms
// ============ PRODUCT FORM VALUE TYPES ============

// Product Forms
// In your types file, update the CreateProductFormValues interface:

export interface CreateProductFormValues {
    name: string;
    description?: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    originCountry?: string;
    importDate?: string;
    isActive?: boolean;

    // Direct fields instead of nested objects
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    baleWeight?: number;
    baleCategory?: string;

    // Warehouse/main store inventory
    warehouseQuantity?: number;
    warehouseReorderLevel?: number;
    warehouseOptimalLevel?: number;

    // Store assignments
    storeAssignments?: Array<{
        storeId: string;
        storeName?: string;
        isMainStore?: boolean;
        isAssigned?: boolean;
        existingQuantity?: number; // For existing stock in branches
        initialQuantity?: number; // Keep for backward compatibility
        reorderLevel?: number;
        optimalLevel?: number;
        storePrice?: number;
    }>;

    // Backward compatibility fields
    tireSpecific?: {
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        tireSize?: string;
        loadIndex?: string;
        speedRating?: string;
        warrantyPeriod?: string;
    };
    baleSpecific?: {
        baleWeight?: number;
        baleCategory?: string;
    };
    mainStoreQuantity?: number; // For backward compatibility
    reorderLevel?: number; // For backward compatibility
    optimalLevel?: number; // For backward compatibility
}

export interface UpdateProductFormValues {
    name?: string;
    description?: string;
    basePrice?: number;
    type?: ProductType;
    grade?: ProductGrade;
    commodity?: string;
    originCountry?: string;
    importDate?: string;
    isActive?: boolean;

    // Direct fields
    tireCategory?: TireCategory;
    tireUsage?: TireUsage;
    tireSize?: string;
    loadIndex?: string;
    speedRating?: string;
    warrantyPeriod?: string;

    baleWeight?: number;
    baleCategory?: string;

    // Backward compatibility
    tireSpecific?: {
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        tireSize?: string;
        loadIndex?: string;
        speedRating?: string;
        warrantyPeriod?: string;
    };
    baleSpecific?: {
        baleWeight?: number;
        baleCategory?: string;
    };
}

export interface AssignProductToStoresFormValues {
    storeIds: Store[];
    initialQuantities?: Record<string, number>;
}

// Transfer Forms
export interface CreateProductTransferFormValues {
    product: Product;
    fromStore: Store;
    toStore: Store;
    quantity: number;
    reason?: string;
    notes?: string;
}

export interface CompleteProductTransferFormValues {
    notes?: string;
}

export interface CancelProductTransferFormValues {
    reason?: string;
}

// Employee Forms
export interface CreateEmployeeFormValues {
    user: User;
    store: Store;
    position: string;
    role: Role;
    hireDate: string;
}

export interface UpdateEmployeeFormValues {
    position?: string;
    role?: Role;
    status?: EmployeeStatus;
    terminationDate?: string;
}

export interface TransferEmployeeFormValues {
    newStore: Store;
    reason: string;
}

export interface PerformanceReviewFormValues {
    period: ReviewPeriod;
    score: number;
    feedback?: string;
    goals: string[];
    strengths: string[];
    areasForImprovement: string[];
}

// Store Forms
export interface CreateStoreFormValues {
    name: string;
    location: string;
    phone: string;
    email: string;
    isMainStore?: boolean;
}

export interface UpdateStoreFormValues {
    name?: string;
    location?: string;
    phone?: string;
    email?: string;
    isMainStore?: boolean;
}

// Auth Forms
export interface LoginFormValues {
    email: string;
    password: string;
}

export interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: Role;
    storeId?: string;
}

export interface ChangePasswordFormValues {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Sale Forms
export interface CreateSaleFormValues {
    employee: Employee;
    store: Store;
    items: Array<{
        product: Product;
        quantity: number;
        price: number;
    }>;
    paymentMethod: PaymentMethodType;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
}

// ============ UTILITY TYPES ============
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType;
    isActive?: boolean;
}

export interface DateRange {
    startDate?: Date;
    endDate?: Date;
}

// ============ API REQUEST TYPES ============
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role?: Role;
    storeId?: string;
}

export interface CreateProductRequest {
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity?: string;
    tireSpecific?: {
        tireCategory?: TireCategory;
        tireUsage?: TireUsage;
        tireSize?: string;
        loadIndex?: string;
        speedRating?: string;
        warrantyPeriod?: string;
    };
    baleSpecific?: {
        baleWeight?: number;
        baleCategory?: string;
        originCountry?: string;
        importDate?: string;
    };
    storeAssignments?: Array<{
        storeId: string;
        initialQuantity?: number;
        storePrice?: number;
    }>;
}

export interface CreateProductTransferRequest {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason?: string;
    notes?: string;
}

// ============ EXPORT/REPORT TYPES ============
export interface EmployeeExportData {
    id: string;
    name: string;
    email: string;
    phone: string;
    position: string;
    role: string;
    store: string;
    hireDate: string;
    terminationDate?: string;
    status: string;
    performanceScore?: number;
    salesCount?: number;
    transferCount?: number;
    reviewCount?: number;
}

export interface ProductExportData {
    id: string;
    name: string;
    type: string;
    grade: string;
    basePrice: number;
    commodity?: string;
    totalInventory: number;
    stores: string;
    lastUpdated: string;
}

// ============ VALIDATION TYPES ============
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// ============ EMPLOYEE PERFORMANCE TYPES (Add to your types file) ============

export interface EmployeePerformanceReport {
    employee: Employee;
    period: 'day' | 'week' | 'month' | 'year';
    sales: {
        revenue: number;
        transactions: number;
        averageTransaction: number;
        bestSellingProducts: Array<{
            productId: string;
            productName: string;
            quantity: number;
            revenue: number;
        }>;
        salesByHour?: Array<{
            hour: number;
            sales: number;
            revenue: number;
        }>;
    };
    comparison?: {
        storeAverage: number;
        employeeRank: number;
        topPerformer: { name: string; revenue: number };
    };
}

// You should also add this interface to your EmployeeStats section:
export interface StoreStaffSummary {
    storeId: string;
    storeName: string;
    period: 'current' | 'month' | 'quarter' | 'year';
    summary: {
        totalEmployees: number;
        activeEmployees: number;
        onLeave: number;
        terminated: number;
        averageTenure: number;
        averagePerformanceScore: number;
    };
    byRole: Array<{
        role: Role;
        count: number;
        percentage: number;
    }>;
    byPosition: Array<{
        position: string;
        count: number;
        percentage: number;
    }>;
    performanceDistribution: Array<{
        range: '0-60' | '61-70' | '71-80' | '81-90' | '91-100';
        count: number;
        percentage: number;
    }>;
    topPerformers: Array<{
        employeeId: string;
        name: string;
        role: string;
        position: string;
        performanceScore: number;
        salesRevenue: number;
    }>;
    recentHires: Array<{
        employeeId: string;
        name: string;
        position: string;
        hireDate: string;
    }>;
    turnover: {
        monthlyTurnoverRate: number;
        quarterlyTurnoverRate: number;
        yearlyTurnoverRate: number;
        voluntaryTurnovers: number;
        involuntaryTurnovers: number;
    };
}

// types/inventory.ts

export interface Inventory {
    id: string;
    productId: string;
    storeId: string;
    quantity: number;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
    createdAt: Date;
    updatedAt: Date;
    product?: Product;
    store?: Store;
}

export interface InventoryFilters {
    productId?: string;
    productName?: string;
    storeId?: string;
    storeName?: string;
    type?: ProductType;
    grade?: ProductGrade;
    lowStock?: boolean;
    outOfStock?: boolean;
    hasReorderLevel?: boolean;
    minQuantity?: number;
    maxQuantity?: number;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
}

export interface PaginatedInventoryResponse {
    inventory: Inventory[];
    total: number;
    page: number;
    totalPages: number;
    summary: {
        totalProducts: number;
        totalQuantity: number;
        totalValue: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

export interface InventorySummary {
    totalProducts: number;
    totalQuantity: number;
    totalValue: number;
    lowStockItems: number;
    byCategory: Record<string, number>;
    byType: Record<string, number>;
}

export interface InventoryHistory {
    id: string;
    inventoryId: string;
    changeType: InventoryChangeType;
    quantityChange: number;
    previousQuantity: number;
    newQuantity: number;
    referenceId?: string;
    referenceType?: string;
    notes?: string;
    createdBy: string;
    createdAt?: Date;
    inventory?: Inventory;
    user?: User;
}

export interface InventoryHistoryFilters {
    productId?: string;
    storeId?: string;
    changeType?: InventoryChangeType;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}

export interface StoreInventory {
    inventory: Inventory[];
    total: number;
    page: number;
    totalPages: number;
}

export interface StoreInventoryFilters {
    productId?: string;
    productName?: string;
    type?: ProductType;
    grade?: ProductGrade;
    lowStock?: boolean;
    page?: number;
    limit?: number;
}

export interface AdjustInventoryFormValues {
    productId: string;
    storeId: string;
    quantity: number;
    changeType: InventoryChangeType;
    notes?: string;
    referenceId?: string;
    referenceType?: string;
}

export interface SetInventoryLevelsFormValues {
    productId: string;
    storeId: string;
    reorderLevel?: number;
    optimalLevel?: number;
    storePrice?: number;
}

export interface CartItem {
    id: string; // Unique ID for the cart item
    product: Product; // The product
    quantity: number; // Quantity in cart
    discount: number; // Discount amount for this specific item
    unitPrice: number; // Price at time of adding to cart (optional)
    notes?: string; // Optional notes for this item
}
import {
    Role,
    ProductType,
    TireCategory,
    TireUsage,
    ProductGrade,
    PaymentMethodType
} from './enums';

// ========== Auth Forms ==========

export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    role: Role;
    storeId?: string;
}

export interface VerifyAccountFormData {
    email: string;
    code: string;
}

export interface ForgotPasswordFormData {
    email: string;
}

export interface ResetPasswordFormData {
    email: string;
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordFormData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ProfileFormData {
    firstName: string;
    lastName: string;
    phone: string;
}

// ========== Store Forms ==========

export interface StoreFormData {
    name: string;
    location: string;
    phone: string;
    email: string;
    isMainStore: boolean;
}

// ========== Product Forms ==========

export interface ProductBaseFormData {
    name: string;
    basePrice: number;
    type: ProductType;
    grade: ProductGrade;
    commodity: string;
}

export interface TireProductFormData extends ProductBaseFormData {
    type: ProductType.TIRE;
    tireCategory: TireCategory;
    tireUsage: TireUsage;
    tireSize: string;
    loadIndex: string;
    speedRating: string;
    warrantyPeriod: string;
}

export interface BaleProductFormData extends ProductBaseFormData {
    type: ProductType.BALE;
    baleWeight: number;
    baleCategory: string;
    originCountry: string;
    importDate: Date;
}

export type ProductFormData = TireProductFormData | BaleProductFormData;

// ========== Inventory Forms ==========

export interface InventoryFormData {
    productId: string;
    storeId: string;
    quantity: number;
    reorderLevel: number;
    optimalLevel: number;
    storePrice: number;
}

export interface InventoryAdjustmentFormData {
    quantityChange: number;
    changeType: string;
    notes: string;
}

// ========== Transfer Forms ==========

export interface TransferFormData {
    productId: string;
    fromStoreId: string;
    toStoreId: string;
    quantity: number;
    reason: string;
    notes: string;
}

// ========== Sales Forms ==========

export interface SaleItemFormData {
    productId: string;
    quantity: number;
    price: number;
}

export interface SaleFormData {
    employeeId: string;
    storeId: string;
    items: SaleItemFormData[];
    paymentMethod: PaymentMethodType;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

export interface VoidSaleFormData {
    reason: string;
}

// ========== Employee Forms ==========

export interface EmployeeFormData {
    userId: string;
    storeId: string;
    position: string;
    role: Role;
}

// ========== User Forms ==========

export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
    storeId?: string;
}

// ========== Filter Forms ==========

export interface DateRangeFilterFormData {
    startDate: Date;
    endDate: Date;
}

export interface InventoryFilterFormData {
    storeId?: string;
    productId?: string;
    minQuantity?: number;
    maxQuantity?: number;
    search?: string;
}

export interface SalesFilterFormData {
    storeId?: string;
    employeeId?: string;
    paymentMethod?: PaymentMethodType;
    startDate?: Date;
    endDate?: Date;
    minTotal?: number;
    maxTotal?: number;
}

// ========== Validation Types ==========

export interface FormValidation<T> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
}

// ========== Select Options ==========

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export const RoleOptions: SelectOption[] = [
    { value: Role.ADMIN, label: 'Administrator' },
    { value: Role.MANAGER, label: 'Manager' },
    { value: Role.CASHIER, label: 'Cashier' }
];

export const ProductTypeOptions: SelectOption[] = [
    { value: ProductType.TIRE, label: 'Tire' },
    { value: ProductType.BALE, label: 'Bale' }
];

export const TireCategoryOptions: SelectOption[] = [
    { value: TireCategory.NEW, label: 'New' },
    { value: TireCategory.SECOND_HAND, label: 'Second Hand' }
];

export const TireUsageOptions: SelectOption[] = [
    { value: TireUsage.FOUR_BY_FOUR, label: '4x4' },
    { value: TireUsage.REGULAR, label: 'Regular' },
    { value: TireUsage.TRUCK, label: 'Truck' }
];

export const ProductGradeOptions: SelectOption[] = [
    { value: ProductGrade.A, label: 'Grade A' },
    { value: ProductGrade.B, label: 'Grade B' },
    { value: ProductGrade.C, label: 'Grade C' }
];

export const PaymentMethodOptions: SelectOption[] = [
    { value: PaymentMethodType.MOBILE, label: 'Mobile Money' },
    { value: PaymentMethodType.CASH, label: 'Cash' },
    { value: PaymentMethodType.CARD, label: 'Card' }
];

export const TransferStatusOptions: SelectOption[] = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'REJECTED', label: 'Rejected' }
];
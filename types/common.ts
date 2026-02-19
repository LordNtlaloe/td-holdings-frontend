import { ReactNode } from "react";

// Navigation
export interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
    disabled?: boolean;
    external?: boolean;
    label?: string;
    description?: string;
    children?: NavItem[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    isCurrent?: boolean;
}

// UI Options
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
    group?: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    count?: number;
}

export interface DateRange {
    from?: Date | string;
    to?: Date | string;
}

export interface TimeRange {
    start: string;
    end: string;
}

// Status Types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'archived';

export interface StatusConfig {
    value: Status;
    label: string;
    color: 'default' | 'destructive' | 'success' | 'warning' | 'secondary';
    icon?: React.ComponentType<{ className?: string }>;
}

// Chart/Display Types
export interface ChartDataPoint {
    name: string;
    value: number;
    color?: string;
}

export interface KeyValuePair {
    key: string;
    value: any;
    label?: string;
}

// Action Types
export interface Action {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

export interface ConfirmDialogProps {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    variant?: 'default' | 'destructive';
}

// File Types
export interface FileWithPreview extends File {
    preview?: string;
    id?: string;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// Export Types
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportConfig {
    filename: string;
    format: ExportFormat;
    columns?: Array<{
        key: string;
        label: string;
        format?: (value: any) => string;
    }>;
    data: any[];
}

// Notification Types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    message: string;
    duration?: number;
    read?: boolean;
    createdAt: Date | string;
    action?: Action;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// Component Props
export interface WithChildren {
    children: ReactNode;
}

export interface WithClassName {
    className?: string;
}

export interface WithTestId {
    'data-testid'?: string;
}

export interface WithLoading {
    loading?: boolean;
}

export interface WithDisabled {
    disabled?: boolean;
}

// Sort Types
export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

export interface SortOption {
    label: string;
    value: string;
    direction?: 'asc' | 'desc';
}

// Search Types
export interface SearchConfig {
    placeholder?: string;
    debounce?: number;
    minLength?: number;
    onSearch: (query: string) => void;
}

// Modal Types
export interface ModalProps extends WithChildren, WithClassName {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closeOnClickOutside?: boolean;
    showCloseButton?: boolean;
}

// Table Types
export interface Column<T = any> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    hidden?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: string | number;
    minWidth?: string | number;
    maxWidth?: string | number;
    render?: (value: any, record: T, index: number) => ReactNode;
    sorter?: (a: T, b: T) => number;
    filter?: (value: any, record: T) => boolean;
}

// Dashboard Types
export interface StatCard {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ComponentType<{ className?: string }>;
    color?: string;
    loading?: boolean;
    onClick?: () => void;
}

export interface Activity {
    id: string;
    user: string;
    action: string;
    target?: string;
    timestamp: Date | string;
    avatar?: string;
    details?: string;
}

// Permission Types
export interface Permission {
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    resource: string;
    fields?: string[];
}

export interface RolePermissions {
    [key: string]: Permission[];
}

// Currency Types
export interface Currency {
    code: string;
    symbol: string;
    name: string;
    decimals: number;
}

// Address Types
export interface Address {
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
    latitude?: number;
    longitude?: number;
}

// Phone Number
export interface PhoneNumber {
    countryCode: string;
    number: string;
    formatted?: string;
}
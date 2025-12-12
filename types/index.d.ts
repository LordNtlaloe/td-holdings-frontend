export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

// types/index.ts
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    avatar?: string;
    emailVerified?: Date;
    isActive?: boolean;
    employee?: {
        id: string;
        position: string;
        storeId?: string;  // Make optional if not always present
        store?: {
            id: string;
            name: string;
            address: string;
            phone: string;
            isActive: boolean;
        };
    };
    store?: {
        id: string;
        name: string;
        address: string;
        phone: string;
        isActive: boolean;
    };
}

// Or create separate types for different contexts
export interface BasicUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    avatar?: string;
    emailVerified?: Date;
    isActive?: boolean;
}

export interface FullUser extends BasicUser {
    employee?: {
        id: string;
        storeId: string;
        position: string;
        store?: {
            id: string;
            name: string;
            address: string;
            phone: string;
            isActive: boolean;
        };
    };
    store?: {
        id: string;
        name: string;
        address: string;
        phone: string;
        isActive: boolean;
    };
}
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    original_user?: User;
}

export interface BreadcrumbItem {
    title?: string;
    href?: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    avatar?: string;
    avatar: string;
    type: 'super_admin' | 'admin' | 'user';
    status: 'active' | 'inactive' | 'suspended' | 'banned';
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    phone?: string;
    bio?: string;
    timezone: string;
    language: string;
    two_factor_enabled: boolean;
    last_login_at?: string;
    last_login_ip?: string;
    created_at: string;
    roles?: Role[];
    permissions?: string[];
    owned_tenants?: Tenant[];
    member_tenants?: Tenant[];
    tenants_count?: number;
    original_user_id?: number;
}

export interface Role {
    id: number;
    name: string;
    label?: string;
    permissions?: Permission[];
    users_count?: number;
    created_at?: string;
}

export interface Permission {
    id: number;
    name: string;
    label?: string;
    module?: string;
    roles?: Role[];
    roles_count?: number;
    created_at?: string;
}

export interface Tenant {
    id: number;
    user_id: number;
    name: string;
    slug: string;
    logo?: string;
    logo_url?: string;
    favicon?: string;
    favicon_url?: string;
    description?: string;
    branding?: {
        primary_color?: string;
        secondary_color?: string;
        [key: string]: any;
    };
    social_links?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        [key: string]: string | undefined;
    };
    custom_domain?: string;
    custom_domain_verified: boolean;
    custom_domain_verified_at?: string;
    status: 'active' | 'inactive' | 'suspended';
    total_views: number;
    total_clicks: number;
    total_links: number;
    created_at: string;
    updated_at: string;
    owner?: User;
    team?: TenantUser[];
    theme?: TenantTheme;
}

export interface TenantUser {
    id: number;
    user: User;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    invitation_accepted_at?: string;
}

export interface Theme {
    id: number;
    name: string;
    slug: string;
    description?: string;
    thumbnail?: string;
    thumbnail_url?: string;
    preview_url?: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        cardBackground: string;
        border: string;
        [key: string]: string;
    };
    fonts: {
        heading: string;
        body: string;
        [key: string]: string;
    };
    spacing?: Record<string, string>;
    components?: Record<string, any>;
    category: string;
    tags?: string[];
    is_premium: boolean;
    is_active: boolean;
    is_featured: boolean;
    usage_count: number;
    rating?: number;
    version: string;
    created_at: string;
}

export interface TenantTheme {
    id: number;
    tenant_id: number;
    theme_id?: number;
    theme?: Theme;
    custom_colors?: Record<string, string>;
    custom_fonts?: Record<string, string>;
    custom_spacing?: Record<string, string>;
    custom_components?: Record<string, any>;
    custom_css?: string;
    custom_js?: string;
    is_active: boolean;
}

export interface Setting {
    id: number;
    group: string;
    key: string;
    value: any;
    type: 'string' | 'boolean' | 'integer' | 'json' | 'text';
    description?: string;
    is_public: boolean;
    order: number;
}

// (merged with the definition above)

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface FlashMessage {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface PageProps<T = Record<string, any>> {
    auth: {
        user: User;
    };
    impersonating?: boolean;
    original_user?: User;
    flash?: FlashMessage;
    errors?: Record<string, string>;
    ziggy?: any;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    [key: string]: any;
}

export interface StatsData {
    label: string;
    value: number | string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
}

export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        [key: string]: any;
    }>;
}

export interface FilterOptions {
    search?: string;
    status?: string;
    type?: string;
    plan?: string;
    category?: string;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

// Component Props Types
export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file';
    placeholder?: string;
    required?: boolean;
    options?: SelectOption[];
    validation?: Record<string, any>;
}

// Admin Users Page Props
export interface UsersPageProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        type?: string;
        sort_by: string;
        sort_direction: string;
    };
    stats: {
        total: number;
        active: number;
        admins: number;
        verified: number;
    };
}

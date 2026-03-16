// Tipe data utama SIPADU — Sistem Informasi Pengaduan Layanan

// --- Status & Enum ---

export type ComplaintStatus =
    | 'submitted'
    | 'verified'
    | 'rejected'
    | 'assigned'
    | 'in_progress'
    | 'responded'
    | 'resolved'
    | 'reopened';

export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export type DataClassification = 'public' | 'internal' | 'confidential';

// --- Model Interfaces ---
// User type is defined in auth.ts and re-exported via index.ts

import type { User } from './auth';
export type { User } from './auth';

export interface ComplaintCategory {
    id: number;
    name: string;
    code: string;
    sla_days: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ComplaintStatusHistory {
    id: number;
    complaint_id: number;
    status: ComplaintStatus;
    note?: string;
    updated_by?: User;
    created_at: string;
}

export interface ComplaintAttachment {
    id: number;
    complaint_id: number;
    file_path: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    created_at: string;
}

export interface ComplaintDisposition {
    id: number;
    complaint_id: number;
    from_user: User;
    to_user: User;
    note?: string;
    created_at: string;
}

export interface Complaint {
    id: number;
    ticket_no: string;
    user_id?: number;
    category_id: number;
    title: string;
    description: string;
    reported_party?: string;
    incident_date: string;
    incident_location?: string;
    status: ComplaintStatus;
    priority: Priority;
    assigned_to?: User;
    sla_deadline: string;
    resolved_at?: string;
    is_anonymous: boolean;
    is_confidential: boolean;
    data_classification: DataClassification;
    complainant_name: string;
    complainant_phone?: string;
    complainant_email?: string;
    category: ComplaintCategory;
    statuses: ComplaintStatusHistory[];
    attachments: ComplaintAttachment[];
    dispositions?: ComplaintDisposition[];
    created_at: string;
    updated_at: string;
}

export interface AuditLog {
    id: number;
    user_id?: number;
    user?: User;
    user_ip: string;
    user_agent: string;
    action: string;
    subject_type?: string;
    subject_id?: number;
    old_values?: Record<string, unknown>;
    new_values?: Record<string, unknown>;
    session_id?: string;
    request_id: string;
    created_at: string;
}

export interface SystemSetting {
    key: string;
    value: string;
    group: string;
    updated_by?: number;
    created_at: string;
    updated_at: string;
}

export interface Holiday {
    id: number;
    date: string;
    name: string;
}

// --- Page Props ---

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export interface SharedPageProps {
    auth: {
        user: User | null;
    };
    flash: FlashMessages;
    appName: string;
    [key: string]: unknown;
}

// --- Form Data ---

export interface ComplaintFormData {
    complainant_nik: string;
    complainant_name: string;
    complainant_address: string;
    complainant_phone: string;
    complainant_email: string;
    category_id: string;
    title: string;
    incident_date: string;
    incident_location: string;
    description: string;
    reported_party: string;
    attachments: File[];
    is_anonymous: boolean;
    is_confidential: boolean;
}

export interface UserFormData {
    name: string;
    email: string;
    phone: string;
    role: string;
    is_active: boolean;
    password: string;
    password_confirmation: string;
}

export interface CategoryFormData {
    name: string;
    code: string;
    sla_days: number;
    is_active: boolean;
}

// --- Statistik ---

export interface DashboardStats {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
    overdue: number;
    sla_compliance: number;
    avg_resolution_days: number;
    by_category: { category: string; count: number }[];
    by_status: { status: ComplaintStatus; count: number }[];
}

export type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string;
    is_active: boolean;
    roles: string[];
    permissions: string[];
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    last_login_at?: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};

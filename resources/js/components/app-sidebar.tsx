import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    FileText,
    Users,
    Tags,
    Settings,
    ScrollText,
    ClipboardList,
    Send,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, SharedPageProps } from '@/types';

/**
 * Sidebar navigasi yang menyesuaikan menu berdasarkan role pengguna.
 */
export function AppSidebar() {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;
    const roles = user?.roles ?? [];

    // Menu navigasi berdasarkan role
    const navItems: NavItem[] = [];

    // Menu untuk masyarakat
    if (roles.includes('masyarakat') || roles.length === 0) {
        navItems.push(
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
            { title: 'Buat Pengaduan', href: '/pengaduan/buat', icon: Send },
        );
    }

    // Menu untuk petugas layanan
    if (roles.includes('petugas_layanan')) {
        navItems.push(
            { title: 'Dashboard Petugas', href: '/petugas/dashboard', icon: LayoutGrid },
            { title: 'Pengaduan Saya', href: '/petugas/dashboard', icon: ClipboardList },
        );
    }

    // Menu untuk panitera
    if (roles.includes('panitera')) {
        navItems.push(
            { title: 'Dashboard Panitera', href: '/panitera/dashboard', icon: LayoutGrid },
            { title: 'Semua Pengaduan', href: '/panitera/dashboard', icon: FileText },
        );
    }

    // Menu untuk admin
    if (roles.includes('admin')) {
        navItems.push(
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
            { title: 'Pengaduan', href: '/admin/dashboard', icon: FileText },
            { title: 'Pengguna', href: '/admin/users', icon: Users },
            { title: 'Kategori', href: '/admin/categories', icon: Tags },
            { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
            { title: 'Audit Log', href: '/admin/audit-log', icon: ScrollText },
        );
    }

    // Fallback jika tidak ada role
    if (navItems.length === 0) {
        navItems.push(
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        );
    }

    const footerNavItems: NavItem[] = [
        {
            title: 'Website PA Penajam',
            href: 'https://pa-penajam.go.id/',
            icon: FileText,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

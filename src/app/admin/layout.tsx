// src/app/admin/layout.tsx
'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    BarChart3,
    Users,
    Calendar,
    MessageSquare,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    X,
    Home
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import styles from './admin.module.css';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Classes', href: '/admin/classes', icon: Calendar },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { name: 'Bookings', href: '/admin/bookings', icon: BookOpen },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const { admin, loading, signOut } = useAdminAuth();
    const router = useRouter();

    // If on login page, don't show the admin layout
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const handleSignOut = async () => {
        await signOut();
    };

    const goToWebsite = () => {
        router.push('/');
    };

    // Show loading screen
    if (loading) {
        return (
            <div className={styles.loadingFullscreen}>
                <div className={styles.spinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // If not logged in and not on login page, show loading (will redirect)
    if (!admin) {
        return (
            <div className={styles.loadingFullscreen}>
                <div className={styles.spinner}></div>
                <p>Redirecting to login...</p>
            </div>
        );
    }

    // Logged in - show full admin layout
    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.logo}>24FITNESS ADMIN</h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className={styles.closeButton}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.navigation}>
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.adminInfo}>
                        <div className={styles.adminEmail}>{admin.email}</div>
                        <div className={styles.adminRole}>{admin.role}</div>
                    </div>

                    <div className={styles.sidebarActions}>
                        <button onClick={goToWebsite} className={styles.websiteButton}>
                            <Home size={20} />
                            <span>View Website</span>
                        </button>

                        <button onClick={handleSignOut} className={styles.logoutButton}>
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Top Header */}
                <header className={styles.header}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className={styles.menuButton}
                    >
                        <Menu size={24} />
                    </button>

                    <div className={styles.headerContent}>
                        <h1 className={styles.pageTitle}>
                            {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
                        </h1>

                        <div className={styles.headerActions}>
                            <span className={styles.welcomeText}>
                                Welcome, {admin.email}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
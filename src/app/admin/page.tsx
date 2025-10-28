// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
    Users,
    Calendar,
    MessageSquare,
    BookOpen,
    TrendingUp,
    Star
} from 'lucide-react';
import styles from './admin.module.css';

interface Stats {
    totalUsers: number;
    totalClasses: number;
    totalReviews: number;
    totalBookings: number;
    averageRating: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalClasses: 0,
        totalReviews: 0,
        totalBookings: 0,
        averageRating: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            // Fetch users count
            const { count: usersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Fetch classes count
            const { count: classesCount } = await supabase
                .from('classes')
                .select('*', { count: 'exact', head: true });

            // Fetch reviews count and average rating
            const { data: reviewsData, count: reviewsCount } = await supabase
                .from('reviews')
                .select('rating', { count: 'exact' });

            // Fetch bookings count
            const { count: bookingsCount } = await supabase
                .from('bookings')
                .select('*', { count: 'exact', head: true });

            // Calculate average rating
            const averageRating = reviewsData && reviewsData.length > 0
                ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
                : 0;

            setStats({
                totalUsers: usersCount || 0,
                totalClasses: classesCount || 0,
                totalReviews: reviewsCount || 0,
                totalBookings: bookingsCount || 0,
                averageRating
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <div className={styles.welcomeSection}>
                <h1 className={styles.welcomeTitle}>Dashboard Overview</h1>
                <p className={styles.welcomeSubtitle}>
                    Welcome to your 24Fitness admin panel
                </p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalUsers}</h3>
                        <p className={styles.statLabel}>Total Users</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Calendar size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalClasses}</h3>
                        <p className={styles.statLabel}>Classes</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <MessageSquare size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalReviews}</h3>
                        <p className={styles.statLabel}>Reviews</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <BookOpen size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalBookings}</h3>
                        <p className={styles.statLabel}>Bookings</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Star size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>
                            {stats.averageRating.toFixed(1)}
                        </h3>
                        <p className={styles.statLabel}>Avg Rating</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>
                            {stats.totalBookings > 0 ? Math.round((stats.totalBookings / stats.totalUsers) * 100) : 0}%
                        </h3>
                        <p className={styles.statLabel}>Engagement Rate</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionGrid}>
                    <button className={styles.actionButton}>
                        <Calendar size={20} />
                        <span>Add New Class</span>
                    </button>
                    <button className={styles.actionButton}>
                        <Users size={20} />
                        <span>Manage Users</span>
                    </button>
                    <button className={styles.actionButton}>
                        <MessageSquare size={20} />
                        <span>Moderate Reviews</span>
                    </button>
                    <button className={styles.actionButton}>
                        <BookOpen size={20} />
                        <span>View Bookings</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Calendar,
    MessageSquare,
    BookOpen,
    TrendingUp,
    Star,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import styles from './admin.module.css';

interface Stats {
    totalUsers: number;
    totalClasses: number;
    totalReviews: number;
    totalBookings: number;
    averageRating: number;
    engagementRate: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalClasses: 0,
        totalReviews: 0,
        totalBookings: 0,
        averageRating: 0,
        engagementRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Fetching admin stats via API...');

            const response = await fetch('/api/admin/dashboard', {
                credentials: 'include',
                cache: 'no-store'
            });

            const data = await response.json();

            console.log('📊 API response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.details || 'Failed to fetch data');
            }

            setStats(data.stats);

        } catch (error) {
            console.error('💥 Error fetching dashboard stats:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardStats();
    };

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading dashboard data...</p>
                    <small>Fetching real-time statistics...</small>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.welcomeSection}>
                <div className={styles.welcomeHeader}>
                    <div>
                        <h1 className={styles.welcomeTitle}>Dashboard Overview</h1>
                        <p className={styles.welcomeSubtitle}>
                            Welcome to 24Fitness Admin Panel
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            className={styles.refreshButton}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh Data'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className={styles.errorState}>
                    <AlertCircle size={24} />
                    <h3>Data Loading Error</h3>
                    <p>{error}</p>
                    <button className={styles.retryButton} onClick={fetchDashboardStats}>
                        <RefreshCw size={16} />
                        Try Again
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Users size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalUsers}</h3>
                        <p className={styles.statLabel}>Total Users</p>
                        <small className={styles.statSubtext}>
                            Registered members
                        </small>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <Calendar size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalClasses}</h3>
                        <p className={styles.statLabel}>Classes</p>
                        <small className={styles.statSubtext}>
                            Available sessions
                        </small>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <MessageSquare size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalReviews}</h3>
                        <p className={styles.statLabel}>Reviews</p>
                        <small className={styles.statSubtext}>
                            Customer feedback
                        </small>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <BookOpen size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>{stats.totalBookings}</h3>
                        <p className={styles.statLabel}>Bookings</p>
                        <small className={styles.statSubtext}>
                            Total reservations
                        </small>
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
                        <small className={styles.statSubtext}>
                            {stats.averageRating > 0 ? 'Out of 5 stars' : 'No ratings yet'}
                        </small>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon}>
                        <TrendingUp size={24} />
                    </div>
                    <div className={styles.statContent}>
                        <h3 className={styles.statNumber}>
                            {stats.engagementRate.toFixed(1)}%
                        </h3>
                        <p className={styles.statLabel}>Engagement Rate</p>
                        <small className={styles.statSubtext}>
                            {Math.round((stats.engagementRate / 100) * stats.totalUsers)} active users
                        </small>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.quickActions}>
                <h2 className={styles.sectionTitle}>Quick Actions</h2>
                <div className={styles.actionGrid}>
                    <button className={styles.actionButton} onClick={() => window.location.href = '/admin/classes/new'}>
                        <Calendar size={20} />
                        <span>Add New Class</span>
                    </button>
                    <button className={styles.actionButton} onClick={() => window.location.href = '/admin/users'}>
                        <Users size={20} />
                        <span>Manage Users</span>
                    </button>
                    <button className={styles.actionButton} onClick={() => window.location.href = '/admin/reviews'}>
                        <MessageSquare size={20} />
                        <span>Moderate Reviews</span>
                    </button>
                    <button className={styles.actionButton} onClick={() => window.location.href = '/admin/bookings'}>
                        <BookOpen size={20} />
                        <span>View Bookings</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className={styles.statsSummary}>
                <h3 className={styles.sectionTitle}>Platform Summary</h3>
                <div className={styles.summaryGrid}>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>User Engagement</span>
                        <div className={styles.summaryBar}>
                            <div
                                className={styles.summaryFill}
                                style={{ width: `${stats.engagementRate}%` }}
                            ></div>
                        </div>
                        <span className={styles.summaryValue}>{stats.engagementRate.toFixed(1)}%</span>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Average Rating</span>
                        <div className={styles.ratingDisplay}>
                            <Star size={16} className={styles.starIcon} />
                            <span>{stats.averageRating.toFixed(1)} / 5.0</span>
                        </div>
                    </div>
                    <div className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>Booking Rate</span>
                        <span className={styles.summaryValue}>
                            {stats.totalUsers > 0
                                ? ((stats.totalBookings / stats.totalUsers) * 100).toFixed(1)
                                : '0'
                            }%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
// src/app/admin/bookings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookOpen, Trash2, Download } from 'lucide-react';
import styles from './bookings.module.css';

interface Booking {
    id: number;
    created_at: string;
    user_id: string;
    class_id: number;
    user_email?: string;
    user_name?: string;
    class_name?: string;
    class_schedule?: string;
    class_duration?: number;
    trainer_name?: string;
}

export default function BookingsManagement() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            console.log('Fetching bookings from admin API...');
            const response = await fetch('/api/admin/bookings/list');

            if (!response.ok) {
                const error = await response.json();
                console.error('Admin API error:', error);
                throw new Error(error.message || 'Failed to fetch bookings');
            }

            const data = await response.json();
            console.log('Received bookings data:', {
                success: !!data.bookings,
                count: data.bookings?.length || 0,
                sample: data.bookings?.[0]
            });

            setBookings(data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            alert('Failed to load bookings. Please try refreshing the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bookingId: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/bookings', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bookingId })
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('Admin API delete error:', json);
                throw new Error(json?.error || 'Failed to cancel booking');
            }

            alert('Booking cancelled successfully!');
            fetchBookings();
        } catch (error: any) {
            console.error('Error deleting booking via admin API:', error);
            alert(`Failed to cancel booking: ${error.message || 'Unknown error'}`);
        }
    };

    const exportToCSV = () => {
        const headers = ['Booking ID', 'User Name', 'User Email', 'Class Name', 'Schedule', 'Trainer', 'Booked At'];
        const rows = filteredBookings.map(booking => [
            booking.id,
            booking.user_name || 'N/A',
            booking.user_email || 'N/A',
            booking.class_name || 'N/A',
            formatDateTime(booking.class_schedule || ''),
            booking.trainer_name || 'N/A',
            formatDate(booking.created_at)
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isUpcoming = (schedule: string) => {
        if (!schedule) return false;
        return new Date(schedule) > new Date();
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return isUpcoming(booking.class_schedule || '');
        if (filter === 'past') return !isUpcoming(booking.class_schedule || '');
        return true;
    });

    const stats = {
        total: bookings.length,
        upcoming: bookings.filter(b => isUpcoming(b.class_schedule || '')).length,
        past: bookings.filter(b => !isUpcoming(b.class_schedule || '')).length
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading bookings...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Bookings Management</h1>
                    <p className={styles.pageSubtitle}>
                        View and manage all class bookings ({bookings.length} total)
                    </p>
                </div>
                <button onClick={exportToCSV} className={styles.primaryButton}>
                    <Download size={20} />
                    Export to CSV
                </button>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statBox}>
                    <h3>{stats.total}</h3>
                    <p>Total Bookings</p>
                </div>
                <div className={styles.statBox}>
                    <h3>{stats.upcoming}</h3>
                    <p>Upcoming</p>
                </div>
                <div className={styles.statBox}>
                    <h3>{stats.past}</h3>
                    <p>Completed</p>
                </div>
            </div>

            <div className={styles.filterBar}>
                <button
                    onClick={() => setFilter('all')}
                    className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                >
                    All Bookings
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`${styles.filterButton} ${filter === 'upcoming' ? styles.active : ''}`}
                >
                    Upcoming ({stats.upcoming})
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`${styles.filterButton} ${filter === 'past' ? styles.active : ''}`}
                >
                    Past ({stats.past})
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Class</th>
                            <th>Schedule</th>
                            <th>Trainer</th>
                            <th>Booked At</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={styles.emptyState}>
                                    <BookOpen size={48} />
                                    <p>No bookings found</p>
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>#{booking.id}</td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>
                                                {booking.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div>{booking.user_name || 'N/A'}</div>
                                                <div className={styles.subText}>{booking.user_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>{booking.class_name}</strong>
                                        <div className={styles.subText}>
                                            {booking.class_duration} min
                                        </div>
                                    </td>
                                    <td>{formatDateTime(booking.class_schedule || '')}</td>
                                    <td>{booking.trainer_name}</td>
                                    <td>{formatDate(booking.created_at)}</td>
                                    <td>
                                        <span className={`${styles.badge} ${isUpcoming(booking.class_schedule || '') ? styles.badgeSuccess : styles.badgeGray}`}>
                                            {isUpcoming(booking.class_schedule || '') ? 'Upcoming' : 'Completed'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleDelete(booking.id)}
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            title="Cancel Booking"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
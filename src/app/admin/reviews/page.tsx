// src/app/admin/reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Star, Trash2, Calendar } from 'lucide-react';
import styles from './reviews.module.css';

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    class_id: number;
    user_email?: string;
    user_name?: string;
    class_name?: string;
}

export default function ReviewsManagement() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            // First get reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (reviewsError) {
                console.error('Reviews fetch error:', reviewsError);
                throw reviewsError;
            }

            console.log('Fetched reviews:', reviewsData);

            if (!reviewsData || reviewsData.length === 0) {
                setReviews([]);
                setLoading(false);
                return;
            }

            // Get unique user IDs and class IDs
            const userIds = [...new Set(reviewsData.map(r => r.user_id))];
            const classIds = [...new Set(reviewsData.map(r => r.class_id))];

            // Fetch user data from admin API
            const usersResponse = await fetch('/api/admin/users/list');
            if (!usersResponse.ok) {
                const error = await usersResponse.json();
                throw new Error(error.message || 'Failed to fetch users');
            }
            const { users: allUsers } = await usersResponse.json();

            // Filter users to only those who wrote reviews
            const usersData = userIds.map(userId => {
                const userData = allUsers?.find((u: any) => u.id === userId);
                return {
                    id: userId,
                    email: userData?.email || 'No email',
                    full_name: userData?.full_name || 'Unknown User'
                };
            });

            // Fetch classes
            const { data: classesData } = await supabase
                .from('classes')
                .select('id, name')
                .in('id', classIds);

            // Map data
            const mappedReviews = reviewsData.map(review => {
                const user = usersData?.find(u => u.id === review.user_id);
                const classData = classesData?.find(c => c.id === review.class_id);

                return {
                    ...review,
                    user_email: user?.email,
                    user_name: user?.full_name,
                    class_name: classData?.name
                };
            });

            console.log('Mapped reviews:', mappedReviews);
            setReviews(mappedReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId: number) => {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: reviewId })
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                console.error('Admin API delete error:', json);
                throw new Error(json?.error || 'Failed to delete review');
            }

            alert('Review deleted successfully!');
            fetchReviews();
        } catch (error: any) {
            console.error('Error deleting review via admin API:', error);
            alert(`Failed to delete review: ${error.message || 'Unknown error'}`);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className={styles.starRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        fill={star <= rating ? '#f97316' : 'none'}
                        stroke={star <= rating ? '#f97316' : '#9ca3af'}
                    />
                ))}
            </div>
        );
    };

    const filteredReviews = filter === 'all'
        ? reviews
        : reviews.filter(review => review.rating === parseInt(filter));

    const stats = {
        total: reviews.length,
        averageRating: reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0',
        fiveStars: reviews.filter(r => r.rating === 5).length,
        fourStars: reviews.filter(r => r.rating === 4).length,
        threeStars: reviews.filter(r => r.rating === 3).length,
        twoStars: reviews.filter(r => r.rating === 2).length,
        oneStar: reviews.filter(r => r.rating === 1).length,
    };

    if (loading) {
        return (
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Reviews Management</h1>
                    <p className={styles.pageSubtitle}>
                        Manage and moderate user reviews ({reviews.length} total)
                    </p>
                </div>
            </div>

            <div className={styles.statsRow}>
                <div className={styles.statBox}>
                    <h3>{stats.total}</h3>
                    <p>Total Reviews</p>
                </div>
                <div className={styles.statBox}>
                    <h3>{stats.averageRating} ★</h3>
                    <p>Average Rating</p>
                </div>
                <div className={styles.statBox}>
                    <h3>{stats.fiveStars}</h3>
                    <p>5-Star Reviews</p>
                </div>
                <div className={styles.statBox}>
                    <h3>{stats.fourStars}</h3>
                    <p>4-Star Reviews</p>
                </div>
            </div>

            <div className={styles.filterBar}>
                <button
                    onClick={() => setFilter('all')}
                    className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                >
                    All Reviews
                </button>
                <button
                    onClick={() => setFilter('5')}
                    className={`${styles.filterButton} ${filter === '5' ? styles.active : ''}`}
                >
                    5 Stars ({stats.fiveStars})
                </button>
                <button
                    onClick={() => setFilter('4')}
                    className={`${styles.filterButton} ${filter === '4' ? styles.active : ''}`}
                >
                    4 Stars ({stats.fourStars})
                </button>
                <button
                    onClick={() => setFilter('3')}
                    className={`${styles.filterButton} ${filter === '3' ? styles.active : ''}`}
                >
                    3 Stars ({stats.threeStars})
                </button>
                <button
                    onClick={() => setFilter('2')}
                    className={`${styles.filterButton} ${filter === '2' ? styles.active : ''}`}
                >
                    2 Stars ({stats.twoStars})
                </button>
                <button
                    onClick={() => setFilter('1')}
                    className={`${styles.filterButton} ${filter === '1' ? styles.active : ''}`}
                >
                    1 Star ({stats.oneStar})
                </button>
            </div>

            <div className={styles.reviewsList}>
                {filteredReviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <MessageSquare size={64} />
                        <p>No reviews found</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review.id} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewUserInfo}>
                                    <div className={styles.avatar}>
                                        {review.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h4>{review.user_name || 'Anonymous'}</h4>
                                        <p className={styles.reviewMeta}>
                                            {review.user_email || 'No email'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDelete(review.id)}
                                    className={styles.deleteButton}
                                    title="Delete Review"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className={styles.reviewRating}>
                                {renderStars(review.rating)}
                                <span className={styles.ratingText}>{review.rating}.0</span>
                            </div>

                            <p className={styles.reviewComment}>{review.comment}</p>

                            <div className={styles.reviewFooter}>
                                <span className={styles.reviewClass}>
                                    Class: <strong>{review.class_name || 'Unknown'}</strong>
                                </span>
                                <span className={styles.reviewDate}>
                                    <Calendar size={14} />
                                    {formatDate(review.created_at)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
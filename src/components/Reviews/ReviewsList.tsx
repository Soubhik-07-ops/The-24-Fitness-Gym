// src/components/Reviews/ReviewsList.tsx
'use client';

import { Review } from '@/types/review';
import styles from './ReviewsList.module.css';
import StarRating from './StarRating';
import { User, Calendar } from 'lucide-react';

interface ReviewsListProps {
    reviews: Review[];
    className?: string;
    currentUserId?: string;
    onEditReview?: (review: Review) => void;
    onDeleteReview?: (reviewId: number) => void;
}

export default function ReviewsList({
    reviews,
    className = '',
    currentUserId,
    onEditReview,
    onDeleteReview
}: ReviewsListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getInitials = (fullName: string | null) => {
        if (!fullName) return 'U';
        return fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (reviews.length === 0) {
        return (
            <div className={`${styles.reviewsList} ${className}`}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>💬</div>
                    <h3>No Reviews Yet</h3>
                    <p>Be the first to share your experience with this class!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.reviewsList} ${className}`}>
            <div className={styles.reviewsHeader}>
                <h3>Member Reviews ({reviews.length})</h3>
            </div>

            <div className={styles.reviewsContainer}>
                {reviews.map((review) => {
                    // Check if current user owns this review
                    const isOwnReview = currentUserId && review.user_id === currentUserId;

                    return (
                        <div key={review.id} className={styles.reviewItem}>
                            {/* Review Header */}
                            <div className={styles.reviewHeader}>
                                <div className={styles.userInfo}>
                                    <div className={styles.avatar}>
                                        {review.profiles?.avatar_url ? (
                                            <img
                                                src={review.profiles.avatar_url}
                                                alt="User avatar"
                                                className={styles.avatarImage}
                                            />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {getInitials(review.profiles?.full_name || null)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>
                                            {review.profiles?.full_name || 'Anonymous Member'}
                                            {isOwnReview && <span className={styles.youBadge}> (You)</span>}
                                        </span>
                                        <div className={styles.reviewMeta}>
                                            <StarRating rating={review.rating} size={16} readonly />
                                            <span className={styles.reviewDate}>
                                                <Calendar size={12} />
                                                {formatDate(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit/Delete Actions - ONLY show for own reviews */}
                                {isOwnReview && (
                                    <div className={styles.reviewActions}>
                                        {onEditReview && (
                                            <button
                                                onClick={() => onEditReview(review)}
                                                className={styles.editButton}
                                                title="Edit your review"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        {onDeleteReview && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete your review?')) {
                                                        onDeleteReview(Number(review.id));
                                                    }
                                                }}
                                                className={styles.deleteButton}
                                                title="Delete your review"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Review Comment */}
                            {review.comment && (
                                <div className={styles.reviewComment}>
                                    <p>{review.comment}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
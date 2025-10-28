// src/components/Reviews/ReviewStats.tsx
import { ReviewStats as ReviewStatsType } from '@/types/review';
import styles from './ReviewStats.module.css';
import StarRating from './StarRating';

interface ReviewStatsProps {
    stats: ReviewStatsType;
    className?: string;
}

export default function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
    const getPercentage = (count: number) => {
        return stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
    };

    return (
        <div className={`${styles.reviewStats} ${className}`}>
            <div className={styles.overview}>
                <div className={styles.averageRating}>
                    <span className={styles.averageNumber}>
                        {stats.average_rating.toFixed(1)}
                    </span>
                    <StarRating rating={stats.average_rating} size={24} readonly showLabel />
                    <span className={styles.totalReviews}>
                        {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            {stats.total_reviews > 0 && (
                <div className={styles.breakdown}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className={styles.ratingBar}>
                            <span className={styles.ratingLabel}>{rating} star</span>
                            <div className={styles.barContainer}>
                                <div
                                    className={styles.bar}
                                    style={{ width: `${getPercentage(stats.rating_distribution[rating as keyof typeof stats.rating_distribution])}%` }}
                                ></div>
                            </div>
                            <span className={styles.ratingCount}>
                                {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
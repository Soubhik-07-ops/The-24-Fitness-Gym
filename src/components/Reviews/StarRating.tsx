// src/components/Reviews/StarRating.tsx
'use client';

import { useState } from 'react';
import styles from './StarRating.module.css';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: number;
    readonly?: boolean;
    showLabel?: boolean;
}

export default function StarRating({
    rating,
    onRatingChange,
    size = 20,
    readonly = false,
    showLabel = false
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const handleClick = (newRating: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(newRating);
        }
    };

    const handleMouseEnter = (newRating: number) => {
        if (!readonly) {
            setHoverRating(newRating);
        }
    };

    const handleMouseLeave = () => {
        if (!readonly) {
            setHoverRating(0);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className={styles.starRating}>
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={`${styles.star} ${star <= displayRating ? styles.filled : ''
                            } ${readonly ? styles.readonly : ''}`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        disabled={readonly}
                    >
                        <Star
                            size={size}
                            fill={star <= displayRating ? "currentColor" : "none"}
                        />
                    </button>
                ))}
            </div>
            {showLabel && (
                <span className={styles.ratingLabel}>
                    {rating.toFixed(1)} out of 5
                </span>
            )}
        </div>
    );
}
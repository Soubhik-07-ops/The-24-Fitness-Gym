// src/components/Reviews/ReviewModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { ReviewFormData } from '@/types/review';
import styles from './ReviewModal.module.css';
import StarRating from './StarRating';
import { X, Send, Loader2 } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (review: ReviewFormData) => Promise<void>;
    classId: number;
    className: string;
    existingReview?: any;
}

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    classId,
    className,
    existingReview
}: ReviewModalProps) {
    const [formData, setFormData] = useState<ReviewFormData>({
        rating: existingReview?.rating || 0,
        comment: existingReview?.comment || ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens/closes or existingReview changes
    useEffect(() => {
        if (isOpen) {
            console.log('🎯 ReviewModal - Opening with existingReview:', existingReview);
            setFormData({
                rating: existingReview?.rating || 0,
                comment: existingReview?.comment || ''
            });
            setError(null);
        }
    }, [isOpen, existingReview]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await onSubmit(formData);
            onClose();
        } catch (error: any) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.modalHeader}>
                    <h2>
                        {existingReview ? 'Update Your Review' : 'Write a Review'}
                    </h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.classInfo}>
                    <h3>{className}</h3>
                </div>

                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    {/* Rating Section */}
                    <div className={styles.ratingSection}>
                        <label className={styles.label}>Your Rating</label>
                        <StarRating
                            rating={formData.rating}
                            onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                            size={32}
                        />
                    </div>

                    {/* Comment Section */}
                    <div className={styles.commentSection}>
                        <label htmlFor="comment" className={styles.label}>
                            Your Review (Optional)
                        </label>
                        <textarea
                            id="comment"
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            className={styles.textarea}
                            placeholder="Share your experience with this class..."
                            rows={4}
                            maxLength={500}
                        />
                        <div className={styles.charCount}>
                            {formData.comment.length}/500 characters
                        </div>
                    </div>

                    {error && (
                        <div className={styles.errorBanner}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || formData.rating === 0}
                            className={styles.submitButton}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className={styles.spinner} size={16} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    {existingReview ? 'Update Review' : 'Submit Review'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
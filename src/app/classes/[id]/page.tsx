// src/app/classes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Class } from '@/components/Classes/ClassList';
import { Review, ReviewStats as ReviewStatsType, ReviewFormData } from '@/types/review';
import styles from './ClassDetail.module.css';
import StarRating from '@/components/Reviews/StarRating';
import ReviewStats from '@/components/Reviews/ReviewStats';
import ReviewsList from '@/components/Reviews/ReviewsList';
import ReviewModal from '@/components/Reviews/ReviewModal';
import { Calendar, Clock, User, Users, ArrowLeft, Edit3, MessageCircle } from 'lucide-react';
import Footer from '@/components/Footer/Footer';
import Navbar from '@/components/Navbar/Navbar';

export default function ClassDetailPage() {
    const params = useParams();
    const router = useRouter();
    const classId = params.id as string;

    const [classItem, setClassItem] = useState<Class | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewStats, setReviewStats] = useState<ReviewStatsType | null>(null);
    const [userReview, setUserReview] = useState<Review | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (classId) {
            fetchClassDetails();
            checkAuth();
        }
    }, [classId]);

    const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
    };

    const fetchClassDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch class details
            const { data: classData, error: classError } = await supabase
                .from('classes')
                .select('*')
                .eq('id', classId)
                .single();

            if (classError) throw classError;
            if (!classData) {
                setError('Class not found');
                return;
            }

            // Fetch bookings count
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('id')
                .eq('class_id', classId);

            // Fetch reviews
            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('class_id', classId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (reviewsError) throw reviewsError;

            // Fetch user profiles for these reviews
            let reviewsWithUserData: Review[] = [];

            if (reviewsData && reviewsData.length > 0) {
                const userIds = [...new Set(reviewsData.map(review => review.user_id))];

                // Get user profiles
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesError) {
                    console.error('Error fetching profiles:', profilesError);
                }

                // Combine reviews with profile data
                reviewsWithUserData = reviewsData.map(review => {
                    const userProfile = profilesData?.find(profile => profile.id === review.user_id);

                    return {
                        ...review,
                        profiles: userProfile ? {
                            full_name: userProfile.full_name || 'Gym Member',
                            avatar_url: userProfile.avatar_url
                        } : {
                            full_name: 'Gym Member',
                            avatar_url: null
                        }
                    };
                });
            }

            // Calculate review stats
            const stats = calculateReviewStats(reviewsWithUserData);

            // Check if current user has a review
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserReview = session?.user
                ? reviewsWithUserData.find(review => review.user_id === session.user.id)
                : null;

            // Set state
            setClassItem({
                ...classData,
                current_bookings: bookingsData?.length || 0
            });
            setReviews(reviewsWithUserData);
            setReviewStats(stats);
            setUserReview(currentUserReview || null);

        } catch (error: any) {
            console.error('🚨 Error in fetchClassDetails:', error);
            setError('Failed to load class details');
        } finally {
            setLoading(false);
        }
    };

    const calculateReviewStats = (reviews: Review[]): ReviewStatsType => {
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;

        const ratingDistribution = {
            1: reviews.filter(r => r.rating === 1).length,
            2: reviews.filter(r => r.rating === 2).length,
            3: reviews.filter(r => r.rating === 3).length,
            4: reviews.filter(r => r.rating === 4).length,
            5: reviews.filter(r => r.rating === 5).length
        };

        return {
            average_rating: averageRating,
            total_reviews: totalReviews,
            rating_distribution: ratingDistribution
        };
    };

    const handleSubmitReview = async (reviewData: ReviewFormData) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            alert('Please log in to submit a review');
            return;
        }

        try {
            if (userReview) {
                // Update existing review
                const { error } = await supabase
                    .from('reviews')
                    .update({
                        rating: reviewData.rating,
                        comment: reviewData.comment,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userReview.id);

                if (error) throw error;
            } else {
                // Create new review
                const { error } = await supabase
                    .from('reviews')
                    .insert({
                        user_id: session.user.id,
                        class_id: classId,
                        rating: reviewData.rating,
                        comment: reviewData.comment
                    });

                if (error) throw error;
            }

            // Refresh data
            await fetchClassDetails();

        } catch (error: any) {
            console.error('Error submitting review:', error);
            throw error;
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        try {
            const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            // Refresh data
            await fetchClassDetails();

        } catch (error: any) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review: ' + error.message);
        }
    };

    const formatDateTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getSpotsRemaining = () => {
        if (!classItem) return 0;
        return classItem.max_capacity - (classItem.current_bookings || 0);
    };

    if (loading) {
        return (
            <div className={styles.classDetailContainer}>
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Loading class details...</p>
                </div>
            </div>
        );
    }

    if (error || !classItem) {
        return (
            <div className={styles.classDetailContainer}>
                <div className={styles.errorState}>
                    <h2>{error || 'Class Not Found'}</h2>
                    <p>The class you're looking for doesn't exist or couldn't be loaded.</p>
                    <button
                        onClick={() => router.push('/classes')}
                        className={styles.backButton}
                    >
                        Back to Classes
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className={styles.classDetailContainer}>
                {/* Back Button */}
                <button
                    onClick={() => router.push('/classes')}
                    className={styles.backButton}
                >
                    <ArrowLeft size={20} />
                    Back to Classes
                </button>

                {/* Class Header */}
                <div className={styles.classHeader}>
                    <div className={styles.classInfo}>
                        <div className={styles.classTitleSection}>
                            <h1 className={styles.classTitle}>{classItem.name}</h1>
                            {classItem.category && classItem.category !== 'General' && (
                                <span className={styles.classCategory}>{classItem.category}</span>
                            )}
                        </div>

                        <div className={styles.classMeta}>
                            <div className={styles.metaItem}>
                                <User size={18} />
                                <span>with {classItem.trainer_name}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Calendar size={18} />
                                <span>{formatDateTime(classItem.schedule)}</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Clock size={18} />
                                <span>{classItem.duration_minutes} minutes</span>
                            </div>
                            <div className={styles.metaItem}>
                                <Users size={18} />
                                <span>
                                    {getSpotsRemaining()} of {classItem.max_capacity} spots available
                                </span>
                            </div>
                        </div>

                        {reviewStats && reviewStats.total_reviews > 0 && (
                            <div className={styles.ratingOverview}>
                                <StarRating
                                    rating={reviewStats.average_rating}
                                    size={20}
                                    readonly
                                    showLabel
                                />
                            </div>
                        )}
                    </div>

                    {/* Review Action Button */}
                    {user && (
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className={styles.reviewButton}
                        >
                            {userReview ? (
                                <>
                                    <Edit3 size={18} />
                                    Edit Your Review
                                </>
                            ) : (
                                <>
                                    <MessageCircle size={18} />
                                    Write a Review
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Class Description */}
                <div className={styles.classDescription}>
                    <h3>About This Class</h3>
                    <p>{classItem.description}</p>
                </div>

                {/* Reviews Section */}
                <div className={styles.reviewsSection}>
                    <div className={styles.reviewsLayout}>
                        {/* Review Stats */}
                        {reviewStats && (
                            <div className={styles.statsColumn}>
                                <ReviewStats stats={reviewStats} />

                                {!user && (
                                    <div className={styles.reviewPrompt}>
                                        <h4>Share Your Experience</h4>
                                        <p>Log in to write a review and help other members choose the best classes.</p>
                                        <button
                                            onClick={() => router.push('/signup')}
                                            className={styles.loginButton}
                                        >
                                            Log In to Review
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reviews List */}
                        <div className={styles.reviewsColumn}>
                            <ReviewsList
                                reviews={reviews}
                                currentUserId={user?.id}
                                onEditReview={(review) => {
                                    setUserReview(review);
                                    setIsReviewModalOpen(true);
                                }}
                                onDeleteReview={handleDeleteReview}
                            />
                        </div>
                    </div>
                </div>

                {/* Review Modal */}
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => {
                        setIsReviewModalOpen(false);
                    }}
                    onSubmit={handleSubmitReview}
                    classId={parseInt(classId)}
                    className={classItem.name}
                    existingReview={userReview}
                />
            </div>
            <Footer />
        </>
    );
}
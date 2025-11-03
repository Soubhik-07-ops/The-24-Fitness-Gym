// src/components/Testimonials/Testimonials.tsx
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { Star, Quote, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Review } from '@/types/review'
import styles from './Testimonials.module.css'

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

interface Class {
    id: number;
    name: string;
}

export default function Testimonials() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-50px' })
    const [reviews, setReviews] = useState<Review[]>([])
    const [classes, setClasses] = useState<Class[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        totalMembers: 0
    })
    const [currentSlide, setCurrentSlide] = useState(0)

    // Fetch reviews, classes, and statistics from the database
    useEffect(() => {
        const fetchTestimonialData = async () => {
            try {
                console.log('🔄 Starting to fetch testimonial data...')

                // Fetch all classes first
                const { data: classesData, error: classesError } = await supabase
                    .from('classes')
                    .select('id, name')
                    .order('name', { ascending: true })

                console.log('📚 Classes data:', classesData)

                if (classesError) throw classesError

                // Normalize ids (Postgres bigint may be returned as string)
                const classesNormalized = (classesData || []).map((c: any) => ({ ...c, id: Number(c.id) }))
                setClasses(classesNormalized)

                // Fetch all approved reviews for carousel
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from('reviews')
                    .select('*')
                    .eq('is_approved', true)
                    .order('created_at', { ascending: false })

                console.log('📊 Reviews data:', reviewsData)

                if (reviewsError) throw reviewsError

                let reviewsWithUserData: Review[] = []

                // Fetch user profiles separately if we have reviews
                if (reviewsData && reviewsData.length > 0) {
                    // Filter out null user_ids and get unique user IDs
                    const userIds = [...new Set(reviewsData
                        .map(review => review.user_id)
                        .filter(userId => userId !== null)
                    )]

                    console.log('👤 User IDs to fetch:', userIds)

                    let profilesData: Profile[] = []
                    if (userIds.length > 0) {
                        const { data: profiles, error: profilesError } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .in('id', userIds)

                        if (profilesError) {
                            console.error('❌ Profiles fetch error:', profilesError)
                        } else {
                            profilesData = profiles || []
                        }
                    }

                    console.log('👤 Profiles data found:', profilesData)

                    // Combine reviews with profiles and class names
                    reviewsWithUserData = reviewsData.map((review): Review => {
                        const userProfile = profilesData?.find(profile => profile.id === review.user_id)

                        // Ensure we compare the same types (normalize review.class_id as number when possible)
                        const reviewClassId = typeof review.class_id === 'string' ? Number(review.class_id) : review.class_id
                        const classInfo = classesData?.find(cls => Number(cls.id) === Number(reviewClassId))

                        return {
                            ...review,
                            profiles: userProfile ? {
                                full_name: userProfile.full_name,
                                avatar_url: userProfile.avatar_url
                            } : {
                                full_name: 'Gym Member',
                                avatar_url: null
                            },
                            classes: classInfo ? {
                                name: classInfo.name
                            } : {
                                name: 'General Fitness' // Fallback if class not found
                            }
                        }
                    })
                }

                // Fetch statistics
                const { data: statsData, error: statsError } = await supabase
                    .from('reviews')
                    .select('rating, user_id')
                    .eq('is_approved', true)

                console.log('📈 Stats query result:', statsData)

                if (statsError) throw statsError

                // Calculate statistics
                const totalReviews = statsData?.length || 0
                const averageRating = totalReviews > 0
                    ? statsData!.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                    : 0

                // Count unique members (filter out nulls)
                const uniqueMembers = new Set(statsData
                    ?.map(review => review.user_id)
                    .filter(userId => userId !== null) || []
                ).size

                console.log('✅ Final stats:', {
                    reviewsCount: reviewsWithUserData.length,
                    averageRating,
                    totalReviews,
                    uniqueMembers
                })

                setReviews(reviewsWithUserData)
                setStats({
                    averageRating,
                    totalReviews,
                    totalMembers: uniqueMembers
                })

            } catch (error: any) {
                console.error('🚨 Error fetching testimonial data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTestimonialData()
    }, [])

    const getInitials = (fullName: string | null) => {
        if (!fullName) return 'GM';
        return fullName
            .split(' ')
            .map(name => name[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short'
        })
    }

    // Carousel navigation
    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === reviews.length - getSlidesPerView() ? 0 : prev + 1
        )
    }

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? reviews.length - getSlidesPerView() : prev - 1
        )
    }

    const getSlidesPerView = () => {
        if (typeof window === 'undefined') return 3
        if (window.innerWidth < 768) return 1
        if (window.innerWidth < 1024) return 2
        return 3
    }

    const visibleReviews = reviews.slice(currentSlide, currentSlide + getSlidesPerView())

    if (loading) {
        return (
            <section className={styles.testimonials}>
                <div className={styles.container}>
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Loading member stories...</p>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section ref={ref} className={styles.testimonials}>
            <div className={styles.backgroundDecoration}>
                <div className={styles.decorationCircle + ' ' + styles.circle1}></div>
                <div className={styles.decorationCircle + ' ' + styles.circle2}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        <span className={styles.gradientText}>Real Members</span>{' '}
                        Real Stories
                    </h2>
                    <p className={styles.subtitle}>
                        Hear what our members are saying about their fitness journey at The 24 Fitness.
                    </p>

                    {/* Real Reviews Counter */}
                    {stats.totalReviews > 0 && (
                        <div className={styles.realReviewsCounter}>
                            <span className={styles.realReviewsBadge}>
                                {stats.totalReviews}+ Verified Member Reviews
                            </span>
                        </div>
                    )}
                </div>

                {reviews.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>💬</div>
                        <h3>No Reviews Yet</h3>
                        <p>Be the first to share your fitness journey experience!</p>
                    </div>
                ) : (
                    <>
                        {/* Testimonials Carousel */}
                        <div className={styles.carouselContainer}>
                            {reviews.length > getSlidesPerView() && (
                                <button
                                    className={`${styles.carouselButton} ${styles.prevButton}`}
                                    onClick={prevSlide}
                                    aria-label="Previous testimonials"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}

                            <div className={styles.carousel}>
                                <div
                                    className={styles.carouselTrack}
                                    style={{
                                        transform: `translateX(-${currentSlide * (100 / getSlidesPerView())}%)`
                                    }}
                                >
                                    {reviews.map((review, index) => (
                                        <div
                                            key={review.id}
                                            className={styles.testimonialCard}
                                        >
                                            <div className={styles.quoteIcon}>
                                                <Quote size={20} />
                                                <div className={styles.verifiedBadge} title="Verified Member Review">
                                                    ✓
                                                </div>
                                            </div>

                                            <div className={styles.content}>
                                                <p className={styles.quote}>"{review.comment || 'Great class experience!'}"</p>

                                                <div className={styles.stars}>
                                                    {[...Array(review.rating)].map((_, i) => (
                                                        <Star key={i} size={16} className={styles.star} fill="currentColor" />
                                                    ))}
                                                </div>

                                                <div className={styles.author}>
                                                    {/* Show actual avatar if available */}
                                                    {review.profiles?.avatar_url ? (
                                                        <img
                                                            src={review.profiles.avatar_url}
                                                            alt={review.profiles.full_name || 'Member avatar'}
                                                            className={styles.avatarImage}
                                                        />
                                                    ) : (
                                                        <div className={styles.avatar}>
                                                            {getInitials(review.profiles?.full_name || null)}
                                                        </div>
                                                    )}
                                                    <div className={styles.authorInfo}>
                                                        <div className={styles.authorName}>
                                                            {review.profiles?.full_name || 'Gym Member'}
                                                        </div>
                                                        <div className={styles.classInfo}>
                                                            {review.classes?.name || 'General Fitness'}
                                                        </div>
                                                        <div className={styles.reviewMeta}>
                                                            <Calendar size={12} />
                                                            <span>{formatDate(review.created_at)}</span>
                                                            <span className={styles.ratingBadge}>
                                                                {review.rating} Star{review.rating !== 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {reviews.length > getSlidesPerView() && (
                                <button
                                    className={`${styles.carouselButton} ${styles.nextButton}`}
                                    onClick={nextSlide}
                                    aria-label="Next testimonials"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}
                        </div>

                        {/* Carousel Indicators */}
                        {reviews.length > getSlidesPerView() && (
                            <div className={styles.carouselIndicators}>
                                {Array.from({ length: reviews.length - getSlidesPerView() + 1 }).map((_, index) => (
                                    <button
                                        key={index}
                                        className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                                        onClick={() => setCurrentSlide(index)}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Stats Bar - Always Horizontal */}
                        <div className={styles.statsBar}>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>
                                    {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
                                </div>
                                <div className={styles.statLabel}>Average Rating</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>{stats.totalReviews}</div>
                                <div className={styles.statLabel}>Member Reviews</div>
                            </div>
                            <div className={styles.stat}>
                                <div className={styles.statNumber}>{stats.totalMembers}</div>
                                <div className={styles.statLabel}>Active Members</div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
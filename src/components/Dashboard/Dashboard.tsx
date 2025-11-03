// src/components/Dashboard/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { type User as SupabaseUser } from '@supabase/supabase-js';
import styles from './Dashboard.module.css';
import { Calendar, Clock, User as UserIcon, ArrowRight, X, Wifi, WifiOff, Edit3, User } from 'lucide-react';

// ----- Type definitions -----
interface ClassData {
    id: number;
    name: string;
    schedule: string;
    trainer_name: string;
    duration_minutes: number;
    category?: string;
}

interface BookingResponse {
    id: number;
    classes: ClassData;
}

interface UserProfile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
}

// ----- Component -----
export default function Dashboard() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [bookedClasses, setBookedClasses] = useState<BookingResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [classesLoading, setClassesLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [cancellingBooking, setCancellingBooking] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error fetching session:', error.message);
                router.push('/signup');
                return;
            }

            if (!session?.user) {
                router.push('/signup');
            } else {
                setUser(session.user);
                setLoading(false);
                fetchUserBookings(session.user.id);
                fetchUserProfile(session.user.id);
                setupRealtimeSubscriptions(session.user.id);
            }
        };

        fetchUser();
    }, [router]);

    // Real-time subscription for dashboard
    const setupRealtimeSubscriptions = (userId: string) => {
        const subscription = supabase
            .channel('dashboard-bookings')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bookings',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    console.log('Dashboard: Bookings changed, refreshing...');
                    fetchUserBookings(userId);
                }
            )
            .subscribe((status) => {
                console.log('Dashboard subscription status:', status);
                setIsOnline(status === 'SUBSCRIBED');
            });

        return () => {
            subscription.unsubscribe();
        };
    };

    const fetchUserBookings = async (userId: string) => {
        try {
            console.log('Fetching bookings for user:', userId);
            const { data, error } = await supabase
                .from('bookings')
                .select(`
          id,
          classes (
            id,
            name,
            schedule,
            trainer_name,
            duration_minutes,
            category
          )
        `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Raw data from Supabase:', data);

            // ✅ Safely map Supabase result to our type and normalize bigint ids
            const typedData: BookingResponse[] = (data || []).map((item: any) => ({
                id: Number(item.id),
                classes: {
                    id: Number(item.classes?.id) || 0,
                    name: item.classes?.name ?? 'Unknown Class',
                    schedule: item.classes?.schedule ?? '',
                    trainer_name: item.classes?.trainer_name ?? 'Unknown Trainer',
                    duration_minutes: item.classes?.duration_minutes ?? 0,
                    category: item.classes?.category ?? 'General'
                },
            }));

            console.log('Processed bookings:', typedData);
            setBookedClasses(typedData);
        } catch (error) {
            console.error('Error fetching user bookings:', error);
        } finally {
            setClassesLoading(false);
        }
    };

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            setUserProfile(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: number) => {
        setCancellingBooking(bookingId);

        try {
            console.log('Attempting to cancel booking:', bookingId);

            // First, let's verify the booking exists and belongs to the user
            const { data: bookingCheck, error: checkError } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .eq('user_id', user?.id)
                .single();

            if (checkError) {
                console.error('Booking verification failed:', checkError);
                throw new Error('Booking not found or access denied');
            }

            console.log('Booking verified:', bookingCheck);

            // Now delete the booking
            const { error: deleteError } = await supabase
                .from('bookings')
                .delete()
                .eq('id', bookingId)
                .eq('user_id', user?.id); // Double check user_id for security

            if (deleteError) {
                console.error('Supabase delete error:', deleteError);
                throw deleteError;
            }

            console.log('Booking deleted successfully');

            // Remove from local state immediately for better UX
            setBookedClasses(prev => prev.filter(booking => booking.id !== bookingId));

            alert('Class booking cancelled successfully.');

        } catch (error: any) {
            console.error('Error cancelling booking:', error);
            alert(`Cancellation failed: ${error.message}`);

            // Refresh data to sync with server
            if (user) {
                fetchUserBookings(user.id);
            }
        } finally {
            setCancellingBooking(null);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'No schedule';
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.dashboardContainer}>
                <h1 className={styles.loading}>Loading...</h1>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Profile Header Section */}
            <div className={styles.profileHeader}>
                <div className={styles.profileInfo}>
                    <div className={styles.avatarContainer}>
                        {userProfile?.avatar_url ? (
                            <img
                                src={userProfile.avatar_url}
                                alt="Profile"
                                className={styles.avatar}
                            />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <User size={32} />
                            </div>
                        )}
                    </div>
                    <div className={styles.profileText}>
                        <h1 className={styles.welcomeTitle}>
                            Welcome back, <span className={styles.gradientText}>
                                {userProfile?.full_name || user?.email?.split('@')[0] || 'Member'}
                            </span>
                        </h1>
                        <p className={styles.welcomeSubtitle}>
                            This is your personal member dashboard. Manage your classes and profile.
                            {isOnline && <span className={styles.liveBadge}> • Live Updates</span>}
                        </p>
                    </div>
                </div>
                <a href="/profile" className={styles.editProfileButton}>
                    <Edit3 size={18} />
                    Edit Profile
                </a>
            </div>

            {/* Dashboard Widgets */}
            <div className={styles.widgetGrid}>
                {/* ---- Upcoming Classes Widget ---- */}
                <div className={styles.widget}>
                    <div className={styles.widgetHeader}>
                        <h3>My Upcoming Classes</h3>
                        {bookedClasses.length > 0 && (
                            <a href="/classes" className={styles.viewAllLink}>
                                View All <ArrowRight size={16} />
                            </a>
                        )}
                    </div>

                    {classesLoading ? (
                        <p>Loading your classes...</p>
                    ) : bookedClasses.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>You have no upcoming classes.</p>
                            <a href="/classes" className={styles.bookClassLink}>
                                Browse Classes
                            </a>
                        </div>
                    ) : (
                        <div className={styles.classesList}>
                            {bookedClasses.slice(0, 3).map((booking) => (
                                <div key={booking.id} className={styles.classItem}>
                                    <div className={styles.classInfo}>
                                        <div className={styles.classHeader}>
                                            <strong className={styles.className}>
                                                {booking.classes.name}
                                            </strong>
                                            {booking.classes.category && booking.classes.category !== 'General' && (
                                                <span className={styles.classCategory}>
                                                    {booking.classes.category}
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.classTrainer}>
                                            <UserIcon size={14} /> {booking.classes.trainer_name}
                                        </span>
                                        <div className={styles.classTime}>
                                            <Calendar size={14} />
                                            <span>{formatDate(booking.classes.schedule)}</span>
                                        </div>
                                        <div className={styles.classDuration}>
                                            <Clock size={14} />
                                            <span>{booking.classes.duration_minutes} min</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        disabled={cancellingBooking === booking.id}
                                        className={styles.cancelButton}
                                    >
                                        {cancellingBooking === booking.id ? (
                                            <>
                                                <X size={14} />
                                                Cancelling...
                                            </>
                                        ) : (
                                            <>
                                                <X size={14} />
                                                Cancel
                                            </>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ---- Profile Stats Widget ---- */}
                <div className={styles.widget}>
                    <h3>My Fitness Stats</h3>
                    <p>Track your progress and achievements.</p>
                    <div className={styles.profileStats}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{bookedClasses.length}</span>
                            <span className={styles.statLabel}>Booked Classes</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>0</span>
                            <span className={styles.statLabel}>Workouts Completed</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>0</span>
                            <span className={styles.statLabel}>Current Streak</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>0</span>
                            <span className={styles.statLabel}>Calories Burned</span>
                        </div>
                    </div>
                    <div className={styles.profileActions}>
                        <a href="/classes" className={styles.actionButton}>
                            Book More Classes
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
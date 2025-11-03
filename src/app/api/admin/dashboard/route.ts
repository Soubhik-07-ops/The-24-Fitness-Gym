// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
    try {
        console.log('🔧 Environment check:', {
            hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
            keyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
        });

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('❌ Missing environment variables:', {
                supabaseUrl: !!supabaseUrl,
                supabaseServiceKey: !!supabaseServiceKey
            });
            return NextResponse.json(
                {
                    error: 'Server configuration error',
                    details: 'Missing Supabase environment variables. Check your .env.local file.'
                },
                { status: 500 }
            );
        }

        // Create Supabase admin client with service role key
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        console.log('🔄 Fetching admin dashboard data with service role key...');

        // Fetch all stats
        const [
            { count: totalUsers, error: usersError },
            { count: totalClasses, error: classesError },
            { data: reviewsData, error: reviewsError },
            { count: totalBookings, error: bookingsError }
        ] = await Promise.all([
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('classes').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('reviews').select('*'),
            supabaseAdmin.from('bookings').select('*', { count: 'exact', head: true })
        ]);

        // Log any errors
        if (usersError) console.error('Users error:', usersError);
        if (classesError) console.error('Classes error:', classesError);
        if (reviewsError) console.error('Reviews error:', reviewsError);
        if (bookingsError) console.error('Bookings error:', bookingsError);

        // Calculate average rating
        const averageRating = reviewsData && reviewsData.length > 0
            ? reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsData.length
            : 0;

        // Calculate engagement rate
        const { data: allBookings, error: bookingsDataError } = await supabaseAdmin
            .from('bookings')
            .select('user_id');

        if (bookingsDataError) {
            console.error('Bookings data error:', bookingsDataError);
        }

        const uniqueUsersWithBookings = new Set(allBookings?.map(booking => booking.user_id) || []);
        const engagementRate = (totalUsers || 0) > 0
            ? (uniqueUsersWithBookings.size / (totalUsers || 1)) * 100
            : 0;

        const stats = {
            totalUsers: totalUsers || 0,
            totalClasses: totalClasses || 0,
            totalReviews: reviewsData?.length || 0,
            totalBookings: totalBookings || 0,
            averageRating,
            engagementRate
        };

        console.log('✅ Admin dashboard stats fetched successfully:', stats);

        return NextResponse.json({
            success: true,
            stats
        });

    } catch (error: any) {
        console.error('💥 Admin dashboard API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard data',
                details: error.message
            },
            { status: 500 }
        );
    }
}
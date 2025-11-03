import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminSession } from '@/lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false }
});

export async function GET(request: NextRequest) {
    try {
        // Validate admin session
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const admin = await validateAdminSession(token);
        if (!admin) {
            return NextResponse.json({ error: 'Invalid or expired admin session' }, { status: 401 });
        }

        console.log('Admin validated, fetching bookings data...');

        // First fetch bookings with join to classes
        const { data: bookingsData, error: bookingsError } = await supabaseAdmin
            .from('bookings')
            .select(`
                *,
                classes (
                    id,
                    name,
                    schedule,
                    duration_minutes,
                    trainer_name
                )
            `)
            .order('created_at', { ascending: false });

        if (bookingsError) {
            console.error('Error fetching bookings:', bookingsError);
            throw bookingsError;
        }

        // Get unique user IDs from bookings
        const userIds = [...new Set(bookingsData?.map(b => b.user_id) || [])];

        // Get auth users data
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        if (authError) throw authError;

        // Get profiles data
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .in('id', userIds);

        if (profilesError) throw profilesError;

        // Map all data together
        const mappedBookings = bookingsData?.map(booking => {
            const authUser = authUsers?.find(u => u.id === booking.user_id);
            const profile = profiles?.find(p => p.id === booking.user_id);

            return {
                ...booking,
                user_email: authUser?.email || 'No email',
                user_name: profile?.full_name || 'Unknown User',
                class_name: booking.classes?.name || 'Unknown Class',
                class_schedule: booking.classes?.schedule,
                class_duration: booking.classes?.duration_minutes,
                trainer_name: booking.classes?.trainer_name
            };
        }) || [];

        console.log('Mapped bookings:', {
            count: mappedBookings.length,
            sample: mappedBookings[0]
        });

        return NextResponse.json({ bookings: mappedBookings });
    } catch (err: any) {
        console.error('Admin bookings list error:', err);
        return NextResponse.json(
            { error: err.message || 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}
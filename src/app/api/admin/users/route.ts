import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminSession } from '@/lib/adminAuth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false }
});

export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const admin = await validateAdminSession(token);
        if (!admin) return NextResponse.json({ success: false, error: 'Invalid or expired admin session' }, { status: 401 });

        const body = await request.json();
        const { id } = body;
        if (!id) return NextResponse.json({ success: false, error: 'Missing id for delete' }, { status: 400 });

        // Delete related bookings
        const { error: bookingsError } = await supabaseAdmin.from('bookings').delete().eq('user_id', id);
        if (bookingsError) console.error('Error deleting bookings for user:', bookingsError);

        // Delete related reviews
        const { error: reviewsError } = await supabaseAdmin.from('reviews').delete().eq('user_id', id);
        if (reviewsError) console.error('Error deleting reviews for user:', reviewsError);

        // Delete profile
        const { error } = await supabaseAdmin.from('profiles').delete().eq('id', id);
        if (error) {
            console.error('Admin users DELETE error:', error);
            return NextResponse.json({ success: false, error: error.message || error }, { status: 500 });
        }

        try {
            await supabaseAdmin.from('admin_audit').insert([{ admin_id: admin.id, action: 'delete', table_name: 'profiles', record_id: id, payload: null, created_at: new Date().toISOString() }]);
        } catch (auditErr) {
            console.warn('Failed to write audit log (users):', auditErr);
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: any) {
        console.error('Admin users DELETE exception:', err);
        return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
    }
}

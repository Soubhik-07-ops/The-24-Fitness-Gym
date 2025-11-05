import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(request: NextRequest) {
    try {
        // Delete notifications older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        // First, count how many will be deleted
        const { count } = await supabaseAdmin
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .lt('created_at', twentyFourHoursAgo);

        // Then delete them
        const { error } = await supabaseAdmin
            .from('notifications')
            .delete()
            .lt('created_at', twentyFourHoursAgo);

        if (error) {
            console.error('Error cleaning up notifications:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            deleted: count || 0,
            message: 'Notifications cleaned up successfully'
        });
    } catch (err: any) {
        console.error('Cleanup error:', err);
        return NextResponse.json({ error: err.message || 'Failed to cleanup notifications' }, { status: 500 });
    }
}


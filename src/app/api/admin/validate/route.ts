// ============================================
// FILE: src/app/api/admin/validate/route.ts
// Validate admin session endpoint
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'No session found' },
                { status: 401 }
            );
        }

        const admin = await validateAdminSession(token);

        if (!admin) {
            return NextResponse.json(
                { error: 'Invalid or expired session' },
                { status: 401 }
            );
        }

        return NextResponse.json({ admin });
    } catch (error) {
        console.error('Admin validation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
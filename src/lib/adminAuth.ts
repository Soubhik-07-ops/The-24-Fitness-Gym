// ============================================
// FILE: src/lib/adminAuth.ts
// Admin authentication utilities
// ============================================

import bcrypt from 'bcryptjs';
import { supabase } from './supabaseClient';

const SALT_ROUNDS = 10;
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface Admin {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'super_admin';
    is_active: boolean;
}

export interface AdminSession {
    token: string;
    admin: Admin;
    expires_at: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
    return crypto.randomUUID();
}

/**
 * Create admin session
 */
export async function createAdminSession(adminId: string): Promise<string> {
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    const { error } = await supabase
        .from('admin_sessions')
        .insert({
            admin_id: adminId,
            token,
            expires_at: expiresAt.toISOString()
        });

    if (error) {
        throw new Error('Failed to create session');
    }

    return token;
}

/**
 * Validate admin session
 */
export async function validateAdminSession(token: string): Promise<Admin | null> {
    const { data, error } = await supabase
        .rpc('validate_admin_session', { session_token: token });

    if (error || !data || data.length === 0) {
        return null;
    }

    const adminData = data[0];
    return {
        id: adminData.admin_id,
        email: adminData.email,
        role: adminData.role,
        full_name: adminData.full_name,
        is_active: true
    };
}

/**
 * Delete admin session (logout)
 */
export async function deleteAdminSession(token: string): Promise<void> {
    await supabase
        .from('admin_sessions')
        .delete()
        .eq('token', token);
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredSessions(): Promise<void> {
    await supabase.rpc('clean_expired_admin_sessions');
}
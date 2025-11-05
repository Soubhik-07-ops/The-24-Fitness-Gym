'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import adminStyles from '../admin.module.css';
import styles from './Messages.module.css';

interface PendingRequest {
    id: string;
    user_id: string;
    subject: string | null;
    message: string | null;
    status: 'pending' | 'accepted' | 'declined';
    created_at: string;
    profiles?: { full_name?: string | null } | null;
}

export default function AdminMessagesPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [accepted, setAccepted] = useState<PendingRequest[]>([]);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [r1, r2] = await Promise.all([
                fetch('/api/admin/contact/requests/pending', { cache: 'no-store', credentials: 'include' }),
                fetch('/api/admin/contact/requests/accepted', { cache: 'no-store', credentials: 'include' })
            ]);
            const d1 = await r1.json();
            const d2 = await r2.json();
            if (!r1.ok) throw new Error(d1.error || 'Failed to load pending');
            if (!r2.ok) throw new Error(d2.error || 'Failed to load accepted');
            setRequests(d1.requests || []);
            setAccepted(d2.requests || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);
    useEffect(() => {
        // realtime: update lists when contact_requests change
        const channel = supabase
            .channel('contact_requests_admin_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, (payload) => {
                const row = payload.new as any;
                if (!row) return;
                setRequests(prev => prev.filter(p => p.id !== row.id));
                setAccepted(prev => prev.filter(p => p.id !== row.id));
                if (row.status === 'pending') setRequests(prev => [row, ...prev]);
                if (row.status === 'accepted') setAccepted(prev => [row, ...prev]);
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, []);

    const act = async (id: string, action: 'accept' | 'decline') => {
        const res = await fetch(`/api/admin/contact/requests/${id}/${action}`, { method: 'POST', credentials: 'include' });
        if (res.ok) {
            if (action === 'accept') router.push(`/admin/messages/${id}`);
            else load();
        }
    };

    return (
        <div className={adminStyles.content}>
            <div className={styles.headerRow}>
                <h1 className={styles.title}>Message Requests</h1>
                <button className={adminStyles.refreshButton} onClick={load}>Refresh</button>
            </div>
            {loading && <div className={adminStyles.loadingState}><div className={adminStyles.spinner}></div>Loading…</div>}
            {error && (
                <div className={adminStyles.errorState}>
                    <h3>Failed to load requests</h3>
                    <p>{error}</p>
                    <button className={adminStyles.retryButton} onClick={load}>Try again</button>
                </div>
            )}
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Pending Requests</div>
                {!loading && requests.length === 0 && <p className={styles.empty}>No pending requests.</p>}
                <div className={styles.grid}>
                    {requests.map((r) => (
                        <div key={r.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.subject}>{r.subject || 'No subject'}</div>
                                    <div className={styles.meta}>{(r as any).full_name || r.user_id}</div>
                                </div>
                                <div className={styles.meta}>{new Date(r.created_at).toLocaleString()}</div>
                            </div>
                            <div className={styles.preview}>{r.message}</div>
                            <div className={styles.actions}>
                                <button className={styles.accept} onClick={() => act(r.id, 'accept')}>Accept</button>
                                <button className={styles.decline} onClick={() => act(r.id, 'decline')}>Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Active Chats</div>
                {!loading && accepted.length === 0 && <p className={styles.empty}>No active chats.</p>}
                <div className={styles.grid}>
                    {accepted.map((r) => (
                        <div key={r.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <div className={styles.subject}>{r.subject || 'No subject'}</div>
                                    <div className={styles.meta}>{(r as any).full_name || r.user_id}</div>
                                </div>
                                <div className={styles.meta}>{new Date(r.created_at).toLocaleString()}</div>
                            </div>
                            <div className={styles.preview}>{r.message}</div>
                            <div className={styles.actions}>
                                <button className={styles.accept} onClick={() => router.push(`/admin/messages/${r.id}`)}>Open Chat</button>
                                <button className={styles.decline} onClick={async () => {
                                    if (!confirm('Delete this chat? This will remove all messages.')) return;
                                    const res = await fetch(`/api/admin/contact/requests/${r.id}`, { method: 'DELETE', credentials: 'include' });
                                    if (res.ok) load();
                                }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}



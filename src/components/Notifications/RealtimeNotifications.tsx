'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './toasts.module.css';
import { usePathname } from 'next/navigation';

interface Toast { id: string; text: string; }

export default function RealtimeNotifications({ mode }: { mode: 'user' | 'admin' }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const pathname = usePathname();
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        async function setup() {
            if (mode === 'user') {
                const { data } = await supabase.auth.getUser();
                const userId = data.user?.id;
                if (!userId) return;
                // Subscribe to DB notifications for this user
                const ch = supabase
                    .channel(`notifications_user_${userId}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userId}`
                    }, (payload: any) => {
                        const row = payload.new as { id: string; type: string; content: string };
                        const onChat = pathname?.startsWith('/contact');
                        // For message type, only show if not on chat
                        if (row.type === 'message' && onChat) return;
                        addToast(row.content || 'Notification');
                    })
                    .subscribe((status) => {
                        if (status === 'SUBSCRIBED') {
                            console.log('User notifications subscribed');
                        }
                    });
                channelRef.current = ch;
            } else {
                const ch = supabase.channel('notify_admin')
                    .on('broadcast', { event: 'new_message' }, () => {
                        if (!pathname?.startsWith('/admin/messages/')) addToast('New message from User');
                    })
                    .on('broadcast', { event: 'new_request' }, () => addToast('New message request received'))
                    .subscribe();
                channelRef.current = ch;
            }
        }
        setup();
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        };
    }, [mode, pathname]);

    const addToast = (text: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts((prev) => [...prev, { id, text }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== id));
        }, 4000);
    };

    return (
        <div className={styles.container}>
            {toasts.map(t => (
                <div key={t.id} className={styles.toast}>{t.text}</div>
            ))}
        </div>
    );
}



'use client';

import { useEffect, useRef, useState, memo } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import styles from './bell.module.css';

interface Notification {
    id: string;
    type: string;
    content: string;
    request_id: string | null;
    is_read: boolean;
    created_at: string;
}

interface AdminNotification {
    id: string;
    content: string;
    type: 'new_message' | 'new_request';
    created_at: string;
}

function NotificationBell({ mode }: { mode: 'user' | 'admin' }) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    const bellRef = useRef<HTMLDivElement | null>(null);

    // Filter out notifications older than 24 hours
    const filterOldNotifications = <T extends { created_at: string }>(notifs: T[]): T[] => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return notifs.filter(n => new Date(n.created_at) > twentyFourHoursAgo);
    };

    const filteredNotifications = filterOldNotifications(notifications);
    const filteredAdminNotifications = filterOldNotifications(adminNotifications);

    const unreadCount = mode === 'user'
        ? filteredNotifications.filter(n => !n.is_read).length
        : filteredAdminNotifications.length;

    useEffect(() => {
        let refreshInterval: any = null;

        const load = async () => {
            if (mode === 'user') {
                const { data: userData } = await supabase.auth.getUser();
                const userId = userData.user?.id;
                if (!userId) {
                    setLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('recipient_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (error) {
                    console.error('Error loading notifications:', error);
                    setLoading(false);
                    return;
                }

                // Filter out old notifications on load
                const allNotifications = (data as any) || [];
                const filtered = allNotifications.filter((n: Notification) => {
                    const notifDate = new Date(n.created_at);
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    return notifDate > twentyFourHoursAgo;
                });
                setNotifications(filtered);
                setLoading(false);

                // Cleanup old notifications via API (run once per hour)
                const cleanupInterval = setInterval(async () => {
                    try {
                        await fetch('/api/notifications/cleanup', { method: 'POST' });
                    } catch (err) {
                        console.error('Failed to cleanup notifications:', err);
                    }
                }, 60 * 60 * 1000); // Every hour

                // Store cleanup interval for cleanup
                (window as any).__notificationCleanupInterval = cleanupInterval;

                // Subscribe to new notifications - use a stable channel name
                const channelName = `notifications_bell_user_${userId}`;
                const ch = supabase
                    .channel(channelName)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userId}`
                    }, (payload: any) => {
                        console.log('New notification received:', payload.new);
                        const newNotif = payload.new as Notification;
                        setNotifications(prev => {
                            // Check if already exists to avoid duplicates
                            if (prev.some(n => n.id === newNotif.id)) return prev;
                            return [newNotif, ...prev];
                        });
                    })
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `recipient_id=eq.${userId}`
                    }, (payload: any) => {
                        const updated = payload.new as Notification;
                        setNotifications(prev => prev.map(n => n.id === updated.id ? updated : n));
                    })
                    .subscribe((status) => {
                        console.log('Notification subscription status:', status);
                        if (status === 'SUBSCRIBED') {
                            console.log('Successfully subscribed to notifications');
                        }
                    });
                channelRef.current = ch;

                // Fallback: refresh notifications every 5 seconds if subscription fails
                refreshInterval = setInterval(async () => {
                    const { data: freshData } = await supabase
                        .from('notifications')
                        .select('*')
                        .eq('recipient_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (freshData) {
                        // Filter out old notifications
                        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        const filtered = (freshData as any[]).filter((n: Notification) =>
                            new Date(n.created_at) > twentyFourHoursAgo
                        );
                        setNotifications(filtered);
                    }
                }, 5000);
            } else {
                // Admin: use broadcast channels
                setAdminNotifications([]);
                setLoading(false);

                const ch = supabase
                    .channel('admin_notifications_bell')
                    .on('broadcast', { event: 'new_message' }, (payload: any) => {
                        console.log('Admin received new message notification');
                        const notif: AdminNotification = {
                            id: `msg_${Date.now()}_${Math.random()}`,
                            content: 'New message from User',
                            type: 'new_message',
                            created_at: new Date().toISOString()
                        };
                        setAdminNotifications(prev => {
                            const filtered = filterOldNotifications([notif, ...prev]);
                            return filtered.slice(0, 50);
                        });
                    })
                    .on('broadcast', { event: 'new_request' }, (payload: any) => {
                        console.log('Admin received new request notification');
                        const notif: AdminNotification = {
                            id: `req_${Date.now()}_${Math.random()}`,
                            content: 'New message request received',
                            type: 'new_request',
                            created_at: new Date().toISOString()
                        };
                        setAdminNotifications(prev => {
                            const filtered = filterOldNotifications([notif, ...prev]);
                            return filtered.slice(0, 50);
                        });
                    })
                    .subscribe((status) => {
                        console.log('Admin notification subscription status:', status);
                    });
                channelRef.current = ch;
            }
        };
        load();

        return () => {
            if (refreshInterval) clearInterval(refreshInterval);
            if ((window as any).__notificationCleanupInterval) {
                clearInterval((window as any).__notificationCleanupInterval);
            }
            if (channelRef.current) supabase.removeChannel(channelRef.current);
        };
    }, [mode]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const markAsRead = async (id: string) => {
        if (mode !== 'user') return;
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const markAllRead = async () => {
        if (mode !== 'user' || unreadCount === 0) return;
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const handleAdminNotificationClick = (notif: AdminNotification) => {
        setAdminNotifications(prev => prev.filter(n => n.id !== notif.id));
        if (notif.type === 'new_request') {
            window.location.href = '/admin/messages';
        } else if (notif.type === 'new_message') {
            // Could navigate to the specific chat if we had request_id
            window.location.href = '/admin/messages';
        }
    };

    // Auto-filter old notifications periodically (every minute)
    // MUST be before conditional return to follow Rules of Hooks
    useEffect(() => {
        const filterInterval = setInterval(() => {
            if (mode === 'user') {
                setNotifications(prev => filterOldNotifications(prev));
            } else {
                setAdminNotifications(prev => filterOldNotifications(prev));
            }
        }, 60 * 1000); // Every minute

        return () => clearInterval(filterInterval);
    }, [mode]);

    const displayNotifications = mode === 'user' ? filteredNotifications : filteredAdminNotifications;
    const showMarkAllRead = mode === 'user' && unreadCount > 0;

    return (
        <div className={`${styles.wrapper} ${mode === 'admin' ? styles.adminWrapper : ''}`} ref={bellRef}>
            <button className={`${styles.bellButton} ${mode === 'admin' ? styles.adminBell : ''}`} onClick={() => setOpen(!open)}>
                <Bell size={20} />
                {!loading && unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {open && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span className={styles.title}>Notifications</span>
                        {showMarkAllRead && (
                            <button className={styles.markAllRead} onClick={markAllRead}>Mark all read</button>
                        )}
                        {mode === 'admin' && adminNotifications.length > 0 && (
                            <button className={styles.markAllRead} onClick={() => setAdminNotifications([])}>Clear all</button>
                        )}
                    </div>
                    <div className={styles.list}>
                        {displayNotifications.length === 0 ? (
                            <div className={styles.empty}>No notifications</div>
                        ) : (
                            displayNotifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`${styles.item} ${mode === 'user' && !(n as Notification).is_read ? styles.unread : mode === 'admin' ? styles.unread : ''}`}
                                    onClick={() => mode === 'user' ? markAsRead((n as Notification).id) : handleAdminNotificationClick(n as AdminNotification)}
                                >
                                    <div className={styles.content}>{n.content}</div>
                                    <div className={styles.time}>{new Date(n.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(NotificationBell);


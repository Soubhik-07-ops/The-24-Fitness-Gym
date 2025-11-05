'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import styles from './ChatWindow.module.css';

interface ChatMessage {
    id: string;
    request_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

export default function ChatWindow({ requestId }: { requestId: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const listRef = useRef<HTMLDivElement | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [typingAdmin, setTypingAdmin] = useState<boolean>(false);
    const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    useEffect(() => {
        const load = async () => {
            const { data: userData } = await supabase.auth.getUser();
            setUserId(userData.user?.id || null);

            const { data } = await supabase
                .from('contact_messages')
                .select('*')
                .eq('request_id', requestId)
                .order('created_at', { ascending: true });
            setMessages((data as any) || []);
        };
        load();

        const channel = supabase
            .channel(`contact_messages_${requestId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_messages', filter: `request_id=eq.${requestId}` }, (payload) => {
                const newMsg = payload.new as ChatMessage;
                setMessages((prev) => [...prev, newMsg]);
            })
            .subscribe();

        const typing = supabase
            .channel(`typing_request_${requestId}`)
            .on('broadcast', { event: 'typing' }, (payload: any) => {
                const { by, isTyping } = payload.payload || {};
                if (by === 'admin') setTypingAdmin(!!isTyping);
            })
            .subscribe();
        typingChannelRef.current = typing;

        return () => {
            supabase.removeChannel(channel);
            if (typingChannelRef.current) supabase.removeChannel(typingChannelRef.current);
            typingChannelRef.current = null;
        };
    }, [requestId]);

    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages]);

    const typingTimerRef = useRef<any>(null);

    const onChange = (v: string) => {
        setInput(v);
        if (typingChannelRef.current) {
            typingChannelRef.current.send({ type: 'broadcast', event: 'typing', payload: { by: 'user', isTyping: true } });
            clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(() => {
                typingChannelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { by: 'user', isTyping: false } });
            }, 1200);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        const { data: userData } = await supabase.auth.getUser();
        const senderId = userData.user?.id;
        if (!senderId) return;

        await supabase.from('contact_messages').insert({ request_id: requestId, sender_id: senderId, content: input.trim() });
        // Notify admin thread to refresh if it can't receive DB changes due to RLS
        if (typingChannelRef.current) {
            typingChannelRef.current.send({ type: 'broadcast', event: 'new_message', payload: { by: 'user' } });
        }
        // Notify admin globally for toast if not in thread
        supabase.channel('admin_notifications_bell').send({ type: 'broadcast', event: 'new_message', payload: { requestId } });
        supabase.channel('notify_admin').send({ type: 'broadcast', event: 'new_message', payload: { requestId } });
        setInput('');
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>Chat with Admin</div>
            <div className={styles.list} ref={listRef}>
                {messages.map((m) => {
                    const mine = m.sender_id === userId;
                    return (
                        <div key={m.id} className={mine ? styles.bubbleMine : styles.bubbleOther}>
                            <div className={styles.content}>{m.content}</div>
                            <div className={styles.ts}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                    );
                })}
                {typingAdmin && <div className={styles.ts}>Admin is typing…</div>}
            </div>
            <form onSubmit={sendMessage} className={styles.inputRow}>
                <input
                    className={styles.textInput}
                    value={input}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Type a message"
                />
                <button className={styles.sendBtn} type="submit">Send</button>
            </form>
        </div>
    );
}



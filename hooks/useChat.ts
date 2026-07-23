import useSWR from 'swr';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderType: 'patient' | 'staff';
    senderId: string;
    body: string;
    sentAt: string;
    readAt: string | null;
}

export function useChat() {
    const { data: conversation, error: convError, isLoading: convLoading } = useSWR(
        '/api/patient/chat/conversation',
        async (url) => {
            const res = await fetch(url);
            const json = await res.json();
            if (!res.ok) {
                throw new Error(json.error?.message || 'Failed to load conversation');
            }
            return json;
        },
        {
            revalidateOnFocus: false,
        }
    );

    const latestSentAtRef = useRef<string | null>(null);

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (messages.length > 0) {
            latestSentAtRef.current = new Date(
                Math.max(...messages.map(m => new Date(m.sentAt).getTime()))
            ).toISOString();
        }
    }, [messages]);

    // Load initial messages once conversation is loaded
    useEffect(() => {
        if (!conversation) return;

        const loadInitialMessages = async () => {
            setLoadingMessages(true);
            setError(null);
            try {
                const res = await fetch('/api/patient/chat/messages?limit=20');
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.error?.message || 'Failed to load messages');
                }

                const fetchedMessages = data.data || [];
                setMessages(fetchedMessages.reverse());

                setHasMore(data.meta?.hasMore || false);
                await markAsRead();
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoadingMessages(false);
            }
        };

        loadInitialMessages();
    }, [conversation]);

    // Polling new messages
    useEffect(() => {
        if (!conversation) return;

        const startPolling = () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

            pollingIntervalRef.current = setInterval(async () => {
                try {
                    const query = latestSentAtRef.current ? `?after=${encodeURIComponent(latestSentAtRef.current)}` : '';
                    const res = await fetch(`/api/patient/chat/messages${query}`);

                    if (!res.ok) return;

                    const json = await res.json();
                    const newMessages: ChatMessage[] = json.data || [];

                    if (newMessages.length > 0) {
                        setMessages(prev => {
                            const existingIds = new Set(prev.map(m => m.id));
                            const uniqueNew = newMessages.filter(m => !existingIds.has(m.id));
                            if (uniqueNew.length === 0) return prev;
                            return [...prev, ...uniqueNew];
                        });
                        await markAsRead();
                    }
                } catch (e) {
                    // Ignore background polling errors
                }
            }, 4000);
        };

        startPolling();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [conversation]);

    const sendMessage = async (body: string) => {
        if (!body.trim() || sending) return;
        setSending(true);
        try {
            const res = await fetch('/api/patient/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body: body.trim() }),
            });

            const responseJson = await res.json();

            if (!res.ok) {
                throw new Error(responseJson.error?.message || 'Failed to send message');
            }

            const newMessage = responseJson.data;

            setMessages(prev => [...prev, newMessage]);
            return newMessage;
        } catch (err: any) {
            toast.error(err.message || 'Failed to send message');
            throw err;
        } finally {
            setSending(false);
        }
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;
        setLoadingMore(true);
        try {
            const oldestSentAt = messages[0].sentAt;

            const res = await fetch(`/api/patient/chat/messages?before=${encodeURIComponent(oldestSentAt)}&limit=20`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error?.message || 'Failed to load older messages');
            }

            const olderMessages: ChatMessage[] = data.data || [];
            if (olderMessages.length > 0) {
                setMessages(prev => {
                    const existingIds = new Set(prev.map(m => m.id));
                    const uniqueOlder = olderMessages.reverse().filter(m => !existingIds.has(m.id));
                    return [...uniqueOlder, ...prev];
                });
            }
            setHasMore(data.meta?.hasMore || false);
        } catch (err: any) {
            toast.error(err.message || 'Could not load older messages');
        } finally {
            setLoadingMore(false);
        }
    };

    const markAsRead = async () => {
        try {
            await fetch('/api/patient/chat/conversation/read', { method: 'PATCH' });
        } catch (e) {
            // Fail silently
        }
    };

    return {
        conversation,
        messages,
        loading: convLoading || (loadingMessages && messages.length === 0),
        loadingMore,
        hasMore,
        sending,
        error: convError ? convError.message : error,
        sendMessage,
        loadMore,
        markAsRead,
    };
}

import AppLayout from '@/layouts/app-layout';
import { Dialog, Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Inbox, PenSquare, Search, SendHorizontal } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

// --- Types ---
interface User {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
}

interface Conversation {
    user: User;
    last_message: {
        body: string;
        created_at: string;
        is_read: boolean;
    };
}

interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    body: string;
    created_at: string;
    is_optimistic?: boolean;
}

interface Props {
    conversations: Conversation[];
    activeMessages: Message[];
    activeRecipient: User | null;
    allowedRecipients: User[];
}

export default function Messages({ conversations, activeMessages, activeRecipient, allowedRecipients }: Props) {
    const { auth } = usePage().props as any;
    const currentUserId = auth.user.id;

    // --- STATE ---
    const [messages, setMessages] = useState<Message[]>(activeMessages);
    const [searchTerm, setSearchTerm] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        recipient_id: '',
        body: '',
    });

    // --- 1. SYNC STATE ON PROP CHANGE ---
    useEffect(() => {
        setMessages(activeMessages);
    }, [activeMessages]);

    // --- 2. AUTO-SCROLL TO BOTTOM ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeRecipient]);

    // --- 3. REAL-TIME POLLING (RECEIVING) ---
    useEffect(() => {
        if (activeRecipient) {
            pollingRef.current = setInterval(() => {
                router.visit(window.location.href, {
                    method: 'get',
                    only: ['activeMessages', 'conversations'],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                });
            }, 2000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeRecipient]);
    // --- ACTIONS ---

    const handleSelectConversation = (userId: number) => {
        // Stop current polling before switching
        if (pollingRef.current) clearInterval(pollingRef.current);

        router.visit(route('messages.index', { user: userId }), {
            only: ['activeMessages', 'activeRecipient', 'conversations'],
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSendReply = () => {
        if (!activeRecipient || !replyText.trim()) return;

        // 1. Immediately show the message in the chat window
        const tempId = Date.now();
        const newMessage: Message = {
            id: tempId,
            sender_id: currentUserId,
            recipient_id: activeRecipient.id,
            body: replyText,
            created_at: new Date().toISOString(),
            is_optimistic: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        setReplyText('');
        setIsSending(true);

        // 2. Send to server in background
        router.post(
            route('messages.store'),
            {
                recipient_id: activeRecipient.id,
                body: newMessage.body,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSending(false);
                },
                onError: () => {
                    setIsSending(false);
                    setMessages((prev) => prev.filter((m) => m.id !== tempId));
                    alert('Failed to send message');
                },
            },
        );
    };

    const handleSendNew = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('messages.store'), {
            onSuccess: () => {
                setIsComposeOpen(false);
                reset();
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    const filteredConvos = conversations.filter(
        (c) =>
            c.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || c.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`;

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/messages' }]}>
            <Head title="Messages" />

            <div className="mx-auto flex h-[calc(100vh-6rem)] w-full max-w-7xl flex-col p-4">
                <div className="flex flex-1 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    {/* ================= LEFT: CONVERSATION LIST ================= */}
                    <div
                        className={`${activeRecipient ? 'hidden md:flex' : 'flex'} w-full flex-col border-r border-neutral-200 bg-white md:w-80 lg:w-96 dark:border-neutral-800 dark:bg-neutral-900`}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between bg-white p-4 dark:bg-neutral-900">
                            <h2 className="text-xl font-bold">Chats</h2>
                            <button
                                onClick={() => setIsComposeOpen(true)}
                                className="rounded-full bg-neutral-100 p-2 transition-colors hover:bg-neutral-200 dark:bg-neutral-800"
                            >
                                <PenSquare className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-4 pb-2">
                            <div className="relative">
                                <Search className="absolute top-2.5 left-3 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-full border-none bg-neutral-100 py-2 pr-4 pl-9 text-sm focus:ring-2 focus:ring-blue-500/20 dark:bg-neutral-800"
                                />
                            </div>
                        </div>

                        <div className="custom-scrollbar mt-2 flex-1 overflow-y-auto">
                            {filteredConvos.length === 0 ? (
                                <div className="p-8 text-center text-sm text-neutral-400">No conversations yet</div>
                            ) : (
                                <div className="flex flex-col">
                                    {filteredConvos.map((convo) => (
                                        <button
                                            key={convo.user.id}
                                            onClick={() => handleSelectConversation(convo.user.id)}
                                            className={`mx-2 flex items-center gap-3 rounded-lg p-3 text-left transition-all ${activeRecipient?.id === convo.user.id ? 'bg-blue-50 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'} `}
                                        >
                                            <div className="relative">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
                                                    {getInitials(convo.user.first_name, convo.user.last_name)}
                                                </div>
                                                {!convo.last_message.is_read && (
                                                    <div className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500"></div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-0.5 flex items-baseline justify-between">
                                                    <h3
                                                        className={`truncate text-sm ${!convo.last_message.is_read ? 'font-bold text-neutral-900 dark:text-white' : 'font-medium text-neutral-700 dark:text-neutral-300'}`}
                                                    >
                                                        {convo.user.first_name} {convo.user.last_name}
                                                    </h3>
                                                    <span className="ml-2 text-[10px] whitespace-nowrap text-neutral-400">
                                                        {new Date(convo.last_message.created_at).toLocaleDateString(undefined, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`truncate text-xs ${!convo.last_message.is_read ? 'font-semibold text-neutral-900 dark:text-white' : 'text-neutral-500'}`}
                                                >
                                                    {convo.last_message.body}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= RIGHT: CHAT HISTORY ================= */}
                    <div className={`${activeRecipient ? 'flex' : 'hidden md:flex'} relative flex-1 flex-col bg-white dark:bg-neutral-900`}>
                        {activeRecipient ? (
                            <>
                                <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
                                    <button
                                        onClick={() => router.visit(route('messages.index'))}
                                        className="-ml-2 rounded-full p-1.5 text-blue-600 hover:bg-blue-50 md:hidden"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </button>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-bold text-white">
                                        {getInitials(activeRecipient.first_name, activeRecipient.last_name)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                                            {activeRecipient.first_name} {activeRecipient.last_name}
                                        </h3>
                                        <p className="text-xs text-neutral-500 capitalize">{activeRecipient.role}</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3 overflow-y-auto bg-white p-4 dark:bg-neutral-900">
                                    {messages.map((msg) => {
                                        // Use 'messages' state instead of 'activeMessages' prop
                                        const isMe = msg.sender_id === currentUserId;
                                        return (
                                            <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div
                                                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                                                        isMe
                                                            ? 'rounded-br-none bg-blue-600 text-white'
                                                            : 'rounded-bl-none border border-neutral-200 bg-neutral-100 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white'
                                                    } ${msg.is_optimistic ? 'opacity-70' : 'opacity-100'} `}
                                                >
                                                    {msg.body}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="border-t border-neutral-100 bg-white p-3 md:p-4 dark:border-neutral-800 dark:bg-neutral-900">
                                    <div className="flex items-end gap-2 rounded-3xl bg-neutral-100 p-1.5 px-2 dark:bg-neutral-800">
                                        <textarea
                                            value={replyText}
                                            onKeyDown={handleKeyDown}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Aa"
                                            className="max-h-32 min-h-[40px] w-full resize-none border-none bg-transparent px-3 py-2.5 text-sm text-neutral-900 focus:ring-0 dark:text-white"
                                            rows={1}
                                        />
                                        <button
                                            onClick={handleSendReply}
                                            disabled={isSending || !replyText.trim()}
                                            className={`mb-0.5 shrink-0 rounded-full p-2 transition-all ${replyText.trim() ? 'text-blue-600 hover:bg-blue-100' : 'cursor-not-allowed text-neutral-400'} `}
                                        >
                                            <SendHorizontal className="h-6 w-6 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-neutral-400">
                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-50 dark:bg-neutral-800">
                                    <Inbox className="h-10 w-10 opacity-20" />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Your Messages</h3>
                                <p className="text-sm">Select a chat to start messaging</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* New Chat Modal */}
                <Transition appear show={isComposeOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsComposeOpen(false)}>
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900">
                                    <Dialog.Title className="mb-4 text-lg font-bold">New Message</Dialog.Title>
                                    <form onSubmit={handleSendNew} className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase">To:</label>
                                            <select
                                                className="mt-1 w-full rounded-lg border-neutral-200 text-sm"
                                                value={data.recipient_id}
                                                onChange={(e) => setData('recipient_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select Person</option>
                                                {allowedRecipients.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.first_name} {u.last_name} ({u.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-neutral-500 uppercase">Message:</label>
                                            <textarea
                                                className="mt-1 h-24 w-full rounded-lg border-neutral-200 text-sm"
                                                value={data.body}
                                                onChange={(e) => setData('body', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-bold text-white"
                                            >
                                                {processing ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </AppLayout>
    );
}

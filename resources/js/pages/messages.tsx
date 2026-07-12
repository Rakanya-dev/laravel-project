import AppLayout from '@/layouts/app-layout';
import { Dialog as HeadlessDialog, Transition } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Inbox, PenSquare, Search, SendHorizontal, Smile, Plus, FileText, X, Download, Loader2, Users } from 'lucide-react';
import { Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';

// --- Types ---
interface User {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    is_online?: boolean;
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
    attachment_url?: string;
    attachment_name?: string;
    is_image?: boolean;
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
    const currentUser = auth.user;
    const currentUserRole = currentUser?.role?.toLowerCase() || '';

    // --- STATE ---
    const [messages, setMessages] = useState<Message[]>(activeMessages);
    const [searchTerm, setSearchTerm] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [contactSearch, setContactSearch] = useState('');

    // File Attachment State
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Image Lightbox (Gallery) State
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    // Dark Mode Detection for Emoji Picker
    const [isDarkMode, setIsDarkMode] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const isTransitioningRef = useRef(false);

    // --- FORMATTERS & HELPERS ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImage = (url?: string) => {
        if (!url) return false;
        return url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    };

    const getFileNameFromUrl = (url?: string) => {
        if (!url) return 'Attachment';
        const parts = url.split('/');
        return decodeURIComponent(parts[parts.length - 1]);
    };

    const getInitials = (first: string, last: string) => `${first[0]}${last[0]}`.toUpperCase();

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const imageGallery = useMemo(() => {
        return messages.filter((msg) => {
            const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
            return isImg && msg.attachment_url;
        });
    }, [messages]);

    // --- EFFECT HOOKS ---
    useEffect(() => {
        const checkDarkMode = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        setMessages(activeMessages);
    }, [activeMessages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeRecipient]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [replyText]);

    useEffect(() => {
        if (activeRecipient) {
            pollingRef.current = setInterval(() => {
                if (isTransitioningRef.current) return;

                router.get(route('messages.index', { user: activeRecipient.id }), {}, {
                    only: ['activeMessages', 'conversations'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    // @ts-ignore
                    showProgress: false,
                });
            }, 15000);
        }

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeRecipient?.id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        }
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showEmojiPicker]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowLeft') {
                setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
            }
            if (e.key === 'ArrowRight') {
                setLightboxIndex((prev) => (prev !== null && prev < imageGallery.length - 1 ? prev + 1 : prev));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, imageGallery.length]);

    useEffect(() => {
        if (!isComposeOpen) {
            setContactSearch('');
        }
    }, [isComposeOpen]);

    // --- EVENT HANDLERS ---
    const handleSelectConversation = (userId: number) => {
        isTransitioningRef.current = true;

        if (pollingRef.current) clearInterval(pollingRef.current);
        router.cancel();

        setShowEmojiPicker(false);
        clearAttachment();
        setReplyText('');

        router.get(route('messages.index', { user: userId }), {}, {
            only: ['activeMessages', 'activeRecipient', 'conversations'],
            preserveState: true,
            preserveScroll: true,
            onFinish: () => {
                isTransitioningRef.current = false;
            },
            onSuccess: () => {
                setTimeout(() => textareaRef.current?.focus(), 100);
            }
        });
    };

    const handleSelectNewContact = (userId: number) => {
        setIsComposeOpen(false);
        handleSelectConversation(userId);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const clearAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const openLightbox = (messageId: number) => {
        const index = imageGallery.findIndex((msg) => msg.id === messageId);
        if (index !== -1) {
            setLightboxIndex(index);
        }
    };

    const handleSendReply = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!activeRecipient || (!replyText.trim() && !attachment)) return;

        setShowEmojiPicker(false);
        setIsSending(true);

        const tempId = Date.now();

        let tempAttachmentUrl = undefined;
        let isImageFile = false;

        if (attachment) {
            tempAttachmentUrl = URL.createObjectURL(attachment);
            isImageFile = attachment.type.startsWith('image/');
        }

        const newMessage: Message = {
            id: tempId,
            sender_id: currentUser.id,
            recipient_id: activeRecipient.id,
            body: replyText,
            attachment_url: tempAttachmentUrl,
            attachment_name: attachment?.name,
            is_image: isImageFile,
            created_at: new Date().toISOString(),
            is_optimistic: true,
        };

        setMessages((prev) => [...prev, newMessage]);
        router.post(
            route('messages.store'),
            {
                recipient_id: activeRecipient.id,
                body: replyText,
                attachment: attachment,
            },
            {
                preserveScroll: true,
                forceFormData: !!attachment,
                onSuccess: () => {
                    setReplyText('');
                    clearAttachment();
                    setIsSending(false);
                    if (tempAttachmentUrl) URL.revokeObjectURL(tempAttachmentUrl);

                    if (textareaRef.current) {
                        textareaRef.current.style.height = 'auto';
                    }
                },
                onError: () => {
                    setIsSending(false);
                    setMessages((prev) => prev.filter((m) => m.id !== tempId));
                    if (tempAttachmentUrl) URL.revokeObjectURL(tempAttachmentUrl);
                    toast.error('Failed to send message', { description: 'Please ensure the file is under 10MB.' });
                },
            },
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply();
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setReplyText((prev) => prev + emojiData.emoji);
    };

    const filteredConvos = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return conversations.filter(
            (c) =>
                c.user.first_name.toLowerCase().includes(lowerSearch) ||
                c.user.last_name.toLowerCase().includes(lowerSearch),
        );
    }, [conversations, searchTerm]);

    const validRecipients = useMemo(() => {
        return allowedRecipients.filter((u) => {
            const role = u.role.toLowerCase();
            if (currentUserRole === 'admin') return role === 'teacher';
            if (currentUserRole === 'teacher') return role === 'admin' || role === 'parent';
            if (currentUserRole === 'parent') return role === 'teacher';
            return true;
        });
    }, [allowedRecipients, currentUserRole]);

    const filteredContacts = useMemo(() => {
        const lowerSearch = contactSearch.toLowerCase();
        return validRecipients.filter(
            (u) =>
                u.first_name.toLowerCase().includes(lowerSearch) ||
                u.last_name.toLowerCase().includes(lowerSearch) ||
                u.role.toLowerCase().includes(lowerSearch)
        );
    }, [validRecipients, contactSearch]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/messages' }]}>
            <Head title="Messages" />

            <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-white dark:bg-zinc-950 transition-colors duration-200 animate-in fade-in duration-500">
                <div className="flex h-full w-full overflow-hidden border-t border-slate-200 dark:border-slate-800 shadow-sm transition-colors">

                    {/* ================= LEFT: CONVERSATION LIST ================= */}
                    <div
                        className={cn(
                            activeRecipient ? 'hidden md:flex' : 'flex',
                            'w-full flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 md:w-80 lg:w-[400px] shrink-0 transition-colors'
                        )}
                    >
                        <div className="p-5 sm:p-6 shrink-0 bg-white dark:bg-zinc-950 z-10 transition-colors">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Chats</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsComposeOpen(true)}
                                    className="size-12 rounded-full bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors"
                                >
                                    <PenSquare className="size-5" />
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 pl-12 pr-4 text-base font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-all focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-4">
                            {filteredConvos.length === 0 ? (
                                <div className="p-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">No conversations found.</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {filteredConvos.map((convo) => {
                                        const isActive = activeRecipient?.id === convo.user.id;
                                        const fullName = `${convo.user.first_name} ${convo.user.last_name}`;

                                        return (
                                            <button
                                                key={convo.user.id}
                                                onClick={() => handleSelectConversation(convo.user.id)}
                                                className={cn(
                                                    'relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 border',
                                                    isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20 shadow-sm' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                                )}
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar className="size-14 shadow-sm border border-indigo-100 dark:border-indigo-500/30 rounded-2xl transition-colors">
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-black text-lg rounded-2xl">
                                                            {getInitials(convo.user.first_name, convo.user.last_name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {convo.user.is_online && (
                                                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 dark:bg-emerald-400 transition-colors"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 overflow-hidden mt-0.5">
                                                    <div className="flex items-baseline justify-between mb-0.5">
                                                        <span className={cn(
                                                            "truncate text-base transition-colors",
                                                            !convo.last_message.is_read && !isActive ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-800 dark:text-slate-200"
                                                        )}>
                                                            {fullName}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[10px] font-bold uppercase tracking-widest transition-colors",
                                                            !convo.last_message.is_read && !isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                                                        )}>
                                                            {new Date(convo.last_message.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "truncate text-sm transition-colors",
                                                        !convo.last_message.is_read && !isActive ? "font-bold text-indigo-600 dark:text-indigo-400" : "font-medium text-slate-500 dark:text-slate-400"
                                                    )}>
                                                        {convo.last_message.body || (convo.user.role === 'file' ? 'Sent an attachment' : 'Attachment')}
                                                    </div>
                                                </div>

                                                {!convo.last_message.is_read && !isActive && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm transition-colors"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= RIGHT: CHAT HISTORY ================= */}
                    <div className={cn(activeRecipient ? 'flex' : 'hidden md:flex', 'flex-1 flex-col bg-white dark:bg-zinc-950 overflow-hidden relative transition-colors')}>

                        <div className="absolute inset-0 z-0 bg-slate-50/50 dark:bg-zinc-950/50 [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none transition-colors">
                            <svg className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="chat-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1.5" fill="currentColor" className="text-slate-900 dark:text-white" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#chat-pattern)" />
                            </svg>
                        </div>

                        {activeRecipient ? (
                            <>
                                {/* Header */}
                                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-zinc-950/95 px-6 py-4 shadow-sm z-10 backdrop-blur-md transition-colors">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => router.visit(route('messages.index'))}
                                            className="-ml-2 rounded-full p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-900 md:hidden transition-colors"
                                        >
                                            <ChevronLeft className="size-6" />
                                        </button>
                                        <div className="relative shrink-0">
                                            <Avatar className="size-14 shadow-sm ring-2 ring-white dark:ring-zinc-950 transition-colors rounded-2xl">
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-lg rounded-2xl">
                                                    {getInitials(activeRecipient.first_name, activeRecipient.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {activeRecipient.is_online && (
                                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 dark:bg-emerald-400 transition-colors"></div>
                                            )}
                                        </div>
                                        <div className="ml-1 mt-0.5">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight transition-colors">
                                                {activeRecipient.first_name} {activeRecipient.last_name}
                                            </h3>
                                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors mt-1">
                                                {activeRecipient.is_online ? <span className="text-emerald-500 dark:text-emerald-400">Online</span> : 'Offline'} <span className="mx-1.5">•</span> {activeRecipient.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Body */}
                                <div className="flex-1 space-y-5 overflow-y-auto p-6 sm:p-8 z-10 relative custom-scrollbar">
                                    {messages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                                            <Avatar className="size-24 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors mb-5 rounded-3xl">
                                                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-3xl rounded-3xl">
                                                    {getInitials(activeRecipient.first_name, activeRecipient.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white transition-colors">
                                                {activeRecipient.first_name} {activeRecipient.last_name}
                                            </h3>
                                            <p className="mt-2.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[11px] bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 transition-colors">{activeRecipient.role}</p>
                                            <p className="mt-5 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Say hello to start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === currentUser.id;
                                            const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
                                            const fileName = msg.attachment_name || getFileNameFromUrl(msg.attachment_url);

                                            return (
                                                <div key={msg.id} className={cn('flex w-full flex-col', isMe ? 'items-end' : 'items-start')}>

                                                    {/* Render Attachment if it exists */}
                                                    {msg.attachment_url && (
                                                        <div className={cn('mb-1.5 flex max-w-[85%] flex-col', isMe ? 'items-end' : 'items-start')}>
                                                            {isImg ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openLightbox(msg.id)}
                                                                    className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-zoom-in group bg-white dark:bg-zinc-900 p-1.5 transition-colors"
                                                                >
                                                                    <img src={msg.attachment_url} alt="Attachment" className="max-h-72 rounded-xl max-w-full object-cover group-hover:opacity-95 transition-opacity" />
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={msg.attachment_url}
                                                                    download={fileName}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={cn(
                                                                        "flex items-center gap-4 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.02]",
                                                                        isMe ? "bg-indigo-600 dark:bg-indigo-500 text-white rounded-br-[6px]" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[6px]"
                                                                    )}
                                                                >
                                                                    <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors", isMe ? "bg-indigo-500/50 dark:bg-indigo-400/30" : "bg-slate-100 dark:bg-zinc-800 shadow-inner")}>
                                                                        <FileText className={cn("size-6", isMe ? "text-indigo-50" : "text-indigo-600 dark:text-indigo-400")} />
                                                                    </div>
                                                                    <div className="flex flex-col overflow-hidden pr-3 mt-0.5">
                                                                        <span className="truncate text-base font-bold leading-tight">{fileName}</span>
                                                                        <span className={cn("text-[11px] font-bold mt-1.5 uppercase tracking-widest", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")}>Click to download</span>
                                                                    </div>
                                                                    <Download className={cn("ml-2 size-5 shrink-0 opacity-70", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Render Text Body if it exists */}
                                                    {msg.body && (
                                                        <div
                                                            className={cn(
                                                                'max-w-[80%] px-5 py-3.5 text-base leading-relaxed whitespace-pre-wrap shadow-sm font-medium transition-colors',
                                                                isMe
                                                                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-br-[6px]'
                                                                    : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-bl-[6px]',
                                                                msg.is_optimistic && 'opacity-70'
                                                            )}
                                                        >
                                                            {msg.body}
                                                        </div>
                                                    )}

                                                    <span className={cn(
                                                        "text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 mx-1.5 transition-colors uppercase tracking-widest",
                                                        msg.is_optimistic && "text-indigo-500 dark:text-indigo-400"
                                                    )}>
                                                        {formatMessageTime(msg.created_at)}
                                                        {msg.is_optimistic && " • Sending..."}
                                                    </span>

                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 w-full bg-white dark:bg-zinc-950 p-6 z-20 relative transition-colors border-t border-slate-100 dark:border-slate-800">

                                    {showEmojiPicker && (
                                        <div ref={pickerRef} className="absolute bottom-full mb-4 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                autoFocusSearch={false}
                                                theme={isDarkMode ? Theme.DARK : Theme.LIGHT}
                                                searchDisabled={false}
                                                skinTonesDisabled={true}
                                                height={350}
                                                width={320}
                                                previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    )}

                                    {attachment && (
                                        <div className="absolute bottom-full left-6 mb-4 flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-xl animate-in slide-in-from-bottom-2 transition-colors">
                                            <div className="flex size-14 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 transition-colors">
                                                <FileText className="size-6" />
                                            </div>
                                            <div className="flex flex-col pr-5">
                                                <span className="max-w-[200px] truncate text-base font-bold text-slate-800 dark:text-slate-200 transition-colors">{attachment.name}</span>
                                                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 transition-colors">{formatFileSize(attachment.size)}</span>
                                            </div>
                                            <button type="button" onClick={clearAttachment} className="ml-2 rounded-xl bg-slate-50 dark:bg-zinc-800 p-2.5 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                                <X className="size-5" />
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSendReply} className="flex items-end gap-3 relative w-full">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mb-1 shrink-0 size-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shadow-sm"
                                        >
                                            <Plus className="size-6" />
                                        </Button>

                                        <div className="flex-1 flex items-end bg-slate-50 dark:bg-zinc-900 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl focus-within:bg-white dark:focus-within:bg-zinc-950 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 p-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "mb-0.5 shrink-0 size-12 rounded-full ml-1 transition-colors",
                                                    showEmojiPicker ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                                                )}
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            >
                                                <Smile className="size-6" />
                                            </Button>

                                            <textarea
                                                ref={textareaRef}
                                                value={replyText}
                                                onKeyDown={handleKeyDown}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onClick={() => setShowEmojiPicker(false)}
                                                placeholder={attachment ? "Add a message with your file..." : "Type a message..."}
                                                rows={1}
                                                className="custom-scrollbar flex-1 resize-none border-none bg-transparent px-4 py-3.5 text-base font-medium text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[52px] max-h-[140px] transition-colors"
                                                disabled={isSending}
                                            />

                                            <Button
                                                type="submit"
                                                size="icon"
                                                variant="ghost"
                                                className={cn(
                                                    'mb-0.5 shrink-0 size-12 rounded-full transition-all mr-1',
                                                    (replyText.trim() || attachment) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-105' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent',
                                                )}
                                                disabled={(!replyText.trim() && !attachment) || isSending}
                                            >
                                                {isSending ? <Loader2 className="size-6 animate-spin text-white" /> : <SendHorizontal className="size-6 -ml-0.5" />}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-10 transition-colors">
                                <div className="mb-6 flex size-24 items-center justify-center rounded-3xl bg-slate-50 dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-slate-800 rotate-3 transition-transform hover:rotate-6">
                                    <Inbox className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Your Messages</h3>
                                <p className="text-base font-medium mt-2 transition-colors">Select a conversation from the sidebar to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LIGHTBOX (HeadlessUI remains specifically for full-screen gallery) --- */}
                <Transition show={lightboxIndex !== null} as={Fragment}>
                    <HeadlessDialog as="div" className="relative z-[100]" onClose={() => setLightboxIndex(null)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/95 backdrop-blur-md transition-colors" aria-hidden="true" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex flex-col items-center justify-center">
                            {/* TOP BAR */}
                            <div className="absolute top-0 inset-x-0 z-[110] flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                                <div className="text-white/90 font-bold text-base px-4">
                                    {lightboxIndex !== null && imageGallery[lightboxIndex]
                                        ? getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)
                                        : 'Image'}
                                </div>

                                <div className="flex items-center gap-3">
                                    {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                        <a
                                            href={imageGallery[lightboxIndex].attachment_url}
                                            download={getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)}
                                            className="rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                            title="Download"
                                        >
                                            <Download className="size-6" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setLightboxIndex(null)}
                                        className="rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                        title="Close (Esc)"
                                    >
                                        <X className="size-6" />
                                    </button>
                                </div>
                            </div>

                            {/* NAVIGATION */}
                            <div className="absolute inset-y-0 left-0 flex items-center px-4 z-[105]">
                                {lightboxIndex !== null && lightboxIndex > 0 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                                        className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all"
                                    >
                                        <ChevronLeft className="size-10" />
                                    </button>
                                )}
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 z-[105]">
                                {lightboxIndex !== null && lightboxIndex < imageGallery.length - 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                                        className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all"
                                    >
                                        <ChevronRight className="size-10" />
                                    </button>
                                )}
                            </div>

                            {/* IMAGE */}
                            <div
                                className="relative flex h-full w-full items-center justify-center p-4 sm:p-20 z-[102]"
                                onClick={() => setLightboxIndex(null)}
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                        <img
                                            src={imageGallery[lightboxIndex].attachment_url}
                                            alt="Full screen view"
                                            className="max-h-full max-w-full rounded-sm shadow-2xl object-contain ring-1 ring-white/10 cursor-default"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </Transition.Child>
                            </div>

                            {/* COUNTER */}
                            <div className="absolute bottom-6 z-[105] text-white/50 text-[11px] font-bold uppercase tracking-widest font-mono">
                                {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {imageGallery.length}
                            </div>
                        </div>
                    </HeadlessDialog>
                </Transition>

                {/* --- CONTACT SELECTOR MODAL (Premium Shadcn UI Integration) --- */}
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                    <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl transition-colors duration-200 flex flex-col h-[700px] max-h-[85vh]">

                        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors text-left shrink-0">
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                        <PenSquare className="size-6" strokeWidth={2.5} />
                                    </div>
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        New Message
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                    Select a contact from the directory to start a secure conversation.
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        <div className="px-6 sm:px-8 pt-6 pb-3 shrink-0 bg-slate-50 dark:bg-zinc-950/30 transition-colors">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                <Input
                                    type="text"
                                    placeholder="Search directory..."
                                    className="w-full h-12 text-base rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 pl-12 shadow-sm font-medium transition-colors focus-visible:ring-indigo-500"
                                    value={contactSearch}
                                    onChange={(e) => setContactSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-6 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30 transition-colors">
                            {filteredContacts.length === 0 ? (
                                <div className="p-8 text-center text-base font-medium text-slate-400 dark:text-slate-500">
                                    No contacts found matching "{contactSearch}"
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    {filteredContacts.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleSelectNewContact(u.id)}
                                            className="flex items-center gap-5 w-full p-4 rounded-2xl text-left transition-all hover:bg-white dark:hover:bg-zinc-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-sm text-slate-800 dark:text-slate-200"
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="size-14 shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl transition-colors">
                                                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-black text-lg rounded-2xl">
                                                        {getInitials(u.first_name, u.last_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div className="flex flex-col overflow-hidden mt-0.5">
                                                <span className="truncate text-lg font-black leading-tight transition-colors text-slate-900 dark:text-white">{u.first_name} {u.last_name}</span>
                                                <span className="text-[11px] font-bold uppercase tracking-widest mt-1.5 text-slate-500 dark:text-slate-400 transition-colors">{u.role}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <DialogFooter className="px-6 py-5 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 transition-colors m-0">
                            <Button variant="ghost" onClick={() => setIsComposeOpen(false)} className="h-12 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors">
                                Cancel
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}

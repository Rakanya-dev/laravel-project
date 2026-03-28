import AppLayout from '@/layouts/app-layout';
import { Dialog, Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Inbox, PenSquare, Search, SendHorizontal, Smile, Plus, FileText, X, Download, Loader2, UserPlus, CheckCircle2 } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import EmojiPicker, { Theme, EmojiClickData } from 'emoji-picker-react';

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
    const currentUserId = auth.user.id;

    // --- STATE ---
    const [messages, setMessages] = useState<Message[]>(activeMessages);
    const [searchTerm, setSearchTerm] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [contactSearch, setContactSearch] = useState(''); // 🚀 NEW: State for contact search in modal

    // File Attachment State
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Emoji Picker State
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Image Lightbox (Gallery) State
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { data, setData, post, processing, reset } = useForm({
        recipient_id: '',
        body: '',
    });

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

    const imageGallery = messages.filter((msg) => {
        const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
        return isImg && msg.attachment_url;
    });

    // --- 1. SYNC STATE ON PROP CHANGE ---
    useEffect(() => {
        setMessages(activeMessages);
    }, [activeMessages]);

    // --- 2. AUTO-SCROLL TO BOTTOM ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeRecipient]);

    // Auto-expand textarea height
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [replyText]);

    // --- 3. REAL-TIME POLLING ---
    useEffect(() => {
        if (activeRecipient) {
            pollingRef.current = setInterval(() => {
                router.visit(window.location.href, {
                    method: 'get',
                    only: ['activeMessages', 'conversations', 'activeRecipient'],
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                });
            }, 2000);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [activeRecipient?.id]);

    // --- 4. EMOJI PICKER OUTSIDE CLICK ---
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

    // Keyboard Navigation for the Image Lightbox
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

    // Reset form when compose modal closes
    useEffect(() => {
        if (!isComposeOpen) {
            reset();
            setContactSearch('');
        }
    }, [isComposeOpen]);

    // --- ACTIONS ---
    const handleSelectConversation = (userId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setShowEmojiPicker(false);
        clearAttachment();

        router.visit(route('messages.index', { user: userId }), {
            only: ['activeMessages', 'activeRecipient', 'conversations'],
            preserveState: true,
            preserveScroll: true,
        });
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
            sender_id: currentUserId,
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
                    alert('Failed to send message. Please ensure the file is under 10MB.');
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

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setReplyText((prev) => prev + emojiData.emoji);
    };

    const filteredConvos = conversations.filter(
        (c) =>
            c.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 🚀 NEW: Search filter for the Contact Book modal
    const filteredContacts = allowedRecipients.filter(
        (u) =>
            u.first_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
            u.last_name.toLowerCase().includes(contactSearch.toLowerCase()) ||
            u.role.toLowerCase().includes(contactSearch.toLowerCase())
    );

    const selectedContactInfo = allowedRecipients.find(u => u.id.toString() === data.recipient_id);

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/messages' }]}>
            <Head title="Messages" />

            {/* 🚀 FIX: Removed max-w-7xl, mx-auto, and outer padding.
              We calculate the height assuming a standard 64px (4rem) navbar.
              Adjust the 64px below if your AppLayout header is taller or shorter.
            */}
            <div className="flex h-[calc(100vh-64px)] w-full flex-col bg-white">
                <div className="flex h-full w-full overflow-hidden border-t border-slate-200 shadow-sm">

                    {/* ================= LEFT: CONVERSATION LIST ================= */}
                    <div
                        className={cn(
                            activeRecipient ? 'hidden md:flex' : 'flex',
                            'w-full flex-col border-r border-slate-200/60 bg-white md:w-80 lg:w-[400px] shrink-0'
                        )}
                    >
                        <div className="p-4 sm:p-5 shrink-0 bg-white z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Chats</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsComposeOpen(true)}
                                    className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                >
                                    <PenSquare className="h-5 w-5" />
                                </Button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[15px] transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="custom-scrollbar flex-1 overflow-y-auto px-3 pb-3">
                            {filteredConvos.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-400">No conversations found.</div>
                            ) : (
                                <div className="flex flex-col gap-1.5">
                                    {filteredConvos.map((convo) => {
                                        const isActive = activeRecipient?.id === convo.user.id;
                                        const fullName = `${convo.user.first_name} ${convo.user.last_name}`;

                                        return (
                                            <button
                                                key={convo.user.id}
                                                onClick={() => handleSelectConversation(convo.user.id)}
                                                className={cn(
                                                    'relative flex items-center gap-3.5 rounded-2xl p-3 text-left transition-all',
                                                    isActive ? 'bg-indigo-50/80 ring-1 ring-indigo-100 shadow-sm' : 'hover:bg-slate-50'
                                                )}
                                            >
                                                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 text-lg font-bold text-indigo-700 shadow-inner">
                                                    {getInitials(convo.user.first_name, convo.user.last_name)}
                                                    {convo.user.is_online && (
                                                        <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></div>
                                                    )}
                                                </div>

                                                <div className="flex-1 overflow-hidden">
                                                    <div className="flex items-baseline justify-between">
                                                        <span className={cn(
                                                            "truncate text-[15px]",
                                                            !convo.last_message.is_read && !isActive ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                                                        )}>
                                                            {fullName}
                                                        </span>
                                                        <span className={cn(
                                                            "text-xs",
                                                            !convo.last_message.is_read && !isActive ? "font-bold text-indigo-600" : "text-slate-400"
                                                        )}>
                                                            {new Date(convo.last_message.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className={cn(
                                                        "mt-0.5 truncate text-[14px]",
                                                        !convo.last_message.is_read && !isActive ? "font-semibold text-indigo-600" : "text-slate-500"
                                                    )}>
                                                        {convo.last_message.body || (convo.user.role === 'file' ? 'Sent an attachment' : 'Attachment')}
                                                    </div>
                                                </div>

                                                {!convo.last_message.is_read && !isActive && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-indigo-600 shadow-sm"></div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================= RIGHT: CHAT HISTORY ================= */}
                    <div className={cn(activeRecipient ? 'flex' : 'hidden md:flex', 'flex-1 flex-col bg-white overflow-hidden relative')}>

                        {/* Decorative Background Pattern */}
                        <div className="absolute inset-0 z-0 bg-slate-50/50 [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none">
                             <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="chat-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
                                        <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#chat-pattern)" />
                            </svg>
                        </div>

                        {activeRecipient ? (
                            <>
                                {/* Header */}
                                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-4 sm:px-6 py-3 shadow-sm z-10 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => router.visit(route('messages.index'))}
                                            className="-ml-2 rounded-full p-1.5 text-indigo-600 hover:bg-indigo-50 md:hidden transition-colors"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                        <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[15px] font-bold text-white shadow-md ring-2 ring-white">
                                            {getInitials(activeRecipient.first_name, activeRecipient.last_name)}
                                            {activeRecipient.is_online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500"></div>
                                            )}
                                        </div>
                                        <div className="ml-1">
                                            <h3 className="text-[16px] font-bold text-slate-900 leading-tight tracking-tight">
                                                {activeRecipient.first_name} {activeRecipient.last_name}
                                            </h3>
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                                {activeRecipient.is_online ? <span className="text-emerald-500">Online</span> : 'Offline'} <span className="mx-1">•</span> {activeRecipient.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Body */}
                                <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 z-10 relative custom-scrollbar">
                                    {messages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400">
                                            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 border border-slate-100 shadow-sm">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-black text-indigo-600">
                                                    {getInitials(activeRecipient.first_name, activeRecipient.last_name)}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-800">
                                                {activeRecipient.first_name} {activeRecipient.last_name}
                                            </h3>
                                            <p className="mt-1 font-semibold text-indigo-500 uppercase tracking-widest text-[11px] bg-indigo-50 px-3 py-1 rounded-full">{activeRecipient.role}</p>
                                            <p className="mt-4 text-sm text-slate-400">Say hello to start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.sender_id === currentUserId;
                                            const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
                                            const fileName = msg.attachment_name || getFileNameFromUrl(msg.attachment_url);

                                            return (
                                                <div key={msg.id} className={cn('flex w-full flex-col', isMe ? 'items-end' : 'items-start')}>

                                                    {/* Render Attachment if it exists */}
                                                    {msg.attachment_url && (
                                                        <div className={cn('mb-1 flex max-w-[85%] flex-col', isMe ? 'items-end' : 'items-start')}>
                                                            {isImg ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openLightbox(msg.id)}
                                                                    className="overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm cursor-zoom-in group bg-white p-1"
                                                                >
                                                                    <img src={msg.attachment_url} alt="Attachment" className="max-h-64 rounded-xl max-w-full object-cover group-hover:opacity-95 transition-opacity" />
                                                                </button>
                                                            ) : (
                                                                <a
                                                                    href={msg.attachment_url}
                                                                    download={fileName}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className={cn(
                                                                        "flex items-center gap-3 rounded-2xl p-3 shadow-sm transition-all hover:scale-[1.02]",
                                                                        isMe ? "bg-indigo-600 text-white rounded-br-[4px]" : "bg-white border border-slate-200 text-slate-900 rounded-bl-[4px]"
                                                                    )}
                                                                >
                                                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", isMe ? "bg-indigo-500/50" : "bg-slate-100 shadow-inner")}>
                                                                        <FileText className={cn("h-5 w-5", isMe ? "text-indigo-50" : "text-indigo-600")} />
                                                                    </div>
                                                                    <div className="flex flex-col overflow-hidden pr-2">
                                                                        <span className="truncate text-[15px] font-bold leading-tight">{fileName}</span>
                                                                        <span className={cn("text-[11px] font-medium mt-0.5 uppercase tracking-wide", isMe ? "text-indigo-200" : "text-slate-400")}>Click to download</span>
                                                                    </div>
                                                                    <Download className={cn("ml-1 h-5 w-5 shrink-0 opacity-70", isMe ? "text-indigo-200" : "text-slate-400")} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Render Text Body if it exists */}
                                                    {msg.body && (
                                                        <div
                                                            className={cn(
                                                                'max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm font-medium',
                                                                isMe
                                                                    ? 'bg-indigo-600 text-white rounded-2xl rounded-br-[4px]'
                                                                    : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-bl-[4px]',
                                                                msg.is_optimistic && 'opacity-70'
                                                            )}
                                                        >
                                                            {msg.body}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="shrink-0 w-full bg-white px-3 pb-4 pt-3 sm:px-6 sm:pb-6 z-20 relative">

                                    {showEmojiPicker && (
                                        <div ref={pickerRef} className="absolute bottom-full mb-4 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                                            <EmojiPicker
                                                onEmojiClick={onEmojiClick}
                                                autoFocusSearch={false}
                                                theme={Theme.LIGHT}
                                                searchDisabled={false}
                                                skinTonesDisabled={true}
                                                height={350}
                                                width={320}
                                                previewConfig={{ showPreview: false }}
                                            />
                                        </div>
                                    )}

                                    {attachment && (
                                        <div className="absolute bottom-full left-6 mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-xl animate-in slide-in-from-bottom-2">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col pr-4">
                                                <span className="max-w-[150px] truncate text-[13px] font-bold text-slate-800">{attachment.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatFileSize(attachment.size)}</span>
                                            </div>
                                            <button type="button" onClick={clearAttachment} className="ml-2 rounded-full bg-slate-50 p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSendReply} className="flex items-end gap-2 relative w-full">
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mb-1 shrink-0 h-11 w-11 rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        >
                                            <Plus className="h-6 w-6" />
                                        </Button>

                                        <div className="flex-1 flex items-end bg-slate-50 transition-all duration-300 border border-slate-200 rounded-3xl focus-within:bg-white focus-within:border-indigo-400 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10 p-1.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className={cn(
                                                    "mb-0.5 shrink-0 h-9 w-9 rounded-full ml-1 transition-colors",
                                                    showEmojiPicker ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-200"
                                                )}
                                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            >
                                                <Smile className="h-5 w-5" />
                                            </Button>

                                            <textarea
                                                ref={textareaRef}
                                                value={replyText}
                                                onKeyDown={handleKeyDown}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onClick={() => setShowEmojiPicker(false)}
                                                placeholder={attachment ? "Add a message with your file..." : "Type a message..."}
                                                rows={1}
                                                className="custom-scrollbar flex-1 resize-none border-none bg-transparent px-3 py-2 text-[15px] font-medium text-slate-900 focus:ring-0 placeholder:text-slate-400 min-h-[40px] max-h-[140px]"
                                                disabled={isSending}
                                            />

                                            <Button
                                                type="submit"
                                                size="icon"
                                                variant="ghost"
                                                className={cn(
                                                    'mb-0.5 shrink-0 h-9 w-9 rounded-full transition-all mr-1',
                                                    (replyText.trim() || attachment) ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700 hover:scale-105' : 'text-slate-300 cursor-not-allowed hover:bg-transparent',
                                                )}
                                                disabled={(!replyText.trim() && !attachment) || isSending}
                                            >
                                                {isSending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <SendHorizontal className="h-4 w-4 -ml-0.5" />}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center text-slate-400 z-10">
                                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-sm border border-slate-100 rotate-3 transition-transform hover:rotate-6">
                                    <Inbox className="h-10 w-10 text-indigo-200" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Your Messages</h3>
                                <p className="text-[15px] font-medium mt-1">Select a conversation from the sidebar to start chatting.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- 🚀 REFINED: MESSENGER-STYLE LIGHTBOX --- */}
                <Transition show={lightboxIndex !== null} as={Fragment}>
                    <Dialog as="div" className="relative z-[100]" onClose={() => setLightboxIndex(null)}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/95 backdrop-blur-md" aria-hidden="true" />
                        </Transition.Child>

                        <div className="fixed inset-0 flex flex-col items-center justify-center">
                            {/* TOP BAR */}
                            <div className="absolute top-0 inset-x-0 z-[110] flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                                <div className="text-white/90 font-medium px-4">
                                    {lightboxIndex !== null && imageGallery[lightboxIndex]
                                        ? getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)
                                        : 'Image'}
                                </div>

                                <div className="flex items-center gap-2">
                                    {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                        <a
                                            href={imageGallery[lightboxIndex].attachment_url}
                                            download={getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)}
                                            className="rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                            title="Download"
                                        >
                                            <Download className="h-6 w-6" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => setLightboxIndex(null)}
                                        className="rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all"
                                        title="Close (Esc)"
                                    >
                                        <X className="h-6 w-6" />
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
                                        <ChevronLeft className="h-10 w-10" />
                                    </button>
                                )}
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 z-[105]">
                                {lightboxIndex !== null && lightboxIndex < imageGallery.length - 1 && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                                        className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all"
                                    >
                                        <ChevronRight className="h-10 w-10" />
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
                            <div className="absolute bottom-6 z-[105] text-white/50 text-xs font-mono tracking-widest">
                                {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {imageGallery.length}
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* --- 🚀 NEW: DIRECTORY-STYLE NEW MESSAGE MODAL --- */}
                <Transition appear show={isComposeOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={() => setIsComposeOpen(false)}>
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4">
                                <Dialog.Panel className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col md:flex-row h-[600px] border border-slate-200">

                                    {/* Modal Left: Contact Directory */}
                                    <div className="w-full md:w-5/12 border-r border-slate-200 flex flex-col bg-slate-50">
                                        <div className="p-5 border-b border-slate-200 bg-white shadow-sm z-10">
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight">New Message</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">Select a contact to start chatting</p>
                                            <div className="mt-4 relative">
                                                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search directory..."
                                                    className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[14px] font-medium transition-all focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                                    value={contactSearch}
                                                    onChange={(e) => setContactSearch(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                                            {filteredContacts.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400 font-medium">No contacts found matching "{contactSearch}"</div>
                                            ) : (
                                                <div className="flex flex-col gap-1.5">
                                                    {filteredContacts.map(u => {
                                                        const isSelected = data.recipient_id === u.id.toString();
                                                        return (
                                                            <button
                                                                key={u.id}
                                                                onClick={() => setData('recipient_id', u.id.toString())}
                                                                className={cn(
                                                                    "flex items-center gap-3 w-full p-2.5 rounded-xl text-left transition-all",
                                                                    isSelected ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-200/50 bg-transparent text-slate-800"
                                                                )}
                                                            >
                                                                <div className={cn(
                                                                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm",
                                                                    isSelected ? "bg-white/20 text-white" : "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700 border border-white"
                                                                )}>
                                                                    {getInitials(u.first_name, u.last_name)}
                                                                </div>
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="truncate text-[15px] font-bold leading-tight">{u.first_name} {u.last_name}</span>
                                                                    <span className={cn("text-[11px] font-bold uppercase tracking-wider mt-0.5", isSelected ? "text-indigo-200" : "text-slate-400")}>{u.role}</span>
                                                                </div>
                                                                {isSelected && <CheckCircle2 className="ml-auto h-5 w-5 text-white mr-2" />}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Modal Right: Composer */}
                                    <div className="w-full md:w-7/12 flex flex-col bg-white relative">
                                        <div className="absolute top-4 right-4 z-10">
                                            <Button variant="ghost" size="icon" onClick={() => setIsComposeOpen(false)} className="rounded-full bg-slate-50 text-slate-400 hover:text-slate-900">
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>

                                        {data.recipient_id && selectedContactInfo ? (
                                            <form onSubmit={handleSendNew} className="flex flex-col h-full">
                                                <div className="p-6 pb-4 border-b border-slate-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 text-xl font-bold border border-indigo-100">
                                                            {getInitials(selectedContactInfo.first_name, selectedContactInfo.last_name)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-bold text-slate-900">{selectedContactInfo.first_name} {selectedContactInfo.last_name}</h4>
                                                            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500">{selectedContactInfo.role}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 p-6 flex flex-col">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message Body</label>
                                                    <textarea
                                                        className="flex-1 w-full resize-none rounded-2xl border-slate-200 bg-slate-50 p-4 text-[15px] font-medium focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 custom-scrollbar shadow-inner"
                                                        placeholder={`Write your first message to ${selectedContactInfo.first_name}...`}
                                                        value={data.body}
                                                        onChange={(e) => setData('body', e.target.value)}
                                                        required
                                                    />
                                                </div>

                                                <div className="p-6 pt-0 flex justify-end">
                                                    <Button
                                                        type="submit"
                                                        disabled={processing || !data.body.trim()}
                                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold px-8 h-12 text-[15px]"
                                                    >
                                                        {processing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <SendHorizontal className="mr-2 h-5 w-5" />}
                                                        {processing ? 'Sending...' : 'Send Message'}
                                                    </Button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 border border-slate-100 shadow-sm">
                                                    <UserPlus className="h-8 w-8 text-indigo-200" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800">Start a Conversation</h3>
                                                <p className="text-[14px] font-medium mt-1 text-slate-500 max-w-xs">Select a contact from the directory on the left to compose a new message.</p>
                                            </div>
                                        )}
                                    </div>

                                </Dialog.Panel>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </AppLayout>
    );
}

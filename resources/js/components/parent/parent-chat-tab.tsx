import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, Transition } from '@headlessui/react';
import axios from 'axios';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import {
    Download,
    FileText,
    Inbox,
    Loader2,
    Search,
    SendHorizontal,
    Smile,
    Plus,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';

// --- Types ---
interface Message {
    id: number;
    body: string;
    sender_id: number;
    recipient_id: number;
    attachment_url?: string;
    attachment_name?: string;
    is_image?: boolean;
    created_at: string;
    is_optimistic?: boolean;
}

interface Conversation {
    contact_id: number;
    contact_name: string;
    contact_role: string;
    last_message: string;
    time: string;
    is_online?: boolean; // 🚀 Real-time online status
}

interface Props {
    conversations: Conversation[];
    currentUser: { id: number; name: string };
}

export function ParentChatTab(props: Props) {
    const { conversations, currentUser } = props;

    // Dark Mode Detection for Emoji Picker
    const [isDarkMode, setIsDarkMode] = useState(false);

    // 🚀 LOCAL STATE FOR SIDEBAR: Allows the sidebar to update without page reloads!
    const [chatContacts, setChatContacts] = useState<Conversation[]>(conversations);

    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<number | null>(
        conversations.length > 0 ? conversations[0].contact_id : null
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [attachment, setAttachment] = useState<File | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Track the active contact using our local state
    const activeContact = chatContacts.find((c) => c.contact_id === selectedContactId);

    // --- FORMATTERS & HELPERS ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const isImage = (url?: string) => url ? url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null : false;
    const getFileNameFromUrl = (url?: string) => url ? decodeURIComponent(url.split('/').pop() || 'Attachment') : 'Attachment';
    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const imageGallery = messages.filter((msg) => {
        const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
        return isImg && msg.attachment_url;
    });

    // --- EFFECTS ---

    // Detect Dark Mode
    useEffect(() => {
        const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, selectedContactId]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
    }, [replyText]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) setShowEmojiPicker(false);
        }
        if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showEmojiPicker]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (lightboxIndex === null) return;
            if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
            if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev !== null && prev < imageGallery.length - 1 ? prev + 1 : prev));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, imageGallery.length]);

    // --- FETCH MESSAGES & SIDEBAR DATA (Axios Polling) ---
    const fetchMessages = async (contactId: number, silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const response = await axios.get(route('messages.index', { recipient: contactId }), {
                headers: { 'Accept': 'application/json' }
            });

            setMessages(response.data.initialMessages || []);

            // Sync Sidebar (Online Statuses & Last Message)
            if (response.data.conversations) {
                setChatContacts(response.data.conversations);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (!silent) setMessages([]);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

    // Background Poller
    useEffect(() => {
        if (selectedContactId) {
            fetchMessages(selectedContactId);
            const interval = setInterval(() => fetchMessages(selectedContactId, true), 3000);
            return () => clearInterval(interval);
        }
    }, [selectedContactId]);

    // --- ACTIONS ---
    const handleSelectConversation = (userId: number) => {
        setShowEmojiPicker(false);
        clearAttachment();
        setSelectedContactId(userId);

        // 🚀 THE FIX: Instantly mark this contact as read in local state
        setChatContacts(prev => prev.map(convo =>
            convo.contact_id === userId
                ? { ...convo, has_unread: false } // Force unread flag to false
                : convo
        ));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setAttachment(e.target.files[0]);
    };

    const clearAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openLightbox = (messageId: number) => {
        const index = imageGallery.findIndex((msg) => msg.id === messageId);
        if (index !== -1) setLightboxIndex(index);
    };

    const handleSendReply = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!activeContact || (!replyText.trim() && !attachment)) return;

        setShowEmojiPicker(false);
        setIsSending(true);

        const tempId = Date.now();
        let tempAttachmentUrl = undefined;
        let isImageFile = false;

        if (attachment) {
            tempAttachmentUrl = URL.createObjectURL(attachment);
            isImageFile = attachment.type.startsWith('image/');
        }

        // 1. Optimistic Update (Messages)
        const newMessage: Message = {
            id: tempId,
            sender_id: currentUser.id,
            recipient_id: activeContact.contact_id,
            body: replyText,
            attachment_url: tempAttachmentUrl,
            attachment_name: attachment?.name,
            is_image: isImageFile,
            created_at: new Date().toISOString(),
            is_optimistic: true,
        };

        // 2. Optimistic Update (Sidebar)
        setChatContacts(prev => prev.map(c =>
            c.contact_id === activeContact.contact_id
                ? { ...c, last_message: replyText || 'Attachment' }
                : c
        ));

        setMessages((prev) => [...prev, newMessage]);

        const textToSend = replyText;
        const fileToSend = attachment;

        setReplyText('');
        clearAttachment();
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        const formData = new FormData();
        formData.append('recipient_id', activeContact.contact_id.toString());
        formData.append('body', textToSend);
        if (fileToSend) formData.append('attachment', fileToSend);

        try {
            await axios.post(route('messages.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsSending(false);
            if (tempAttachmentUrl) URL.revokeObjectURL(tempAttachmentUrl);

            // Sync database after sending
            fetchMessages(activeContact.contact_id, true);
        } catch (error) {
            setIsSending(false);
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            if (tempAttachmentUrl) URL.revokeObjectURL(tempAttachmentUrl);
            alert('Failed to send message. Please ensure the file is under 10MB.');
        }
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

    const filteredConvos = chatContacts.filter((c) => c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-[650px] w-full overflow-hidden bg-white dark:bg-zinc-950 rounded-b-2xl border border-slate-200 dark:border-slate-800 shadow-sm border-t-0 transition-colors duration-200">

            {/* ================= LEFT: CONVERSATION LIST ================= */}
            <div className="hidden md:flex w-80 lg:w-[350px] flex-col border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-zinc-950 shrink-0 transition-colors">
                <div className="p-4 shrink-0 bg-white dark:bg-zinc-950 z-10 border-b border-slate-50 dark:border-slate-800/50 transition-colors">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-[14px] font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 shadow-sm"
                        />
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-2">
                    {filteredConvos.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400 dark:text-slate-500 font-medium transition-colors">No contacts found.</div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            {filteredConvos.map((convo) => {
                                const isActive = activeContact?.contact_id === convo.contact_id;
                                const isUnread = (convo as any).has_unread && !isActive;
                                return (
                                    <button
                                        key={convo.contact_id}
                                        onClick={() => handleSelectConversation(convo.contact_id)}
                                        className={cn(
                                            'relative flex items-center gap-3.5 rounded-2xl p-3 text-left transition-all',
                                            isActive ? 'bg-indigo-50/80 dark:bg-indigo-500/10 ring-1 ring-indigo-100 dark:ring-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                                        )}
                                    >
                                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/30 text-lg font-bold text-indigo-700 dark:text-indigo-400 border-2 border-white dark:border-zinc-950 shadow-inner transition-colors">
                                            {getInitials(convo.contact_name)}
                                            {convo.is_online && (
                                                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 dark:bg-emerald-400 transition-colors"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-baseline justify-between">
                                                <span className={cn(
                                                    "truncate text-[15px] transition-colors",
                                                    isUnread ? "font-black text-slate-900 dark:text-white" : "font-semibold text-slate-600 dark:text-slate-300")}>
                                                    {convo.contact_name}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "mt-0.5 truncate text-[14px] transition-colors",
                                                isUnread ? "font-bold text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400")}>
                                                {convo.last_message || convo.contact_role}
                                            </div>
                                            {isUnread && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm ml-2 transition-colors"></div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= RIGHT: CHAT HISTORY ================= */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative transition-colors">

                {/* 🚀 Decorative SVG Background Pattern */}
                <div className="absolute inset-0 z-0 bg-slate-50/50 dark:bg-zinc-950/50 [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none transition-colors">
                    <svg className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="chat-pattern" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#chat-pattern)" />
                    </svg>
                </div>

                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-zinc-950/95 px-4 sm:px-6 py-3 shadow-sm z-10 backdrop-blur-md transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[15px] font-bold text-white shadow-md ring-2 ring-white dark:ring-zinc-950 transition-colors">
                                    {getInitials(activeContact.contact_name)}
                                    {activeContact.is_online && (
                                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 dark:bg-emerald-400 transition-colors"></div>
                                    )}
                                </div>
                                <div className="ml-1">
                                    <h3 className="text-[16px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight transition-colors">
                                        {activeContact.contact_name}
                                    </h3>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
                                        {activeContact.is_online ? <span className="text-emerald-500 dark:text-emerald-400">Online</span> : 'Offline'} <span className="mx-1">•</span> {activeContact.contact_role}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 z-10 relative custom-scrollbar">
                            {isLoading && messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500 dark:text-indigo-400" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500 transition-colors">
                                    <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-2xl font-black text-indigo-600 dark:text-indigo-400 transition-colors">
                                            {getInitials(activeContact.contact_name)}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors">{activeContact.contact_name}</h3>
                                    <p className="mt-1 font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest text-[11px] bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full transition-colors">{activeContact.contact_role}</p>
                                    <p className="mt-4 text-sm text-slate-400 dark:text-slate-500 transition-colors">Say hello to start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.sender_id === currentUser.id;
                                    const isImg = msg.is_image !== undefined ? msg.is_image : isImage(msg.attachment_url);
                                    const fileName = msg.attachment_name || getFileNameFromUrl(msg.attachment_url);

                                    return (
                                        <div key={msg.id} className={cn('flex w-full flex-col', isMe ? 'items-end' : 'items-start')}>

                                            {/* Attachment Preview */}
                                            {msg.attachment_url && (
                                                <div className={cn('mb-1 flex max-w-[85%] flex-col', isMe ? 'items-end' : 'items-start')}>
                                                    {isImg ? (
                                                        <button type="button" onClick={() => openLightbox(msg.id)} className="overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm cursor-zoom-in group bg-white dark:bg-zinc-900 p-1 transition-colors">
                                                            <img src={msg.attachment_url} alt="Attachment" className="max-h-64 rounded-xl max-w-full object-cover group-hover:opacity-95 transition-opacity" />
                                                        </button>
                                                    ) : (
                                                        <a href={msg.attachment_url} download={fileName} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-3 rounded-2xl p-3 shadow-sm transition-all hover:scale-[1.02]", isMe ? "bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-[4px]" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[4px]")}>
                                                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", isMe ? "bg-indigo-500/50 dark:bg-indigo-500/30" : "bg-slate-100 dark:bg-zinc-800 shadow-inner")}>
                                                                <FileText className={cn("h-5 w-5", isMe ? "text-indigo-50 dark:text-indigo-100" : "text-indigo-600 dark:text-indigo-400")} />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden pr-2">
                                                                <span className="truncate text-[15px] font-bold leading-tight">{fileName}</span>
                                                                <span className={cn("text-[11px] font-medium mt-0.5 uppercase tracking-wide", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")}>Click to download</span>
                                                            </div>
                                                            <Download className={cn("ml-1 h-5 w-5 shrink-0 opacity-70", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {/* Text Body */}
                                            {msg.body && (
                                                <div className={cn('max-w-[75%] px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm font-medium transition-colors', isMe ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-br-[4px]' : 'bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-[4px]', msg.is_optimistic && 'opacity-70')}>
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
                        <div className="shrink-0 w-full bg-white dark:bg-zinc-950 px-3 pb-4 pt-3 sm:px-6 sm:pb-6 z-20 relative transition-colors">
                            {showEmojiPicker && (
                                <div ref={pickerRef} className="absolute bottom-full mb-4 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                                    <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} theme={isDarkMode ? Theme.DARK : Theme.LIGHT} searchDisabled={false} skinTonesDisabled={true} height={350} width={320} previewConfig={{ showPreview: false }} />
                                </div>
                            )}

                            {attachment && (
                                <div className="absolute bottom-full left-6 mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-2.5 shadow-xl animate-in slide-in-from-bottom-2 transition-colors">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/30 transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col pr-4">
                                        <span className="max-w-[150px] truncate text-[13px] font-bold text-slate-800 dark:text-slate-200 transition-colors">{attachment.name}</span>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{formatFileSize(attachment.size)}</span>
                                    </div>
                                    <button type="button" onClick={clearAttachment} className="ml-2 rounded-full bg-slate-50 dark:bg-zinc-800 p-1.5 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleSendReply} className="flex items-end gap-2 relative w-full">
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="mb-1 shrink-0 h-11 w-11 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-900 transition-colors">
                                    <Plus className="h-6 w-6" />
                                </Button>

                                <div className="flex-1 flex items-end bg-slate-50 dark:bg-zinc-900 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl focus-within:bg-white dark:focus-within:bg-zinc-950 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 p-1.5">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("mb-0.5 shrink-0 h-9 w-9 rounded-full ml-1 transition-colors", showEmojiPicker ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-800")}>
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
                                        className="custom-scrollbar flex-1 resize-none border-none bg-transparent px-3 py-2 text-[15px] font-medium text-slate-900 dark:text-white focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[40px] max-h-[140px] transition-colors"
                                        disabled={isSending}
                                    />

                                    <Button type="submit" size="icon" variant="ghost" disabled={(!replyText.trim() && !attachment) || isSending} className={cn('mb-0.5 shrink-0 h-9 w-9 rounded-full transition-all mr-1', (replyText.trim() || attachment) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-105' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent')}>
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <SendHorizontal className="h-4 w-4 -ml-0.5" />}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-10 transition-colors">
                        <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-3xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-slate-800 rotate-3 transition-transform hover:rotate-6">
                            <Inbox className="h-10 w-10 text-indigo-200 dark:text-indigo-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 transition-colors">Your Messages</h3>
                        <p className="text-[15px] font-medium mt-1 transition-colors">Select a conversation from the sidebar to start chatting.</p>
                    </div>
                )}
            </div>

            {/* ================= LIGHTBOX GALLERY ================= */}
            <Transition show={lightboxIndex !== null} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setLightboxIndex(null)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/95 backdrop-blur-md" aria-hidden="true" />
                    </Transition.Child>
                    <div className="fixed inset-0 flex flex-col items-center justify-center">
                        <div className="absolute top-0 inset-x-0 z-[110] flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
                            <div className="text-white/90 font-medium px-4">
                                {lightboxIndex !== null && imageGallery[lightboxIndex] ? getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url) : 'Image'}
                            </div>
                            <div className="flex items-center gap-2">
                                {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                    <a href={imageGallery[lightboxIndex].attachment_url} download={getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)} className="rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                        <Download className="h-6 w-6" />
                                    </a>
                                )}
                                <button onClick={() => setLightboxIndex(null)} className="rounded-full bg-white/10 p-2.5 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 left-0 flex items-center px-4 z-[105]">
                            {lightboxIndex !== null && lightboxIndex > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }} className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all">
                                    <ChevronLeft className="h-10 w-10" />
                                </button>
                            )}
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 z-[105]">
                            {lightboxIndex !== null && lightboxIndex < imageGallery.length - 1 && (
                                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }} className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all">
                                    <ChevronRight className="h-10 w-10" />
                                </button>
                            )}
                        </div>
                        <div className="relative flex h-full w-full items-center justify-center p-4 sm:p-20 z-[102]" onClick={() => setLightboxIndex(null)}>
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                                {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                    <img src={imageGallery[lightboxIndex].attachment_url} alt="Full screen" className="max-h-full max-w-full rounded-sm shadow-2xl object-contain ring-1 ring-white/10" onClick={(e) => e.stopPropagation()} />
                                )}
                            </Transition.Child>
                        </div>
                        <div className="absolute bottom-6 z-[105] text-white/50 text-xs font-mono tracking-widest">
                            {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {imageGallery.length}
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

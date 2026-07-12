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
    ChevronRight,
    MessageSquare
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
    is_online?: boolean;
}

export interface TeacherContact {
    id: number;
    name: string;
    role?: string;
}

interface Props {
    conversations: Conversation[];
    currentUser: { id: number; name: string };
    teachers?: TeacherContact[];
}

export function ParentChatTab(props: Props) {
    const { conversations, currentUser, teachers = [] } = props;

    const mergeContacts = (serverConvos: Conversation[]) => {
        const list = [...serverConvos];
        teachers.forEach(t => {
            if (!list.find(c => c.contact_id === t.id)) {
                list.push({
                    contact_id: t.id,
                    contact_name: t.name,
                    contact_role: t.role || 'Teacher',
                    last_message: 'Start a conversation...',
                    time: '',
                    is_online: false
                });
            }
        });
        return list;
    };

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [chatContacts, setChatContacts] = useState<Conversation[]>(mergeContacts(conversations));
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedContactId, setSelectedContactId] = useState<number | null>(
        chatContacts.length > 0 ? chatContacts[0].contact_id : null
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

    // --- FETCH MESSAGES ---
    const fetchMessages = async (contactId: number, silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const response = await axios.get(route('messages.index', { recipient: contactId }), {
                headers: { 'Accept': 'application/json' }
            });

            setMessages(response.data.initialMessages || []);

            if (response.data.conversations) {
                setChatContacts(mergeContacts(response.data.conversations));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (!silent) setMessages([]);
        } finally {
            if (!silent) setIsLoading(false);
        }
    };

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

        setChatContacts(prev => prev.map(convo =>
            convo.contact_id === userId
                ? { ...convo, has_unread: false }
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
        <div className="flex h-[80vh] min-h-[600px] w-full overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 rounded-b-2xl border-t-0">

            {/* ================= LEFT: CONVERSATION LIST ================= */}
            <div className="hidden md:flex w-80 lg:w-[380px] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shrink-0 transition-colors">
                <div className="p-6 shrink-0 bg-white dark:bg-zinc-950 z-10 border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900 pl-12 pr-4 text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:ring-indigo-500/20 shadow-sm"
                        />
                    </div>
                </div>

                <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
                    {filteredConvos.length === 0 ? (
                        <div className="p-8 text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">No contacts found</div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {filteredConvos.map((convo) => {
                                const isActive = activeContact?.contact_id === convo.contact_id;
                                const isUnread = (convo as any).has_unread && !isActive;
                                return (
                                    <button
                                        key={convo.contact_id}
                                        onClick={() => handleSelectConversation(convo.contact_id)}
                                        className={cn(
                                            'relative flex items-center gap-4 rounded-2xl p-4 text-left transition-all',
                                            isActive ? 'bg-indigo-50/80 dark:bg-indigo-500/10 ring-1 ring-indigo-100 dark:ring-indigo-500/20 shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50'
                                        )}
                                    >
                                        <div className="relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-500/20 dark:to-indigo-500/30 text-lg font-black text-indigo-700 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/30 shadow-sm transition-colors">
                                            {getInitials(convo.contact_name)}
                                            {convo.is_online && (
                                                <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-500 dark:bg-emerald-400 transition-colors"></div>
                                            )}
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <div className="flex items-baseline justify-between mb-0.5">
                                                <span className={cn(
                                                    "truncate text-base transition-colors",
                                                    isUnread ? "font-black text-slate-900 dark:text-white" : "font-bold text-slate-700 dark:text-slate-300")}>
                                                    {convo.contact_name}
                                                </span>
                                            </div>
                                            <div className={cn(
                                                "truncate text-sm transition-colors",
                                                isUnread ? "font-bold text-indigo-600 dark:text-indigo-400" : "font-medium text-slate-500 dark:text-slate-400")}>
                                                {convo.last_message || convo.contact_role}
                                            </div>
                                        </div>
                                        {isUnread && (
                                            <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shadow-sm ml-2 shrink-0 transition-colors"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ================= RIGHT: CHAT HISTORY ================= */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-950 relative transition-colors">

                {/* Decorative Pattern */}
                <div className="absolute inset-0 z-0 bg-slate-50/50 dark:bg-zinc-950/50 [mask-image:linear-gradient(to_bottom,transparent,black)] pointer-events-none transition-colors">
                    <svg className="absolute inset-0 h-full w-full opacity-[0.03] dark:opacity-[0.05] text-slate-900 dark:text-white" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="chat-pattern" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="currentColor" /></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#chat-pattern)" />
                    </svg>
                </div>

                {activeContact ? (
                    <>
                        {/* Header */}
                        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-zinc-950/95 px-6 py-5 shadow-sm z-10 backdrop-blur-md transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 text-lg font-black text-white shadow-sm transition-colors">
                                    {getInitials(activeContact.contact_name)}
                                    {activeContact.is_online && (
                                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-zinc-950 bg-emerald-400 transition-colors"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                                        {activeContact.contact_name}
                                    </h3>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                                        {activeContact.is_online ? <span className="text-emerald-500 dark:text-emerald-400">Online</span> : 'Offline'} <span className="mx-1.5">•</span> {activeContact.contact_role}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Messages Body */}
                        <div className="flex-1 space-y-6 overflow-y-auto p-6 sm:p-8 z-10 relative custom-scrollbar">
                            {isLoading && messages.length === 0 ? (
                                <div className="flex h-full items-center justify-center"><Loader2 className="size-8 animate-spin text-indigo-500 dark:text-indigo-400" /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-sm text-slate-400 dark:text-slate-500 transition-colors">
                                    <div className="mb-6 flex size-20 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 shadow-sm border border-indigo-100 dark:border-indigo-500/20 transition-colors">
                                        <MessageSquare className="size-10 text-indigo-500 dark:text-indigo-400" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{activeContact.contact_name}</h3>
                                    <p className="mt-2.5 font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest text-[11px] bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20 transition-colors">{activeContact.contact_role}</p>
                                    <p className="mt-6 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Say hello to start the conversation!</p>
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
                                                <div className={cn('mb-1.5 flex max-w-[85%] flex-col', isMe ? 'items-end' : 'items-start')}>
                                                    {isImg ? (
                                                        <button type="button" onClick={() => openLightbox(msg.id)} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm cursor-zoom-in group bg-white dark:bg-zinc-900 p-1.5 transition-colors">
                                                            <img src={msg.attachment_url} alt="Attachment" className="max-h-72 rounded-xl max-w-full object-cover group-hover:opacity-90 transition-opacity" />
                                                        </button>
                                                    ) : (
                                                        <a href={msg.attachment_url} download={fileName} target="_blank" rel="noopener noreferrer" className={cn("flex items-center gap-4 rounded-2xl p-4 shadow-sm transition-all hover:scale-[1.02]", isMe ? "bg-indigo-600 dark:bg-indigo-600 text-white rounded-br-[6px]" : "bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-[6px]")}>
                                                            <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", isMe ? "bg-indigo-500/50 dark:bg-indigo-500/30" : "bg-slate-100 dark:bg-zinc-800 shadow-inner")}>
                                                                <FileText className={cn("size-6", isMe ? "text-indigo-50 dark:text-indigo-100" : "text-indigo-600 dark:text-indigo-400")} />
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden pr-3">
                                                                <span className="truncate text-base font-bold leading-tight">{fileName}</span>
                                                                <span className={cn("text-[11px] font-bold mt-1.5 uppercase tracking-widest", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")}>Click to download</span>
                                                            </div>
                                                            <Download className={cn("ml-2 size-5 shrink-0 opacity-70", isMe ? "text-indigo-200" : "text-slate-400 dark:text-slate-500")} />
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {/* Text Body */}
                                            {msg.body && (
                                                <div className={cn('max-w-[80%] px-5 py-3.5 text-base leading-relaxed whitespace-pre-wrap shadow-sm font-medium transition-colors', isMe ? 'bg-indigo-600 dark:bg-indigo-600 text-white rounded-2xl rounded-br-[6px]' : 'bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-[6px]', msg.is_optimistic && 'opacity-70')}>
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
                        <div className="shrink-0 w-full bg-white dark:bg-zinc-950 p-6 z-20 relative transition-colors border-t border-slate-100 dark:border-slate-800">
                            {showEmojiPicker && (
                                <div ref={pickerRef} className="absolute bottom-full mb-4 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
                                    <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} theme={isDarkMode ? Theme.DARK : Theme.LIGHT} searchDisabled={false} skinTonesDisabled={true} height={350} width={320} previewConfig={{ showPreview: false }} />
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
                                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="mb-1 shrink-0 size-14 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shadow-sm">
                                    <Plus className="size-6" />
                                </Button>

                                <div className="flex-1 flex items-end bg-slate-50 dark:bg-zinc-900 transition-all duration-300 border border-slate-200 dark:border-slate-800 rounded-3xl focus-within:bg-white dark:focus-within:bg-zinc-950 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:shadow-md focus-within:ring-4 focus-within:ring-indigo-500/10 dark:focus-within:ring-indigo-500/20 p-2">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={cn("mb-0.5 shrink-0 size-12 rounded-full ml-1 transition-colors", showEmojiPicker ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20" : "text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-800")}>
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

                                    <Button type="submit" size="icon" variant="ghost" disabled={(!replyText.trim() && !attachment) || isSending} className={cn('mb-0.5 shrink-0 size-12 rounded-full transition-all mr-1', (replyText.trim() || attachment) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:scale-105' : 'text-slate-300 dark:text-slate-600 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent')}>
                                        {isSending ? <Loader2 className="size-6 animate-spin text-white" /> : <SendHorizontal className="size-6 -ml-0.5" />}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center text-slate-400 dark:text-slate-500 z-10 transition-colors">
                        <div className="mb-6 flex size-24 items-center justify-center rounded-2xl bg-slate-50 dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-slate-800 transition-all rotate-3 hover:rotate-6">
                            <Inbox className="size-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">Your Messages</h3>
                        <p className="text-base font-medium mt-2 text-slate-500 dark:text-slate-400 transition-colors">Select a conversation from the sidebar to start chatting.</p>
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
                            <div className="text-white/90 font-medium px-4 text-base">
                                {lightboxIndex !== null && imageGallery[lightboxIndex] ? getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url) : 'Image'}
                            </div>
                            <div className="flex items-center gap-2">
                                {lightboxIndex !== null && imageGallery[lightboxIndex] && (
                                    <a href={imageGallery[lightboxIndex].attachment_url} download={getFileNameFromUrl(imageGallery[lightboxIndex].attachment_url)} className="rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                        <Download className="size-6" />
                                    </a>
                                )}
                                <button onClick={() => setLightboxIndex(null)} className="rounded-full bg-white/10 p-3 text-white/70 hover:bg-white/20 hover:text-white transition-all">
                                    <X className="size-6" />
                                </button>
                            </div>
                        </div>
                        <div className="absolute inset-y-0 left-0 flex items-center px-4 z-[105]">
                            {lightboxIndex !== null && lightboxIndex > 0 && (
                                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }} className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all">
                                    <ChevronLeft className="size-10" />
                                </button>
                            )}
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 z-[105]">
                            {lightboxIndex !== null && lightboxIndex < imageGallery.length - 1 && (
                                <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }} className="rounded-full bg-black/20 p-4 text-white/40 hover:bg-black/40 hover:text-white transition-all">
                                    <ChevronRight className="size-10" />
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
                        <div className="absolute bottom-6 z-[105] text-white/50 text-[11px] font-bold uppercase tracking-widest">
                            {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {imageGallery.length}
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}

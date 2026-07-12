import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCircle2, FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios'; // 🚀 IMPORTED AXIOS HERE!

// --- TYPES ---
export interface Notification {
    id: string;
    type: 'message' | 'assessment' | 'system' | 'enrollment';
    title: string;
    message: string;
    time: string;
    is_read: boolean;
    url?: string;
}

interface NotificationPopoverProps {
    userId?: number;
    initialNotifications?: Notification[];
    unreadCount?: number;
}

export function NotificationPopover({ userId, initialNotifications = [], unreadCount = 0 }: NotificationPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [localUnread, setLocalUnread] = useState(unreadCount);

    // 🚀 THE WEBSOCKET LISTENER (This makes it real-time!)
    useEffect(() => {
        if (!userId || typeof window === 'undefined' || !(window as any).Echo) return;

        const echo = (window as any).Echo;
        const channelName = `App.Models.User.${userId}`;

        echo.private(channelName)
            .notification((notification: any) => {
                console.log("WebSocket Payload Received:", notification);

                const newNotification: Notification = {
                    id: notification.id,
                    type: notification.type || notification.data?.type || 'system',
                    title: notification.title || notification.data?.title || 'New Alert',
                    message: notification.message || notification.data?.message || '',
                    url: notification.url || notification.data?.url,
                    time: 'Just now',
                    is_read: false,
                };

                setNotifications((prev) => [newNotification, ...prev]);
                setLocalUnread((prev) => prev + 1);
            });

        return () => {
            echo.leave(channelName);
        };
    }, [userId]);

    // --- ICON MAPPER ---
    const getNotificationIcon = (type: Notification['type'], isRead: boolean) => {
        const baseClasses = "size-6 transition-colors";

        switch (type) {
            case 'message':
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-blue-100 dark:bg-blue-500/20',
                    icon: <MessageSquare className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-blue-600 dark:text-blue-400')} />
                };
            case 'assessment':
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-indigo-100 dark:bg-indigo-500/20',
                    icon: <FileText className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-indigo-600 dark:text-indigo-400')} />
                };
            case 'enrollment':
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-emerald-100 dark:bg-emerald-500/20',
                    icon: <CheckCircle2 className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-emerald-600 dark:text-emerald-400')} />
                };
            case 'system':
            default:
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-amber-100 dark:bg-amber-500/20',
                    icon: <AlertCircle className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400')} />
                };
        }
    };

    // --- HANDLERS ---
    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setLocalUnread(0);

        // 🚀 FIXED: Swapped router.post for axios.post!
        axios.post(route('notifications.mark-all-read')).catch(err => console.error("Failed to mark all as read:", err));
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
            setLocalUnread(prev => Math.max(0, prev - 1));

            // 🚀 FIXED: Swapped router.post for axios.post!
            axios.post(route('notifications.mark-read', notification.id)).catch(err => console.error("Failed to mark as read:", err));
        }

        if (notification.url) {
            setIsOpen(false);
            router.visit(notification.url);
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative size-12 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <Bell className="size-6" />
                    {localUnread > 0 && (
                        <span className="absolute top-2.5 right-3 size-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950 animate-in zoom-in" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                className="w-full sm:w-[420px] p-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden"
            >
                {/* --- HEADER --- */}
                <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                        {localUnread > 0 && (
                            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold px-2 py-0.5 shadow-none hover:bg-indigo-100">
                                {localUnread} New
                            </Badge>
                        )}
                    </div>
                    {localUnread > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 h-9 rounded-lg"
                        >
                            <Check className="mr-1.5 size-4" /> Mark All Read
                        </Button>
                    )}
                </div>

                {/* --- LIST --- */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center">
                            <div className="flex size-16 items-center justify-center rounded-2xl bg-white dark:bg-zinc-900 shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
                                <Bell className="size-8 text-slate-300 dark:text-slate-600" />
                            </div>
                            <p className="text-lg font-black text-slate-900 dark:text-white mb-1">All Caught Up!</p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">You have no new notifications right now.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
                            {notifications.map((notif) => {
                                const { bg, icon } = getNotificationIcon(notif.type, notif.is_read);

                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            "flex items-start gap-4 p-5 sm:p-6 text-left transition-all duration-200",
                                            notif.is_read
                                                ? "bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                                : "bg-indigo-50/40 dark:bg-indigo-500/5 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 relative"
                                        )}
                                    >
                                        {/* Unread Indicator Dot */}
                                        {!notif.is_read && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 dark:bg-indigo-400 rounded-r-full" />
                                        )}

                                        <div className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm border border-black/5 dark:border-white/5", bg)}>
                                            {icon}
                                        </div>

                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1 gap-2">
                                                <h4 className={cn(
                                                    "text-base truncate transition-colors",
                                                    notif.is_read ? "font-bold text-slate-700 dark:text-slate-300" : "font-black text-slate-900 dark:text-white"
                                                )}>
                                                    {notif.title}
                                                </h4>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest shrink-0 transition-colors",
                                                    notif.is_read ? "text-slate-400 dark:text-slate-500" : "text-indigo-600 dark:text-indigo-400"
                                                )}>
                                                    {notif.time}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                {notifications.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 shrink-0">
                        <Button
                            variant="outline"
                            className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-base hover:bg-slate-50 dark:hover:bg-zinc-800"
                            onClick={() => {
                                setIsOpen(false);
                                router.visit(route('notifications.index'));
                            }}
                        >
                            View All Notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}

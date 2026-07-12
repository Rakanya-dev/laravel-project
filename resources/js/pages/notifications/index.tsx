import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCircle2, FileText, MessageSquare, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Using the same types from our popover
export interface NotificationData {
    type: 'message' | 'assessment' | 'system' | 'enrollment' | 'rejected';
    title: string;
    message: string;
    url?: string;
}

export interface NotificationRecord {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface PaginationProps {
    data: NotificationRecord[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
}

export default function NotificationsIndex({ notifications }: { notifications: PaginationProps }) {
    const [localNotifications, setLocalNotifications] = useState(notifications.data);
    const [viewingNotif, setViewingNotif] = useState<NotificationRecord | null>(null);
    const unreadCount = localNotifications.filter(n => !n.read_at).length;

    // --- ICON MAPPER ---
    const getNotificationIcon = (type: NotificationData['type'], isRead: boolean) => {
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
            case 'rejected':
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-red-100 dark:bg-red-500/20',
                    icon: <XCircle className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-red-600 dark:text-red-400')} />
                };
            case 'system':
            default:
                return {
                    bg: isRead ? 'bg-slate-100 dark:bg-zinc-800' : 'bg-amber-100 dark:bg-amber-500/20',
                    icon: <AlertCircle className={cn(baseClasses, isRead ? 'text-slate-500' : 'text-amber-600 dark:text-amber-400')} />
                };
        }
    };

    const handleMarkAllAsRead = () => {
        setLocalNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        router.post(route('notifications.mark-all-read'), {}, { preserveScroll: true, preserveState: true });
    };

    const handleNotificationClick = (notification: NotificationRecord) => {
        if (!notification.read_at) {
            setLocalNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n));
            router.post(route('notifications.mark-read', notification.id), {}, { preserveScroll: true, preserveState: true });
        }

        setViewingNotif(notification);
    };

    const handleNavigate = (url: string) => {
        setViewingNotif(null);
        router.visit(url);
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Dashboard', href: '/redirect-by-role' },
            { title: 'Notifications', href: '/notifications' }
        ]}>
            <Head title="Notifications Center" />

            {/* 🚀 REMOVED max-w-5xl mx-auto to perfectly match StudentManagement fluid spacing */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                {/* HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        {/* 🚀 REMOVED the Bell icon and flex alignment to match standard headers */}
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                            Notifications Center
                        </h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">
                            View and manage your complete history of system alerts and messages.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={handleMarkAllAsRead}
                            className="shrink-0 h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-base hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                        >
                            <Check className="mr-2 size-5 text-indigo-600 dark:text-indigo-400" /> Mark All as Read
                        </Button>
                    )}
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors overflow-hidden">
                    {localNotifications.length === 0 ? (
                        <div className="p-6 sm:p-8">
                            <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 transition-colors">
                                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <CheckCircle2 className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <span className="text-2xl font-black text-slate-900 dark:text-white transition-colors">All caught up!</span>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">You have no new notifications right now.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                            {localNotifications.map((notif) => {
                                const isRead = !!notif.read_at;
                                const { bg, icon } = getNotificationIcon(notif.data.type || 'system', isRead);
                                const date = new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={cn(
                                            "group relative flex items-start gap-5 p-6 sm:p-8 cursor-pointer transition-colors duration-200",
                                            isRead ? "bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800/50" : "bg-indigo-50/40 dark:bg-indigo-500/5 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10"
                                        )}
                                    >
                                        {!isRead && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-indigo-500 dark:bg-indigo-400 rounded-r-full" />
                                        )}

                                        <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm border transition-colors", bg, isRead ? "border-slate-200 dark:border-slate-700" : "border-indigo-200 dark:border-indigo-500/20")}>
                                            {icon}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                                                <h4 className={cn("text-lg truncate transition-colors", isRead ? "font-bold text-slate-700 dark:text-slate-300" : "font-black text-slate-900 dark:text-white")}>
                                                    {notif.data.title}
                                                </h4>
                                                <span className={cn("text-[11px] font-bold uppercase tracking-widest shrink-0 transition-colors", isRead ? "text-slate-400 dark:text-slate-500" : "text-indigo-600 dark:text-indigo-400")}>
                                                    {date}
                                                </span>
                                            </div>
                                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 transition-colors">
                                                {notif.data.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* PAGINATION */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {notifications.links.map((link, i) => {
                            let label = link.label;
                            if (label.includes('Previous')) label = '«';
                            if (label.includes('Next')) label = '»';

                            return (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={cn(
                                        "flex h-12 min-w-12 items-center justify-center rounded-xl px-4 text-base font-bold transition-all shadow-sm",
                                        !link.url ? "text-slate-400 dark:text-slate-600 bg-slate-50 dark:bg-zinc-900/50 cursor-not-allowed border border-slate-200 dark:border-slate-800" :
                                        link.active ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white" : "bg-white dark:bg-zinc-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                                    )}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* NOTIFICATION VIEWER MODAL */}
            <Dialog open={!!viewingNotif} onOpenChange={(open) => !open && setViewingNotif(null)}>
                <DialogContent hideClose className="sm:max-w-[550px] p-0 overflow-hidden bg-white dark:bg-zinc-950 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl flex flex-col">
                    {viewingNotif && (
                        <>
                            <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <DialogHeader className="text-left">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className={cn(
                                            "flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors",
                                            getNotificationIcon(viewingNotif.data.type || 'system', true).bg
                                        )}>
                                            {getNotificationIcon(viewingNotif.data.type || 'system', true).icon}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                                {viewingNotif.data.title}
                                            </DialogTitle>
                                            <DialogDescription className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">
                                                {new Date(viewingNotif.created_at).toLocaleString('en-US', {
                                                    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
                                                })}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                            </div>

                            <div className="p-6 sm:p-8 bg-slate-50 dark:bg-zinc-950/30 transition-colors">
                                <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-colors">
                                    <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {viewingNotif.data.message}
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                                <Button
                                    variant="ghost"
                                    onClick={() => setViewingNotif(null)}
                                    className="w-full sm:w-auto h-12 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    Close
                                </Button>
                                {viewingNotif.data.url && (
                                    <Button
                                        onClick={() => handleNavigate(viewingNotif.data.url!)}
                                        className="w-full sm:w-auto h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold shadow-sm transition-colors"
                                    >
                                        Proceed to Page
                                    </Button>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}

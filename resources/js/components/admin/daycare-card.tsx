import { Building2, MoreVertical, Users, MapPin, UserCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { Daycare } from '@/pages/admin/daycare-management';

interface DaycareCardProps {
    daycare: Daycare;
    onView: (daycare: Daycare) => void;
    onEdit: (daycare: Daycare) => void;
    onDelete: (id: number) => void;
}

export default function DaycareCard({ daycare, onView, onEdit, onDelete }: DaycareCardProps) {
    const getCapacityColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-600 dark:bg-red-500';
        if (percentage >= 75) return 'bg-amber-500 dark:bg-amber-500';
        return 'bg-emerald-500 dark:bg-emerald-500';
    };

    const getCapacityTextColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-700 dark:text-red-400';
        if (percentage >= 75) return 'text-amber-700 dark:text-amber-400';
        return 'text-emerald-700 dark:text-emerald-400';
    };

    const getCapacityBadge = (percentage: number) => {
        // 🚀 Bumped badge text from text-[11px] to text-xs
        if (percentage >= 90) return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-none transition-colors">Near Capacity</Badge>;
        if (percentage >= 75) return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-none transition-colors">Filling Up</Badge>;
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-none transition-colors">Available</Badge>;
    };

    const teachersList = (daycare as any).teachers || (daycare.principal_name ? [daycare.principal_name] : []);

    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md flex flex-col h-full print:shadow-none print:border-slate-300 print:break-inside-avoid print:hover:translate-y-0">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-indigo-500 dark:bg-indigo-600 transition-colors" />

            <CardHeader className="pb-4 pt-6 px-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-4 mb-2">
                            {/* 🚀 Increased icon container and icon size */}
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-600 dark:group-hover:text-white transition-colors duration-300">
                                <Building2 className="size-7" strokeWidth={2.5} />
                            </div>
                            {/* 🚀 Bumped title from text-xl to text-2xl */}
                            <CardTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate transition-colors">{daycare.name}</CardTitle>
                        </div>
                        {/* 🚀 Bumped location text from text-sm to text-base, icon from size-4 to size-5 */}
                        <div className="flex items-center gap-2.5 text-base font-medium text-slate-500 dark:text-slate-400 pl-[4.25rem] mt-2 transition-colors">
                            <MapPin className="size-5 shrink-0" />
                            <span className="truncate">{daycare.location || daycare.address}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col p-6 pt-2">
                <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950/50 p-4 transition-colors print:bg-white print:border-slate-300">
                    <div className="flex -space-x-3 rtl:space-x-reverse shrink-0">
                        {teachersList.length > 0 ? (
                            teachersList.slice(0, 3).map((teacher: string, idx: number) => {
                                const nameParts = teacher.trim().split(' ');
                                const firstInitial = nameParts[0]?.[0]?.toUpperCase() || '';
                                const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() : '';

                                return (
                                    /* 🚀 Increased avatars from size-11 to size-12 */
                                    <Avatar key={idx} className="size-12 border-2 border-slate-50 dark:border-zinc-950 shadow-sm relative z-10 transition-colors">
                                        {/* 🚀 Bumped text-sm to text-base */}
                                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-base rounded-xl">
                                            {firstInitial}{lastInitial}
                                        </AvatarFallback>
                                    </Avatar>
                                );
                            })
                        ) : (
                            <Avatar className="size-12 border-2 border-slate-50 dark:border-zinc-950 shadow-sm relative z-10 transition-colors">
                                <AvatarFallback className="bg-white dark:bg-zinc-800 text-slate-400 dark:text-slate-500 rounded-xl">
                                    <UserCircle className="size-7" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                        {teachersList.length > 3 && (
                            <Avatar className="size-12 border-2 border-slate-50 dark:border-zinc-950 shadow-sm relative z-0 transition-colors">
                                <AvatarFallback className="bg-white dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold text-base rounded-xl">
                                    +{teachersList.length - 3}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        {/* 🚀 Bumped from text-[11px] to text-xs */}
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                            {teachersList.length === 1 ? 'Educator' : 'Educators'}
                        </span>
                        {/* 🚀 Bumped from text-base to text-lg */}
                        <span className="text-lg font-bold text-slate-900 dark:text-white truncate mt-0.5 transition-colors">
                            {teachersList.length === 0 ? 'Unassigned'
                                : teachersList.length === 1 ? teachersList[0]
                                    : `${teachersList.length} Teachers Assigned`}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            {/* 🚀 Bumped icon from size-5 to size-6 */}
                            <Users className="size-6 text-slate-400 dark:text-slate-500" />
                            {/* 🚀 Bumped from text-[11px] to text-xs */}
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Capacity</span>
                        </div>
                        {getCapacityBadge(daycare.percentage)}
                    </div>

                    {/* 🚀 Bumped from text-base to text-lg */}
                    <div className="flex items-center justify-between text-lg mb-2.5 font-bold">
                        <span className={`${getCapacityTextColor(daycare.percentage)} transition-colors`}>
                            {daycare.current} / {daycare.capacity} Enrolled
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 transition-colors">{daycare.percentage}%</span>
                    </div>

                    {/* 🚀 Made the progress bar slightly thicker (h-2.5 to h-3) to match the larger text */}
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800 transition-colors">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(daycare.percentage)}`}
                            style={{ width: `${daycare.percentage}%` }}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => onView(daycare)}
                    variant="outline"
                    // 🚀 Bumped from text-base to text-lg and made button slightly taller (h-12 to h-14)
                    className="print:hidden w-full mt-4 h-14 text-lg rounded-xl bg-slate-50 dark:bg-zinc-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-white dark:hover:bg-zinc-900 hover:text-indigo-800 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700 font-bold border-slate-200 dark:border-slate-800 transition-all shadow-sm"
                >
                    Open Center Profile
                </Button>
            </CardContent>
        </Card>
    );
}

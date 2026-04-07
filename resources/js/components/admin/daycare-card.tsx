import { Building2, MoreVertical, Users, MapPin, UserCircle, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        if (percentage >= 90) return <Badge className="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 font-bold uppercase tracking-widest text-[10px]">Near Capacity</Badge>;
        if (percentage >= 75) return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50 font-bold uppercase tracking-widest text-[10px]">Filling Up</Badge>;
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 font-bold uppercase tracking-widest text-[10px]">Available</Badge>;
    };

    // 🚀 NEW: Handle an array of teachers (fallback to single principal_name for backward compatibility)
    const teachersList = (daycare as any).teachers || (daycare.principal_name ? [daycare.principal_name] : []);

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md flex flex-col h-full">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-indigo-500 dark:bg-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500" />

            <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-1.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Building2 className="size-4" />
                            </div>
                            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white truncate">{daycare.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 pl-11">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{daycare.location || daycare.address}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg shrink-0 -mt-1 -mr-2 transition-colors">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                            <DropdownMenuItem onClick={() => onView(daycare)} className="cursor-pointer font-medium text-indigo-600 dark:text-indigo-400 focus:text-indigo-700 dark:focus:text-indigo-300 focus:bg-indigo-50 dark:focus:bg-zinc-800 transition-colors">
                                <Eye className="mr-2 size-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="dark:bg-slate-800" />
                            <DropdownMenuItem onClick={() => onEdit(daycare)} className="cursor-pointer font-medium text-slate-600 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-zinc-800 transition-colors">
                                <Edit className="mr-2 size-4 text-slate-400 dark:text-slate-500" /> Edit Center
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(daycare.id)} className="cursor-pointer font-medium text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300 transition-colors">
                                <Trash2 className="mr-2 size-4" /> Delete Center
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col">
                {/* --- 🚀 MULTI-TEACHER DISPLAY --- */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 p-3 transition-colors">
                    <div className="flex -space-x-3 rtl:space-x-reverse shrink-0">
                        {teachersList.length > 0 ? (
                            teachersList.slice(0, 3).map((teacher: string, idx: number) => {
                                const nameParts = teacher.trim().split(' ');
                                const firstInitial = nameParts[0]?.[0]?.toUpperCase() || '';
                                const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() : '';

                                return (
                                    <div key={idx} className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 border-2 border-white dark:border-zinc-900 shadow-sm text-indigo-700 dark:text-indigo-400 font-bold text-xs relative z-10 transition-colors">
                                        {firstInitial}{lastInitial}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 shadow-sm text-slate-400 dark:text-slate-500 z-10 transition-colors">
                                <UserCircle className="size-5" />
                            </div>
                        )}
                        {teachersList.length > 3 && (
                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 shadow-sm text-slate-600 dark:text-slate-400 font-bold text-xs relative z-0 transition-colors">
                                +{teachersList.length - 3}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            {teachersList.length === 1 ? 'Educator' : 'Educators'}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {teachersList.length === 0 ? 'Unassigned'
                                : teachersList.length === 1 ? teachersList[0]
                                    : `${teachersList.length} Teachers Assigned`}
                        </span>
                    </div>
                </div>

                {/* --- Capacity Section --- */}
                <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-slate-400 dark:text-slate-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Capacity</span>
                        </div>
                        {getCapacityBadge(daycare.percentage)}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2 font-bold">
                        <span className={getCapacityTextColor(daycare.percentage)}>
                            {daycare.current} / {daycare.capacity} Enrolled
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{daycare.percentage}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(daycare.percentage)}`}
                            style={{ width: `${daycare.percentage}%` }}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => onView(daycare)}
                    className="w-full mt-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-800 dark:hover:text-indigo-300 font-bold border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors shadow-none"
                >
                    Open Center Profile
                </Button>
            </CardContent>
        </Card>
    );
}

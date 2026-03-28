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
        if (percentage >= 90) return 'text-red-600 bg-red-600';
        if (percentage >= 75) return 'text-amber-600 bg-amber-500';
        return 'text-emerald-600 bg-emerald-500';
    };

    const getCapacityTextColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-700';
        if (percentage >= 75) return 'text-amber-700';
        return 'text-emerald-700';
    };

    const getCapacityBadge = (percentage: number) => {
        if (percentage >= 90) return <Badge className="bg-red-50 text-red-700 border-red-200 font-bold uppercase tracking-widest text-[10px]">Near Capacity</Badge>;
        if (percentage >= 75) return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold uppercase tracking-widest text-[10px]">Filling Up</Badge>;
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase tracking-widest text-[10px]">Available</Badge>;
    };

    // Safely handle teacher name whether it comes through as principal_name or teacher
    const assignedTeacher = (daycare as any).principal_name || daycare.teacher || 'Unassigned';

    return (
        <Card className="group relative overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-md flex flex-col h-full">
            {/* 🚀 Decorative top accent line */}
            <div className="absolute left-0 top-0 h-1.5 w-full bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-600" />

            <CardHeader className="pb-4 pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 mb-1.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <Building2 className="size-4" />
                            </div>
                            <CardTitle className="text-lg font-extrabold text-slate-900 truncate">{daycare.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 pl-11">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{daycare.location || daycare.address}</span>
                        </div>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 rounded-lg shrink-0 -mt-1 -mr-2">
                                <MoreVertical className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuItem onClick={() => onView(daycare)} className="cursor-pointer font-medium text-indigo-600 focus:text-indigo-700 focus:bg-indigo-50">
                                <Eye className="mr-2 size-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(daycare)} className="cursor-pointer font-medium text-slate-600">
                                <Edit className="mr-2 size-4 text-slate-400" /> Edit Center
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDelete(daycare.id)} className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700">
                                <Trash2 className="mr-2 size-4" /> Delete Center
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 flex flex-col">

                {/* --- Teacher Section --- */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 shrink-0">
                        <UserCircle className="size-5 text-indigo-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Child Dev. Worker</span>
                        <span className="text-sm font-bold text-slate-900 truncate">{assignedTeacher}</span>
                    </div>
                </div>

                {/* --- Capacity Section --- */}
                <div className="mt-auto pt-2">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-4 text-slate-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Capacity</span>
                        </div>
                        {getCapacityBadge(daycare.percentage)}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2 font-bold">
                        <span className={getCapacityTextColor(daycare.percentage)}>
                            {daycare.current} / {daycare.capacity} Enrolled
                        </span>
                        <span className="text-slate-600">{daycare.percentage}%</span>
                    </div>

                    {/* Custom Progress Bar for better coloring */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${getCapacityColor(daycare.percentage)}`}
                            style={{ width: `${daycare.percentage}%` }}
                        />
                    </div>
                </div>

                {/* --- Action Button --- */}
                <Button
                    onClick={() => onView(daycare)}
                    className="w-full mt-2 rounded-xl bg-slate-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 font-bold border border-slate-200 hover:border-indigo-200 transition-colors shadow-none"
                >
                    Open Center Profile
                </Button>
            </CardContent>
        </Card>
    );
}

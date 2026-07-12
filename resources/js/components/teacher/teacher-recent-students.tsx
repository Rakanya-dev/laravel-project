import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Student } from '@/pages/teacher/dashboard';
import { Users2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherRecentStudentsProps {
    students: Student[];
    onStudentClick?: (student: Student) => void;
    maxStudents?: number;
}

export function TeacherRecentStudents({
    students,
    onStudentClick = () => { },
    maxStudents = 5
}: TeacherRecentStudentsProps) {

    const getFullName = (student: Student) => {
        return `${student.firstName}${student.middleName ? ' ' + student.middleName : ''} ${student.lastName}`.trim();
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 w-fit border rounded-md transition-colors";

        switch (status) {
            case 'In Progress':
            case 'Draft':
                return <span className={cn(baseClasses, "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50")}>In Progress</span>;
            case 'Not Started':
            default:
                return <span className={cn(baseClasses, "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700")}>Not Started</span>;
        }
    };

    // Filter out 'Completed' students so this becomes a true To-Do list
    const displayStudents = students
        .filter(s => s.status === 'Draft' || s.status === 'In Progress' || s.status === 'Not Started')
        .slice(0, maxStudents);

    return (
        <Card className="flex flex-col h-[450px] lg:h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
            <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 px-6 py-4 transition-colors">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Pending Roster</h3>
            </div>

            {displayStudents.length === 0 ? (
                <div className="flex-1 p-6 sm:p-8">
                    <div className="flex h-full flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-950/50 text-center transition-colors px-4">
                        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <Users2 className="size-10 text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">All caught up!</p>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors max-w-xs">No pending assessments at the moment.</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 custom-scrollbar transition-colors">
                    {displayStudents.map((student) => {
                        const fullName = getFullName(student);
                        // Safe initials parsing
                        const firstInitial = student.firstName?.charAt(0) || '';
                        const lastInitial = student.lastName?.charAt(0) || '';
                        const initials = (firstInitial + lastInitial).toUpperCase();

                        return (
                            <div
                                key={student.id}
                                className="group flex items-center justify-between cursor-pointer p-5 sm:p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-zinc-800/50"
                                onClick={() => onStudentClick(student)}
                            >
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <Avatar className="size-14 rounded-xl border border-indigo-100 dark:border-indigo-500/30 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                        <AvatarFallback className="rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-lg font-black transition-colors">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1 mt-0.5">
                                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight transition-colors">{fullName}</p>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">{student.age} years old</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 sm:gap-5">
                                    <div className="flex flex-col items-end gap-1.5 hidden sm:flex">
                                        {getStatusBadge(student.status)}
                                    </div>
                                    <ChevronRight className="size-6 shrink-0 text-slate-300 dark:text-slate-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

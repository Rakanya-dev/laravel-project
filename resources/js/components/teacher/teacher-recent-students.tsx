import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Student } from '@/pages/teacher/dashboard';
import { Users2, ChevronRight } from 'lucide-react';

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
        switch (status) {
            case 'In Progress':
            case 'Draft':
                return <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-500/30 transition-colors">Draft / In Progress</span>;
            case 'Not Started':
            default:
                return <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 ring-1 ring-inset ring-slate-500/10 dark:ring-slate-500/20 transition-colors">Not Started</span>;
        }
    };

    // Filter out 'Completed' students so this becomes a true To-Do list
    const displayStudents = students
        .filter(s => s.status === 'Draft' || s.status === 'In Progress' || s.status === 'Not Started')
        .slice(0, maxStudents);

    return (
        <Card className="flex flex-col h-[400px] lg:h-[450px] rounded-2xl border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
            <div className="shrink-0 border-b border-slate-100 dark:border-slate-800 p-5 transition-colors">
                <h3 className="font-bold text-slate-800 dark:text-white tracking-tight transition-colors">Action Needed</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">Students with pending or unstarted assessments</p>
            </div>

            {displayStudents.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500 dark:text-slate-400 transition-colors">
                    <div className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 p-4 mb-3 transition-colors">
                        <Users2 className="size-8 text-emerald-500 dark:text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 transition-colors">All caught up!</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 transition-colors">No pending assessments at the moment.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 dark:divide-slate-800/80 custom-scrollbar transition-colors">
                    {displayStudents.map((student) => {
                        const fullName = getFullName(student);
                        const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

                        return (
                            <div
                                key={student.id}
                                className="group flex items-center justify-between cursor-pointer p-4 transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/50"
                                onClick={() => onStudentClick(student)}
                            >
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-11 border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-transform duration-300 group-hover:scale-105">
                                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold transition-colors">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">{fullName}</p>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors">{student.age} years old</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end gap-1.5">
                                        {getStatusBadge(student.status)}
                                    </div>
                                    <ChevronRight className="size-4 text-slate-300 dark:text-slate-600 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}

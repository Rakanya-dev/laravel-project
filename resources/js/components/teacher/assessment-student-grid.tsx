import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Calendar, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudentGroup {
    studentId: number;
    childName: string;
    childAge: number;
    assessments: any[];
}

interface AssessmentStudentGridProps {
    students: StudentGroup[];
    searchQuery: string;
    onStudentClick: (student: StudentGroup) => void;
}

export function AssessmentStudentGrid({ students, searchQuery, onStudentClick }: AssessmentStudentGridProps) {
    return (
        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 transition-colors duration-200 print:grid-cols-3 print:gap-4">
            {students.map((group) => {
                const sortedAssessments = [...group.assessments].sort((a, b) => b.sortTimestamp - a.sortTimestamp);
                const latest = sortedAssessments.length > 0 ? sortedAssessments[0] : null;

                return (
                    <Card
                        key={group.studentId}
                        onClick={() => onStudentClick(group)}
                        className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 print:shadow-none print:border-slate-300 print:hover:translate-y-0 print:break-inside-avoid"
                    >
                        <CardHeader className="flex flex-row items-start gap-4 p-6 pb-4">
                            <Avatar className="size-14 shrink-0 rounded-xl border border-indigo-100 dark:border-indigo-500/30 shadow-sm transition-colors">
                                <AvatarFallback className="rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-lg font-black text-indigo-700 dark:text-indigo-400 transition-colors">
                                    {group.childName.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden mt-1">
                                <CardTitle className="truncate text-xl font-black text-slate-900 dark:text-white transition-colors">
                                    {group.childName}
                                </CardTitle>
                                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                    {group.childAge} years old
                                </p>
                            </div>
                            <ChevronRight className="size-5 shrink-0 text-slate-300 dark:text-slate-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:group-hover:text-slate-400 mt-2 print:hidden" />
                        </CardHeader>

                        <CardContent className="px-6 pb-6 pt-0">
                            <div className="flex items-center justify-between mt-2 transition-colors">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Evaluations</span>
                                <Badge variant="outline" className="bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black px-3 py-0.5 shadow-sm transition-colors text-xs">
                                    {group.assessments.length}
                                </Badge>
                            </div>

                            {latest ? (
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors">
                                        <Calendar className="size-4" />
                                        <span>{latest.dateCreated}</span>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border",
                                            latest.status === 'Completed'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50'
                                                : latest.status === 'In Progress'
                                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50'
                                                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700'
                                        )}
                                    >
                                        {latest.status}
                                    </Badge>
                                </div>
                            ) : (
                                <div className="mt-5 flex items-center justify-center border-t border-slate-100 dark:border-slate-800 pt-5 transition-colors">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">
                                        No assessments yet
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                );
            })}

            {students.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-zinc-900/50 text-center transition-colors print:hidden">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                        <Search className="size-10 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No students found</h3>
                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                        Try adjusting your search query: "{searchQuery}"
                    </p>
                </div>
            )}
        </div>
    );
}

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, ChevronRight, Search } from 'lucide-react';

interface AssessmentTableProps {
    currentTableData: any[];
    searchQuery: string;
    groupedStudentsLength: number;
    onStudentClick: (studentData: any) => void;
}

export function AssessmentTable({ currentTableData, searchQuery, groupedStudentsLength, onStudentClick }: AssessmentTableProps) {
    return (
        <Table className="w-full min-w-[900px] table-fixed print:table-auto print:min-w-0">
            <TableHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-slate-100 dark:border-slate-800">
                    <TableHead className="w-[30%] py-5 pl-6 sm:pl-8 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Student</TableHead>
                    <TableHead className="w-[10%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Age</TableHead>
                    <TableHead className="w-[35%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Latest Progress</TableHead>
                    <TableHead className="w-[15%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Total Evals</TableHead>
                    <TableHead className="w-[10%] py-5 text-right pr-6 sm:pr-8 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors print:hidden">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors print:divide-slate-300">
                {currentTableData.map((group: any) => {
                    const sortedAssessments = [...group.assessments].sort((a, b) => b.sortTimestamp - a.sortTimestamp);
                    const latest = sortedAssessments.length > 0 ? sortedAssessments[0] : null;

                    return (
                        <TableRow
                            key={group.studentId}
                            onClick={() => onStudentClick(group)}
                            className="group cursor-pointer transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 border-slate-100 dark:border-slate-800 h-24 print:border-slate-300 print:hover:bg-transparent print:h-auto"
                        >
                            <TableCell className="pl-6 sm:pl-8 py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-14 shadow-sm border border-indigo-100 dark:border-indigo-500/30 rounded-xl shrink-0 transition-colors print:hidden">
                                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 font-black text-lg text-indigo-700 dark:text-indigo-400 rounded-xl transition-colors">
                                            {group.childName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-lg font-black text-slate-900 dark:text-white truncate transition-colors print:text-slate-900">
                                        {group.childName}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center py-4">
                                <span className="text-base font-bold text-slate-700 dark:text-slate-300 transition-colors print:text-slate-800">
                                    {group.childAge}
                                </span>
                            </TableCell>
                            <TableCell className="py-4">
                                {latest ? (
                                    <div className="w-full space-y-2.5 pr-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate transition-colors print:text-slate-900">
                                                {latest.type}
                                                {latest.category && (
                                                    <span className="ml-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0 transition-colors print:border-slate-300 print:bg-transparent">
                                                        {latest.category}
                                                    </span>
                                                )}
                                            </span>
                                            <Badge
                                                variant="outline"
                                                className={`px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border ${
                                                    latest.status === 'Completed'
                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50'
                                                        : latest.status === 'In Progress'
                                                          ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50'
                                                          : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700'
                                                }`}
                                            >
                                                {latest.status}
                                            </Badge>
                                        </div>
                                        {latest.status === 'Completed' ? (
                                            <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 transition-colors">
                                                <CheckCircle2 className="size-4" />
                                                <span>Completed {latest.dateCreated}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Progress value={latest.progressPercent} className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 print:hidden" />
                                                <span className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                                    {latest.filledCount}/{latest.totalCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-colors">No assessments yet</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center py-4">
                                <Badge variant="outline" className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black text-sm px-3.5 py-1.5 shadow-sm transition-colors print:shadow-none print:border-slate-300 print:bg-transparent">
                                    {group.assessments.length}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6 sm:pr-8 py-4 print:hidden">
                                <Button variant="ghost" size="icon" className="size-11 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <ChevronRight className="size-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-slate-500 dark:group-hover:text-slate-400" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {groupedStudentsLength === 0 && (
                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent print:hidden">
                        <TableCell colSpan={5} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                    <Search className="size-10 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No students found</h3>
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                    Try adjusting your search query: "{searchQuery}"
                                </p>
                            </div>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

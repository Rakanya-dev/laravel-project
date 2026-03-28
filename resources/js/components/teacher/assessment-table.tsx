import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface AssessmentTableProps {
    currentTableData: any[];
    searchQuery: string;
    groupedStudentsLength: number;
    onStudentClick: (studentData: any) => void;
}

export function AssessmentTable({ currentTableData, searchQuery, groupedStudentsLength, onStudentClick }: AssessmentTableProps) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="w-[250px]">Student</TableHead>
                    <TableHead className="w-[100px] text-center">Age</TableHead>
                    <TableHead className="w-[300px]">Latest Progress</TableHead>
                    <TableHead className="text-center">Total Evals</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {currentTableData.map((group: any) => {
                    const sortedAssessments = [...group.assessments].sort((a, b) => b.sortTimestamp - a.sortTimestamp);
                    const latest = sortedAssessments.length > 0 ? sortedAssessments[0] : null;

                    return (
                        <TableRow
                            key={group.studentId}
                            onClick={() => onStudentClick(group)}
                            className="cursor-pointer transition-colors hover:bg-slate-50"
                        >
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-blue-200 bg-blue-100">
                                        <AvatarFallback className="text-xs font-bold text-blue-700">
                                            {group.childName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-slate-700">{group.childName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center text-slate-500">{group.childAge} yrs</TableCell>
                            <TableCell>
                                {latest ? (
                                    <div className="w-full space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-slate-700">
                                                {latest.type}
                                                {latest.category && ` (${latest.category})`}
                                            </span>
                                            <span
                                                className={
                                                    latest.status === 'Completed'
                                                        ? 'font-bold text-green-600'
                                                        : latest.status === 'In Progress'
                                                          ? 'text-blue-600'
                                                          : 'text-slate-500'
                                                }
                                            >
                                                {latest.status}
                                            </span>
                                        </div>
                                        {latest.status === 'Completed' ? (
                                            <div className="flex w-fit items-center gap-1.5 rounded border border-green-100 bg-green-50 p-1 text-xs text-green-600">
                                                <CheckCircle2 className="h-3 w-3" />
                                                <span>Completed on {latest.dateCreated}</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Progress value={latest.progressPercent} className="h-2 w-full" />
                                                <span className="w-12 text-right text-[10px] text-slate-500">
                                                    {latest.filledCount}/{latest.totalCount}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">No assessments yet</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono">
                                    {group.assessments.length}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
                {groupedStudentsLength === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                            No students found matching "{searchQuery}"
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckSquare, FileText, MoreVertical, RefreshCw, Search, Trash2, X, Archive, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';
import type { Student } from '@/pages/teacher/my-students';

interface TeacherArchivedStudentsDialogProps {
    onOpenChange: (open: boolean) => void;
    archivedStudents: Student[];
    selectedArchivedStudents: Set<number>;
    filterDate: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onToggleAllArchived: () => void;
    onToggleArchivedStudent: (id: number) => void;
    onOpenDetail: (student: Student) => void;
    onOpenRestore: (student: Student) => void;
    onPermanentDelete: (id: number) => void;
    onBulkRestore: () => void;
    onBulkDelete: () => void;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Graduated': return <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">Graduated</Badge>;
        case 'Transferred': return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">Transferred</Badge>;
        case 'Inactive': return <Badge className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200">Inactive</Badge>;
        default: return <Badge variant="outline" className="text-gray-500">{status}</Badge>;
    }
};

const formatDateForDisplay = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export function TeacherArchivedStudentsDialog({
    onOpenChange,
    archivedStudents,
    selectedArchivedStudents,
    filterDate,
    searchQuery,
    onSearchChange,
    onDateChange,
    onToggleAllArchived,
    onToggleArchivedStudent,
    onOpenDetail,
    onOpenRestore,
    onPermanentDelete,
    onBulkRestore,
    onBulkDelete,
}: TeacherArchivedStudentsDialogProps) {

    const uniqueArchivedDates = useMemo(() => {
        const dates = new Set<string>();
        archivedStudents.forEach((student) => {
            if (student.archivedDate) dates.add(student.archivedDate);
        });
        return Array.from(dates);
    }, [archivedStudents]);

    const displayStudents = useMemo(() => {
        return archivedStudents.filter(s => {
             const name = `${s.firstName} ${s.middleName} ${s.lastName}`.toLowerCase();
             const query = searchQuery.toLowerCase();
             return name.includes(query);
        });
    }, [archivedStudents, searchQuery]);

    return (
        <DialogContent className="w-full sm:max-w-5xl gap-0 p-0 overflow-hidden rounded-xl border-0 [&>button]:hidden">
            <DialogHeader className="sr-only">
                <DialogTitle>Archived Students</DialogTitle>
                <DialogDescription>View and manage archived student records</DialogDescription>
            </DialogHeader>

            {/* --- Modern Dark Header --- */}
            <div className="bg-slate-900 text-white p-6 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                            <Archive className="size-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Archived Students</h2>
                            <p className="text-slate-400 text-sm">Manage graduated, transferred, or inactive records</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenChange(false)}
                        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X className="size-6" />
                    </Button>
                </div>
            </div>

            {/* --- Filters & Controls --- */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-4 items-end">
                <div className="relative flex-1 w-full">
                    <Label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wider">Search Student</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <Input
                            placeholder="Search by name..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-10 rounded-lg border-gray-200 bg-gray-50 pl-10 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="w-full sm:w-[200px]">
                    <Label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wider">Filter Date</Label>
                    <Select value={filterDate} onValueChange={onDateChange}>
                        <SelectTrigger className="h-10 bg-white border-gray-200 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Filter className="size-3.5" />
                                <SelectValue placeholder="All Dates" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            {uniqueArchivedDates.map((date) => (
                                <SelectItem key={date} value={date}>{date}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* --- Main Table Content --- */}
            <Card className="border-0 shadow-none flex-1 overflow-hidden flex flex-col rounded-none h-[500px]">
                <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
                    {selectedArchivedStudents.size > 0 && (
                        <div className="bg-blue-50/50 px-6 py-3 flex items-center justify-between shrink-0 border-b border-blue-100">
                            <div className="flex items-center gap-2">
                                <CheckSquare className="size-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">{selectedArchivedStudents.size} selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={onBulkRestore} className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50 h-8 text-xs font-medium shadow-sm">
                                    <RefreshCw className="mr-2 size-3.5" /> Restore
                                </Button>
                                <Button variant="outline" size="sm" onClick={onBulkDelete} className="bg-white border-red-200 text-red-600 hover:bg-red-50 h-8 text-xs font-medium shadow-sm">
                                    <Trash2 className="mr-2 size-3.5" /> Delete
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10">
                                <TableRow className="hover:bg-transparent border-gray-100">
                                    <TableHead className="w-[50px] pl-6">
                                        <Checkbox
                                            checked={displayStudents.length > 0 && selectedArchivedStudents.size === displayStudents.length}
                                            onCheckedChange={onToggleAllArchived}
                                        />
                                    </TableHead>
                                    <TableHead className="font-semibold text-gray-600">Student Name</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Archived Date</TableHead>
                                    <TableHead className="font-semibold text-gray-600">Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <Archive className="size-10 mb-3 opacity-20" />
                                                <p className="font-medium">No archived students found</p>
                                                <p className="text-xs mt-1">Try adjusting your filters</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    displayStudents.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-blue-50/30 transition-colors border-gray-50">
                                            <TableCell className="pl-6">
                                                <Checkbox
                                                    checked={selectedArchivedStudents.has(student.id)}
                                                    onCheckedChange={() => onToggleArchivedStudent(student.id)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-gray-900">{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">ID: {student.student_id || student.id}</div>
                                            </TableCell>
                                            <TableCell className="text-gray-500 font-medium text-sm">{formatDateForDisplay(student.archivedDate)}</TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem onClick={() => onOpenDetail(student)} className="gap-2">
                                                            <FileText className="size-4 text-blue-500" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onOpenRestore(student)} className="gap-2 text-green-600 focus:text-green-700 focus:bg-green-50">
                                                            <RefreshCw className="size-4" /> Restore
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </DialogContent>
    );
}

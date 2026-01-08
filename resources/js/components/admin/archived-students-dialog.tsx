import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Student } from '@/pages/admin/student-management';
import { CheckSquare, FileText, MoreVertical, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ArchivedStudentsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    archivedStudents: Student[];
    daycareList: string[];
    selectedArchivedStudents: Set<number>;
    filterDate: string;
    filterDaycare: string;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onDaycareChange: (value: string) => void;
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
        case 'Active':
            return <Badge className="rounded-lg border-[#baf7d1] bg-green-50 px-3 py-1 text-[13px] text-[#27815f] hover:bg-green-50">Active</Badge>;
        case 'Graduated':
            return (
                <Badge className="rounded-lg border-purple-50 bg-[#f4e9fe] px-3 py-1 text-[13px] text-[#9846dd] hover:bg-[#f4e9fe]">Graduated</Badge>
            );
        case 'Transferred':
            return (
                <Badge className="rounded-lg border-[#d7e9fd] bg-[#eff6fe] px-3 py-1 text-[13px] text-[#4b7ae8] hover:bg-[#eff6fe]">
                    Transferred
                </Badge>
            );
        case 'Inactive':
            return <Badge className="rounded-lg border-[#f3f4f5] bg-gray-50 px-3 py-1 text-[13px] text-[#697280] hover:bg-gray-50">Inactive</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

    return utcDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
};

export function ArchivedStudentsDialog({
    onOpenChange,
    archivedStudents,
    daycareList,
    selectedArchivedStudents,
    filterDate,
    filterDaycare,
    searchQuery,
    onSearchChange,
    onDaycareChange,
    onDateChange,
    onToggleAllArchived,
    onToggleArchivedStudent,
    onOpenDetail,
    onOpenRestore,
    onPermanentDelete,
    onBulkRestore,
    onBulkDelete,
}: ArchivedStudentsDialogProps) {
    const uniqueArchivedDates = useMemo(() => {
        const dates = new Set<string>();

        archivedStudents.forEach((student) => {
            if (student.archivedDate) {
                dates.add(student.archivedDate);
            }
        });

        return Array.from(dates);
    }, [archivedStudents]);

    return (
        <DialogContent className="flex h-[630px] w-full flex-col gap-0 p-0 sm:max-w-[940px]">
            <DialogHeader className="sr-only">
                <DialogTitle>Archived Child Records</DialogTitle>

                <DialogDescription>View and manage archived child records</DialogDescription>
            </DialogHeader>

            <Card className="flex h-full flex-col border-0 shadow-none">
                <div className="flex items-end gap-3 border-b px-6 pt-6 pb-4">
                    <div className="relative flex-1">
                        <Label htmlFor="searchArchived" className="text-[13px] text-[#a0a0a0]">
                            Search
                        </Label>

                        <Search className="absolute top-1/2 left-3 mt-2.5 size-[14px] -translate-y-1/2 text-[#a0a0a0]" />

                        <Input
                            id="searchArchived"
                            placeholder="Search child..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="h-[35px] rounded-lg border-[#e5e5e5] bg-[#f8f8f8] pl-10"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="filterDate" className="text-[13px] text-[#a0a0a0]">
                            Filter by Archived Date
                        </Label>

                        <Select value={filterDate} onValueChange={onDateChange}>
                            <SelectTrigger id="filterDate" className="h-[35px] w-[180px] rounded-lg border-[#e5e5e5] bg-[#f3f3f5] text-[13px]">
                                <SelectValue placeholder="All Dates" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Dates</SelectItem>

                                {uniqueArchivedDates.map((date) => (
                                    <SelectItem key={date} value={date}>
                                        {date}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="filterDaycare" className="text-[13px] text-[#a0a0a0]">
                            Daycare
                        </Label>

                        <Select value={filterDaycare} onValueChange={onDaycareChange}>
                            <SelectTrigger id="filterDaycare" className="h-[35px] w-[300px] rounded-lg border-[#e5e5e5] bg-[#f3f3f5] text-[13px]">
                                <SelectValue placeholder="All Daycares" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="all">All Daycares</SelectItem>

                                {daycareList.map((daycare) => (
                                    <SelectItem key={daycare} value={daycare}>
                                        {daycare}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
                    {/* Bulk Actions Bar */}

                    {selectedArchivedStudents.size > 0 && (
                        <div className="border-b border-green-200 bg-green-50 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="size-5 text-green-600" />

                                    <span className="text-[14px]">{selectedArchivedStudents.size} archived student(s) selected</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onBulkRestore}
                                        className="border-green-600 text-green-600 hover:bg-green-50"
                                    >
                                        <RefreshCw className="mr-2 size-4" />
                                        Restore Selected
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onBulkDelete}
                                        className="border-red-600 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 size-4" />
                                        Delete Selected
                                    </Button>

                                    <Button variant="outline" size="sm" onClick={() => onToggleAllArchived()}>
                                        Clear Selection
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table Container */}

                    <div className="flex-1 overflow-y-auto px-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={archivedStudents.length > 0 && selectedArchivedStudents.size === archivedStudents.length}
                                            onCheckedChange={onToggleAllArchived}
                                        />
                                    </TableHead>

                                    <TableHead>Name</TableHead>

                                    <TableHead>Archived Date</TableHead>

                                    <TableHead>Daycare</TableHead>

                                    <TableHead>Status</TableHead>

                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {archivedStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-8 text-center text-neutral-500">
                                            No archived students found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    archivedStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedArchivedStudents.has(student.id)}
                                                    onCheckedChange={() => onToggleArchivedStudent(student.id)}
                                                />
                                            </TableCell>

                                            <TableCell>{`${student.firstName} ${student.middleName} ${student.lastName}`.trim()}</TableCell>

                                            <TableCell className="text-neutral-500">{formatDateForDisplay(student.archivedDate || '')}</TableCell>

                                            <TableCell className="text-neutral-500">{student.daycare}</TableCell>

                                            <TableCell>{getStatusBadge(student.status)}</TableCell>

                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onOpenDetail(student)}>
                                                            <FileText className="mr-2 size-4" /> View Details
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem onClick={() => onOpenRestore(student)}>
                                                            <RefreshCw className="mr-2 size-4" /> Restore
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem className="text-red-600" onClick={() => onPermanentDelete(student.id)}>
                                                            <Trash2 className="mr-2 size-4" /> Delete Permanently
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

                    <div className="border-t px-6 py-4">
                        <p className="text-neutral-600">
                            Showing 1 to {archivedStudents.length} of {archivedStudents.length} entries
                        </p>
                    </div>
                </CardContent>
            </Card>
        </DialogContent>
    );
}

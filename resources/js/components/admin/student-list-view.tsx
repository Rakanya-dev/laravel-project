import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Student } from '@/pages/admin/student-management';
import { Archive, CheckSquare, Download, Edit2, FileText, MoreVertical, Plus, RefreshCw, Search, Trash2, Upload } from 'lucide-react';

interface StudentListViewProps {
    paginatedStudents: Student[];
    filteredStudents: Student[];
    selectedStudents: Set<number>;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    filterDaycare: string;
    filterStatus: string;
    daycareList: string[];
    onSearchChange: (value: string) => void;
    onDaycareChange: (value: string) => void;
    onStatusChange: (value: string) => void;
    onClearFilters: () => void;
    onPageChange: (page: number) => void;
    onToggleAll: () => void;
    onToggleStudent: (id: number) => void;

    // Actions
    onOpenAdd: () => void;
    onOpenImport: () => void;
    onOpenArchived: () => void;
    onExport: () => void;

    // Row Actions
    onOpenDetail: (student: Student) => void;
    onOpenEdit: (student: Student) => void;
    onOpenArchive: (student: Student) => void;
    onDelete: (id: number) => void;
    onOpenBulkArchive: () => void;
    itemsPerPage: number;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return <Badge className="rounded-lg border-[#baf7d1] bg-green-50 px-3 py-1 text-[13px] text-[#27815f] hover:bg-green-50">Active</Badge>;
        case 'Graduated':
            return <Badge className="rounded-lg border-purple-50 bg-[#f4e9fe] px-3 py-1 text-[13px] text-[#9846dd] hover:bg-[#f4e9fe]">Graduated</Badge>;
        case 'Transferred':
            return <Badge className="rounded-lg border-[#d7e9fd] bg-[#eff6fe] px-3 py-1 text-[13px] text-[#4b7ae8] hover:bg-[#eff6fe]">Transferred</Badge>;
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

export function StudentListView({
    paginatedStudents,
    filteredStudents,
    selectedStudents,
    currentPage,
    totalPages,
    searchQuery,
    filterDaycare,
    filterStatus,
    daycareList,
    onSearchChange,
    onDaycareChange,
    onStatusChange,
    onClearFilters,
    onPageChange,
    onToggleAll,
    onToggleStudent,
    onOpenAdd,
    onOpenImport,
    onOpenArchived,
    onExport,
    onOpenDetail,
    onOpenEdit,
    onOpenArchive,
    onDelete,
    onOpenBulkArchive,
    itemsPerPage,
}: StudentListViewProps) {
    const totalItems = filteredStudents.length;

    return (
        <div className="space-y-6">
            {/* 1. CLEANER HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-black">Child Records</h2>
                    <p className="text-neutral-600">Manage children enrolled in daycare centers</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={onOpenArchived}>
                        <Archive className="size-4" />
                        Archived
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onExport}>
                        <Download className="size-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedStudents.size > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2">
                            <CheckSquare className="size-5 text-blue-600" />
                            <span className="text-[14px]">{selectedStudents.size} student(s) selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={onOpenBulkArchive}>
                                <Archive className="mr-2 size-4" />
                                Archive Selected
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => onToggleStudent(0)}>
                                Clear Selection
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                {/* Search and Filter Bar */}
                <div className="border-b px-6 pt-6 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Search by child's name..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="border-neutral-300 bg-[#f8f8f8] pl-10"
                            />
                        </div>

                        <Select value={filterDaycare} onValueChange={onDaycareChange}>
                            <SelectTrigger className="w-[200px] bg-[#f3f3f5]">
                                <SelectValue placeholder="All Daycares" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Daycares</SelectItem>
                                {daycareList.map((daycare) => (
                                    <SelectItem key={daycare} value={daycare}>{daycare}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={onStatusChange}>
                            <SelectTrigger className="w-[150px] bg-[#f3f3f5]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                                <SelectItem value="Graduated">Graduated</SelectItem>
                                <SelectItem value="Transferred">Transferred</SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchQuery || filterDaycare !== 'all' || filterStatus !== 'all') && (
                            <Button variant="outline" size="sm" onClick={onClearFilters}>
                                <RefreshCw className="mr-2 size-4" />
                            </Button>
                        )}

                        {/* 2. CONSOLIDATED ACTIONS */}
                        <div className="flex gap-2 pl-2 border-l ml-2">
                            <Button variant="outline" onClick={onOpenImport}>
                                <Upload className="mr-2 h-4 w-4" /> Import
                            </Button>
                            <Button onClick={onOpenAdd} className="bg-black text-white hover:bg-black/90">
                                <Plus className="mr-2 h-4 w-4" /> Add Child
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={paginatedStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
                                        onCheckedChange={onToggleAll}
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Date of Birth</TableHead>
                                <TableHead>Daycare</TableHead>
                                <TableHead>Parent Status</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-neutral-500">
                                        No students found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedStudents.has(student.id)}
                                                onCheckedChange={() => onToggleStudent(student.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="cursor-pointer font-medium hover:text-blue-600" onClick={() => onOpenDetail(student)}>
                                            {`${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim()}
                                        </TableCell>
                                        <TableCell className="text-neutral-500">{formatDateForDisplay(student.dateOfBirth)}</TableCell>
                                        <TableCell className="text-neutral-500">{student.daycare}</TableCell>
                                        <TableCell>
                                            {student.parentLinked ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge className="rounded-lg border-blue-100 bg-blue-50 px-3 py-1 text-[13px] text-blue-700 hover:bg-blue-50">
                                                        Linked
                                                    </Badge>
                                                    <span className="text-[13px] text-neutral-500">{student.parentName}</span>
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="rounded-lg border-neutral-300 px-3 py-1 text-[13px] text-neutral-600"
                                                >
                                                    Not Linked
                                                </Badge>
                                            )}
                                        </TableCell>
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
                                                    <DropdownMenuItem onClick={() => onOpenEdit(student)}>
                                                        <Edit2 className="mr-2 size-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onOpenArchive(student)}>
                                                        <Archive className="mr-2 size-4" /> Archive
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(student.id)}>
                                                        <Trash2 className="mr-2 size-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-neutral-600">
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of{' '}
                            {filteredStudents.length} entries
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

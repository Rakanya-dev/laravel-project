import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';
import {
    Archive,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Copy,
    Download,
    Edit,
    Eye,
    MoreVertical,
    Plus,
    Printer,
    RefreshCw,
    Search,
    Upload,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- Types ---
export interface Student {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    age: number;
    status: 'Active' | 'Inactive' | 'Graduated' | 'Transferred';
    assessmentStatus: 'Completed' | 'In Progress' | 'Draft' | 'Not Started';
    lastAssessment: string;
    score?: number;
    parentName: string;
    parentEmail: string;
    archived: boolean;
    archivedDate?: string;
    daycare: string;
    accessCode?: string | null;
    [key: string]: any;
}

interface TeacherStudentListProps {
    students: Student[];
    daycareName: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onNewAssessment: () => void;
    onExportData: () => void;
    onViewStudent: (student: Student) => void;
    onEditStudent: (student: Student) => void;
    onArchiveStudent: (student: Student) => void;
    onOpenArchivedList: () => void;
    selectedStudents: Set<number>;
    onToggleStudent: (id: number) => void;
    onToggleAll: () => void;
    onBulkArchive: () => void;
    onAddStudent?: () => void;
    onBulkImport?: () => void;
}

// --- HELPERS ---
const getFullName = (student: Student) => {
    return `${student.firstName}${student.middleName ? ' ' + student.middleName : ''} ${student.lastName}`.trim();
};

const getEnrollmentBadge = (status: string) => {
    switch (status) {
        case 'Active':
            return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">Active</Badge>;
        case 'Inactive':
            return <Badge className="border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-50">Inactive</Badge>;
        case 'Graduated':
            return <Badge className="border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50">Graduated</Badge>;
        case 'Transferred':
            return <Badge className="border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-50">Transferred</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getAssessmentBadge = (status: string = 'Not Started') => {
    switch (status) {
        case 'Completed':
            return <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">Completed</Badge>;
        case 'In Progress':
            return <Badge className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">In Progress</Badge>;
        case 'Draft':
            return <Badge className="border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-100">Draft</Badge>;
        case 'Not Started':
            return <Badge className="border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Not Started</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export function TeacherStudentList({
    students,
    daycareName,
    searchQuery,
    onSearchChange,
    onNewAssessment,
    onExportData,
    onViewStudent,
    onEditStudent,
    onArchiveStudent,
    onOpenArchivedList,
    selectedStudents,
    onToggleStudent,
    onToggleAll,
    onBulkArchive,
    onAddStudent,
    onBulkImport,
}: TeacherStudentListProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, students.length]);

    const totalPages = Math.ceil(students.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStudents = students.slice(startIndex, endIndex);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Code ${code} copied to clipboard!`);
    };

    const handleRegenerateCode = (studentId: number) => {
        if (confirm('Generate a new code for a second parent?')) {
            router.post(route('teacher.students.regenerate-code', studentId));
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Page Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-black">My Students</h2>
                    <p className="text-neutral-600">Manage your students at {daycareName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* View Archived */}
                    <Button
                        variant="outline"
                        className="h-9 gap-2 border-dashed border-neutral-300 text-neutral-600 hover:bg-neutral-50"
                        onClick={onOpenArchivedList}
                    >
                        <Clock className="size-4" /> View Archived
                    </Button>

                    {/* Export CSV */}
                    <Button variant="outline" className="h-9 gap-2" onClick={onExportData}>
                        <Download className="size-4" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Bulk Actions (Conditional) */}
            {selectedStudents.size > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-amber-800">
                        <CheckSquare className="size-5" />
                        <span className="text-sm font-medium">{selectedStudents.size} student(s) selected</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onBulkArchive}
                            className="h-8 border-amber-300 text-amber-700 hover:bg-amber-100"
                        >
                            <Archive className="mr-2 size-4" /> Archive Selected
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onToggleAll} className="h-8 text-amber-600 hover:bg-amber-100">
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Table Card */}
            <Card>
                <div className="flex flex-col items-start justify-between gap-4 border-b px-6 py-4 lg:flex-row lg:items-center">
                    <div className="flex w-full flex-1 flex-col gap-4 lg:flex-row lg:items-center">
                        {/* Search Bar */}
                        <div className="relative w-full lg:max-w-xs">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="border-neutral-300 bg-[#f8f8f8] pl-10"
                            />
                        </div>

                        {/* --- UNIFIED ACTION TOOLBAR --- */}
                        <div className="ml-auto flex flex-wrap gap-2 lg:border-l lg:pl-4">
                            {/* New Assessment */}
                            <Button className="h-9 gap-2 bg-black hover:bg-black/90" onClick={onNewAssessment}>
                                <Plus className="size-4" /> New Assessment
                            </Button>
                            {/* Print Codes */}
                            <a
                                href={route('teacher.students.print-codes')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ring-offset-background focus-visible:ring-ring inline-flex h-9 items-center justify-center gap-2 rounded-md border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                            >
                                <Printer className="size-4" />
                                <span className="hidden sm:inline">Print Codes</span>
                            </a>
                            {/* Import */}
                            <Button variant="outline" className="h-9 gap-2" onClick={onBulkImport}>
                                <Upload className="mr-2 size-4" /> Import
                            </Button>
                            {/* Add Child */}
                            <Button variant="outline" className="h-9 gap-2" onClick={onAddStudent}>
                                <Plus className="mr-2 size-4" /> Add Child
                            </Button>
                        </div>
                    </div>
                </div>

                <CardContent className="p-0">
                    <div className="min-h-[400px]">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {selectedStudents && onToggleAll && (
                                        <TableHead className="w-[40px] pl-4">
                                            <Checkbox
                                                checked={students.length > 0 && selectedStudents.size === students.length}
                                                onCheckedChange={onToggleAll}
                                            />
                                        </TableHead>
                                    )}
                                    <TableHead>Name</TableHead>
                                    <TableHead>Access Code</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Parent/Guardian</TableHead>
                                    <TableHead>Enrollment</TableHead>
                                    <TableHead>Assessment</TableHead>
                                    <TableHead>Last Date</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={10} className="py-12 text-center text-neutral-500">
                                            {searchQuery ? 'No students found matching your search' : 'No students in this daycare yet'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedStudents.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-neutral-50">
                                            {selectedStudents && onToggleStudent && (
                                                <TableCell className="pl-4">
                                                    <Checkbox
                                                        checked={selectedStudents.has(student.id)}
                                                        onCheckedChange={() => onToggleStudent(student.id)}
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell
                                                className="cursor-pointer font-medium hover:text-blue-600"
                                                onClick={() => onViewStudent(student)}
                                            >
                                                {getFullName(student)}
                                            </TableCell>

                                            <TableCell>
                                                {student.accessCode ? (
                                                    <div className="group flex items-center gap-2">
                                                        <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 font-mono text-xs font-bold text-blue-700">
                                                            {student.accessCode}
                                                        </span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyCode(student.accessCode!);
                                                            }}
                                                            className="text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-black"
                                                            title="Copy Code"
                                                        >
                                                            <Copy className="size-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-green-600 italic">Claimed</span>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRegenerateCode(student.id);
                                                            }}
                                                            className="text-gray-400 hover:text-blue-600"
                                                            title="Generate New Code"
                                                        >
                                                            <RefreshCw className="size-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </TableCell>

                                            <TableCell className="text-neutral-500">{student.age} years</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{student.parentName}</span>
                                                    <span className="text-xs text-gray-500">{student.parentEmail}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell>{getEnrollmentBadge(student.status)}</TableCell>
                                            <TableCell>{getAssessmentBadge(student.assessmentStatus)}</TableCell>

                                            <TableCell className="text-sm text-neutral-500">{student.lastAssessment}</TableCell>
                                            <TableCell>
                                                {student.score ? (
                                                    <span className="font-medium text-gray-900">{student.score}</span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="pr-4 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100">
                                                            <MoreVertical className="size-4 text-gray-500" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => onViewStudent(student)} className="cursor-pointer">
                                                            <Eye className="mr-2 size-4 text-blue-500" /> View Details
                                                        </DropdownMenuItem>

                                                        {student.accessCode && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleCopyCode(student.accessCode!)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Copy className="mr-2 size-4 text-gray-500" /> Copy Access Code
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuItem onClick={() => onEditStudent(student)} className="cursor-pointer">
                                                            <Edit className="mr-2 size-4 text-gray-500" /> Edit Student
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer text-amber-700 focus:bg-amber-50 focus:text-amber-800"
                                                            onClick={() => onArchiveStudent(student)}
                                                        >
                                                            <Archive className="mr-2 size-4" /> Archive / Status
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

                    {/* Pagination */}
                    {students.length > 0 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <div className="text-sm text-neutral-500">
                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(endIndex, students.length)}</span> of{' '}
                                <span className="font-medium">{students.length}</span> students
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="text-sm font-medium">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

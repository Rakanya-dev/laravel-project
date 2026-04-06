import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Archive,
    BarChart3,
    CheckSquare,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Edit,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    GraduationCap,
    Key,
    MoreHorizontal,
    PlayCircle,
    Plus,
    PlusCircle,
    Printer,
    Search,
    Upload,
    X,
} from 'lucide-react';
import { useMemo } from 'react';

// 🚀 IMPORT NEW DATE TOOLKIT
import { calculateAge, formatPHDate } from '@/utils/date';
import { getAssessmentBadge, getEnrollmentBadge } from '@/utils/badges'; // 🚀 NEW

export interface BaseStudent {
    id: number;
    firstName: string;
    lastName: string;
    status: string;
    archived: boolean;
    access_code?: string; // 🚀 NEW: Tell React this might exist
    [key: string]: any;
}

interface StudentListViewProps<T extends BaseStudent> {
    role: 'admin' | 'teacher';
    paginatedStudents: T[];
    filteredStudents: T[];
    selectedStudents: Set<number>;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    itemsPerPage: number;

    filterDaycare?: string;
    filterSection?: string;
    filterStatus: string;
    filterAssessment?: string;
    daycareList?: string[];
    sectionList?: string[];

    onSearchChange: (value: string) => void;
    onDaycareChange?: (value: string) => void;
    onSectionChange?: (value: string) => void;
    onStatusChange: (value: string) => void;
    onAssessmentChange?: (value: string) => void;
    onClearFilters: () => void;
    onPageChange: (page: number) => void;

    onToggleAll: () => void;
    onToggleStudent: (id: number) => void;
    onCancelSelection: () => void;

    onOpenBulkArchive: () => void;
    onOpenArchived: () => void;
    onExport: () => void;
    onOpenAdd?: () => void;
    onOpenImport?: () => void;
    onNewAssessment?: (id?: number) => void;
    onConsolidatedReport?: () => void;
    onAnalysisReport?: () => void;

    onOpenDetail: (student: T) => void;
    onOpenEdit: (student: T) => void;
    onOpenArchive: (student: T) => void;
    onGraduate?: (student: T) => void;
    onProgressReport?: (student: T) => void;
    onViewPin?: (student: T) => void; // 🚀 NEW: The click handler
}

// --- Helpers ---
const formatName = (s: BaseStudent) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ');

export function StudentListView<T extends BaseStudent>({
    role,
    paginatedStudents,
    filteredStudents,
    selectedStudents,
    currentPage,
    totalPages,
    searchQuery,
    itemsPerPage,
    filterDaycare,
    filterSection,
    filterStatus,
    filterAssessment,
    daycareList,
    sectionList,
    onSearchChange,
    onDaycareChange,
    onSectionChange,
    onStatusChange,
    onAssessmentChange,
    onClearFilters,
    onPageChange,
    onToggleAll,
    onToggleStudent,
    onCancelSelection,
    onOpenBulkArchive,
    onOpenArchived,
    onExport,
    onOpenAdd,
    onOpenImport,
    onNewAssessment,
    onConsolidatedReport,
    onAnalysisReport,
    onOpenDetail,
    onOpenEdit,
    onOpenArchive,
    onGraduate,
    onProgressReport,
    onViewPin,
}: StudentListViewProps<T>) {
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterStatus && filterStatus !== 'all') count++;
        if (role === 'admin' && filterDaycare && filterDaycare !== 'all') count++;
        if (role === 'teacher') {
            if (filterAssessment && filterAssessment !== 'all') count++;
        }
        return count;
    }, [role, filterStatus, filterDaycare, filterAssessment]);

    const title = role === 'admin' ? 'Child Records' : 'My Students';
    const subtitle = role === 'admin' ? 'Manage all children enrolled across daycare centers.' : 'Manage profiles, enrollment, and parent details.';

    return (
        <div className="space-y-4 sm:space-y-6 transition-colors duration-200">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl md:text-2xl lg:text-3xl transition-colors">{title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm md:text-base transition-colors">{subtitle}</p>
                </div>
                <div className="flex grid grid-cols-2 items-center gap-2 sm:flex">
                    <Button variant="outline" className="h-9 w-full gap-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs sm:w-auto md:text-sm transition-colors" onClick={onOpenArchived}>
                        <Clock className="size-3.5 sm:size-4" /> <span className="truncate">View Archived</span>
                    </Button>
                    {role === 'admin' && onOpenImport && (
                        <Button variant="outline" className="h-9 w-full gap-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs sm:w-auto md:text-sm transition-colors" onClick={onOpenImport}>
                            <Upload className="size-3.5 sm:size-4" /> <span className="truncate">Import CSV</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedStudents.size > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 text-amber-800 dark:text-amber-400 shadow-sm transition-all sm:flex-row sm:items-center sm:py-2">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="size-4" />
                        <span className="text-xs font-medium sm:text-sm md:text-base">{selectedStudents.size} selected</span>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancelSelection}
                            className="h-8 flex-1 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none md:text-sm transition-colors"
                        >
                            <X className="mr-2 size-3" /> Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenBulkArchive}
                            className="h-8 flex-1 border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 text-xs text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none md:text-sm transition-colors"
                        >
                            <Archive className="mr-2 size-3" /> Archive Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* 🚀 NEW: Sleek Session Tabs for Teachers */}
            {role === 'teacher' && sectionList && onSectionChange && (
                <div className="hide-scrollbar flex w-full overflow-x-auto border-b border-slate-200 dark:border-slate-800 transition-colors">
                    <button
                        onClick={() => {
                            onSectionChange('all');
                            onPageChange(1);
                        }}
                        className={`mr-8 border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === 'all' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Students
                    </button>
                    {sectionList.map((sec) => (
                        <button
                            key={sec}
                            onClick={() => {
                                onSectionChange(sec);
                                onPageChange(1);
                            }}
                            className={`mr-8 border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === sec ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {sec}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            onSectionChange('unassigned');
                            onPageChange(1);
                        }}
                        className={`border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === 'unassigned' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Unassigned
                    </button>
                </div>
            )}

            {/* Table Card */}
            <Card className="gap-0! overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 py-0! shadow-sm transition-colors">
                {/* TOOLBAR */}
                <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between transition-colors">
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-center">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-2.5 left-3 size-4 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 dark:text-white dark:placeholder:text-slate-500 pl-9 text-xs sm:text-sm md:text-base transition-colors"
                            />
                        </div>

                        {/* POPOVER FILTER */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-9 w-full border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs sm:w-auto sm:text-sm md:text-base transition-colors"
                                >
                                    <Filter className="mr-2 size-3.5 sm:size-4" /> Filters
                                    {activeFilterCount > 0 && (
                                        <>
                                            <span className="mx-2 h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
                                            <Badge
                                                variant="secondary"
                                                className="rounded-sm bg-blue-100 dark:bg-blue-500/20 px-1.5 text-[10px] font-normal text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 md:text-xs transition-colors"
                                            >
                                                {activeFilterCount} Active
                                            </Badge>
                                        </>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4 dark:bg-zinc-900 dark:border-slate-800" align="start">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-1 leading-none font-medium text-slate-900 dark:text-white">Filter Records</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Narrow down your list.</p>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        {/* Admin Only: Daycare Filter */}
                                        {role === 'admin' && onDaycareChange && daycareList && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Branch</Label>
                                                <Select value={filterDaycare} onValueChange={onDaycareChange}>
                                                    <SelectTrigger className="w-full text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200">
                                                        <SelectValue placeholder="All Branches" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                                        <SelectItem value="all" className="dark:text-slate-200 dark:focus:bg-zinc-800">All Branches</SelectItem>
                                                        {daycareList.map((d) => (
                                                            <SelectItem key={d} value={d} className="dark:text-slate-200 dark:focus:bg-zinc-800">
                                                                {d}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Shared: Status Filter */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Enrollment Status</Label>
                                            <Select value={filterStatus} onValueChange={onStatusChange}>
                                                <SelectTrigger className="w-full text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                                    <SelectItem value="all" className="dark:text-slate-200 dark:focus:bg-zinc-800">All Statuses</SelectItem>
                                                    <SelectItem value="Active" className="dark:text-slate-200 dark:focus:bg-zinc-800">Active</SelectItem>
                                                    <SelectItem value="Inactive" className="dark:text-slate-200 dark:focus:bg-zinc-800">Inactive</SelectItem>
                                                    {role === 'teacher' && <SelectItem value="Completed" className="dark:text-slate-200 dark:focus:bg-zinc-800">Completed</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Teacher Only: Assessment Filter */}
                                        {role === 'teacher' && onAssessmentChange && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                                                    Assessment Status
                                                </Label>
                                                <Select value={filterAssessment} onValueChange={onAssessmentChange}>
                                                    <SelectTrigger className="w-full text-sm dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200">
                                                        <SelectValue placeholder="All Assessments" />
                                                    </SelectTrigger>
                                                    <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                                        <SelectItem value="all" className="dark:text-slate-200 dark:focus:bg-zinc-800">All Assessments</SelectItem>
                                                        <SelectItem value="Not Started" className="dark:text-slate-200 dark:focus:bg-zinc-800">Not Started</SelectItem>
                                                        <SelectItem value="Draft" className="dark:text-slate-200 dark:focus:bg-zinc-800">Draft</SelectItem>
                                                        <SelectItem value="In Progress" className="dark:text-slate-200 dark:focus:bg-zinc-800">In Progress</SelectItem>
                                                        <SelectItem value="Completed" className="dark:text-slate-200 dark:focus:bg-zinc-800">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <div className="mt-4 border-t dark:border-slate-800 pt-2">
                                            <Button
                                                variant="ghost"
                                                className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-zinc-800"
                                                onClick={onClearFilters}
                                            >
                                                <X className="mr-2 size-4" /> Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Right Side Buttons */}
                    <div className="flex w-full flex-row items-center gap-2 lg:w-auto lg:justify-end">
                        {role === 'teacher' && onConsolidatedReport && onAnalysisReport ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-9 flex-1 gap-1 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-2 text-xs sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base transition-colors"
                                    >
                                        <FileText className="size-3.5 text-slate-500 dark:text-slate-400 sm:size-4" /> <span className="truncate">Reports</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 dark:bg-zinc-900 dark:border-slate-800">
                                    <DropdownMenuLabel className="dark:text-slate-300">Reports</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="dark:bg-slate-800" />
                                    <DropdownMenuItem onClick={onConsolidatedReport} className="dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">
                                        <FileSpreadsheet className="mr-2 size-4 text-green-600 dark:text-green-500" /> Class Consolidated Record
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onAnalysisReport} className="dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">
                                        <BarChart3 className="mr-2 size-4 text-blue-600 dark:text-blue-500" /> Class Developmental Summary
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-9 flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-xs sm:flex-none sm:text-sm md:text-base transition-colors"
                                onClick={onExport}
                            >
                                <Download className="mr-2 size-3.5 sm:size-4" /> <span className="truncate">Export</span>
                            </Button>
                        )}

                        {role === 'admin' && onOpenAdd ? (
                            <Button
                                className="h-9 flex-1 gap-1 bg-indigo-600 dark:bg-indigo-600 px-2 text-xs text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base transition-colors"
                                onClick={onOpenAdd}
                            >
                                <Plus className="size-3.5 sm:size-4" /> <span className="truncate">Add Student</span>
                            </Button>
                        ) : role === 'teacher' && onNewAssessment ? (
                            <Button
                                className="h-9 flex-1 gap-1 bg-slate-900 dark:bg-slate-100 px-2 text-xs text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base transition-colors"
                                onClick={() => onNewAssessment()}
                            >
                                <Plus className="size-3.5 sm:size-4" /> <span className="truncate">New Assessment</span>
                            </Button>
                        ) : null}
                    </div>
                </div>

                {/* --- TABLE CONTENT --- */}
                <CardContent className="min-h-[530px] overflow-x-auto p-0">
                    <Table className="w-full min-w-[1050px] table-fixed">
                        <TableHeader className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 transition-colors">
                            <TableRow className="py-2 text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase hover:bg-transparent dark:hover:bg-transparent sm:text-xs md:text-sm">
                                <TableHead className="w-[4%] pl-4 align-middle sm:pl-6">
                                    <Checkbox
                                        checked={filteredStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
                                        onCheckedChange={onToggleAll}
                                        aria-label="Select all rows"
                                    />
                                </TableHead>

                                <TableHead className={role === 'admin' ? 'w-[24%] align-middle' : 'w-[18%] align-middle'}>Name</TableHead>

                                {role === 'teacher' && <TableHead className="w-[13%] align-middle">Session</TableHead>}

                                {role === 'admin' ? (
                                    <TableHead className="w-[14%] align-middle">Date of Birth</TableHead>
                                ) : (
                                    <TableHead className="w-[8%] align-middle whitespace-nowrap">Age</TableHead>
                                )}

                                {role === 'admin' && <TableHead className="w-[16%] align-middle">Branch</TableHead>}

                                <TableHead className={role === 'admin' ? 'w-[22%] align-middle' : 'w-[17%] align-middle'}>
                                    Parent / Guardian
                                </TableHead>

                                <TableHead className={role === 'admin' ? 'w-[16%] align-middle' : 'w-[12%] pr-4 align-middle leading-tight'}>
                                    Enrollment Status
                                </TableHead>

                                {role === 'teacher' && (
                                    <>
                                        <TableHead className="w-[14%] pl-2 align-middle leading-tight">Assessment Status</TableHead>
                                        <TableHead className="w-[10%] text-right align-middle leading-tight">Latest Score</TableHead>
                                    </>
                                )}

                                <TableHead className="w-[4%] pr-4 align-middle sm:pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedStudents.length === 0 ? (
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                    <TableCell colSpan={role === 'admin' ? 7 : 9} className="h-48 text-center text-sm text-slate-500 dark:text-slate-400 md:text-base">
                                        No student records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className={`group transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/50 ${selectedStudents.has(student.id) ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''}`}
                                    >
                                        <TableCell className="py-2 pl-4 sm:py-3 sm:pl-6">
                                            <Checkbox
                                                checked={selectedStudents.has(student.id)}
                                                onCheckedChange={() => onToggleStudent(student.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-2 sm:py-3">
                                            <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-sm shadow-inner shrink-0 transition-colors">
                                                    {student.firstName?.[0] || student.firstName?.[0] || ''}{student.last_name?.[0] || student.lastName?.[0] || ''}
                                                </div>
                                                <button
                                                    onClick={() => onOpenDetail(student)}
                                                    className="truncate text-left text-xs font-medium text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline sm:text-sm md:text-base transition-colors"
                                                >
                                                    {formatName(student)}
                                                </button>
                                            </div>
                                        </TableCell>

                                        {role === 'teacher' && (
                                            <TableCell className="py-2 sm:py-3">
                                                <div
                                                    className="truncate text-xs font-medium text-slate-700 dark:text-slate-300 sm:text-sm md:text-base transition-colors"
                                                    title={student.section_name}
                                                >
                                                    {student.section_name || (
                                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 italic sm:text-xs md:text-sm">Unassigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}

                                        {role === 'admin' ? (
                                            <TableCell className="py-2 text-xs text-slate-600 dark:text-slate-300 sm:py-3 sm:text-sm md:text-base transition-colors">
                                                {formatPHDate(student.dateOfBirth)}
                                            </TableCell>
                                        ) : (
                                            <TableCell className="py-2 text-xs font-medium text-slate-600 dark:text-slate-300 sm:py-3 sm:text-sm md:text-base transition-colors">
                                                {calculateAge(student.dateOfBirth)} yrs
                                            </TableCell>
                                        )}

                                        {role === 'admin' && (
                                            <TableCell className="py-2 sm:py-3">
                                                <div
                                                    className="truncate text-xs font-medium text-indigo-600 dark:text-indigo-400 sm:text-sm md:text-base transition-colors"
                                                    title={student.daycare || '-'}
                                                >
                                                    {student.daycare || '-'}
                                                </div>
                                            </TableCell>
                                        )}

                                        <TableCell className="overflow-hidden py-2 sm:py-3">
                                            {student.parentName || student.parentLinked ? (
                                                <div className="flex flex-col">
                                                    <span
                                                        className="truncate text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm md:text-base transition-colors"
                                                        title={student.parentName}
                                                    >
                                                        {student.parentName || 'Linked Parent'}
                                                    </span>
                                                    {student.parentEmail && (
                                                        <span
                                                            className="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs md:text-sm transition-colors"
                                                            title={student.parentEmail}
                                                        >
                                                            {student.parentEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:px-2 sm:text-[11px] md:text-xs transition-colors"
                                                >
                                                    Unlinked
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className={role === 'teacher' ? 'py-2 pr-4 sm:py-3' : 'py-2 sm:py-3'}>
                                            {getEnrollmentBadge(student.status)}
                                        </TableCell>

                                        {role === 'teacher' && (
                                            <>
                                                <TableCell className="py-2 pl-2 sm:py-3">{getAssessmentBadge(student.assessmentStatus)}</TableCell>
                                                <TableCell className="py-2 text-right sm:py-3">
                                                    {student.score ? (
                                                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300 sm:px-2.5 sm:text-sm md:text-base transition-colors">
                                                            {student.score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 sm:text-sm md:text-base transition-colors">-</span>
                                                    )}
                                                </TableCell>
                                            </>
                                        )}

                                        <TableCell className="py-2 pr-4 text-right sm:py-3 sm:pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-7 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white sm:size-8 transition-colors"
                                                    >
                                                        <MoreHorizontal className="size-3.5 sm:size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 dark:bg-zinc-900 dark:border-slate-800">
                                                    <DropdownMenuLabel className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                                                        Manage Record
                                                    </DropdownMenuLabel>
                                                    {role === 'admin' && student.access_code && onViewPin && (
                                                        <DropdownMenuItem
                                                            onClick={() => onViewPin(student)}
                                                            className="mb-1 cursor-pointer bg-indigo-50/50 dark:bg-indigo-500/10 font-medium text-indigo-600 dark:text-indigo-400 dark:focus:bg-zinc-800 transition-colors"
                                                        >
                                                            <Key className="mr-2 size-4" /> View Parent PIN
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator className="dark:bg-slate-800" />
                                                    {role === 'teacher' &&
                                                        onNewAssessment &&
                                                        !(
                                                            student.status === 'Completed' ||
                                                            student.status === 'Graduated' ||
                                                            student.canGraduate
                                                        ) && (
                                                            <DropdownMenuItem onClick={() => onNewAssessment(student.id)} className="cursor-pointer dark:text-slate-200 dark:focus:bg-zinc-800">
                                                                {student.assessmentStatus === 'Draft' ||
                                                                    student.assessmentStatus === 'In Progress' ? (
                                                                    <>
                                                                        <PlayCircle className="mr-2 size-4 text-amber-500 dark:text-amber-400" /> Resume Assessment
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PlusCircle className="mr-2 size-4 text-slate-500 dark:text-slate-400" /> Start New Assessment
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}

                                                    <DropdownMenuSeparator className="dark:bg-slate-800" />

                                                    <DropdownMenuItem onClick={() => onOpenDetail(student)} className="cursor-pointer text-sm dark:text-slate-200 dark:focus:bg-zinc-800">
                                                        <Eye className="mr-2 size-4 text-slate-500 dark:text-slate-400" /> View Profile
                                                    </DropdownMenuItem>

                                                    {role === 'teacher' && onProgressReport && (
                                                        <DropdownMenuItem
                                                            onClick={() => onProgressReport(student)}
                                                            className="cursor-pointer text-sm text-blue-600 dark:text-blue-400 dark:focus:bg-zinc-800"
                                                        >
                                                            <Printer className="mr-2 size-4" /> Progress Report
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem onClick={() => onOpenEdit(student)} className="cursor-pointer text-sm dark:text-slate-200 dark:focus:bg-zinc-800">
                                                        <Edit className="mr-2 size-4 text-slate-500 dark:text-slate-400" /> Edit Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator className="dark:bg-slate-800" />

                                                    {role === 'teacher' && onGraduate && (
                                                        <DropdownMenuItem
                                                            onClick={() => onGraduate(student)}
                                                            disabled={!student.canGraduate}
                                                            className={
                                                                !student.canGraduate
                                                                    ? 'cursor-not-allowed text-sm text-slate-400 dark:text-slate-600 opacity-60'
                                                                    : 'cursor-pointer text-sm text-purple-600 dark:text-purple-400 dark:focus:bg-zinc-800'
                                                            }
                                                        >
                                                            <GraduationCap className="mr-2 size-4" />
                                                            {student.canGraduate ? 'Graduate Student' : 'Cannot Graduate Yet'}
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() => onOpenArchive(student)}
                                                        className="cursor-pointer text-sm text-amber-600 dark:text-amber-500 dark:focus:bg-zinc-800"
                                                    >
                                                        <Archive className="mr-2 size-4" /> Archive Record
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* --- PAGINATION --- */}
                {filteredStudents.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 rounded-b-xl border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 p-3 sm:flex-row sm:px-6 sm:py-4 transition-colors">
                        <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm md:text-base transition-colors">
                            Showing <span className="font-medium text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                            <span className="font-medium text-slate-900 dark:text-white">{filteredStudents.length}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 px-2 text-xs sm:px-3 md:text-sm transition-colors"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 px-2 text-xs sm:px-3 md:text-sm transition-colors"
                            >
                                <ChevronRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

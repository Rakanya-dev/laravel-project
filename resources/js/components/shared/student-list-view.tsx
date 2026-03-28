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
            // 🚀 FIX: Removed section tracking so the Filter badge doesn't light up for tabs
            if (filterAssessment && filterAssessment !== 'all') count++;
        }
        return count;
    }, [role, filterStatus, filterDaycare, filterAssessment]); // Removed filterSection from dependency array

    const title = role === 'admin' ? 'Child Records' : 'My Students';
    const subtitle = role === 'admin' ? 'Manage all children enrolled across daycare centers.' : 'Manage profiles, enrollment, and parent details.';

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    {/* 🚀 RESPONSIVE TEXT: Scales from lg (mobile) up to 3xl (desktop) */}
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl md:text-2xl lg:text-3xl">{title}</h2>
                    <p className="text-xs text-slate-500 sm:text-sm md:text-base">{subtitle}</p>
                </div>
                <div className="flex grid grid-cols-2 items-center gap-2 sm:flex">
                    <Button variant="outline" className="h-9 w-full gap-2 border-dashed text-xs sm:w-auto md:text-sm" onClick={onOpenArchived}>
                        <Clock className="size-3.5 sm:size-4" /> <span className="truncate">View Archived</span>
                    </Button>
                    {role === 'admin' && onOpenImport && (
                        <Button variant="outline" className="h-9 w-full gap-2 text-xs sm:w-auto md:text-sm" onClick={onOpenImport}>
                            <Upload className="size-3.5 sm:size-4" /> <span className="truncate">Import CSV</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedStudents.size > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm transition-all sm:flex-row sm:items-center sm:py-2">
                    <div className="flex items-center gap-2">
                        <CheckSquare className="size-4" />
                        <span className="text-xs font-medium sm:text-sm md:text-base">{selectedStudents.size} selected</span>
                    </div>
                    <div className="flex w-full gap-2 sm:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancelSelection}
                            className="h-8 flex-1 text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-900 sm:flex-none md:text-sm"
                        >
                            <X className="mr-2 size-3" /> Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenBulkArchive}
                            className="h-8 flex-1 border-amber-300 bg-white text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-900 sm:flex-none md:text-sm"
                        >
                            <Archive className="mr-2 size-3" /> Archive Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* 🚀 NEW: Sleek Session Tabs for Teachers */}
            {role === 'teacher' && sectionList && onSectionChange && (
                <div className="hide-scrollbar flex w-full overflow-x-auto border-b border-slate-200">
                    <button
                        onClick={() => {
                            onSectionChange('all');
                            onPageChange(1);
                        }}
                        className={`mr-8 border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === 'all' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
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
                            className={`mr-8 border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === sec ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                        >
                            {sec}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            onSectionChange('unassigned');
                            onPageChange(1);
                        }}
                        className={`border-b-2 px-1 pb-3 text-sm font-medium whitespace-nowrap transition-colors ${filterSection === 'unassigned' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                    >
                        Unassigned
                    </button>
                </div>
            )}

            {/* Table Card */}
            <Card className="gap-0! overflow-hidden border-slate-200 py-0! shadow-sm">
                {/* TOOLBAR */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-white p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:items-center">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-9 border-slate-200 bg-slate-50 pl-9 text-xs sm:text-sm md:text-base"
                            />
                        </div>

                        {/* POPOVER FILTER */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-9 w-full border-dashed border-slate-300 bg-slate-50 text-xs text-slate-700 sm:w-auto sm:text-sm md:text-base"
                                >
                                    <Filter className="mr-2 size-3.5 sm:size-4" /> Filters
                                    {activeFilterCount > 0 && (
                                        <>
                                            <span className="mx-2 h-4 w-px bg-slate-200"></span>
                                            <Badge
                                                variant="secondary"
                                                className="rounded-sm bg-blue-100 px-1.5 text-[10px] font-normal text-blue-700 hover:bg-blue-100 md:text-xs"
                                            >
                                                {activeFilterCount} active
                                            </Badge>
                                        </>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-4" align="start">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-1 leading-none font-medium text-slate-900">Filter Records</h4>
                                        <p className="text-sm text-slate-500">Narrow down your list.</p>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        {/* Admin Only: Daycare Filter */}
                                        {role === 'admin' && onDaycareChange && daycareList && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Branch</Label>
                                                <Select value={filterDaycare} onValueChange={onDaycareChange}>
                                                    <SelectTrigger className="w-full text-sm">
                                                        <SelectValue placeholder="All Branches" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Branches</SelectItem>
                                                        {daycareList.map((d) => (
                                                            <SelectItem key={d} value={d}>
                                                                {d}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Shared: Status Filter */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Enrollment Status</Label>
                                            <Select value={filterStatus} onValueChange={onStatusChange}>
                                                <SelectTrigger className="w-full text-sm">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Statuses</SelectItem>
                                                    <SelectItem value="Active">Active</SelectItem>
                                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                                    {role === 'teacher' && <SelectItem value="Completed">Completed</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Teacher Only: Assessment Filter */}
                                        {role === 'teacher' && onAssessmentChange && (
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                    Assessment Status
                                                </Label>
                                                <Select value={filterAssessment} onValueChange={onAssessmentChange}>
                                                    <SelectTrigger className="w-full text-sm">
                                                        <SelectValue placeholder="All Assessments" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Assessments</SelectItem>
                                                        <SelectItem value="Not Started">Not Started</SelectItem>
                                                        <SelectItem value="Draft">Draft</SelectItem>
                                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                                        <SelectItem value="Completed">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <div className="mt-4 border-t pt-2">
                                            <Button
                                                variant="ghost"
                                                className="w-full text-sm text-slate-500 hover:text-slate-900"
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
                                        className="h-9 flex-1 gap-1 bg-white px-2 text-xs sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base"
                                    >
                                        <FileText className="size-3.5 text-slate-500 sm:size-4" /> <span className="truncate">Reports</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>Analytics</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onConsolidatedReport}>
                                        <FileSpreadsheet className="mr-2 size-4 text-green-600" /> Record
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onAnalysisReport}>
                                        <BarChart3 className="mr-2 size-4 text-blue-600" /> Analysis
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                variant="outline"
                                className="h-9 flex-1 gap-2 bg-white text-xs sm:flex-none sm:text-sm md:text-base"
                                onClick={onExport}
                            >
                                <Download className="mr-2 size-3.5 sm:size-4" /> <span className="truncate">Export</span>
                            </Button>
                        )}

                        {role === 'admin' && onOpenAdd ? (
                            <Button
                                className="h-9 flex-1 gap-1 bg-indigo-600 px-2 text-xs text-white shadow-sm hover:bg-indigo-700 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base"
                                onClick={onOpenAdd}
                            >
                                <Plus className="size-3.5 sm:size-4" /> <span className="truncate">Add Student</span>
                            </Button>
                        ) : role === 'teacher' && onNewAssessment ? (
                            <Button
                                className="h-9 flex-1 gap-1 bg-slate-900 px-2 text-xs text-white hover:bg-slate-800 sm:flex-none sm:gap-2 sm:px-4 sm:text-sm md:text-base"
                                onClick={() => onNewAssessment()}
                            >
                                <Plus className="size-3.5 sm:size-4" /> <span className="truncate">New Assessment</span>
                            </Button>
                        ) : null}
                    </div>
                </div>
                {/* --- TABLE CONTENT --- */}
                {/* 🚀 FIX: Removed internal vertical scroll, added min-h-[680px] to lock the height for exactly 10 rows so pagination doesn't jump */}
                <CardContent className="min-h-[530px] overflow-x-auto p-0">
                    {' '}
                    <Table className="w-full min-w-[1050px] table-fixed">
                        {/* 🚀 FIX: Removed sticky header classes since the table no longer scrolls internally */}
                        <TableHeader className="border-b border-slate-200 bg-slate-50">
                            <TableRow className="py-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase hover:bg-transparent sm:text-xs md:text-sm">
                                <TableHead className="w-[4%] pl-4 align-middle sm:pl-6">
                                    <Checkbox
                                        checked={filteredStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
                                        onCheckedChange={onToggleAll}
                                        aria-label="Select all rows"
                                    />
                                </TableHead>

                                {/* Adjusted percentages to give Assessment/Enrollment more room */}
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

                                {/* 🚀 FIX: Added pr-4 (padding right) to push Enrollment away from Assessment */}
                                <TableHead className={role === 'admin' ? 'w-[16%] align-middle' : 'w-[12%] pr-4 align-middle leading-tight'}>
                                    Enrollment Status
                                </TableHead>

                                {role === 'teacher' && (
                                    <>
                                        {/* 🚀 FIX: Added pl-2 (padding left) to push Assessment away from Enrollment */}
                                        <TableHead className="w-[14%] pl-2 align-middle leading-tight">Assessment Status</TableHead>
                                        <TableHead className="w-[10%] text-right align-middle leading-tight">Latest Score</TableHead>
                                    </>
                                )}

                                <TableHead className="w-[4%] pr-4 align-middle sm:pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={role === 'admin' ? 7 : 9} className="h-48 text-center text-sm text-slate-500 md:text-base">
                                        No student records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => (
                                    <TableRow
                                        key={student.id}
                                        className={`group transition-colors hover:bg-slate-50 ${selectedStudents.has(student.id) ? 'bg-indigo-50/40' : ''}`}
                                    >
                                        <TableCell className="py-2 pl-4 sm:py-3 sm:pl-6">
                                            <Checkbox
                                                checked={selectedStudents.has(student.id)}
                                                onCheckedChange={() => onToggleStudent(student.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="py-2 sm:py-3">
                                            <div className="flex items-center gap-2 overflow-hidden sm:gap-3">
                                                <Avatar className="size-6 shrink-0 border border-slate-200 sm:size-8">
                                                    <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-700 sm:text-xs">
                                                        {student.firstName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <button
                                                    onClick={() => onOpenDetail(student)}
                                                    className="truncate text-left text-xs font-medium text-slate-900 hover:text-indigo-600 hover:underline sm:text-sm md:text-base"
                                                >
                                                    {formatName(student)}
                                                </button>
                                            </div>
                                        </TableCell>

                                        {role === 'teacher' && (
                                            <TableCell className="py-2 sm:py-3">
                                                <div
                                                    className="truncate text-xs font-medium text-slate-700 sm:text-sm md:text-base"
                                                    title={student.section_name}
                                                >
                                                    {student.section_name || (
                                                        <span className="text-[10px] text-slate-400 italic sm:text-xs md:text-sm">Unassigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        )}

                                        {role === 'admin' ? (
                                            <TableCell className="py-2 text-xs text-slate-600 sm:py-3 sm:text-sm md:text-base">
                                                {/* 🚀 USES THE BULLETPROOF FORMATTER */}
                                                {formatPHDate(student.dateOfBirth)}
                                            </TableCell>
                                        ) : (
                                            <TableCell className="py-2 text-xs font-medium text-slate-600 sm:py-3 sm:text-sm md:text-base">
                                                {/* 🚀 USES THE BULLETPROOF CALCULATOR */}
                                                {calculateAge(student.dateOfBirth)} yrs
                                            </TableCell>
                                        )}

                                        {role === 'admin' && (
                                            <TableCell className="py-2 sm:py-3">
                                                <div
                                                    className="truncate text-xs font-medium text-indigo-600 sm:text-sm md:text-base"
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
                                                        className="truncate text-xs font-medium text-slate-900 sm:text-sm md:text-base"
                                                        title={student.parentName}
                                                    >
                                                        {student.parentName || 'Linked Parent'}
                                                    </span>
                                                    {student.parentEmail && (
                                                        <span
                                                            className="truncate text-[10px] text-slate-500 sm:text-xs md:text-sm"
                                                            title={student.parentEmail}
                                                        >
                                                            {student.parentEmail}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:px-2 sm:text-[11px] md:text-xs"
                                                >
                                                    Unlinked
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Added right padding to push it away from Assessment */}
                                        <TableCell className={role === 'teacher' ? 'py-2 pr-4 sm:py-3' : 'py-2 sm:py-3'}>
                                            {getEnrollmentBadge(student.status)}
                                        </TableCell>

                                        {role === 'teacher' && (
                                            <>
                                                {/* Added left padding to distance it from Enrollment */}
                                                <TableCell className="py-2 pl-2 sm:py-3">{getAssessmentBadge(student.assessmentStatus)}</TableCell>
                                                <TableCell className="py-2 text-right sm:py-3">
                                                    {student.score ? (
                                                        <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 sm:px-2.5 sm:text-sm md:text-base">
                                                            {student.score}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 sm:text-sm md:text-base">-</span>
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
                                                        className="size-7 text-slate-400 hover:bg-slate-100 hover:text-slate-900 sm:size-8"
                                                    >
                                                        <MoreHorizontal className="size-3.5 sm:size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                                                        Manage Record
                                                    </DropdownMenuLabel>
                                                    {/* 🚀 NEW: Admin Only - View PIN Button */}
                                                    {role === 'admin' && student.access_code && onViewPin && (
                                                        <DropdownMenuItem
                                                            onClick={() => onViewPin(student)}
                                                            className="mb-1 cursor-pointer bg-indigo-50/50 font-medium text-indigo-600"
                                                        >
                                                            <Key className="mr-2 size-4" /> View Parent PIN
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {role === 'teacher' &&
                                                        onNewAssessment &&
                                                        !(
                                                            student.status === 'Completed' ||
                                                            student.status === 'Graduated' ||
                                                            student.canGraduate
                                                        ) && (
                                                            <DropdownMenuItem onClick={() => onNewAssessment(student.id)}>
                                                                {student.assessmentStatus === 'Draft' ||
                                                                student.assessmentStatus === 'In Progress' ? (
                                                                    <>
                                                                        <PlayCircle className="mr-2 size-4 text-amber-500" /> Resume Assessment
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <PlusCircle className="mr-2 size-4" /> Start New Assessment
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}

                                                    <DropdownMenuSeparator />

                                                    <DropdownMenuItem onClick={() => onOpenDetail(student)} className="cursor-pointer text-sm">
                                                        <Eye className="mr-2 size-4 text-slate-500" /> View Profile
                                                    </DropdownMenuItem>

                                                    {role === 'teacher' && onProgressReport && (
                                                        <DropdownMenuItem
                                                            onClick={() => onProgressReport(student)}
                                                            className="cursor-pointer text-sm text-blue-600"
                                                        >
                                                            <Printer className="mr-2 size-4" /> Progress Report
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem onClick={() => onOpenEdit(student)} className="cursor-pointer text-sm">
                                                        <Edit className="mr-2 size-4 text-slate-500" /> Edit Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    {role === 'teacher' && onGraduate && (
                                                        <DropdownMenuItem
                                                            onClick={() => onGraduate(student)}
                                                            disabled={!student.canGraduate}
                                                            className={
                                                                !student.canGraduate
                                                                    ? 'cursor-not-allowed text-sm text-slate-400 opacity-60'
                                                                    : 'cursor-pointer text-sm text-purple-600'
                                                            }
                                                        >
                                                            <GraduationCap className="mr-2 size-4" />
                                                            {student.canGraduate ? 'Graduate Student' : 'Cannot Graduate Yet'}
                                                        </DropdownMenuItem>
                                                    )}

                                                    <DropdownMenuItem
                                                        onClick={() => onOpenArchive(student)}
                                                        className="cursor-pointer text-sm text-amber-600"
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
                    <div className="flex flex-col items-center justify-between gap-3 rounded-b-xl border-t bg-slate-50/50 p-3 sm:flex-row sm:px-6 sm:py-4">
                        <div className="text-xs text-slate-500 sm:text-sm md:text-base">
                            Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                            <span className="font-medium text-slate-900">{filteredStudents.length}</span> records
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-8 border-slate-200 bg-white px-2 text-xs sm:px-3 md:text-sm"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="h-8 border-slate-200 bg-white px-2 text-xs sm:px-3 md:text-sm"
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

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
    XCircle,
} from 'lucide-react';
import { useMemo } from 'react';
import { toast } from 'sonner';

import { calculateAge, formatPHDate } from '@/utils/date';
import { getAssessmentBadge, getEnrollmentBadge } from '@/utils/badges';
import { cn } from '@/lib/utils';

export interface BaseStudent {
    id: number;
    firstName: string;
    lastName: string;
    status: string;
    archived: boolean;
    access_code?: string;
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
    onViewPin?: (student: T) => void;
}

const formatName = (s: BaseStudent) => [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim();

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

    // 🚀 INVISIBLE EXCEL PRINT FUNCTION
    const handlePrint = () => {
        toast.loading('Generating print layout...', { id: 'print-toast' });

        // 1. Build the exact URL for Laravel based on role and active filters
        const params = new URLSearchParams({
            search: searchQuery,
            status: filterStatus,
            // Only send these if they exist to keep the URL clean
            ...(filterDaycare && filterDaycare !== 'all' ? { daycare: filterDaycare } : {}),
            ...(filterSection && filterSection !== 'all' ? { section: filterSection } : {}),
            ...(filterAssessment && filterAssessment !== 'all' ? { assessment: filterAssessment } : {})
        });

        // Admins hit /admin/students/print, Teachers hit /teacher/students/print
        const basePath = role === 'admin' ? '/admin/students/print' : '/teacher/students/print';
        const printUrl = `${basePath}?${params.toString()}`;

        // 2. Create the hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = printUrl;

        // 3. Trigger the print dialog instantly when Laravel returns the Blade view
        iframe.onload = () => {
            toast.dismiss('print-toast');

            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Cleanup
                setTimeout(() => {
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 2000);
            }, 200);
        };

        // 4. Fire!
        document.body.appendChild(iframe);
    };

    return (
        <div className="space-y-4 sm:space-y-6 transition-colors duration-200">
            {role === 'teacher' && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">My Students</h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">Manage profiles, enrollment, and parent details.</p>
                    </div>
                </div>
            )}

            {selectedStudents.size > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-3 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 text-amber-800 dark:text-amber-400 shadow-sm transition-all sm:flex-row sm:items-center sm:py-3">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="size-5 shrink-0" />
                        <span className="text-base font-bold sm:text-lg">{selectedStudents.size} records selected</span>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                        <Button
                            variant="ghost"
                            onClick={onCancelSelection}
                            className="h-12 px-6 rounded-xl flex-1 text-base font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none transition-colors"
                        >
                            <X className="mr-2 size-5" /> Cancel
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onOpenBulkArchive}
                            className="h-12 px-6 rounded-xl flex-1 border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 shadow-sm text-base font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none transition-colors"
                        >
                            <Archive className="mr-2 size-5" /> Archive Selected
                        </Button>
                    </div>
                </div>
            )}

            {role === 'teacher' && sectionList && onSectionChange && (
                <div className="hide-scrollbar flex w-full overflow-x-auto border-b border-slate-200 dark:border-slate-800 transition-colors">
                    <button
                        onClick={() => { onSectionChange('all'); onPageChange(1); }}
                        className={`mr-8 border-b-2 px-1 pb-4 text-base font-bold whitespace-nowrap transition-colors ${filterSection === 'all' ? 'border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Students
                    </button>
                    {sectionList.map((sec) => (
                        <button
                            key={sec}
                            onClick={() => { onSectionChange(sec); onPageChange(1); }}
                            className={`mr-8 border-b-2 px-1 pb-4 text-base font-bold whitespace-nowrap transition-colors ${filterSection === sec ? 'border-indigo-600 text-indigo-700 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {sec}
                        </button>
                    ))}
                </div>
            )}

            <Card className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-200">

                {/* TOOLBAR */}
                <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 lg:flex-row lg:items-center lg:justify-between transition-colors">
                    <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-center">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4 size-5 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="h-12 text-base rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 dark:text-white dark:placeholder:text-slate-500 pl-12 pr-10 font-medium shadow-sm transition-colors w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => onSearchChange('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                                    <XCircle className="size-5" />
                                </button>
                            )}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-12 px-6 text-base rounded-xl w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 sm:w-auto font-bold shadow-sm transition-colors"
                                >
                                    <Filter className="mr-2 size-5" /> Filters
                                    {activeFilterCount > 0 && (
                                        <>
                                            <span className="mx-2 h-6 w-px bg-slate-200 dark:bg-slate-700"></span>
                                            <Badge
                                                variant="secondary"
                                                className="rounded-md bg-indigo-100 dark:bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 transition-colors shadow-none"
                                            >
                                                {activeFilterCount} Active
                                            </Badge>
                                        </>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-6 rounded-2xl dark:bg-zinc-900 dark:border-slate-800 shadow-xl" align="start">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="mb-1 leading-none text-xl font-black text-slate-900 dark:text-white">Filter Records</h4>
                                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1">Narrow down your list.</p>
                                    </div>
                                    <div className="space-y-5 pt-2">
                                        {role === 'admin' && onDaycareChange && daycareList && (
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Branch</Label>
                                                <Select value={filterDaycare} onValueChange={onDaycareChange}>
                                                    <SelectTrigger className="h-12 text-base rounded-xl w-full font-bold dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200 transition-colors">
                                                        <SelectValue placeholder="All Branches" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                        <SelectItem value="all" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">All Branches</SelectItem>
                                                        {daycareList.map((d) => (
                                                            <SelectItem key={d} value={d} className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">
                                                                {d}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="space-y-2.5">
                                            <Label className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Enrollment Status</Label>
                                            <Select value={filterStatus} onValueChange={onStatusChange}>
                                                <SelectTrigger className="h-12 text-base rounded-xl w-full font-bold dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200 transition-colors">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                    <SelectItem value="all" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">All Statuses</SelectItem>
                                                    <SelectItem value="Active" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Active</SelectItem>
                                                    <SelectItem value="Inactive" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Inactive</SelectItem>
                                                    {role === 'teacher' && <SelectItem value="Completed" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Completed</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {role === 'teacher' && onAssessmentChange && (
                                            <div className="space-y-2.5">
                                                <Label className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                                                    Assessment Status
                                                </Label>
                                                <Select value={filterAssessment} onValueChange={onAssessmentChange}>
                                                    <SelectTrigger className="h-12 text-base rounded-xl w-full font-bold dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200 transition-colors">
                                                        <SelectValue placeholder="All Assessments" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                        <SelectItem value="all" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">All Assessments</SelectItem>
                                                        <SelectItem value="Not Started" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Not Started</SelectItem>
                                                        <SelectItem value="Draft" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Draft</SelectItem>
                                                        <SelectItem value="In Progress" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">In Progress</SelectItem>
                                                        <SelectItem value="Completed" className="rounded-lg py-2.5 text-base font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                                            <Button
                                                variant="ghost"
                                                className="h-12 rounded-xl w-full font-bold text-base text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                                onClick={onClearFilters}
                                            >
                                                <X className="mr-2 size-5" /> Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
                        <Button
                            variant="outline"
                            className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-6 font-bold shadow-sm sm:flex-none transition-colors"
                            onClick={onOpenArchived}
                        >
                            <Clock className="size-5" /> <span className="truncate">Archived</span>
                        </Button>

                        {role === 'admin' && onOpenImport && (
                            <Button
                                variant="outline"
                                className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-6 font-bold shadow-sm sm:flex-none transition-colors"
                                onClick={onOpenImport}
                            >
                                <Upload className="size-5" /> <span className="truncate">Import</span>
                            </Button>
                        )}

                        {/* 1. ONLY TEACHERS get the Reports Dropdown */}
                        {role === 'teacher' && onConsolidatedReport && onAnalysisReport && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-6 font-bold shadow-sm sm:flex-none transition-colors"
                                    >
                                        <FileText className="size-5 text-slate-500 dark:text-slate-400" /> <span className="truncate">Reports</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 rounded-2xl dark:bg-zinc-900 dark:border-slate-800 transition-colors p-2 shadow-xl">
                                    <DropdownMenuLabel className="dark:text-slate-400 font-bold text-[11px] uppercase tracking-widest py-2 px-3">Class Reports</DropdownMenuLabel>
                                    <DropdownMenuSeparator className="dark:bg-slate-800 mb-2" />
                                    <DropdownMenuItem onClick={onConsolidatedReport} className="rounded-xl text-base py-3 px-3 font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer transition-colors">
                                        <FileSpreadsheet className="mr-3 size-5 text-emerald-600 dark:text-emerald-500" /> Consolidated Record
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onAnalysisReport} className="rounded-xl text-base py-3 px-3 font-bold dark:text-slate-200 dark:focus:bg-zinc-800 cursor-pointer transition-colors">
                                        <BarChart3 className="mr-3 size-5 text-indigo-600 dark:text-indigo-500" /> Developmental Summary
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* 2. EVERYONE gets the Export Button */}
                        <Button
                            variant="outline"
                            className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-6 font-bold shadow-sm sm:flex-none transition-colors"
                            onClick={onExport}
                        >
                            <Download className="size-5" /> <span className="truncate">Export</span>
                        </Button>

                        {/* 3. EVERYONE gets the Print Button */}
                        <Button
                            variant="outline"
                            className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-6 font-bold shadow-sm sm:flex-none transition-colors hidden sm:flex"
                            onClick={handlePrint}
                        >
                            <Printer className="size-5" /> <span className="truncate">Print</span>
                        </Button>

                        {/* 4. Role-Specific Primary Add Buttons */}
                        {role === 'admin' && onOpenAdd ? (
                            <Button
                                className="h-12 text-base rounded-xl flex-1 gap-2 bg-indigo-600 dark:bg-indigo-600 px-8 font-bold text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 sm:flex-none transition-colors"
                                onClick={onOpenAdd}
                            >
                                <Plus className="size-5" /> <span className="truncate">Add Student</span>
                            </Button>
                        ) : role === 'teacher' && onNewAssessment ? (
                            <Button
                                className="h-12 text-base rounded-xl flex-1 gap-2 bg-indigo-600 dark:bg-indigo-600 px-8 font-bold text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 sm:flex-none transition-colors"
                                onClick={() => onNewAssessment()}
                            >
                                <Plus className="size-5" /> <span className="truncate">New Assessment</span>
                            </Button>
                        ) : null}
                    </div>
                </div>

                <CardContent className="min-h-[530px] overflow-x-auto p-0 custom-scrollbar">
                    <Table className="w-full min-w-[1050px] table-fixed">
                        <TableHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 transition-colors">
                            <TableRow className="py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-transparent dark:hover:bg-transparent">
                                <TableHead className="w-[5%] pl-6 align-middle sm:pl-8">
                                    <Checkbox
                                        checked={filteredStudents.length > 0 && selectedStudents.size === paginatedStudents.length}
                                        onCheckedChange={onToggleAll}
                                        aria-label="Select all rows"
                                        className="size-5 rounded-md"
                                    />
                                </TableHead>
                                <TableHead className={cn("py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors", role === 'admin' ? 'w-[24%] align-middle' : 'w-[18%] align-middle')}>Name</TableHead>
                                {role === 'teacher' && <TableHead className="w-[13%] align-middle py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Session</TableHead>}
                                {role === 'admin' ? (
                                    <TableHead className="w-[14%] align-middle py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Date of Birth</TableHead>
                                ) : (
                                    <TableHead className="w-[8%] align-middle whitespace-nowrap py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Age</TableHead>
                                )}
                                {role === 'admin' && <TableHead className="w-[16%] align-middle py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Branch</TableHead>}
                                <TableHead className={cn("py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors", role === 'admin' ? 'w-[22%] align-middle' : 'w-[17%] align-middle')}>Parent / Guardian</TableHead>
                                <TableHead className={cn("py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors", role === 'admin' ? 'w-[14%] align-middle' : 'w-[12%] pr-4 align-middle leading-tight')}>Enrollment Status</TableHead>
                                {role === 'teacher' && (
                                    <>
                                        <TableHead className="w-[14%] pl-2 align-middle leading-tight py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Assessment Status</TableHead>
                                        <TableHead className="w-[10%] text-right align-middle leading-tight py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Latest Score</TableHead>
                                    </>
                                )}
                                <TableHead className="w-[5%] pr-6 align-middle sm:pr-8"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                            {paginatedStudents.length === 0 ? (
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                    <TableCell colSpan={role === 'admin' ? 7 : 9} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center py-24 px-4">
                                            <div className="rounded-2xl bg-slate-50 dark:bg-zinc-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors mb-5">
                                                <Search className="size-10 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">No student records found</p>
                                                <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Try adjusting your filters or search query.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedStudents.map((student) => {
                                    const firstInitial = student.firstName?.charAt(0) || '';
                                    const lastInitial = student.lastName?.charAt(0) || '';
                                    const initials = (firstInitial + lastInitial).toUpperCase();

                                    return (
                                        <TableRow
                                            key={student.id}
                                            className={`group transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 h-[88px] border-slate-100 dark:border-slate-800 ${selectedStudents.has(student.id) ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''}`}
                                        >
                                            <TableCell className="py-4 pl-6 sm:py-5 sm:pl-8">
                                                <Checkbox
                                                    checked={selectedStudents.has(student.id)}
                                                    onCheckedChange={() => onToggleStudent(student.id)}
                                                    className="size-5 rounded-md"
                                                />
                                            </TableCell>
                                            <TableCell className="py-4 sm:py-5">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <Avatar className="size-14 shadow-sm border border-indigo-100 dark:border-indigo-500/30 transition-colors rounded-2xl shrink-0">
                                                        <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-black text-lg rounded-2xl">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button
                                                        onClick={() => onOpenDetail(student)}
                                                        className="truncate text-left text-lg font-black text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                                    >
                                                        {formatName(student)}
                                                    </button>
                                                </div>
                                            </TableCell>

                                            {role === 'teacher' && (
                                                <TableCell className="py-4 sm:py-5">
                                                    <div className="truncate text-base font-bold text-slate-700 dark:text-slate-300 transition-colors" title={student.section_name}>
                                                        {student.section_name || <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 italic">Unassigned</span>}
                                                    </div>
                                                </TableCell>
                                            )}

                                            {role === 'admin' ? (
                                                <TableCell className="py-4 text-base font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                                    {formatPHDate(student.dateOfBirth)}
                                                </TableCell>
                                            ) : (
                                                <TableCell className="py-4 text-base font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                                    {calculateAge(student.dateOfBirth)} yrs
                                                </TableCell>
                                            )}

                                            {role === 'admin' && (
                                                <TableCell className="py-4 sm:py-5">
                                                    <div className="truncate text-base font-bold text-indigo-600 dark:text-indigo-400 transition-colors" title={student.daycare || '-'}>
                                                        {student.daycare || '-'}
                                                    </div>
                                                </TableCell>
                                            )}

                                            <TableCell className="overflow-hidden py-4 sm:py-5">
                                                {student.parentName || student.parentLinked ? (
                                                    <div className="flex flex-col">
                                                        <span className="truncate text-base font-bold text-slate-900 dark:text-slate-100 transition-colors" title={student.parentName}>
                                                            {student.parentName || 'Linked Parent'}
                                                        </span>
                                                        {student.parentEmail && (
                                                            <span className="truncate text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 transition-colors" title={student.parentEmail}>
                                                                {student.parentEmail}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="w-fit border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800/50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors shadow-none">
                                                        Unlinked
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            <TableCell className={cn(role === 'teacher' ? 'py-4 pr-5 sm:py-5' : 'py-4 sm:py-5')}>
                                                {getEnrollmentBadge(student.status)}
                                            </TableCell>

                                            {role === 'teacher' && (
                                                <>
                                                    <TableCell className="py-4 pl-2 sm:py-5">{getAssessmentBadge(student.assessmentStatus)}</TableCell>
                                                    <TableCell className="py-4 text-right sm:py-5">
                                                        {student.score ? (
                                                            <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 px-3.5 py-1.5 text-lg font-black text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700">
                                                                {student.score}
                                                            </span>
                                                        ) : (
                                                            <span className="text-lg font-medium text-slate-400 dark:text-slate-500 transition-colors">-</span>
                                                        )}
                                                    </TableCell>
                                                </>
                                            )}

                                            <TableCell className="py-4 pr-6 text-right sm:py-5 sm:pr-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-12 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                            <MoreHorizontal className="size-6" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl dark:bg-zinc-900 dark:border-slate-800 transition-colors shadow-xl">
                                                        <DropdownMenuLabel className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-2 px-3">Manage Record</DropdownMenuLabel>
                                                        {role === 'admin' && student.access_code && onViewPin && (
                                                            <DropdownMenuItem onClick={() => onViewPin(student)} className="mb-2 py-3 px-3 rounded-xl cursor-pointer bg-indigo-50 dark:bg-indigo-500/10 text-base font-bold text-indigo-600 dark:text-indigo-400 dark:focus:bg-zinc-800 transition-colors">
                                                                <Key className="mr-3 size-5" /> View Parent PIN
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="dark:bg-slate-800 mb-1" />
                                                        {role === 'teacher' && onNewAssessment && !(student.status === 'Completed' || student.status === 'Graduated' || student.canGraduate) && (
                                                            <DropdownMenuItem onClick={() => onNewAssessment(student.id)} className="cursor-pointer py-3 px-3 text-base rounded-xl font-bold dark:text-slate-200 dark:focus:bg-zinc-800 transition-colors">
                                                                {student.assessmentStatus === 'Draft' || student.assessmentStatus === 'In Progress' ? (
                                                                    <><PlayCircle className="mr-3 size-5 text-amber-500 dark:text-amber-400" /> Resume Assessment</>
                                                                ) : (
                                                                    <><PlusCircle className="mr-3 size-5 text-indigo-600 dark:text-indigo-400" /> Start New Assessment</>
                                                                )}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="dark:bg-slate-800 my-1" />
                                                        <DropdownMenuItem onClick={() => onOpenDetail(student)} className="cursor-pointer py-3 px-3 text-base rounded-xl font-bold dark:text-slate-200 dark:focus:bg-zinc-800 transition-colors">
                                                            <Eye className="mr-3 size-5 text-slate-500 dark:text-slate-400" /> View Profile
                                                        </DropdownMenuItem>
                                                        {role === 'teacher' && onProgressReport && (
                                                            <DropdownMenuItem onClick={() => onProgressReport(student)} className="cursor-pointer py-3 px-3 text-base rounded-xl font-bold text-blue-600 dark:text-blue-400 dark:focus:bg-zinc-800 transition-colors">
                                                                <Printer className="mr-3 size-5" /> Progress Report
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => onOpenEdit(student)} className="cursor-pointer py-3 px-3 text-base rounded-xl font-bold dark:text-slate-200 dark:focus:bg-zinc-800 transition-colors">
                                                            <Edit className="mr-3 size-5 text-slate-500 dark:text-slate-400" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="dark:bg-slate-800 my-1" />
                                                        {role === 'teacher' && onGraduate && (
                                                            <DropdownMenuItem onClick={() => onGraduate(student)} disabled={!student.canGraduate} className={!student.canGraduate ? 'cursor-not-allowed py-3 px-3 text-base rounded-xl font-bold text-slate-400 dark:text-slate-600 opacity-60' : 'cursor-pointer py-3 px-3 text-base rounded-xl font-bold text-purple-600 dark:text-purple-400 dark:focus:bg-zinc-800 transition-colors'}>
                                                                <GraduationCap className="mr-3 size-5" />
                                                                {student.canGraduate ? 'Graduate Student' : 'Cannot Graduate Yet'}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem onClick={() => onOpenArchive(student)} className="cursor-pointer py-3 px-3 text-base rounded-xl font-bold text-amber-600 dark:text-amber-500 dark:focus:bg-zinc-800 transition-colors">
                                                            <Archive className="mr-3 size-5" /> Archive Record
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {filteredStudents.length > 0 && (
                    <div className="flex flex-col items-center justify-between gap-4 rounded-b-3xl border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 p-6 sm:flex-row sm:px-8 transition-colors">
                        <div className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                            Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                            <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                            <span className="font-bold text-slate-900 dark:text-white">{filteredStudents.length}</span> records
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                                <ChevronLeft className="size-6" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                                <ChevronRight className="size-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

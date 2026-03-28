import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BookOpen, ChevronLeft, ChevronRight, Eye, FileOutput, Printer, RefreshCcw, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// 🚀 ENHANCED: Added Age and Section for ECCD context
export interface BaseStudent {
    id: number;
    firstName: string;
    lastName: string;
    age?: number | string;
    section_name?: string;
    daycare?: string;
    status: string;
    archivedDate?: string;
    archiveReason?: string | null;
    [key: string]: any;
}

interface ArchivedStudentsDialogProps<T extends BaseStudent> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    archivedStudents: T[];
    onOpenDetail: (student: T) => void;
    onRestore: (student: T) => void;
    onBulkRestore: (ids: number[]) => void;

    // Optional Props for Admin
    daycareList?: string[];
    onDelete?: (student: T) => void;
    onBulkDelete?: (ids: number[]) => void;
    onPrintReport?: (student: T) => void;
}

export function ArchivedStudentsDialog<T extends BaseStudent>({
    open,
    onOpenChange,
    archivedStudents,
    daycareList,
    onOpenDetail,
    onRestore,
    onBulkRestore,
    onDelete,
    onBulkDelete,
    onPrintReport,
}: ArchivedStudentsDialogProps<T>) {
    // 🚀 FIX: Updated state to 'completers'
    const [activeTab, setActiveTab] = useState<'completers' | 'withdrawn'>('completers');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setFilterDaycare('all');
            setSelectedIds(new Set());
            setCurrentPage(1);
        }
    }, [open, activeTab]);

    const filteredStudents = useMemo(() => {
        return archivedStudents.filter((s) => {
            // 🚀 FIX: Updated filter logic to match 'completers' tab
            const isGraduate = s.status === 'Graduated' || s.status === 'Completed';
            if (activeTab === 'completers' && !isGraduate) return false;
            if (activeTab === 'withdrawn' && isGraduate) return false;

            // 2. Daycare Filter (Admin only)
            if (filterDaycare !== 'all' && s.daycare !== filterDaycare) return false;

            // 3. Search Filter
            const name = `${s.firstName} ${s.lastName}`.toLowerCase();
            const reason = (s.archiveReason || '').toLowerCase();
            const search = searchQuery.toLowerCase();
            return name.includes(search) || reason.includes(search);
        });
    }, [archivedStudents, searchQuery, filterDaycare, activeTab]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterDaycare]);

    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
    }, [filteredStudents.length, totalPages, currentPage]);

    const paginatedData = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleToggleAll = () => {
        if (selectedIds.size === paginatedData.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedData.map((s) => s.id)));
        }
    };

    const handlePrintEccdChecklist = (student: T) => {
        if (onPrintReport) {
            onPrintReport(student);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden bg-slate-50 sm:max-w-[95vw] lg:max-w-[1400px] xl:max-w-[1536px]">
                <DialogHeader className="px-4 pt-4 pb-2 border-b border-slate-200 bg-white">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <BookOpen className="size-5" />
                        </div>
                        {/* 🚀 FIX: Updated official title */}
                        Past Learner Records
                    </DialogTitle>
                    <DialogDescription className="text-base text-slate-500">
                        Manage ECCD curriculum completers, transferred learners, and inactive center records.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-1 flex-col overflow-hidden p-4">
                    {/* Controls Bar */}
                    <div className="mb-4 flex flex-col xl:flex-row items-center justify-between gap-4 rounded-xl bg-white p-2 shadow-sm border border-slate-200">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as 'completers' | 'withdrawn')}
                            className="w-full xl:w-auto"
                        >
                            <TabsList className="grid w-full grid-cols-2 xl:w-[450px] h-11 bg-slate-100">
                                {/* 🚀 FIX: Tab Values updated to Completers */}
                                <TabsTrigger value="completers" className="flex gap-2 font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">
                                    <Award className="size-4" /> ECCD Completers
                                </TabsTrigger>
                                <TabsTrigger value="withdrawn" className="flex gap-2 font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=active]:shadow-sm">
                                    <FileOutput className="size-4" /> Transferred / Withdrawn
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex w-full flex-1 items-center justify-end gap-3 xl:w-auto overflow-x-auto">
                            {/* Bulk Actions Menu */}
                            {selectedIds.size > 0 && (
                                <div className="animate-in fade-in slide-in-from-right-4 flex shrink-0 items-center gap-2 border-r border-slate-200 pr-3">
                                    <span className="text-xs font-medium text-slate-500 mr-1">{selectedIds.size} selected</span>
                                    {activeTab === 'withdrawn' && (
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                onBulkRestore(Array.from(selectedIds));
                                                setSelectedIds(new Set());
                                            }}
                                            className="h-10 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                                        >
                                            <RefreshCcw className="mr-2 size-4" /> Restore Active Status
                                        </Button>
                                    )}

                                    {onBulkDelete && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => {
                                                onBulkDelete(Array.from(selectedIds));
                                                setSelectedIds(new Set());
                                            }}
                                            className="h-10 shadow-sm"
                                        >
                                            <Trash2 className="size-4 lg:mr-2" /> <span className="hidden lg:inline">Delete Records</span>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Filters */}
                            {daycareList && daycareList.length > 0 && (
                                <div className="w-full sm:w-48 shrink-0">
                                    <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                                        <SelectTrigger className="h-10 border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500">
                                            <SelectValue placeholder="All Centers" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Centers</SelectItem>
                                            {daycareList.map((daycare, idx) => (
                                                <SelectItem key={idx} value={daycare}>{daycare}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="relative w-full sm:max-w-xs shrink-0">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <Input
                                    placeholder="Search student or reason..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 border-slate-200 bg-slate-50 pl-9 focus:bg-white focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    {/* 🚀 FIX: Added min-h-0 and w-full so flexbox respects boundaries and enables scrolling inside */}
                    <div className="h-[60vh] min-h-[450px] w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <Table className="w-full text-sm">
                            <TableHeader className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-sm shadow-sm">
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[40px] pl-4">
                                        <Checkbox
                                            checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                                            onCheckedChange={handleToggleAll}
                                            className="border-slate-300"
                                        />
                                    </TableHead>
                                    <TableHead className="font-bold text-slate-600">Child's Name</TableHead>
                                    <TableHead className="font-bold text-slate-600">Age & Session</TableHead>
                                    {daycareList && daycareList.length > 0 && (
                                        <TableHead className="font-bold text-slate-600">Assigned Center</TableHead>
                                    )}
                                    <TableHead className="font-bold text-slate-600">Status</TableHead>
                                    <TableHead className="font-bold text-slate-600">Date Logged</TableHead>
                                    <TableHead className="font-bold text-slate-600">Notes / Reason</TableHead>
                                    <TableHead className="pr-4 text-right font-bold text-slate-600">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100">
                                {paginatedData.length === 0 ? (
                                    <TableRow className="hover:bg-transparent border-none">
                                        <TableCell colSpan={daycareList && daycareList.length > 0 ? 8 : 7} className="h-[400px] text-center align-middle">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                {/* 🚀 FIX: Updated empty state text */}
                                                {activeTab === 'completers' ? (
                                                    <>
                                                        <Award className="mb-3 size-12 opacity-20" />
                                                        <p className="text-base font-medium text-slate-600">No ECCD completers yet.</p>
                                                        <p className="text-sm">Students will appear here once they complete the curriculum.</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileOutput className="mb-3 size-12 opacity-20" />
                                                        <p className="text-base font-medium text-slate-600">No withdrawn records found.</p>
                                                        <p className="text-sm">Transferred or inactive students will be listed here.</p>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((student) => (
                                        <TableRow key={student.id} className={`group hover:bg-slate-50 ${selectedIds.has(student.id) ? 'bg-indigo-50/50 hover:bg-indigo-50/50' : ''}`}>
                                            <TableCell className="pl-4">
                                                <Checkbox
                                                    checked={selectedIds.has(student.id)}
                                                    onCheckedChange={() => handleToggleSelect(student.id)}
                                                    className={selectedIds.has(student.id) ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600 shadow-inner shrink-0">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    <span className="font-semibold text-slate-900">
                                                        {student.firstName} {student.lastName}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {student.age && <span className="text-sm font-medium text-slate-700">{student.age} yrs old</span>}
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Users className="size-3" />
                                                        {student.section_name || 'Unassigned Session'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {daycareList && daycareList.length > 0 && (
                                                <TableCell className="text-sm font-semibold text-indigo-600">
                                                    {student.daycare || '—'}
                                                </TableCell>
                                            )}

                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        student.status === 'Graduated' || student.status === 'Completed'
                                                            ? 'border-indigo-200 bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wider text-[10px]'
                                                            : student.status === 'Transferred'
                                                                ? 'border-cyan-200 bg-cyan-50 text-cyan-700 font-bold uppercase tracking-wider text-[10px]'
                                                                : 'border-slate-200 bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px]'
                                                    }
                                                >
                                                    {student.status === 'Graduated' || student.status === 'Completed' ? 'ECCD Completed' : student.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-sm font-medium text-slate-600">
                                                {student.archivedDate || '—'}
                                            </TableCell>

                                            <TableCell className="max-w-[200px] truncate text-sm text-slate-500" title={student.archiveReason || ''}>
                                                {student.archiveReason || '—'}
                                            </TableCell>

                                            <TableCell className="pr-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onOpenDetail(student)}
                                                        className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                                                        title="View Profile"
                                                    >
                                                        <Eye className="size-4" />
                                                    </Button>

                                                    {activeTab === 'withdrawn' ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => onRestore(student)}
                                                            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                                                        >
                                                            <RefreshCcw className="mr-2 size-3" /> Restore
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePrintEccdChecklist(student)}
                                                            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                                                            title="Print ECCD Progress Report"
                                                        >
                                                            <Printer className="mr-2 size-3" /> Progress Report
                                                        </Button>
                                                    )}

                                                    {onDelete && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onDelete(student)}
                                                            className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                            title="Permanent Delete"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Bar */}
                    {filteredStudents.length > 0 && (
                        <div className="flex items-center justify-between pt-4">
                            <div className="text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                                <span className="font-bold text-slate-700">{filteredStudents.length}</span> records
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="h-9 w-9 p-0"
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <div className="px-2 text-sm font-medium text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="h-9 w-9 p-0"
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

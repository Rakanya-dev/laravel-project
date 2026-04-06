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
    const [activeTab, setActiveTab] = useState<'completers' | 'withdrawn'>('completers');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    // 🚀 NEW: State strictly for the Delete Confirmation Dialog
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', student?: T } | null>(null);

    const itemsPerPage = 8;

    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setFilterDaycare('all');
            setSelectedIds(new Set());
            setCurrentPage(1);
            setConfirmDelete(null); // Ensure modal resets when opening
        }
    }, [open, activeTab]);

    const filteredStudents = useMemo(() => {
        return archivedStudents.filter((s) => {
            const isGraduate = s.status === 'Graduated' || s.status === 'Completed';
            if (activeTab === 'completers' && !isGraduate) return false;
            if (activeTab === 'withdrawn' && isGraduate) return false;
            if (filterDaycare !== 'all' && s.daycare !== filterDaycare) return false;

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

    // 🚀 NEW: Function to execute the delete after confirmation
    const executeDelete = () => {
        if (confirmDelete?.type === 'single' && confirmDelete.student && onDelete) {
            onDelete(confirmDelete.student);
        } else if (confirmDelete?.type === 'bulk' && onBulkDelete) {
            onBulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
        }
        setConfirmDelete(null);
    };

    return (
        <>
            {/* MAIN DATA DIALOG */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="flex max-h-[90vh] w-full flex-col overflow-hidden bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 sm:max-w-[95vw] lg:max-w-[1400px] xl:max-w-[1536px] transition-colors duration-200 p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 transition-colors">
                        <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-slate-800 dark:text-white">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                                <BookOpen className="size-5" />
                            </div>
                            Past Learner Records
                        </DialogTitle>
                        <DialogDescription className="text-base text-slate-500 dark:text-slate-400">
                            Manage ECCD curriculum completers, transferred learners, and inactive center records.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-1 flex-col overflow-hidden p-4 sm:p-6 bg-slate-50/50 dark:bg-zinc-950">
                        <div className="mb-4 flex flex-col xl:flex-row items-center justify-between gap-4 rounded-xl bg-white dark:bg-zinc-900 p-2 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => setActiveTab(v as 'completers' | 'withdrawn')}
                                className="w-full xl:w-auto"
                            >
                                <TabsList className="grid w-full grid-cols-2 xl:w-[450px] h-11 bg-slate-100 dark:bg-zinc-950 transition-colors">
                                    <TabsTrigger value="completers" className="flex gap-2 font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm transition-colors">
                                        <Award className="size-4" /> ECCD Completers
                                    </TabsTrigger>
                                    <TabsTrigger value="withdrawn" className="flex gap-2 font-medium text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-slate-700 dark:data-[state=active]:text-slate-200 text-slate-500 dark:text-slate-400 data-[state=active]:shadow-sm transition-colors">
                                        <FileOutput className="size-4" /> Transferred / Withdrawn
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex w-full flex-1 items-center justify-end gap-3 xl:w-auto overflow-x-auto">
                                {selectedIds.size > 0 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 flex shrink-0 items-center gap-2 border-r border-slate-200 dark:border-slate-800 pr-3 transition-colors">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">{selectedIds.size} selected</span>
                                        {activeTab === 'withdrawn' && (
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    onBulkRestore(Array.from(selectedIds));
                                                    setSelectedIds(new Set());
                                                }}
                                                className="h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors text-white"
                                            >
                                                <RefreshCcw className="mr-2 size-4" /> Restore Active Status
                                            </Button>
                                        )}

                                        {onBulkDelete && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => setConfirmDelete({ type: 'bulk' })}
                                                className="h-10 shadow-sm dark:bg-red-600 dark:hover:bg-red-500 transition-colors"
                                            >
                                                <Trash2 className="size-4 lg:mr-2" /> <span className="hidden lg:inline">Delete Records</span>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {daycareList && daycareList.length > 0 && (
                                    <div className="w-full sm:w-48 shrink-0">
                                        <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                                            <SelectTrigger className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 focus:bg-white dark:focus:bg-zinc-900 focus:ring-indigo-500 dark:text-white transition-colors">
                                                <SelectValue placeholder="All Centers" />
                                            </SelectTrigger>
                                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                                <SelectItem value="all" className="dark:text-slate-200 dark:focus:bg-zinc-800">All Centers</SelectItem>
                                                {daycareList.map((daycare, idx) => (
                                                    <SelectItem key={idx} value={daycare} className="dark:text-slate-200 dark:focus:bg-zinc-800">{daycare}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="relative w-full sm:max-w-xs shrink-0">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        placeholder="Search student or reason..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-10 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 pl-9 focus:bg-white dark:focus:bg-zinc-900 focus:ring-indigo-500 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="h-[60vh] min-h-[450px] w-full overflow-y-auto overflow-x-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <Table className="w-full text-sm">
                                <TableHeader className="sticky top-0 z-10 bg-slate-50/90 dark:bg-zinc-900/90 backdrop-blur-sm shadow-sm transition-colors border-b border-slate-200 dark:border-slate-800">
                                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-none">
                                        <TableHead className="w-[40px] pl-4">
                                            <Checkbox
                                                checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                                                onCheckedChange={handleToggleAll}
                                                className="border-slate-300 dark:border-slate-600"
                                            />
                                        </TableHead>
                                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Child's Name</TableHead>
                                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Age & Session</TableHead>
                                        {daycareList && daycareList.length > 0 && (
                                            <TableHead className="font-bold text-slate-600 dark:text-slate-300">Assigned Center</TableHead>
                                        )}
                                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Status</TableHead>
                                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Date Logged</TableHead>
                                        <TableHead className="font-bold text-slate-600 dark:text-slate-300">Notes / Reason</TableHead>
                                        <TableHead className="pr-4 text-right font-bold text-slate-600 dark:text-slate-300">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {paginatedData.length === 0 ? (
                                        <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-none">
                                            <TableCell colSpan={daycareList && daycareList.length > 0 ? 8 : 7} className="h-[400px] text-center align-middle">
                                                <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                                                    {activeTab === 'completers' ? (
                                                        <>
                                                            <Award className="mb-3 size-12 opacity-20" />
                                                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">No ECCD completers yet.</p>
                                                            <p className="text-sm">Students will appear here once they complete the curriculum.</p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileOutput className="mb-3 size-12 opacity-20" />
                                                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">No withdrawn records found.</p>
                                                            <p className="text-sm">Transferred or inactive students will be listed here.</p>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((student) => (
                                            <TableRow key={student.id} className={`group hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors ${selectedIds.has(student.id) ? 'bg-indigo-50/50 hover:bg-indigo-50/50 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/10' : ''}`}>
                                                <TableCell className="pl-4">
                                                    <Checkbox
                                                        checked={selectedIds.has(student.id)}
                                                        onCheckedChange={() => handleToggleSelect(student.id)}
                                                        className={selectedIds.has(student.id) ? "border-indigo-600 bg-indigo-600" : "border-slate-300 dark:border-slate-600"}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 font-semibold text-slate-600 dark:text-slate-300 shadow-inner shrink-0 transition-colors">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                            {student.firstName} {student.lastName}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {student.age && <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{student.age} yrs old</span>}
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                            <Users className="size-3" />
                                                            {student.section_name || 'Unassigned Session'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {daycareList && daycareList.length > 0 && (
                                                    <TableCell className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                                        {student.daycare || '—'}
                                                    </TableCell>
                                                )}

                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            student.status === 'Graduated' || student.status === 'Completed'
                                                                ? 'border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider text-[10px] transition-colors'
                                                                : student.status === 'Transferred'
                                                                    ? 'border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-bold uppercase tracking-wider text-[10px] transition-colors'
                                                                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px] transition-colors'
                                                        }
                                                    >
                                                        {student.status === 'Graduated' || student.status === 'Completed' ? 'ECCD Completed' : student.status}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                                    {student.archivedDate || '—'}
                                                </TableCell>

                                                <TableCell className="max-w-[200px] truncate text-sm text-slate-500 dark:text-slate-400" title={student.archiveReason || ''}>
                                                    {student.archiveReason || '—'}
                                                </TableCell>

                                                <TableCell className="pr-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onOpenDetail(student)}
                                                            className="text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>

                                                        {activeTab === 'withdrawn' ? (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => onRestore(student)}
                                                                className="border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors"
                                                            >
                                                                <RefreshCcw className="mr-2 size-3" /> Restore
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePrintEccdChecklist(student)}
                                                                className="border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors"
                                                                title="Print ECCD Progress Report"
                                                            >
                                                                <Printer className="mr-2 size-3" /> Progress Report
                                                            </Button>
                                                        )}

                                                        {onDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setConfirmDelete({ type: 'single', student })}
                                                                className="text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

                        {filteredStudents.length > 0 && (
                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors">
                                    Showing <span className="font-bold text-slate-700 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{filteredStudents.length}</span> records
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 w-9 p-0 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <div className="px-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                                        Page {currentPage} of {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 w-9 p-0 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* SECONDARY DELETE CONFIRMATION DIALOG */}
            <Dialog open={!!confirmDelete} onOpenChange={(isOpen) => !isOpen && setConfirmDelete(null)}>
                <DialogContent className="max-w-sm rounded-2xl p-6 text-center shadow-2xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 transition-colors duration-200">
                    <DialogHeader>
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 ring-4 ring-white dark:ring-zinc-950 shadow-sm mb-4 transition-colors">
                            <Trash2 className="size-6 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white tracking-tight text-center transition-colors">
                            {confirmDelete?.type === 'single'
                                ? `Delete ${confirmDelete.student?.firstName}?`
                                : `Delete ${selectedIds.size} records?`}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                            This action is permanent and cannot be undone. This will completely erase the student's records from the database.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => setConfirmDelete(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full sm:w-auto h-11 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-colors text-white"
                            onClick={executeDelete}
                        >
                            Yes, delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

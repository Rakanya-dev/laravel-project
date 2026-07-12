import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BookOpen, ChevronLeft, ChevronRight, Eye, FileOutput, Printer, RefreshCcw, Search, Trash2, Users, X, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

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

    const [confirmDelete, setConfirmDelete] = useState<{ type: 'single' | 'bulk', student?: T } | null>(null);

    const itemsPerPage = 8;

    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setFilterDaycare('all');
            setSelectedIds(new Set());
            setCurrentPage(1);
            setConfirmDelete(null);
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
            {/* --- MAIN DATA DIALOG --- */}
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent hideClose className="sm:max-w-[95vw] lg:max-w-[1400px] xl:max-w-[1536px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                    {/* PREMIUM HEADER */}
                    <DialogHeader className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-row items-center justify-between shrink-0 m-0">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                <BookOpen className="size-6" strokeWidth={2.5} />
                            </div>
                            <div className="text-left mt-1">
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                                    Past Learner Records
                                </DialogTitle>
                                <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors leading-relaxed">
                                    Manage ECCD curriculum completers, transferred learners, and inactive center records.
                                </DialogDescription>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl size-12 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors shrink-0 -mr-2">
                            <X className="size-6" />
                        </Button>
                    </DialogHeader>

                    {/* SCROLLABLE BODY */}
                    <div className="flex flex-1 flex-col overflow-hidden p-6 sm:p-8 bg-slate-50 dark:bg-zinc-950/30">

                        {/* TOOLBAR */}
                        <div className="mb-6 flex flex-col xl:flex-row items-center justify-between gap-5 transition-colors">
                            <Tabs
                                value={activeTab}
                                onValueChange={(v) => setActiveTab(v as 'completers' | 'withdrawn')}
                                className="w-full xl:w-auto"
                            >
                                <TabsList className="grid w-full grid-cols-2 xl:w-[480px] h-14 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 transition-colors border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <TabsTrigger value="completers" className="flex gap-2 font-bold text-sm rounded-xl data-[state=active]:bg-indigo-50 dark:data-[state=active]:bg-indigo-500/10 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-none transition-colors h-full">
                                        <Award className="size-4" /> ECCD Completers
                                    </TabsTrigger>
                                    <TabsTrigger value="withdrawn" className="flex gap-2 font-bold text-sm rounded-xl data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-slate-800 dark:data-[state=active]:text-slate-200 text-slate-500 dark:text-slate-400 data-[state=active]:shadow-none transition-colors h-full">
                                        <FileOutput className="size-4" /> Transferred / Inactive
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <div className="flex w-full flex-1 items-center justify-end gap-4 xl:w-auto overflow-x-auto">
                                {selectedIds.size > 0 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 flex shrink-0 items-center gap-4 border-r border-slate-200 dark:border-slate-800 pr-4 transition-colors">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{selectedIds.size} selected</span>
                                        {activeTab === 'withdrawn' && (
                                            <Button
                                                onClick={() => {
                                                    onBulkRestore(Array.from(selectedIds));
                                                    setSelectedIds(new Set());
                                                }}
                                                className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 shadow-sm transition-colors text-white font-bold px-5 text-base"
                                            >
                                                <RefreshCcw className="mr-2 size-4" /> Restore Active Status
                                            </Button>
                                        )}

                                        {onBulkDelete && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => setConfirmDelete({ type: 'bulk' })}
                                                className="h-12 rounded-xl shadow-sm dark:bg-red-600 dark:hover:bg-red-500 font-bold px-5 transition-colors text-base"
                                            >
                                                <Trash2 className="size-4 lg:mr-2" /> <span className="hidden lg:inline">Delete Records</span>
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {daycareList && daycareList.length > 0 && (
                                    <div className="w-full sm:w-64 shrink-0">
                                        <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                                            <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 font-bold text-slate-700 dark:text-slate-300 focus:ring-indigo-500 shadow-sm transition-colors text-base">
                                                <SelectValue placeholder="All Centers" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                <SelectItem value="all" className="font-medium rounded-lg py-2.5 text-base">All Centers</SelectItem>
                                                {daycareList.map((daycare, idx) => (
                                                    <SelectItem key={idx} value={daycare} className="font-medium rounded-lg py-2.5 text-base">{daycare}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="relative w-full sm:max-w-md shrink-0">
                                    <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        placeholder="Search student or reason..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 pl-11 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 shadow-sm focus-visible:ring-indigo-500 transition-colors text-base"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TABLE GRID */}
                        <div className="flex-1 min-h-0 w-full overflow-y-auto custom-scrollbar rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                            <Table className="w-full table-fixed min-w-[1000px]">
                                <TableHeader className="sticky top-0 z-10 bg-slate-50/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-sm transition-colors border-b border-slate-200 dark:border-slate-800">
                                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-none">
                                        <TableHead className="w-[6%] pl-8 py-5">
                                            <Checkbox
                                                checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                                                onCheckedChange={handleToggleAll}
                                                className="border-slate-300 dark:border-slate-600 rounded-[4px] size-5"
                                            />
                                        </TableHead>
                                        <TableHead className="w-[20%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Child's Name</TableHead>
                                        <TableHead className="w-[15%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Age & Session</TableHead>
                                        {daycareList && daycareList.length > 0 && (
                                            <TableHead className="w-[15%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Assigned Center</TableHead>
                                        )}
                                        <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</TableHead>
                                        <TableHead className="w-[12%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Date Logged</TableHead>
                                        <TableHead className="w-[20%] text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Notes / Reason</TableHead>
                                        <TableHead className="w-[120px] pr-8 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                    {paginatedData.length === 0 ? (
                                        <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-none">
                                            <TableCell colSpan={daycareList && daycareList.length > 0 ? 8 : 7} className="h-[400px] text-center align-middle">
                                                <div className="flex flex-col items-center justify-center py-10 px-4">
                                                    <div className="bg-slate-50 dark:bg-zinc-800 p-6 rounded-2xl mb-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                                        {activeTab === 'completers' ? <Award className="size-10 text-slate-400 dark:text-slate-500" /> : <FileOutput className="size-10 text-slate-400 dark:text-slate-500" />}
                                                    </div>
                                                    <p className="text-2xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                                                        {activeTab === 'completers' ? 'No ECCD completers yet.' : 'No withdrawn records found.'}
                                                    </p>
                                                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                                        {activeTab === 'completers' ? 'Students will appear here once they complete the curriculum.' : 'Transferred or inactive students will be listed here.'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((student) => (
                                            <TableRow key={student.id} className={cn("group transition-colors h-[72px] border-slate-100 dark:border-slate-800", selectedIds.has(student.id) ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-800/50')}>
                                                <TableCell className="pl-8">
                                                    <Checkbox
                                                        checked={selectedIds.has(student.id)}
                                                        onCheckedChange={() => handleToggleSelect(student.id)}
                                                        className={cn("rounded-[4px] transition-colors size-5", selectedIds.has(student.id) ? "border-indigo-600 bg-indigo-600 dark:bg-indigo-500 dark:border-indigo-500" : "border-slate-300 dark:border-slate-600")}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-zinc-800 font-bold text-sm text-slate-600 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                        <span className="font-bold text-base text-slate-900 dark:text-slate-100 truncate transition-colors">
                                                            {student.firstName} {student.lastName}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex flex-col overflow-hidden">
                                                        {student.age && <span className="text-sm font-bold text-slate-800 dark:text-slate-200 transition-colors">{student.age} yrs old</span>}
                                                        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5 truncate transition-colors">
                                                            {student.section_name || 'Unassigned Session'}
                                                        </span>
                                                    </div>
                                                </TableCell>

                                                {daycareList && daycareList.length > 0 && (
                                                    <TableCell className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate transition-colors">
                                                        {student.daycare || '—'}
                                                    </TableCell>
                                                )}

                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "px-3 py-1 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit",
                                                            student.status === 'Graduated' || student.status === 'Completed'
                                                                ? 'border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                                                : student.status === 'Transferred'
                                                                    ? 'border-cyan-200 dark:border-cyan-900/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                                                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-zinc-800 text-slate-600 dark:text-slate-300'
                                                        )}
                                                    >
                                                        {student.status === 'Graduated' || student.status === 'Completed' ? 'ECCD Completed' : student.status}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell className="text-sm font-bold text-slate-600 dark:text-slate-300 transition-colors">
                                                    {student.archivedDate || '—'}
                                                </TableCell>

                                                <TableCell className="truncate text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors" title={student.archiveReason || ''}>
                                                    {student.archiveReason || '—'}
                                                </TableCell>

                                                <TableCell className="pr-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onOpenDetail(student)}
                                                            className="size-10 rounded-xl text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors"
                                                            title="View Profile"
                                                        >
                                                            <Eye className="size-5" />
                                                        </Button>

                                                        {activeTab === 'withdrawn' ? (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => onRestore(student)}
                                                                className="h-10 rounded-xl border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-colors font-bold px-3"
                                                            >
                                                                <RefreshCcw className="mr-1.5 size-4" /> Restore
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => handlePrintEccdChecklist(student)}
                                                                className="h-10 rounded-xl border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors font-bold px-3"
                                                                title="Print ECCD Progress Report"
                                                            >
                                                                <Printer className="mr-1.5 size-4" /> Report
                                                            </Button>
                                                        )}

                                                        {onDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setConfirmDelete({ type: 'single', student })}
                                                                className="size-10 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                                title="Permanent Delete"
                                                            >
                                                                <Trash2 className="size-5" />
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

                        {/* PAGINATION FOOTER */}
                        {filteredStudents.length > 0 && (
                            <div className="flex flex-col items-center justify-between gap-4 rounded-b-2xl bg-transparent pt-6 sm:flex-row transition-colors shrink-0">
                                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                    Showing <span className="mx-1 font-black text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="mx-1 font-black text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of{' '}
                                    <span className="mx-1 font-black text-slate-900 dark:text-white">{filteredStudents.length}</span> records
                                </div>
                                <div className="flex items-center gap-5">
                                    <span className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                        Page <span className="mx-1 font-black text-slate-900 dark:text-white">{currentPage}</span> of <span className="mx-1 font-black text-slate-900 dark:text-white">{totalPages}</span>
                                    </span>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-11 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-400 dark:hover:bg-zinc-800"
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="size-5" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-11 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-400 dark:hover:bg-zinc-800"
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- SECONDARY DELETE CONFIRMATION DIALOG --- */}
            <Dialog open={!!confirmDelete} onOpenChange={(isOpen) => !isOpen && setConfirmDelete(null)}>
                <DialogContent hideClose className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col">

                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <DialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl shrink-0">
                                    <AlertTriangle className="size-6" strokeWidth={2.5} />
                                </div>
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {confirmDelete?.type === 'single'
                                        ? `Delete ${confirmDelete.student?.firstName}?`
                                        : `Delete ${selectedIds.size} records?`}
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2 transition-colors">
                                This action is permanent and cannot be undone. This will completely erase the student's records from the database.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <Button
                            variant="ghost"
                            className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                            onClick={() => setConfirmDelete(null)}
                        >
                            <X className="mr-2 size-5" /> Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="h-12 w-full sm:w-auto px-8 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white text-base font-bold shadow-sm transition-colors"
                            onClick={executeDelete}
                        >
                            <Trash2 className="mr-2 size-5" /> Yes, delete completely
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

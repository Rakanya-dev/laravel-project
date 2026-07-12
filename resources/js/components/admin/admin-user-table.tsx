import { router } from '@inertiajs/react';
import { Check, Download, Edit, MoreVertical, Search, Trash2, X, School, Mail, Phone, ShieldAlert, XCircle, Filter, Plus, UserPlus, CheckSquare, Printer } from 'lucide-react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { User } from './admin-user-management';

interface AdminUsersTableProps {
    users: User[];
    userType: 'teachers' | 'parents';
    daycareList: any[];
    pagination?: { current_page: number; last_page: number; total: number; from: number; to: number; links: any[] };
    onApprove?: (userId: number) => void;
    onReject?: (userId: number) => void;
    onEdit?: (user: User) => void;
    onDelete?: (userId: number) => void;
    onExport?: () => void;
    onAddTeacher?: () => void;
    onBulkDelete?: (userIds: number[]) => void;
}

export default function AdminUsersTable({
    users,
    userType,
    daycareList,
    pagination,
    onApprove,
    onReject,
    onEdit,
    onDelete,
    onExport,
    onAddTeacher,
    onBulkDelete
}: AdminUsersTableProps) {
    const urlParams = new URLSearchParams(window.location.search);
    const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
    const [filterStatus, setFilterStatus] = useState<string>(urlParams.get('status') || 'all');
    const [filterDaycare, setFilterDaycare] = useState<string>(urlParams.get('daycare') || 'all');

    // State for multiple select
    const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
    const isInitialMount = useRef(true);

    // Clear selections when paginating or filtering
    useEffect(() => {
        setSelectedUsers(new Set());
    }, [users]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                window.location.pathname,
                { search: searchQuery, status: filterStatus, daycare: filterDaycare },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [searchQuery, filterStatus, filterDaycare]);

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filterStatus && filterStatus !== 'all') count++;
        if (filterDaycare && filterDaycare !== 'all') count++;
        return count;
    }, [filterStatus, filterDaycare]);

    const getFullName = (user: User) => {
        const first = user.first_name || user.firstName || '';
        const middle = user.middle_name || user.middleName || '';
        const last = user.last_name || user.lastName || '';
        return `${first} ${middle ? middle + ' ' : ''}${last}`.trim();
    };

    const getDaycareName = (user: User) => {
        if (typeof user.daycare === 'string') {
            if (user.daycare === 'Unassigned') return <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>;
            return user.daycare;
        }
        if (user.daycare && typeof user.daycare === 'object' && 'name' in user.daycare) {
            return user.daycare.name;
        }
        return <span className="text-slate-400 dark:text-slate-500 italic">Unassigned</span>;
    };

    const formatDisplayPhone = (phone?: string) => {
        if (!phone) return 'N/A';
        let clean = phone.replace(/\D/g, '');
        if (clean.startsWith('63')) clean = clean.substring(2);
        else if (clean.startsWith('0')) clean = clean.substring(1);
        if (clean.length >= 10) return `+63 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
        return phone;
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || 'unknown';
        switch (s) {
            case 'active': return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-400 uppercase tracking-widest text-[11px] py-0.5 px-2 font-bold shadow-none transition-colors">Active</Badge>;
            case 'pending': return <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-500/10 dark:text-amber-400 uppercase tracking-widest text-[11px] py-0.5 px-2 font-bold shadow-none transition-colors">Pending</Badge>;
            case 'rejected':
            case 'inactive': return <Badge className="border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-500/10 dark:text-red-400 uppercase tracking-widest text-[11px] py-0.5 px-2 font-bold shadow-none transition-colors">{status}</Badge>;
            default: return <Badge className="border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-zinc-800 dark:text-slate-300 uppercase tracking-widest text-[11px] py-0.5 px-2 font-bold shadow-none transition-colors">{status}</Badge>;
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterDaycare('all');
    };

    const handleToggleAll = () => {
        if (selectedUsers.size === users.length && users.length > 0) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(users.map((u) => u.id)));
        }
    };

    const handleToggleUser = (id: number) => {
        setSelectedUsers((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkDeleteAction = () => {
        if (onBulkDelete) {
            onBulkDelete(Array.from(selectedUsers));
        } else {
            toast.info('Bulk deletion will be processed.');
            setSelectedUsers(new Set());
        }
    };

    const handlePrint = () => {
        toast.loading('Generating print layout...', { id: 'print-toast' });

        // 1. Build the URL with your current filters
        const params = new URLSearchParams({
            search: searchQuery,
            status: filterStatus,
            daycare: filterDaycare
        });

        // Adjust route prefix based on your web.php structure!
        // Example: if you removed /admin/ from web.php, change this to `/${userType}/print?`
        const printUrl = `/admin/${userType}/print?${params.toString()}`;

        // 2. Create a hidden iframe
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = printUrl;

        // 3. When the iframe finishes loading the Blade view, trigger print
        iframe.onload = () => {
            toast.dismiss('print-toast');

            // Slight delay to ensure browser paints the HTML inside the iframe
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();

                // Clean up the iframe after the print dialog closes
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 2000);
            }, 200);
        };

        // 4. Add it to the page to start the invisible download
        document.body.appendChild(iframe);
    };

    return (
        <div className="space-y-4">

            {/* Bulk Action Banner */}
            {selectedUsers.size > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 px-5 py-4 text-amber-800 dark:text-amber-400 shadow-sm transition-all sm:flex-row sm:items-center sm:py-3 mb-2 print:hidden">
                    <div className="flex items-center gap-3">
                        <CheckSquare className="size-5" />
                        <span className="text-base font-bold sm:text-lg">{selectedUsers.size} records selected</span>
                    </div>
                    <div className="flex w-full gap-3 sm:w-auto">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUsers(new Set())}
                            className="h-11 rounded-xl flex-1 text-base font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none transition-colors"
                        >
                            <X className="mr-2 size-5" /> Cancel
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleBulkDeleteAction}
                            className="h-11 rounded-xl flex-1 border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-900 shadow-sm text-base font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-amber-300 sm:flex-none transition-colors"
                        >
                            <Trash2 className="mr-2 size-5" /> Delete Selected
                        </Button>
                    </div>
                </div>
            )}

            {/* Wrapped Card in id="printable-area" */}
            <Card id="printable-area" className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-200 print:shadow-none print:border-none print:rounded-none">

                {/* Print Only Header */}
                <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                        {userType === 'teachers' ? 'Registered Teachers & Staff' : 'Registered Parents'}
                    </h1>
                    <p className="text-base font-bold text-slate-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* TOOLBAR */}
                <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 lg:flex-row lg:items-center lg:justify-between transition-colors print:hidden">

                    {/* LEFT: Search & Filters Popover */}
                    <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-center">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-1/2 -translate-y-1/2 left-4 size-5 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder={`Search ${userType === 'teachers' ? 'teachers' : 'parents'}...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 text-base rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 dark:text-white dark:placeholder:text-slate-500 pl-12 pr-10 font-medium shadow-sm transition-colors w-full"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                                    <XCircle className="size-5" />
                                </button>
                            )}
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="h-12 text-base rounded-xl w-full border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 sm:w-auto font-bold shadow-sm transition-colors"
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
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Narrow down the user list.</p>
                                    </div>
                                    <div className="space-y-5 pt-2">
                                        <div className="space-y-2.5">
                                            <Label className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Center Assignment</Label>
                                            <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                                                <SelectTrigger className="h-12 text-base rounded-xl w-full font-medium dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200 transition-colors">
                                                    <SelectValue placeholder="All Centers" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                    <SelectItem value="all" className="rounded-lg text-base font-medium py-2.5">All Centers</SelectItem>
                                                    {daycareList.map((daycare: any, index) => {
                                                        const dcName = typeof daycare === 'string' ? daycare : daycare.name;
                                                        return <SelectItem key={index} value={dcName} className="rounded-lg text-base font-medium py-2.5">{dcName}</SelectItem>;
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2.5">
                                            <Label className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Account Status</Label>
                                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                                <SelectTrigger className="h-12 text-base rounded-xl w-full font-medium dark:bg-zinc-950 dark:border-slate-800 dark:text-slate-200 transition-colors">
                                                    <SelectValue placeholder="All Statuses" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                                    <SelectItem value="all" className="rounded-lg text-base font-medium py-2.5">All Statuses</SelectItem>
                                                    <SelectItem value="Active" className="rounded-lg text-base font-medium py-2.5">Active</SelectItem>
                                                    {userType === 'parents' && <SelectItem value="Pending" className="rounded-lg text-base font-medium py-2.5">Pending</SelectItem>}
                                                    <SelectItem value="Inactive" className="rounded-lg text-base font-medium py-2.5">Inactive</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    {activeFilterCount > 0 && (
                                        <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
                                            <Button
                                                variant="ghost"
                                                className="h-12 rounded-xl w-full font-bold text-base text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                                onClick={clearFilters}
                                            >
                                                <X className="mr-2 size-5" /> Clear All Filters
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* RIGHT: Action Buttons */}
                    <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
                        <Button
                            variant="outline"
                            className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-5 font-bold shadow-sm sm:flex-none transition-colors"
                            onClick={onExport}
                        >
                            <Download className="size-5" /> <span className="truncate">Export</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 text-base rounded-xl flex-1 gap-2 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 px-5 font-bold shadow-sm sm:flex-none transition-colors hidden sm:flex"
                            onClick={handlePrint} // 🚀 Updated this line!
                        >
                            <Printer className="size-5" /> <span className="truncate">Print</span>
                        </Button>

                        {userType === 'teachers' && onAddTeacher && (
                            <Button
                                className="h-12 text-base rounded-xl flex-1 gap-2 bg-indigo-600 dark:bg-indigo-600 px-5 font-bold text-white shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 sm:flex-none transition-colors"
                                onClick={onAddTeacher}
                            >
                                <UserPlus className="size-5" /> <span className="truncate">Add CDW / Teacher</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* TABLE CONTENT */}
                <CardContent className="min-h-[530px] p-0 overflow-x-auto custom-scrollbar print:overflow-visible">
                    <Table className="min-w-[950px] table-fixed w-full print:min-w-0 print:table-auto">
                        <TableHeader className="bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                            <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-slate-100 dark:border-slate-800">
                                <TableHead className="w-[5%] pl-6 align-middle sm:pl-8 print:hidden">
                                    <Checkbox
                                        checked={users.length > 0 && selectedUsers.size === users.length}
                                        onCheckedChange={handleToggleAll}
                                        aria-label="Select all rows"
                                        className="size-5"
                                    />
                                </TableHead>
                                <TableHead className="w-[28%] py-5 pl-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Profile</TableHead>
                                <TableHead className="w-[30%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Contact Details</TableHead>
                                <TableHead className="w-[20%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Center Assignment</TableHead>
                                <TableHead className="w-[12%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Status</TableHead>
                                <TableHead className="w-[5%] pr-6 print:hidden"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors print:divide-slate-300">
                            {users.length === 0 ? (
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent print:hidden">
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="rounded-2xl bg-white dark:bg-zinc-800 p-5 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                                                <Search className="size-10 text-slate-400 dark:text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-black text-slate-900 dark:text-white transition-colors">No records found</p>
                                                <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Try adjusting your filters or search query.</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        className={`group transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 border-slate-100 dark:border-slate-800 ${selectedUsers.has(user.id) ? 'bg-indigo-50/40 dark:bg-indigo-500/10' : ''}`}
                                    >
                                        <TableCell className="py-4 pl-6 sm:py-5 sm:pl-8 print:hidden">
                                            <Checkbox
                                                checked={selectedUsers.has(user.id)}
                                                onCheckedChange={() => handleToggleUser(user.id)}
                                                className="size-5"
                                            />
                                        </TableCell>

                                        <TableCell className="py-4 pl-2 pr-4 print:whitespace-normal">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="size-14 shadow-sm border border-indigo-100 dark:border-indigo-500/30 transition-colors rounded-xl shrink-0 print:hidden">
                                                    <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold text-lg rounded-xl">
                                                        {user.first_name?.[0] || user.firstName?.[0] || ''}{user.last_name?.[0] || user.lastName?.[0] || ''}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-base font-bold text-slate-900 dark:text-slate-100 truncate print:whitespace-normal transition-colors">
                                                        {getFullName(user)}
                                                    </span>
                                                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 transition-colors mt-0.5">
                                                        {userType === 'teachers' ? 'CDW / Teacher' : 'Parent / Guardian'}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-4 print:whitespace-normal">
                                            <div className="flex flex-col gap-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium transition-colors">
                                                <div className="flex items-center gap-2.5 truncate print:whitespace-normal"><Mail className="size-4 text-slate-400 dark:text-slate-500 shrink-0" /> <span className="truncate print:whitespace-normal">{user.email}</span></div>
                                                <div className="flex items-center gap-2.5"><Phone className="size-4 text-slate-400 dark:text-slate-500 shrink-0" /> {formatDisplayPhone(user.phone)}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 pr-4 print:whitespace-normal">
                                            <div className="flex items-center gap-2.5 text-base font-bold text-slate-700 dark:text-slate-200 truncate print:whitespace-normal transition-colors">
                                                <School className="size-5 text-indigo-400 dark:text-indigo-500 shrink-0 transition-colors print:hidden" />
                                                <span className="truncate print:whitespace-normal">{getDaycareName(user)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">{getStatusBadge(user.status)}</TableCell>
                                        <TableCell className="py-4 pr-6 text-right print:hidden">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="size-11 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                                                        <MoreVertical className="size-6" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-60 p-2 rounded-xl dark:bg-zinc-900 dark:border-slate-800 transition-colors shadow-xl">
                                                    <DropdownMenuLabel className="text-[11px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase py-2">Manage Record</DropdownMenuLabel>
                                                    {userType === 'parents' && user.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onApprove?.(user.id)} className="cursor-pointer py-3 rounded-lg text-base font-medium text-emerald-600 dark:text-emerald-400 focus:text-emerald-700 dark:focus:text-emerald-300 dark:focus:bg-zinc-800 transition-colors"><Check className="mr-3 size-5" /> Approve Account</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onReject?.(user.id)} className="cursor-pointer py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 dark:focus:bg-zinc-800 transition-colors"><X className="mr-3 size-5" /> Reject Account</DropdownMenuItem>
                                                            <DropdownMenuSeparator className="dark:bg-slate-800 mb-1" />
                                                        </>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onEdit?.(user)} className="cursor-pointer py-3 rounded-lg text-base font-medium dark:text-slate-200 dark:focus:bg-zinc-800 transition-colors"><Edit className="mr-3 size-5 text-slate-400 dark:text-slate-500" /> Edit Details</DropdownMenuItem>
                                                    <DropdownMenuSeparator className="dark:bg-slate-800 my-1" />
                                                    <DropdownMenuItem onClick={() => onDelete?.(user.id)} className="cursor-pointer py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-300 transition-colors"><Trash2 className="mr-3 size-5" /> Delete Account</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* MATCHING FOOTER & PAGINATION */}
                {(users.length > 0 || isInitialMount.current === false) && (
                    <div className="flex flex-col items-center justify-between gap-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 p-6 sm:flex-row sm:px-8 transition-colors print:hidden">
                        <div className="text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                            {searchQuery !== '' || filterStatus !== 'all' || filterDaycare !== 'all' ? `Found ` : `Showing `}
                            <span className="font-bold text-slate-900 dark:text-white">{pagination?.from || 0}</span> to{' '}
                            <span className="font-bold text-slate-900 dark:text-white">{pagination?.to || 0}</span> of{' '}
                            <span className="font-bold text-slate-900 dark:text-white">{pagination?.total || 0}</span> records
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!pagination?.links?.[0]?.url}
                                onClick={() => pagination?.links?.[0]?.url && router.get(pagination.links[0].url, {}, { preserveState: true, preserveScroll: true })}
                                className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft className="size-6" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!pagination?.links?.[pagination.links.length - 1]?.url}
                                onClick={() => pagination?.links?.[pagination.links.length - 1]?.url && router.get(pagination.links[pagination.links.length - 1].url, {}, { preserveState: true, preserveScroll: true })}
                                className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight className="size-6" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

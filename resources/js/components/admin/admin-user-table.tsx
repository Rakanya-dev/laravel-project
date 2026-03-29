import { router } from '@inertiajs/react';
import { Check, Download, Edit, MoreVertical, Search, Trash2, X, School, Mail, Phone, ShieldAlert, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { User } from './admin-user-management';

interface AdminUsersTableProps {
    users: User[];
    userType: 'teachers' | 'parents';
    daycareList: any[];
    pagination?: { total: number; from: number; to: number; links: any[] };
    onApprove?: (userId: number) => void;
    onReject?: (userId: number) => void;
    onEdit?: (user: User) => void;
    onDelete?: (userId: number) => void;
    onExport?: () => void;
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
}: AdminUsersTableProps) {
    const urlParams = new URLSearchParams(window.location.search);
    const [searchQuery, setSearchQuery] = useState(urlParams.get('search') || '');
    const [filterStatus, setFilterStatus] = useState<string>(urlParams.get('status') || 'all');
    const [filterDaycare, setFilterDaycare] = useState<string>(urlParams.get('daycare') || 'all');

    const isInitialMount = useRef(true);

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

    const getFullName = (user: User) => {
        const first = user.first_name || user.firstName || '';
        const middle = user.middle_name || user.middleName || '';
        const last = user.last_name || user.lastName || '';
        return `${first} ${middle ? middle + ' ' : ''}${last}`.trim();
    };

    const getDaycareName = (user: User) => {
        // 1. Is it the new clean string from our Laravel Accessor?
        if (typeof user.daycare === 'string') {
            // If the backend sent 'Unassigned', let's make it look nice
            if (user.daycare === 'Unassigned') {
                return <span className="text-slate-400 italic">Unassigned</span>;
            }
            return user.daycare;
        }

        // 2. Just in case it comes through as the old object format
        if (user.daycare && typeof user.daycare === 'object' && 'name' in user.daycare) {
            return user.daycare.name;
        }

        // 3. The absolute fallback
        return <span className="text-slate-400 italic">Unassigned</span>;
    };

    const formatDisplayPhone = (phone?: string) => {
        if (!phone) return 'N/A';
        let clean = phone.replace(/\D/g, '');

        if (clean.startsWith('63')) clean = clean.substring(2);
        else if (clean.startsWith('0')) clean = clean.substring(1);

        if (clean.length >= 10) {
            // 🚀 Changed to 63+
            return `+63 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 10)}`;
        }
        return phone;
    };

    const getStatusBadge = (status: string) => {
        const s = status?.toLowerCase() || 'unknown';
        switch (s) {
            case 'pending': return <Badge className="border-amber-200 bg-amber-50 text-amber-700 uppercase tracking-widest text-[10px] font-bold">Pending</Badge>;
            case 'active': return <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 uppercase tracking-widest text-[10px] font-bold">Active</Badge>;
            case 'rejected':
            case 'inactive': return <Badge className="border-red-200 bg-red-50 text-red-700 uppercase tracking-widest text-[10px] font-bold">{status}</Badge>;
            default: return <Badge className="border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-widest text-[10px] font-bold">{status}</Badge>;
        }
    };

    const isFiltering = searchQuery !== '' || filterStatus !== 'all' || filterDaycare !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setFilterStatus('all');
        setFilterDaycare('all');
    };

    return (
        <div className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col xl:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search entire database by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 w-full"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <XCircle className="size-4" />
                        </button>
                    )}
                </div>

                <div className="flex w-full xl:w-auto items-center gap-2 overflow-x-auto pb-2 xl:pb-0">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 min-w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                        <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 min-w-[180px] max-w-[250px]">
                            <SelectValue placeholder="Daycare Center" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Centers</SelectItem>
                            {daycareList.map((daycare: any, index) => {
                                const dcName = typeof daycare === 'string' ? daycare : daycare.name;
                                return <SelectItem key={index} value={dcName}>{dcName}</SelectItem>;
                            })}
                        </SelectContent>
                    </Select>

                    {isFiltering && (
                        <Button variant="ghost" onClick={clearFilters} className="h-11 px-3 text-slate-500 hover:text-red-600 rounded-xl">
                            Clear
                        </Button>
                    )}

                    <div className="h-8 w-px bg-slate-200 mx-1 hidden xl:block"></div>

                    <Button variant="outline" className="gap-2 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0" onClick={onExport}>
                        <Download className="size-4" />
                        Export
                    </Button>
                </div>
            </div>

            <div className="px-1 text-sm font-medium text-slate-500">
                {isFiltering
                    ? `Found ${pagination?.total || 0} matching records in database.`
                    : `Showing ${pagination?.from || 0} to ${pagination?.to || 0} of ${pagination?.total || 0} total records.`
                }
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm min-h-[500px] flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <Table className="min-w-[900px] table-fixed">
                        <TableHeader className="bg-slate-50 border-b border-slate-100">
                            <TableRow>
                                <TableHead className="w-[30%] py-4 pl-6 text-xs font-bold uppercase tracking-widest text-slate-500">Profile</TableHead>
                                <TableHead className="w-[30%] py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Contact Details</TableHead>
                                <TableHead className="w-[20%] py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Center Assignment</TableHead>
                                <TableHead className="w-[15%] py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                                <TableHead className="w-[5%] pr-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <ShieldAlert className="mb-3 size-10 opacity-20" />
                                            <p className="text-base font-bold text-slate-600">No records found</p>
                                            <Button variant="link" onClick={clearFilters} className="mt-1 text-indigo-600">Clear all filters</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} className="group h-16 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-3 pl-6 truncate pr-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm shadow-inner shrink-0">
                                                    {user.first_name?.[0] || user.firstName?.[0] || ''}{user.last_name?.[0] || user.lastName?.[0] || ''}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="font-bold text-slate-900 truncate">{getFullName(user)}</span>
                                                    <span className="text-xs font-medium text-slate-500 capitalize">{userType === 'teachers' ? 'CDW / Teacher' : 'Parent / Guardian'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 truncate pr-4">
                                            <div className="flex flex-col gap-1 text-xs text-slate-600 font-medium">
                                                <div className="flex items-center gap-2 truncate"><Mail className="size-3.5 text-slate-400 shrink-0" /> <span className="truncate">{user.email}</span></div>
                                                {/* 🚀 APPLIED FORMATTER RIGHT HERE */}
                                                <div className="flex items-center gap-2"><Phone className="size-3.5 text-slate-400 shrink-0" /> {formatDisplayPhone(user.phone)}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 truncate pr-4">
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 truncate">
                                                <School className="size-4 text-indigo-400 shrink-0" />
                                                <span className="truncate">{getDaycareName(user)}</span>
                                            </div>
                                        </td>
                                        <td className="py-3">{getStatusBadge(user.status)}</td>
                                        <td className="py-3 pr-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700"><MoreVertical className="size-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                    {userType === 'parents' && user.status?.toLowerCase() === 'pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => onApprove?.(user.id)} className="cursor-pointer font-medium text-emerald-600 focus:text-emerald-700"><Check className="mr-2 size-4" /> Approve Account</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => onReject?.(user.id)} className="cursor-pointer font-medium text-red-600 focus:text-red-700"><X className="mr-2 size-4" /> Reject Account</DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                        </>
                                                    )}
                                                    <DropdownMenuItem onClick={() => onEdit?.(user)} className="cursor-pointer font-medium"><Edit className="mr-2 size-4 text-slate-400" /> Edit Details</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => onDelete?.(user.id)} className="cursor-pointer font-medium text-red-600 focus:bg-red-50 focus:text-red-700"><Trash2 className="mr-2 size-4" /> Delete Account</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

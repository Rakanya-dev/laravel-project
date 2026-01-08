import { Check, Download, Edit, Filter, MoreVertical, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface User {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    daycare: string;
    status: string;
    role: string;
}

interface AdminUsersTableProps {
    users: User[];
    userType: 'teachers' | 'parents';
    daycareList: string[];
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
    onApprove = () => {},
    onReject = () => {},
    onEdit = () => {},
    onDelete = () => {},
    onExport = () => {},
}: AdminUsersTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const getFullName = (user: User) => {
        return `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();
    };

    const filteredUsers = users.filter((user) => {
        const fullName = getFullName(user);
        const matchesSearch =
            fullName.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        const matchesDaycare = filterDaycare === 'all' || user.daycare === filterDaycare;

        return matchesSearch && matchesStatus && matchesDaycare;
    });

    const getStatusBadge = (status: string) => {
        const s = status.toLowerCase();

        switch (s) {
            case 'pending':
                return <Badge className="border-[#ffee8e] bg-[#fefbe9] text-[#a56105]">Pending</Badge>;
            case 'active':
                return <Badge className="border-[#bfdbfe] bg-blue-50 text-[#1d4ed8]">Active</Badge>;
            case 'rejected':
                return <Badge className="border-[#fecaca] bg-red-50 text-[#dc2626]">Rejected</Badge>;
            default:
                return <Badge className="border-[#baf7d1] bg-green-50 text-[#27815f]">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400" />
                    <Input
                        placeholder={`Search ${userType} by name or email...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <Button variant="outline" className="gap-2" onClick={() => setIsFilterOpen(true)}>
                        <Filter className="size-4" />
                        Filters
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Filter Users</DialogTitle>
                            <DialogDescription>Filter {userType} by status and daycare</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm">Status</label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm">Daycare Center</label>
                                <Select value={filterDaycare} onValueChange={setFilterDaycare}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Daycares</SelectItem>
                                        {daycareList.map((daycare, index) => (
                                            <SelectItem key={index} value={daycare}>
                                                {daycare}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFilterOpen(false)}>
                                Close
                            </Button>
                            <Button onClick={() => setIsFilterOpen(false)}>Apply</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button variant="outline" className="gap-2" onClick={onExport}>
                    <Download className="size-4" />
                    Export CSV
                </Button>
            </div>

            {/* Results count */}
            <p className="text-sm text-neutral-500">
                Showing {filteredUsers.length} of {users.length} {userType}
            </p>

            {/* Users Table */}
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Assigned Daycare</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center text-neutral-500">
                                    {searchQuery ? 'No users found matching your search' : `No ${userType} yet`}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{getFullName(user)}</TableCell>
                                    <TableCell className="text-neutral-500">{user.email}</TableCell>
                                    <TableCell className="text-neutral-500">{user.daycare}</TableCell>
                                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {userType === 'parents' && user.status.toLowerCase() === 'pending' && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => onApprove(user.id)}>
                                                            <Check className="mr-2 size-4 text-green-600" />
                                                            Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onReject(user.id)}>
                                                            <X className="mr-2 size-4 text-red-600" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                    </>
                                                )}
                                                <DropdownMenuItem onClick={() => onEdit(user)}>
                                                    <Edit className="mr-2 size-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-red-600">
                                                    <Trash2 className="mr-2 size-4" />
                                                    Delete
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
        </div>
    );
}

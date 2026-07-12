import { useState } from 'react';
import { router } from '@inertiajs/react';
import AddTeacherDialog, { NewTeacher } from './add-teacher-dialog';
import AdminUsersTable from './admin-user-table';
import EditUserDialog from './edit-user-dialog';
import UserActionDialogs from './user-action-dialog';
import { toast } from 'sonner';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Users, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export interface User {
    id: number;
    firstName?: string;
    first_name?: string;
    middleName?: string;
    middle_name?: string;
    lastName?: string;
    last_name?: string;
    email: string;
    phone: string;
    daycare: any;
    status: string;
    role: string;
    childName?: string;
}

interface AdminUserManagementProps {
    teachers: any;
    parents: any;
    daycareList: string[];
    onAddTeacher: (teacher: NewTeacher) => void;
    onEditParent: (parent: User) => void;
    onEditTeacher: (teacher: User) => void;
    onDeleteUser: (userId: number, userType: 'teachers' | 'parents') => void;
    onBulkDeleteUsers?: (userIds: number[], userType: 'teachers' | 'parents') => void;
    onExportData: (userType: 'teachers' | 'parents') => void;
}

export default function AdminUserManagement({
    teachers,
    parents,
    daycareList,
    onAddTeacher,
    onEditParent,
    onEditTeacher,
    onDeleteUser,
    onBulkDeleteUsers,
    onExportData,
}: AdminUserManagementProps) {
    const [userTab, setUserTab] = useState<'teachers' | 'parents'>('teachers');

    const currentUsers = userTab === 'teachers' ? (teachers?.data || []) : (parents?.data || []);
    const currentPagination = userTab === 'teachers' ? teachers : parents;

    const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
    const [isEditParentOpen, setIsEditParentOpen] = useState(false);
    const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
    const [editingParent, setEditingParent] = useState<User | null>(null);
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);

    // Single User Delete State
    const [selectedUserForAction, setSelectedUserForAction] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'delete' | null>(null);

    // Bulk Delete State
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
    const [usersToBulkDelete, setUsersToBulkDelete] = useState<number[]>([]);

    const handleDelete = (userId: number) => {
        setSelectedUserForAction(userId);
        setActionType('delete');
    };

    // Opens the beautiful custom modal
    const handleBulkDeleteRequest = (userIds: number[]) => {
        setUsersToBulkDelete(userIds);
        setIsBulkDeleteDialogOpen(true);
    };

    // Executes the bulk delete after confirmation
    const executeBulkDelete = () => {
        if (onBulkDeleteUsers) {
            onBulkDeleteUsers(usersToBulkDelete, userTab);
            setIsBulkDeleteDialogOpen(false);
            setUsersToBulkDelete([]);
        } else {
            router.post(route('admin.users.bulk-delete'), { ids: usersToBulkDelete, type: userTab }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${usersToBulkDelete.length} users deleted successfully.`);
                    setIsBulkDeleteDialogOpen(false);
                    setUsersToBulkDelete([]);
                },
                onError: () => toast.error('Failed to delete selected users.')
            });
        }
    };

    const handleEdit = (user: User) => {
        if (userTab === 'parents') {
            setEditingParent(user);
            setIsEditParentOpen(true);
        } else {
            setEditingTeacher(user);
            setIsEditTeacherOpen(true);
        }
    };

    const confirmAction = () => {
        if (!selectedUserForAction || !actionType) return;
        if (actionType === 'delete') onDeleteUser(selectedUserForAction, userTab);
        setSelectedUserForAction(null);
        setActionType(null);
    };

    return (
        <div className="space-y-6 sm:space-y-8 transition-colors duration-200">

            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between print:hidden">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                        Staff & Users
                    </h2>
                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1 transition-colors">
                        Manage Child Development Workers and Parents across all centers.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={userTab} onValueChange={(val) => setUserTab(val as 'teachers' | 'parents')} className="w-full">
                <div className="mb-6 flex items-center justify-between print:hidden">
                    <TabsList className="grid w-full sm:w-[500px] h-14 grid-cols-2 dark:bg-zinc-900/50 p-1.5 transition-colors rounded-2xl border border-slate-200 dark:border-slate-800 bg-white">
                        <TabsTrigger
                            value="teachers"
                            className="text-base rounded-xl dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold h-full transition-all"
                        >
                            <UserCheck className="mr-2 size-5" /> CDWs / Teachers
                        </TabsTrigger>
                        <TabsTrigger
                            value="parents"
                            className="text-base rounded-xl dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-white font-bold h-full transition-all"
                        >
                            <Users className="mr-2 size-5" /> Parents
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Table Area */}
                <AdminUsersTable
                    users={currentUsers}
                    userType={userTab}
                    daycareList={daycareList}
                    pagination={currentPagination}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onBulkDelete={handleBulkDeleteRequest}
                    onExport={() => onExportData(userTab)}
                    onAddTeacher={() => setIsAddTeacherOpen(true)}
                />
            </Tabs>

            {/* --- INTERACTIVE: Custom Bulk Delete Modal --- */}
            <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-xl shrink-0">
                                <AlertTriangle className="size-6" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Delete Selected Users</h2>
                        </div>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                            Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-200">{usersToBulkDelete.length}</strong> selected users? This action cannot be undone and will permanently remove their data from the system.
                        </p>
                    </div>
                    <div className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsBulkDeleteDialogOpen(false)}
                            className="rounded-xl font-bold h-11 px-6 w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={executeBulkDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white rounded-xl font-bold h-11 px-6 shadow-sm w-full sm:w-auto transition-colors"
                        >
                            Yes, Delete Users
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Other Modals */}
            <AddTeacherDialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen} daycareList={daycareList} onSave={(t) => { onAddTeacher(t); setIsAddTeacherOpen(false); }} />
            <EditUserDialog open={isEditParentOpen} onOpenChange={setIsEditParentOpen} user={editingParent} userType="parent" daycareList={daycareList} onUserChange={setEditingParent} onSave={() => { if (editingParent) onEditParent(editingParent); setIsEditParentOpen(false); }} />
            <EditUserDialog open={isEditTeacherOpen} onOpenChange={setIsEditTeacherOpen} user={editingTeacher} userType="teacher" daycareList={daycareList} onUserChange={setEditingTeacher} onSave={() => { if (editingTeacher) onEditTeacher(editingTeacher); setIsEditTeacherOpen(false); }} />
            <UserActionDialogs actionType={actionType} isOpen={selectedUserForAction !== null && actionType !== null} onOpenChange={(open) => { if (!open) { setSelectedUserForAction(null); setActionType(null); } }} onConfirm={confirmAction} />
        </div>
    );
}

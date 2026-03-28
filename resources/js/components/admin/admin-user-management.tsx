import { ChevronLeft, ChevronRight, Plus, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';
import Pagination from '../shared/pagination';
import { Button } from '../ui/button';
import AddTeacherDialog, { NewTeacher } from './add-teacher-dialog';
import AdminUsersTable from './admin-user-table';
import EditUserDialog from './edit-user-dialog';
import UserActionDialogs from './user-action-dialog';
import { router } from '@inertiajs/react';


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
    teachers: any; // 🚀 Accept the full Laravel Paginator object
    parents: any;  // 🚀 Accept the full Laravel Paginator object
    daycareList: string[];
    onAddTeacher: (teacher: NewTeacher) => void;
    onEditParent: (parent: User) => void;
    onEditTeacher: (teacher: User) => void;
    onDeleteUser: (userId: number, userType: 'teachers' | 'parents') => void;
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
    onExportData,
}: AdminUserManagementProps) {
    const [userTab, setUserTab] = useState<'teachers' | 'parents'>('teachers');

    // 🚀 THE FIX: Correctly extract the '.data' array from Laravel's paginator!
    const currentUsers = userTab === 'teachers' ? (teachers?.data || []) : (parents?.data || []);
    const currentPagination = userTab === 'teachers' ? teachers : parents;
    const currentLinks = currentPagination?.links || [];

    const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
    const [isEditParentOpen, setIsEditParentOpen] = useState(false);
    const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
    const [editingParent, setEditingParent] = useState<User | null>(null);
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
    const [selectedUserForAction, setSelectedUserForAction] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'delete' | null>(null);

    const handleDelete = (userId: number) => {
        setSelectedUserForAction(userId);
        setActionType('delete');
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
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
                        <Users className="size-6 text-indigo-600" />
                        ECCD User Management
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage Child Development Workers and Parents across all centers.
                    </p>
                </div>
                {userTab === 'teachers' && (
                    <Button
                        className="h-10 rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700"
                        onClick={() => setIsAddTeacherOpen(true)}
                    >
                        <UserPlus className="mr-2 size-4" />
                        Add CDW / Teacher
                    </Button>
                )}
            </div>

            <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-6 border-b border-slate-100 bg-slate-50/50 px-6 pt-4">
                    <button
                        onClick={() => setUserTab('teachers')}
                        className={`relative pb-3 text-sm font-bold tracking-wide transition-colors ${userTab === 'teachers'
                            ? 'border-b-2 border-indigo-600 text-indigo-700'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Child Development Workers
                    </button>
                    <button
                        onClick={() => setUserTab('parents')}
                        className={`relative pb-3 text-sm font-bold tracking-wide transition-colors ${userTab === 'parents'
                            ? 'border-b-2 border-indigo-600 text-indigo-700'
                            : 'text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        Parent Accounts
                    </button>
                </div>

                <div className="p-0">
                    <AdminUsersTable
                        users={currentUsers} // Now passing the clean array!
                        userType={userTab}
                        daycareList={daycareList}
                        pagination={currentPagination}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onExport={() => onExportData(userTab)}
                    />
                </div>
            </div>

            {/* 🚀 NEW: Minimalist < > Pagination */}
            <div className="mt-4 flex w-full items-center justify-end gap-3 pr-2">
                <span className="text-sm font-medium text-slate-500">
                    Page {currentPagination?.current_page || 1} of {currentPagination?.last_page || 1}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        disabled={!currentLinks[0]?.url}
                        onClick={() => currentLinks[0]?.url && router.get(currentLinks[0].url, {}, { preserveState: true, preserveScroll: true })}
                    >
                        <ChevronLeft className="size-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        disabled={!currentLinks[currentLinks.length - 1]?.url}
                        onClick={() => currentLinks[currentLinks.length - 1]?.url && router.get(currentLinks[currentLinks.length - 1].url, {}, { preserveState: true, preserveScroll: true })}
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>

            <AddTeacherDialog open={isAddTeacherOpen} onOpenChange={setIsAddTeacherOpen} daycareList={daycareList} onSave={(t) => { onAddTeacher(t); setIsAddTeacherOpen(false); }} />
            <EditUserDialog open={isEditParentOpen} onOpenChange={setIsEditParentOpen} user={editingParent} userType="parent" daycareList={daycareList} onUserChange={setEditingParent} onSave={() => { if (editingParent) onEditParent(editingParent); setIsEditParentOpen(false); }} />
            <EditUserDialog open={isEditTeacherOpen} onOpenChange={setIsEditTeacherOpen} user={editingTeacher} userType="teacher" daycareList={daycareList} onUserChange={setEditingTeacher} onSave={() => { if (editingTeacher) onEditTeacher(editingTeacher); setIsEditTeacherOpen(false); }} />
            <UserActionDialogs actionType={actionType} isOpen={selectedUserForAction !== null && actionType !== null} onOpenChange={(open) => { if (!open) { setSelectedUserForAction(null); setActionType(null); } }} onConfirm={confirmAction} />
        </div>
    );
}

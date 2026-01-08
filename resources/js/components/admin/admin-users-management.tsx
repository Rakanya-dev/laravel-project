import { Plus, Check, X, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import AddTeacherDialog, { NewTeacher } from './add-teacher-dialog';
import AdminUsersTable from './admin-user-table';
import EditUserDialog from './edit-user-dialog';
import UserActionDialogs from './user-action-dialog';

export interface User {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    daycare: string;
    status: string;
    role: string;
    childName?: string;
}

// Interface for Pending Requests
export interface PendingRequest {
    link_id: number;
    parent_first: string;
    parent_last: string;
    parent_email: string;
    child_first: string;
    child_last: string;
    created_at: string;
}

interface AdminUserManagementProps {
    teachers: User[];
    parents: User[];
    pendingRequests: PendingRequest[];
    daycareList: string[];
    onAddTeacher: (teacher: NewTeacher) => void;
    onEditParent: (parent: User) => void;
    onEditTeacher: (teacher: User) => void;
    onApproveRequest: (id: number) => void;
    onRejectRequest: (id: number) => void;
    onDeleteUser: (userId: number, userType: 'teachers' | 'parents') => void;
    onExportData: (userType: 'teachers' | 'parents') => void;
}

export default function AdminUserManagement({
    teachers,
    parents,
    pendingRequests,
    daycareList,
    onAddTeacher,
    onEditParent,
    onEditTeacher,
    onApproveRequest,
    onRejectRequest,
    onDeleteUser,
    onExportData,
}: AdminUserManagementProps) {
    const [userTab, setUserTab] = useState<'teachers' | 'parents' | 'pending'>('teachers');

    const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
    const [isEditParentOpen, setIsEditParentOpen] = useState(false);
    const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
    const [editingParent, setEditingParent] = useState<User | null>(null);
    const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
    const [selectedUserForAction, setSelectedUserForAction] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete' | null>(null);

    const currentUsers = userTab === 'teachers' ? teachers : parents;

    const handleApprove = (userId: number) => {
        setSelectedUserForAction(userId);
        setActionType('approve');
    };

    const handleReject = (userId: number) => {
        setSelectedUserForAction(userId);
        setActionType('reject');
    };

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

        switch (actionType) {
            case 'delete':
                if (userTab !== 'pending') {
                    onDeleteUser(selectedUserForAction, userTab);
                }
                break;
        }

        setSelectedUserForAction(null);
        setActionType(null);
    };

    const handleSaveParentEdit = () => {
        if (!editingParent) return;
        onEditParent(editingParent);
        setIsEditParentOpen(false);
        setEditingParent(null);
    };

    const handleSaveTeacherEdit = () => {
        if (!editingTeacher) return;
        onEditTeacher(editingTeacher);
        setIsEditTeacherOpen(false);
        setEditingTeacher(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-black text-2xl font-bold">User Management</h2>
                    <p className="text-neutral-600">Manage teachers and parents across all daycare centers</p>
                </div>
                {userTab === 'teachers' && (
                    <Button className="gap-2 bg-black hover:bg-black/90" onClick={() => setIsAddTeacherOpen(true)}>
                        <Plus className="size-4" />
                        Add Teacher
                    </Button>
                )}
            </div>

            {/* Users Table Card */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setUserTab('teachers')}
                            className={`pb-3 transition-colors text-sm font-medium ${userTab === 'teachers' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Teachers
                        </button>
                        <button
                            onClick={() => setUserTab('parents')}
                            className={`pb-3 transition-colors text-sm font-medium ${userTab === 'parents' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Parents
                        </button>

                        {/* PENDING TAB */}
                        <button
                            onClick={() => setUserTab('pending')}
                            className={`pb-3 transition-colors text-sm font-medium flex items-center gap-2 ${userTab === 'pending' ? 'border-b-2 border-black text-black' : 'text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Pending Requests
                            {pendingRequests.length > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                    {pendingRequests.length}
                                </Badge>
                            )}
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Render different content based on tab */}
                    {userTab === 'pending' ? (
                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-12 text-neutral-500 border rounded-lg bg-neutral-50 border-dashed">
                                    <Clock className="mx-auto h-10 w-10 text-neutral-300 mb-2" />
                                    <p>No pending registrations at the moment.</p>
                                </div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.link_id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-white shadow-sm gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold text-gray-900">{req.parent_first} {req.parent_last}</h4>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{req.parent_email}</span>
                                            </div>
                                            <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                                                <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-100">Requesting Access</span>
                                                <span>to child: <strong>{req.child_first} {req.child_last}</strong></span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                Registered: {new Date(req.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onRejectRequest(req.link_id)}
                                                className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4 mr-1" /> Reject
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => onApproveRequest(req.link_id)}
                                                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <Check className="w-4 h-4 mr-1" /> Approve
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <AdminUsersTable
                            users={currentUsers}
                            userType={userTab}
                            daycareList={daycareList}
                            onApprove={handleApprove}
                            onReject={handleReject}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onExport={() => onExportData(userTab)}
                        />
                    )}
                </CardContent>
            </Card>

            <AddTeacherDialog
                open={isAddTeacherOpen}
                onOpenChange={setIsAddTeacherOpen}
                daycareList={daycareList}
                onSave={(teacher) => {
                    onAddTeacher(teacher);
                    setIsAddTeacherOpen(false);
                }}
            />

            <EditUserDialog
                open={isEditParentOpen}
                onOpenChange={setIsEditParentOpen}
                user={editingParent}
                userType="parent"
                daycareList={daycareList}
                onUserChange={setEditingParent}
                onSave={handleSaveParentEdit}
            />

            <EditUserDialog
                open={isEditTeacherOpen}
                onOpenChange={setIsEditTeacherOpen}
                user={editingTeacher}
                userType="teacher"
                daycareList={daycareList}
                onUserChange={setEditingTeacher}
                onSave={handleSaveTeacherEdit}
            />

            <UserActionDialogs
                actionType={actionType}
                isOpen={selectedUserForAction !== null && actionType !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedUserForAction(null);
                        setActionType(null);
                    }
                }}
                onConfirm={confirmAction}
            />
        </div>
    );
}

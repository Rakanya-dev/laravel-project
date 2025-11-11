import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button'; // Adjust path if needed
import { Card, CardContent, CardHeader } from './ui/card'; // Adjust path if needed
import AdminUsersTable from './ui/admin-user-table';
import AddTeacherDialog, { NewTeacher } from './ui/add-teacher-dialog'; // NewTeacher is imported from here
import EditUserDialog from './ui/edit-user-dialog';
import UserActionDialogs from './ui/user-action-dialog';
import { toast } from 'sonner';

// --- THIS IS THE ONLY CHANGE ---
// Add 'export' so your page can import this type
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
}
// ------------------------------

interface AdminUserManagementProps {
  teachers: User[];
  parents: User[];
  daycareList: string[];
  onAddTeacher: (teacher: NewTeacher) => void; // Uses NewTeacher from import
  onEditParent: (parent: User) => void;
  onEditTeacher: (teacher: User) => void;
  onApproveParent: (parentId: number) => void;
  onRejectParent: (parentId: number) => void;
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
  onApproveParent,
  onRejectParent,
  onDeleteUser,
  onExportData,
}: AdminUserManagementProps) {
  const [userTab, setUserTab] = useState<'teachers' | 'parents'>('teachers');
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isEditParentOpen, setIsEditParentOpen] = useState(false);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editingParent, setEditingParent] = useState<User | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [selectedUserForAction, setSelectedUserForAction] = useState<number | null>(
    null,
  );
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'delete' | null
  >(null);

  const currentUsers = userTab === 'teachers' ? teachers : parents;

  const handleApprove = (userId: number) => {
    setSelectedUserForAction(userId);
    setActionType('approve');
  };

  const handleReject = (userId: number) => {
    setSelectedUserForAction(userId);
    setActionType('reject');
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

  const handleDelete = (userId: number) => {
    setSelectedUserForAction(userId);
    setActionType('delete');
  };

  const confirmAction = () => {
    if (!selectedUserForAction || !actionType) return;

    switch (actionType) {
      case 'approve':
        onApproveParent(selectedUserForAction);
        break;
      case 'reject':
        onRejectParent(selectedUserForAction);
        break;
      case 'delete':
        onDeleteUser(selectedUserForAction, userTab);
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
          <h2 className="text-black">User Management</h2>
          <p className="text-neutral-600">
            Manage teachers and parents across all daycare centers
          </p>
        </div>
        {userTab === 'teachers' && (
          <Button
            className="gap-2 bg-black hover:bg-black/90"
            onClick={() => setIsAddTeacherOpen(true)}
          >
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
              className={`pb-3 transition-colors ${
                userTab === 'teachers'
                  ? 'border-b-2 border-black'
                  : 'text-neutral-500'
              }`}
            >
              Teachers
            </button>
            <button
              onClick={() => setUserTab('parents')}
              className={`pb-3 transition-colors ${
                userTab === 'parents'
                  ? 'border-b-2 border-black'
                  : 'text-neutral-500'
              }`}
            >
              Parents
            </button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Add Teacher Dialog */}
      <AddTeacherDialog
        open={isAddTeacherOpen}
        onOpenChange={setIsAddTeacherOpen}
        daycareList={daycareList}
        onSave={(teacher) => {
          onAddTeacher(teacher);
          setIsAddTeacherOpen(false);
        }}
      />

      {/* Edit Parent Dialog */}
      <EditUserDialog
        open={isEditParentOpen}
        onOpenChange={setIsEditParentOpen}
        user={editingParent}
        userType="parent"
        daycareList={daycareList}
        onUserChange={setEditingParent}
        onSave={handleSaveParentEdit}
      />

      {/* Edit Teacher Dialog */}
      <EditUserDialog
        open={isEditTeacherOpen}
        onOpenChange={setIsEditTeacherOpen}
        user={editingTeacher}
        userType="teacher"
        daycareList={daycareList}
        onUserChange={setEditingTeacher}
        onSave={handleSaveTeacherEdit}
      />

      {/* Action Confirmation Dialogs */}
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

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';

interface UserActionDialogsProps {
  actionType: 'approve' | 'reject' | 'delete' | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function UserActionDialogs({
  actionType,
  isOpen,
  onOpenChange,
  onConfirm
}: UserActionDialogsProps) {
  const getDialogContent = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Parent Account',
          description: 'Are you sure you want to approve this parent account? They will be granted access to the parent dashboard and will be able to view their child\'s assessment records.',
          confirmText: 'Approve Account',
          confirmClass: 'bg-green-600 hover:bg-green-700'
        };
      case 'reject':
        return {
          title: 'Reject Parent Account',
          description: 'Are you sure you want to reject this parent account? The parent will be notified and will not be able to access the system. You can approve them later if needed.',
          confirmText: 'Reject Account',
          confirmClass: 'bg-red-600 hover:bg-red-700'
        };
      case 'delete':
        return {
          title: 'Delete User Account',
          description: 'Are you sure you want to permanently delete this user account? This action cannot be undone and all associated data will be removed.',
          confirmText: 'Delete Permanently',
          confirmClass: 'bg-red-600 hover:bg-red-700'
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();

  if (!content) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{content.title}</AlertDialogTitle>
          <AlertDialogDescription>{content.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={content.confirmClass}
            onClick={onConfirm}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

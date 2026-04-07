import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';

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
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm transition-colors',
          icon: <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />,
          iconBg: 'bg-emerald-100 dark:bg-emerald-500/20 ring-4 ring-white dark:ring-zinc-950'
        };
      case 'reject':
        return {
          title: 'Reject Parent Account',
          description: 'Are you sure you want to reject this parent account? The parent will be notified and will not be able to access the system. You can approve them later if needed.',
          confirmText: 'Reject Account',
          confirmClass: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white shadow-sm transition-colors',
          icon: <ShieldAlert className="size-6 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-100 dark:bg-rose-500/20 ring-4 ring-white dark:ring-zinc-950'
        };
      case 'delete':
        return {
          title: 'Delete User Account',
          description: 'Are you sure you want to permanently delete this user account? This action cannot be undone and all associated data will be removed.',
          confirmText: 'Delete Permanently',
          confirmClass: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white shadow-sm transition-colors',
          icon: <Trash2 className="size-6 text-red-600 dark:text-red-400" />,
          iconBg: 'bg-red-100 dark:bg-red-500/20 ring-4 ring-white dark:ring-zinc-950'
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();

  if (!content) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 sm:max-w-[425px] rounded-2xl p-6 shadow-2xl transition-colors duration-200">
        <AlertDialogHeader className="flex flex-col items-center text-center pb-2">
          <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-full shadow-sm ${content.iconBg}`}>
            {content.icon}
          </div>
          <AlertDialogTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col sm:flex-row justify-center gap-3 mt-4 sm:space-x-0">
          <AlertDialogCancel className="w-full sm:w-auto h-11 bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold transition-colors mt-0">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={`w-full sm:w-auto h-11 rounded-xl font-bold ${content.confirmClass}`}
            onClick={onConfirm}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

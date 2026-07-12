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
          confirmClass: 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500',
          icon: <CheckCircle2 className="size-6" strokeWidth={2.5} />,
          iconBg: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500'
        };
      case 'reject':
        return {
          title: 'Reject Parent Account',
          description: 'Are you sure you want to reject this parent account? The parent will be notified and will not be able to access the system. You can approve them later if needed.',
          confirmText: 'Reject Account',
          confirmClass: 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500',
          icon: <ShieldAlert className="size-6" strokeWidth={2.5} />,
          iconBg: 'bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-500'
        };
      case 'delete':
        return {
          title: 'Delete User Account',
          description: 'Are you sure you want to permanently delete this user account? This action cannot be undone and all associated data will be removed from the system.',
          confirmText: 'Delete Permanently',
          confirmClass: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500',
          icon: <Trash2 className="size-6" strokeWidth={2.5} />,
          iconBg: 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-500'
        };
      default:
        return null;
    }
  };

  const content = getDialogContent();

  if (!content) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors">

        {/* Main Content Area */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
            <AlertDialogHeader className="text-left">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-xl shrink-0 ${content.iconBg}`}>
                  {content.icon}
                </div>
                <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                  {content.title}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                {content.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
        </div>

        {/* Footer Area */}
        <AlertDialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
          <AlertDialogCancel className="h-11 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className={`h-11 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-white shadow-sm transition-colors m-0 ${content.confirmClass}`}
            onClick={onConfirm}
          >
            {content.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}

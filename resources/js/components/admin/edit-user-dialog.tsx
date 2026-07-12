import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User } from './admin-user-management';
import { Mail, Phone, School, UserPen, Save, X, Baby } from 'lucide-react';

import { formatPhoneNumber } from '@/utils/phone';

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  userType: 'parent' | 'teacher';
  daycareList: any[];
  onUserChange: (user: User) => void;
  onSave: () => void;
}

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  userType,
  daycareList,
  onUserChange,
  onSave
}: EditUserDialogProps) {

  useEffect(() => {
    if (user?.phone) {
      if (!user.phone.startsWith('63+') || !user.phone.includes(' ')) {
        const formatted = formatPhoneNumber(user.phone);
        if (formatted !== user.phone) {
          onUserChange({ ...user, phone: formatted });
        }
      }
    }
  }, [user?.id, open]);

  if (!user) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onUserChange({ ...user, phone: formatted });
  };

  const currentDaycareName = typeof user.daycare === 'string' ? user.daycare : (user.daycare?.name || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

        {/* Header - Synced with premium modal layouts */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                  <UserPen className="size-6" strokeWidth={2.5} />
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Edit {userType === 'parent' ? 'Parent / Guardian' : 'Teacher'}
                </DialogTitle>
              </div>
              <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                Update the contact details and center assignment.
              </DialogDescription>
            </DialogHeader>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

          {/* Linked Learner Context (Parents Only) */}
          {userType === 'parent' && (
            <div className="space-y-2.5 p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 transition-colors shadow-sm">
              <Label className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-[11px]">Linked Learner</Label>
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shrink-0 transition-colors">
                  <Baby className="size-5" />
                </div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg transition-colors">
                  {user.childName && user.childName !== 'No Child Linked' ? user.childName : (
                    <span className="text-slate-400 dark:text-slate-500 italic font-medium text-base">No child currently linked</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">First Name <span className="text-red-500">*</span></Label>
              <Input
                value={user.first_name || user.firstName || ''}
                onChange={(e) => onUserChange({ ...user, first_name: e.target.value, firstName: e.target.value })}
                placeholder="First name"
                className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Last Name <span className="text-red-500">*</span></Label>
              <Input
                value={user.last_name || user.lastName || ''}
                onChange={(e) => onUserChange({ ...user, last_name: e.target.value, lastName: e.target.value })}
                placeholder="Last name"
                className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Middle Name</Label>
            <Input
              value={user.middle_name || user.middleName || ''}
              onChange={(e) => onUserChange({ ...user, middle_name: e.target.value, middleName: e.target.value })}
              placeholder="Optional"
              className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Email Address <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                <Input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => onUserChange({ ...user, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-12 pl-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Phone Number <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                <Input
                  type="tel"
                  value={user.phone || ''}
                  onChange={handlePhoneChange}
                  placeholder="63+ 9XX XXX XXXX"
                  className="h-12 pl-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Placement */}
          <div className="space-y-2.5">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              {userType === 'parent' ? 'Linked Center' : 'Assigned Center'} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <School className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500 z-10" />
              <Select
                value={currentDaycareName}
                onValueChange={(value) => onUserChange({ ...user, daycare: value })}
              >
                <SelectTrigger className="h-12 pl-12 rounded-xl text-base bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white shadow-sm transition-colors">
                  <SelectValue placeholder="Select a center..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                  {daycareList.map((dc, index) => {
                    const dcName = typeof dc === 'string' ? dc : dc.name;
                    return (
                      <SelectItem
                        key={index}
                        value={dcName}
                        className="text-base font-medium rounded-lg py-2.5 dark:focus:bg-zinc-800 dark:text-slate-200 cursor-pointer transition-colors"
                      >
                        {dcName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
          <Button
            type="button"
            variant="ghost"
            className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="mr-2 size-5" /> Cancel
          </Button>
          <Button
            type="button"
            className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
            onClick={onSave}
          >
            <Save className="mr-2 size-5" /> Save Changes
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

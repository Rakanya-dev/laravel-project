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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl transition-colors duration-200">

        <DialogHeader className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-zinc-900/80 transition-colors">
          <DialogTitle className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            <UserPen className="size-6 text-indigo-600 dark:text-indigo-400" />
            Edit {userType === 'parent' ? 'Parent / Guardian' : 'Teacher'}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Update the contact details and center assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin">

          {/* Linked Learner Context */}
          {userType === 'parent' && (
            <div className="space-y-2 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 transition-colors">
              <Label className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-[10px]">Linked Learner</Label>
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Baby className="size-5" />
                </div>
                <div className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                  {user.childName && user.childName !== 'No Child Linked' ? user.childName : (
                    <span className="text-slate-400 dark:text-slate-500 italic font-medium">No child currently linked</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300">First Name <span className="text-red-500 dark:text-rose-400">*</span></Label>
              <Input
                value={user.first_name || user.firstName || ''}
                onChange={(e) => onUserChange({ ...user, first_name: e.target.value, firstName: e.target.value })}
                placeholder="First name"
                className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300">Last Name <span className="text-red-500 dark:text-rose-400">*</span></Label>
              <Input
                value={user.last_name || user.lastName || ''}
                onChange={(e) => onUserChange({ ...user, last_name: e.target.value, lastName: e.target.value })}
                placeholder="Last name"
                className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700 dark:text-slate-300">Middle Name</Label>
            <Input
              value={user.middle_name || user.middleName || ''}
              onChange={(e) => onUserChange({ ...user, middle_name: e.target.value, middleName: e.target.value })}
              placeholder="Optional"
              className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500 dark:text-rose-400">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                <Input
                  type="email"
                  value={user.email || ''}
                  onChange={(e) => onUserChange({ ...user, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500 dark:text-rose-400">*</span></Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                <Input
                  type="tel"
                  value={user.phone || ''}
                  onChange={handlePhoneChange}
                  placeholder="63+ 9XX XXX XXXX"
                  className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Placement */}
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 dark:text-slate-300">
              {userType === 'parent' ? 'Linked Center' : 'Assigned Center'} <span className="text-red-500 dark:text-rose-400">*</span>
            </Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500 z-10" />
              <Select
                value={currentDaycareName}
                onValueChange={(value) => onUserChange({ ...user, daycare: value })}
              >
                <SelectTrigger className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors">
                  <SelectValue placeholder="Select a center..." />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                  {daycareList.map((dc, index) => {
                    const dcName = typeof dc === 'string' ? dc : dc.name;
                    return (
                      <SelectItem
                        key={index}
                        value={dcName}
                        className="font-medium dark:focus:bg-zinc-800 dark:text-slate-200"
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

        <DialogFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-zinc-900/80 flex flex-row justify-end items-center gap-3 transition-colors">
          <Button variant="ghost" className="h-11 px-5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors" onClick={() => onOpenChange(false)}>
            <X className="mr-2 size-4" /> Cancel
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-indigo-600 font-bold hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition-colors" onClick={onSave}>
            <Save className="mr-2 size-4" /> Save Changes
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

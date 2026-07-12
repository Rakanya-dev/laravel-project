import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import { Mail, Phone, School, UserPlus, Save, X } from 'lucide-react';

import { formatPhoneNumber } from '@/utils/phone';

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daycareList: string[];
  onSave: (teacher: NewTeacher) => void;
}

export interface NewTeacher {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  daycare: string;
  password: string;
  password_confirmation: string;
}

const DEFAULT_PASSWORD = 'password123';

export default function AddTeacherDialog({
  open,
  onOpenChange,
  daycareList,
  onSave
}: AddTeacherDialogProps) {
  const [teacher, setTeacher] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    daycare: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!teacher.firstName || !teacher.lastName || !teacher.email || !teacher.phone || !teacher.daycare) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const newTeacherWithPassword: NewTeacher = {
      ...teacher,
      password: DEFAULT_PASSWORD,
      password_confirmation: DEFAULT_PASSWORD
    };

    onSave(newTeacherWithPassword);

    setTeacher({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      daycare: ''
    });
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTeacher({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phone: '',
        daycare: ''
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">

        {/* Header - Synced with premium modal layouts */}
        <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                <UserPlus className="size-6" strokeWidth={2.5} />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Add New Teacher
              </DialogTitle>
            </div>
            <DialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
              Create a new CDW / Teacher account. Their default password will be{' '}
              <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-sm font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 ml-1 transition-colors">
                {DEFAULT_PASSWORD}
              </span>
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Scrollable Form Content */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Juan"
                  className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                  value={teacher.firstName}
                  onChange={(e) => setTeacher({ ...teacher, firstName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Dela Cruz"
                  className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                  value={teacher.lastName}
                  onChange={(e) => setTeacher({ ...teacher, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="middleName" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Middle Name
              </Label>
              <Input
                id="middleName"
                placeholder="Optional"
                className="h-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                value={teacher.middleName}
                onChange={(e) => setTeacher({ ...teacher, middleName: e.target.value })}
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@example.com"
                    className="h-12 pl-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                    value={teacher.email}
                    onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="63+ 9XX XXX XXXX"
                    className="h-12 pl-12 rounded-xl text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                    value={teacher.phone}
                    onChange={(e) => {
                      const formattedNumber = formatPhoneNumber(e.target.value);
                      setTeacher({ ...teacher, phone: formattedNumber });
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Placement */}
            <div className="space-y-2.5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Assigned Center <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500 z-10" />
                <Select
                  value={teacher.daycare}
                  onValueChange={(value) => setTeacher({ ...teacher, daycare: value })}
                  required
                >
                  <SelectTrigger className="h-12 pl-12 rounded-xl text-base bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white shadow-sm transition-colors">
                    <SelectValue placeholder="Select a center..." />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                    {daycareList.map((daycare) => (
                      <SelectItem
                        key={daycare}
                        value={daycare}
                        className="text-base font-medium rounded-lg py-2.5 dark:focus:bg-zinc-800 dark:text-slate-200 cursor-pointer transition-colors"
                      >
                        {daycare}
                      </SelectItem>
                    ))}
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
              onClick={() => handleOpenChange(false)}
            >
              <X className="mr-2 size-5" /> Cancel
            </Button>
            <Button
              type="submit"
              className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
            >
              <Save className="mr-2 size-5" /> Create Teacher
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';

// Make sure to adjust this import path to wherever your function is actually located!
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
      {/* Increased max-width for better dual-column breathing room */}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px] p-6 sm:p-8">

        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900">
            Add New Teacher
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-1.5 text-sm leading-relaxed">
            Create a new CDW / Teacher account. Their default password will be{' '}
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-bold text-slate-800 border border-slate-200 ml-1">
              {DEFAULT_PASSWORD}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

          {/* Row 1: First & Middle Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                First Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="firstName"
                placeholder="Juan"
                className="focus-visible:ring-indigo-500 transition-all"
                value={teacher.firstName}
                onChange={(e) => setTeacher({ ...teacher, firstName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="middleName" className="text-sm font-semibold text-slate-700">
                Middle Name <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="middleName"
                placeholder="Santos"
                className="focus-visible:ring-indigo-500 transition-all"
                value={teacher.middleName}
                onChange={(e) => setTeacher({ ...teacher, middleName: e.target.value })}
              />
            </div>
          </div>

          {/* Row 2: Last Name */}
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
              Last Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="lastName"
              placeholder="Dela Cruz"
              className="focus-visible:ring-indigo-500 transition-all"
              value={teacher.lastName}
              onChange={(e) => setTeacher({ ...teacher, lastName: e.target.value })}
              required
            />
          </div>

          {/* Row 3: Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email Address <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="juan.delacruz@example.com"
              className="focus-visible:ring-indigo-500 transition-all"
              value={teacher.email}
              onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
              required
            />
          </div>

          {/* Row 4: Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
              Phone Number <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+63 XXX XXX XXXX"
              className="focus-visible:ring-indigo-500 transition-all"
              value={teacher.phone}
              onChange={(e) => {
                // Apply the formatting function here
                const formattedNumber = formatPhoneNumber(e.target.value);
                setTeacher({ ...teacher, phone: formattedNumber });
              }}
              required
            />
          </div>

          {/* Row 5: Daycare Select */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">
              Assigned Center <span className="text-rose-500">*</span>
            </Label>
            <Select
              value={teacher.daycare}
              onValueChange={(value) => setTeacher({ ...teacher, daycare: value })}
              required
            >
              <SelectTrigger className="focus:ring-indigo-500 transition-all">
                <SelectValue placeholder="Select a daycare center..." />
              </SelectTrigger>
              <SelectContent>
                {daycareList.map((daycare) => (
                  <SelectItem key={daycare} value={daycare} className="cursor-pointer hover:bg-slate-50">
                    {daycare}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-6 border-t border-slate-100 mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
            >
              Create Teacher Account
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}

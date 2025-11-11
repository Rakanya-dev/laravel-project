import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { useState } from 'react';
import { toast } from 'sonner'; // Import toast for error messages

interface AddTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  daycareList: string[];
  onSave: (teacher: NewTeacher) => void;
}

// NOTE: This interface still includes password fields
// because the parent component (UsersManagement.tsx)
// needs them to send to the backend.
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

// --- Set your default password here ---
const DEFAULT_PASSWORD = 'daycare123';
// --------------------------------------

export default function AddTeacherDialog({
  open,
  onOpenChange,
  daycareList,
  onSave
}: AddTeacherDialogProps) {
  // --- FIX: State no longer includes password fields ---
  const [teacher, setTeacher] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    daycare: ''
  });

  const handleSave = () => {
    // Validate required fields
    if (!teacher.firstName || !teacher.lastName || !teacher.email || !teacher.phone || !teacher.daycare) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // --- FIX: Combine state with the default password ---
    const newTeacherWithPassword: NewTeacher = {
      ...teacher,
      password: DEFAULT_PASSWORD,
      password_confirmation: DEFAULT_PASSWORD
    };

    onSave(newTeacherWithPassword);

    // Reset form
    setTeacher({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      daycare: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Create a new teacher account. Their default password will be:
            <strong className="text-gray-900 dark:text-gray-100"> {DEFAULT_PASSWORD}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="First name"
                value={teacher.firstName}
                onChange={(e) => setTeacher({ ...teacher, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input
                placeholder="Middle name (optional)"
                value={teacher.middleName}
                onChange={(e) => setTeacher({ ...teacher, middleName: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Last Name <span className="text-red-500">*</span></Label>
            <Input
              placeholder="Last name"
              value={teacher.lastName}
              onChange={(e) => setTeacher({ ...teacher, lastName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              placeholder="Enter email address"
              value={teacher.email}
              onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number <span className="text-red-500">*</span></Label>
            <Input
              type="tel"
              placeholder="+63 XXX XXX XXXX"
              value={teacher.phone}
              onChange={(e) => setTeacher({ ...teacher, phone: e.target.value })}
            />
          </div>

          {/* --- FIX: Password fields are removed from the form --- */}

          <div className="space-y-2">
            <Label>Assigned Daycare <span className="text-red-500">*</span></Label>
            <Select
              value={teacher.daycare}
              onValueChange={(value) => setTeacher({ ...teacher, daycare: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select daycare center" />
              </SelectTrigger>
              <SelectContent>
                {daycareList.map((daycare, index) => (
                  <SelectItem key={index} value={daycare}>{daycare}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-black hover:bg-black/90" onClick={handleSave}>
            Create Teacher Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

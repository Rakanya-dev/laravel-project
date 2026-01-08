import { useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface User {
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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  userType: 'parent' | 'teacher';
  daycareList: string[];
  onUserChange: (user: User) => void;
  onSave: () => void;
}

const formatPhoneNumber = (value: string) => {
  if (!value) return '';

  // Remove all non-digits
  let cleanValue = value.replace(/\D/g, '');

  // If data comes from DB as "639...", strip the 63 so we can re-add it with +
  if (cleanValue.startsWith('63')) {
    cleanValue = cleanValue.substring(2);
  }

  // Also handle if it starts with "09" (common PH format)
  if (cleanValue.startsWith('09')) {
    cleanValue = cleanValue.substring(1);
  }

  // Formatting Logic
  if (cleanValue.length === 0) return '';

  if (cleanValue.length <= 3) {
    return `+63 ${cleanValue}`;
  } else if (cleanValue.length <= 6) {
    return `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3)}`;
  } else if (cleanValue.length <= 10) {
    return `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3, 6)} ${cleanValue.slice(6)}`;
  } else {
    // Limit to 10 digits (standard PH mobile)
    return `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3, 6)} ${cleanValue.slice(6, 10)}`;
  }
};

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
      // Check if it's already formatted to avoid infinite loops
      if (!user.phone.startsWith('+63') || !user.phone.includes(' ')) {
        const formatted = formatPhoneNumber(user.phone);
        // Only update if the format is actually different
        if (formatted !== user.phone) {
          onUserChange({ ...user, phone: formatted });
        }
      }
    }
  }, [user?.id, open]); // Run when user ID changes or dialog opens

  if (!user) return null;

  // 3. Update handler to use the helper function
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onUserChange({ ...user, phone: formatted });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {userType === 'parent' ? 'Parent' : 'Teacher'} Details</DialogTitle>
          <DialogDescription>Update the {userType}'s information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input
                value={user.firstName}
                onChange={(e) => onUserChange({ ...user, firstName: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input
                value={user.middleName}
                onChange={(e) => onUserChange({ ...user, middleName: e.target.value })}
                placeholder="Middle name (optional)"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Last Name <span className="text-red-500">*</span></Label>
            <Input
              value={user.lastName}
              onChange={(e) => onUserChange({ ...user, lastName: e.target.value })}
              placeholder="Last name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address <span className="text-red-500">*</span></Label>
            <Input
              type="email"
              value={user.email}
              onChange={(e) => onUserChange({ ...user, email: e.target.value })}
              placeholder="Email address"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number <span className="text-red-500">*</span></Label>
            <Input
              type="tel"
              value={user.phone}
              onChange={handlePhoneChange}
              placeholder="+63 9XX XXX XXXX"
            />
          </div>
          <div className="space-y-2">
            <Label>Assigned Daycare <span className="text-red-500">*</span></Label>
            <Select
              value={user.daycare}
              onValueChange={(value) => onUserChange({ ...user, daycare: value })}
            >
              <SelectTrigger>
                <SelectValue />
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
          <Button className="bg-black hover:bg-black/90" onClick={onSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

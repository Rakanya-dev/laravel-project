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

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  userType,
  daycareList,
  onUserChange,
  onSave
}: EditUserDialogProps) {
  if (!user) return null;

  const handlePhoneChange = (value: string) => {
    // Simple Philippine phone number formatting
    let cleanValue = value.replace(/\D/g, '');
    if (cleanValue.startsWith('63')) {
      cleanValue = cleanValue.slice(2);
    }
    if (cleanValue.length > 0) {
      if (cleanValue.length <= 3) {
        value = `+63 ${cleanValue}`;
      } else if (cleanValue.length <= 6) {
        value = `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3)}`;
      } else if (cleanValue.length <= 10) {
        value = `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3, 6)} ${cleanValue.slice(6)}`;
      } else {
        value = `+63 ${cleanValue.slice(0, 3)} ${cleanValue.slice(3, 6)} ${cleanValue.slice(6, 10)}`;
      }
    }
    onUserChange({ ...user, phone: value });
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
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+63 XXX XXX XXXX"
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

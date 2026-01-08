import { ArrowLeft, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Daycare } from '@/pages/admin/daycare-management';

interface DaycareEditFormProps {
    editingDaycare: Daycare;
    availableTeachers: string[];
    onSetEditingDaycare: React.Dispatch<React.SetStateAction<Daycare | null>>;
    onSave: (editedData: Daycare) => void;
    onCancel: () => void;
}

export default function DaycareEditForm({
    editingDaycare,
    availableTeachers,
    onSetEditingDaycare: setEditingDaycare,
    onSave,
    onCancel,
}: DaycareEditFormProps) {

    const setField = (field: keyof Daycare, value: string | number) => {
        setEditingDaycare((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Daycare) => {
        const value = parseInt(e.target.value) || 0;
        setField(field, value);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-black text-2xl font-semibold">Editing: {editingDaycare.name}</h2>
                <Button variant="ghost" onClick={onCancel} className="gap-2">
                    <ArrowLeft className="size-4" /> Cancel
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Daycare Name</Label>
                                <Input value={editingDaycare.name} onChange={(e) => setField('name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={editingDaycare.description || ''} onChange={(e) => setField('description', e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <Label>Established Date</Label>
                                <Input
                                    type="date"
                                    value={editingDaycare.established_date || ''}
                                    onChange={(e) => setField('established_date', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Location Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Street Address</Label>
                                <Input value={editingDaycare.address || ''} onChange={(e) => setField('address', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>City</Label><Input value={editingDaycare.city || ''} onChange={(e) => setField('city', e.target.value)} /></div>
                                <div className="space-y-2"><Label>Province</Label><Input value={editingDaycare.province || ''} onChange={(e) => setField('province', e.target.value)} /></div>

                                <div className="space-y-2">
                                    <Label>Postal Code</Label>
                                    <Input
                                        value={editingDaycare.postal_code || ''}
                                        onChange={(e) => setField('postal_code', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar (1/3 width) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Teacher Assignment</CardTitle></CardHeader>
                        <CardContent>
                            <Select
                                value={editingDaycare.principal_name || ''}
                                onValueChange={(value) => setField('principal_name', value)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                                <SelectContent>{availableTeachers.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Capacity Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Maximum Capacity</Label>
                                <Input type="number" value={editingDaycare.capacity.toString()} onChange={(e) => handleNumericChange(e, 'capacity')} />
                            </div>
                            <div className="space-y-2">
                                <Label>Current Students</Label>
                                <Input type="number" value={editingDaycare.current.toString()} onChange={(e) => handleNumericChange(e, 'current')} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6 space-y-3">
                            <Button className="w-full bg-black hover:bg-black/90" onClick={() => onSave(editingDaycare)}>
                                Save Changes
                            </Button>
                            <Button variant="outline" className="w-full" onClick={onCancel}>
                                Cancel
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

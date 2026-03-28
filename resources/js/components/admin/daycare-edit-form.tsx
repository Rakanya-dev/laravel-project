import { ArrowLeft, Edit2, Info, MapPin, Save, Settings, UserCircle, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Daycare } from '@/pages/admin/daycare-management';

import { formatForInput } from '@/utils/date';
import { formatPhoneNumber } from '@/utils/phone';

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

    // 🚀 Forcefully combine the backend list with the currently assigned teacher
    const teacherOptions = Array.from(new Set([
        ...availableTeachers,
        ...(editingDaycare.principal_name ? [editingDaycare.principal_name] : [])
    ]));

    return (
        <div className="animate-in fade-in space-y-6 duration-300">
            {/* --- HEADER --- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900">
                        <Edit2 className="size-6 text-indigo-600" />
                        Edit Center Profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Update information and settings for <span className="font-bold text-slate-700">{editingDaycare.name}</span>
                    </p>
                </div>
                <Button variant="outline" onClick={onCancel} className="gap-2 h-11 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0">
                    <ArrowLeft className="size-4" /> Back to Details
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* --- MAIN FORM (2/3 width) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Info className="size-5 text-indigo-500" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Daycare Name <span className="text-red-500">*</span></Label>
                                <Input
                                    value={editingDaycare.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Description</Label>
                                <Textarea
                                    value={editingDaycare.description || ''}
                                    onChange={(e) => setField('description', e.target.value)}
                                    className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 resize-none font-medium text-slate-900"
                                    placeholder="Enter a brief description of the center..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Established Date</Label>
                                <Input
                                    type="date"
                                    value={formatForInput(editingDaycare.established_date)}
                                    onChange={(e) => setField('established_date', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🚀 Contact Details Card */}
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Phone className="size-5 text-indigo-500" /> Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Email Address <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={editingDaycare.email || ''}
                                        onChange={(e) => setField('email', e.target.value)}
                                        className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                        placeholder="center@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Phone Number <span className="text-red-500">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        value={editingDaycare.phone || ''}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            setField('phone', formatted);
                                        }}
                                        className="h-11 pl-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                        // 🚀 UPDATED PLACEHOLDER
                                        placeholder="63+ 9XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MapPin className="size-5 text-indigo-500" /> Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Street Address <span className="text-red-500">*</span></Label>
                                <Input
                                    value={editingDaycare.address || ''}
                                    onChange={(e) => setField('address', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">City</Label>
                                    <Input
                                        value={editingDaycare.city || ''}
                                        onChange={(e) => setField('city', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Province</Label>
                                    <Input
                                        value={editingDaycare.province || ''}
                                        onChange={(e) => setField('province', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Postal Code</Label>
                                    <Input
                                        value={editingDaycare.postal_code || ''}
                                        onChange={(e) => setField('postal_code', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SIDEBAR (1/3 width) --- */}
                <div className="space-y-6">
                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <UserCircle className="size-5 text-indigo-500" /> Educator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Primary Assigned Teacher</Label>
                                <Select
                                    value={editingDaycare.principal_name || undefined}
                                    onValueChange={(value) => setField('principal_name', value)}
                                >
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 font-medium text-slate-900">
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teacherOptions.map((t) => (
                                            <SelectItem key={t} value={t} className="font-medium">{t}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Settings className="size-5 text-indigo-500" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Maximum Capacity <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingDaycare.capacity.toString()}
                                    onChange={(e) => handleNumericChange(e, 'capacity')}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-bold text-slate-900 text-lg"
                                />
                                <p className="text-xs text-slate-500 font-medium mt-1">Total spots available across all sessions.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-transparent bg-slate-50 shadow-none">
                        <CardContent className="p-4 space-y-3">
                            <Button className="w-full h-11 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-sm" onClick={() => onSave(editingDaycare)}>
                                <Save className="mr-2 size-4" /> Save Changes
                            </Button>
                            <Button variant="outline" className="w-full h-11 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-100 font-bold" onClick={onCancel}>
                                <X className="mr-2 size-4" /> Discard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { ArrowLeft, Edit2, Info, MapPin, Save, Settings, UserCircle, X, Phone, Mail, CheckCircle, Users, Badge } from 'lucide-react';
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

    const setField = (field: string, value: string | number | string[]) => {
        setEditingDaycare((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Daycare) => {
        const value = parseInt(e.target.value) || 0;
        setField(field, value);
    };

    const teacherOptions = Array.from(new Set([
        ...availableTeachers,
        ...(editingDaycare.principal_name ? [editingDaycare.principal_name] : [])
    ]));

    return (
        <div className="animate-in fade-in space-y-6 duration-300 transition-colors">
            {/* --- HEADER --- */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                    <h2 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        <Edit2 className="size-6 text-indigo-600 dark:text-indigo-400" />
                        Edit Center Profile
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Update information and settings for <span className="font-bold text-slate-700 dark:text-slate-300">{editingDaycare.name}</span>
                    </p>
                </div>
                <Button
                    type="button" // 👈 ADD THIS!
                    variant="outline"
                    onClick={onCancel}
                    className="gap-2 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 shrink-0 transition-colors"
                >
                    <ArrowLeft className="size-4" /> Back to Details
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* --- MAIN FORM (2/3 width) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Info className="size-5 text-indigo-500 dark:text-indigo-400" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Daycare Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    value={editingDaycare.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Description</Label>
                                <Textarea
                                    value={editingDaycare.description || ''}
                                    onChange={(e) => setField('description', e.target.value)}
                                    className="min-h-[120px] rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 resize-none font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                    placeholder="Enter a brief description of the center..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Established Date</Label>
                                <Input
                                    type="date"
                                    value={formatForInput(editingDaycare.established_date)}
                                    onChange={(e) => setField('established_date', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 🚀 Contact Details Card */}
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Phone className="size-5 text-indigo-500 dark:text-indigo-400" /> Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Email Address <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="email"
                                        value={editingDaycare.email || ''}
                                        onChange={(e) => setField('email', e.target.value)}
                                        className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                        placeholder="center@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Phone Number <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="tel"
                                        value={editingDaycare.phone || ''}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            setField('phone', formatted);
                                        }}
                                        className="h-11 pl-10 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                        placeholder="63+ 9XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <MapPin className="size-5 text-indigo-500 dark:text-indigo-400" /> Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Street Address <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    value={editingDaycare.address || ''}
                                    onChange={(e) => setField('address', e.target.value)}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 dark:text-slate-300">City</Label>
                                    <Input
                                        value={editingDaycare.city || ''}
                                        onChange={(e) => setField('city', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 dark:text-slate-300">Province</Label>
                                    <Input
                                        value={editingDaycare.province || ''}
                                        onChange={(e) => setField('province', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700 dark:text-slate-300">Postal Code</Label>
                                    <Input
                                        value={editingDaycare.postal_code || ''}
                                        onChange={(e) => setField('postal_code', e.target.value)}
                                        className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SIDEBAR (1/3 width) --- */}
                <div className="space-y-6">

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Users className="size-5 text-indigo-500 dark:text-indigo-400" /> Assigned Educators
                                </div>
                                <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border-none transition-colors">
                                    {((editingDaycare as any).teachers || []).length} Selected
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="max-h-[250px] overflow-y-auto p-4 space-y-2 scrollbar-thin dark:scrollbar-thumb-zinc-700">
                                {(() => {
                                    const currentTeachers = (editingDaycare as any).teachers || (editingDaycare.principal_name ? [editingDaycare.principal_name] : []);
                                    const allOptions = Array.from(new Set([...availableTeachers, ...currentTeachers]));

                                    const sortedTeachers = allOptions.sort((a, b) => {
                                        const aSelected = currentTeachers.includes(a);
                                        const bSelected = currentTeachers.includes(b);

                                        if (aSelected && !bSelected) return -1;
                                        if (!aSelected && bSelected) return 1;
                                        return a.localeCompare(b);
                                    });

                                    if (sortedTeachers.length === 0) {
                                        return <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No teachers available.</p>;
                                    }

                                    return sortedTeachers.map((teacherName) => {
                                        const isSelected = currentTeachers.includes(teacherName);

                                        return (
                                            <button
                                                key={teacherName}
                                                type="button"
                                                onClick={() => {
                                                    let updatedTeachers = [...currentTeachers];
                                                    if (isSelected) {
                                                        updatedTeachers = updatedTeachers.filter(t => t !== teacherName);
                                                    } else {
                                                        updatedTeachers.push(teacherName);
                                                    }
                                                    setField('teachers' as any, updatedTeachers);
                                                }}
                                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                                    : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                                    }`}
                                            >
                                                <span className={`text-sm font-bold truncate pr-3 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {teacherName}
                                                </span>
                                                <div className={`size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                    {isSelected && <CheckCircle className="size-3.5 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Settings className="size-5 text-indigo-500 dark:text-indigo-400" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 pt-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Maximum Capacity <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingDaycare.capacity.toString()}
                                    onChange={(e) => handleNumericChange(e, 'capacity')}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white text-lg transition-colors"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Total spots available across all sessions.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-transparent dark:border-transparent bg-slate-50 dark:bg-zinc-900/50 shadow-none transition-colors">
                        <CardContent className="p-4 space-y-3">
                            {/* 🚀 SAVE BUTTON */}
                            <Button
                                type="button"
                                className="w-full h-11 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors"
                                onClick={() => onSave(editingDaycare)}
                            >
                                <Save className="mr-2 size-4" /> Save Changes
                            </Button>

                            {/* 🚀 DISCARD BUTTON */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11 rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold transition-colors"
                                onClick={onCancel} // 👈 Changed to just onCancel
                            >
                                <X className="mr-2 size-4" /> Discard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

import { ArrowLeft, Edit2, Info, MapPin, Save, Settings, UserCircle, X, Phone, Mail, CheckCircle, Users, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
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
    const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    // Track if the user has made any changes
    const [isDirty, setIsDirty] = useState(false);

    const setField = (field: string, value: string | number | string[]) => {
        setIsDirty(true); // Flag the form as changed
        setEditingDaycare((prev) => (prev ? { ...prev, [field]: value } : null));
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Daycare) => {
        const value = parseInt(e.target.value) || 0;
        setField(field, value);
    };

    // Smart Discard Logic
    const handleDiscardClick = () => {
        if (isDirty) {
            setIsDiscardModalOpen(true); // Show warning if there are unsaved changes
        } else {
            onCancel(); // Instantly go back if no changes were made
        }
    };

    const teacherOptions = Array.from(new Set([
        ...availableTeachers,
        ...(editingDaycare.principal_name ? [editingDaycare.principal_name] : [])
    ]));

    return (
        <div className="animate-in fade-in space-y-8 duration-300 transition-colors">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-2">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-4 transition-colors">
                        <Edit2 className="size-8 sm:size-9 text-slate-900 dark:text-white" />
                        Edit Center Profile
                    </h2>
                    <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-2 transition-colors">
                        Update information and settings for <span className="font-bold text-slate-700 dark:text-slate-300">{editingDaycare.name}</span>.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleDiscardClick}
                        className="gap-2 h-12 px-6 text-base font-bold rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 shrink-0 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="size-5" /> Back to Details
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* --- MAIN FORM (2/3 width) --- */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:px-8 transition-colors">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                <Info className="size-6 text-indigo-500 dark:text-indigo-400" /> Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Daycare Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    value={editingDaycare.name}
                                    onChange={(e) => setField('name', e.target.value)}
                                    className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Description</Label>
                                <Textarea
                                    value={editingDaycare.description || ''}
                                    onChange={(e) => setField('description', e.target.value)}
                                    className="min-h-[140px] text-base p-4 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 resize-none font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors shadow-sm"
                                    placeholder="Enter a brief description of the center..."
                                />
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Established Date</Label>
                                <Input
                                    type="date"
                                    value={formatForInput(editingDaycare.established_date)}
                                    onChange={(e) => setField('established_date', e.target.value)}
                                    className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:px-8 transition-colors">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                <Phone className="size-6 text-indigo-500 dark:text-indigo-400" /> Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 sm:p-8">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Email Address <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="email"
                                        value={editingDaycare.email || ''}
                                        onChange={(e) => setField('email', e.target.value)}
                                        className="h-12 text-base pl-12 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white dark:placeholder:text-slate-400 transition-colors shadow-sm"
                                        placeholder="center@example.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Phone Number <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        type="tel"
                                        value={editingDaycare.phone || ''}
                                        onChange={(e) => {
                                            const formatted = formatPhoneNumber(e.target.value);
                                            setField('phone', formatted);
                                        }}
                                        className="h-12 text-base pl-12 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white dark:placeholder:text-slate-400 transition-colors shadow-sm"
                                        placeholder="63+ 9XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:px-8 transition-colors">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                <MapPin className="size-6 text-indigo-500 dark:text-indigo-400" /> Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Street Address <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    value={editingDaycare.address || ''}
                                    onChange={(e) => setField('address', e.target.value)}
                                    className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">City</Label>
                                    <Input
                                        value={editingDaycare.city || ''}
                                        onChange={(e) => setField('city', e.target.value)}
                                        className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Province</Label>
                                    <Input
                                        value={editingDaycare.province || ''}
                                        onChange={(e) => setField('province', e.target.value)}
                                        className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Postal Code</Label>
                                    <Input
                                        value={editingDaycare.postal_code || ''}
                                        onChange={(e) => setField('postal_code', e.target.value)}
                                        className="h-12 text-base rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors shadow-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* --- SIDEBAR (1/3 width) --- */}
                <div className="space-y-6">

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 transition-colors">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Users className="size-6 text-indigo-500 dark:text-indigo-400" /> Assigned Educators
                                </div>
                                <div className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-bold px-3 py-1 rounded-lg text-sm transition-colors shadow-none">
                                    {((editingDaycare as any).teachers || []).length} Selected
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="max-h-[300px] overflow-y-auto p-6 space-y-3 custom-scrollbar">
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
                                        return <p className="text-base font-medium text-slate-500 dark:text-slate-400 text-center py-6">No teachers available.</p>;
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
                                                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected
                                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                                    : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-zinc-800'
                                                    }`}
                                            >
                                                <span className={`text-base font-bold truncate pr-3 ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {teacherName}
                                                </span>
                                                <div className={`size-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'bg-white dark:bg-zinc-800 border-slate-300 dark:border-slate-600'
                                                    }`}>
                                                    {isSelected && <CheckCircle className="size-4 text-white" />}
                                                </div>
                                            </button>
                                        );
                                    });
                                })()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden transition-colors">
                        <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 p-6 sm:px-8 transition-colors">
                            <CardTitle className="text-xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-3">
                                <Settings className="size-6 text-indigo-500 dark:text-indigo-400" /> Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 p-6 sm:p-8">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Maximum Capacity <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    type="number"
                                    value={editingDaycare.capacity.toString()}
                                    onChange={(e) => handleNumericChange(e, 'capacity')}
                                    className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-black text-slate-900 dark:text-white text-xl transition-colors shadow-sm"
                                />
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">Total spots available across all sessions in this center.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border-transparent dark:border-transparent bg-slate-50 dark:bg-zinc-900/50 shadow-none transition-colors">
                        <CardContent className="p-6 space-y-4">
                            {/* 🚀 SAVE BUTTON */}
                            <Button
                                type="button"
                                className="w-full h-12 text-base rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors"
                                onClick={() => setIsSaveModalOpen(true)}
                            >
                                <Save className="mr-3 size-5" /> Save Changes
                            </Button>

                            {/* 🚀 DISCARD BUTTON */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-12 text-base rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 font-bold transition-colors shadow-sm"
                                onClick={handleDiscardClick}
                            >
                                Discard Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* 🚀 SAVE CONFIRMATION MODAL (Premium Modal Layout) */}
            <AlertDialog open={isSaveModalOpen} onOpenChange={setIsSaveModalOpen}>
                <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                    <Save className="size-6" strokeWidth={2.5} />
                                </div>
                                <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">Save Changes</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                                Are you sure you want to apply these updates? The new details will be immediately visible across the system.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="bg-slate-50 dark:bg-zinc-950 px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <AlertDialogCancel
                            className="h-11 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                            onClick={() => setIsSaveModalOpen(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm transition-colors m-0"
                            onClick={() => {
                                setIsSaveModalOpen(false);
                                onSave(editingDaycare);
                            }}
                        >
                            Yes, Save Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 🚀 DISCARD CONFIRMATION MODAL (Premium Modal Layout) */}
            <AlertDialog open={isDiscardModalOpen} onOpenChange={setIsDiscardModalOpen}>
                <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-xl shrink-0">
                                    <AlertTriangle className="size-6" strokeWidth={2.5} />
                                </div>
                                <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">Discard Changes</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                                Are you sure you want to discard your edits? Any unsaved changes to this center's profile will be lost.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="bg-slate-50 dark:bg-zinc-950 px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <AlertDialogCancel
                            className="h-11 w-full sm:w-auto px-6 rounded-xl text-base font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                            onClick={() => setIsDiscardModalOpen(false)}
                        >
                            Keep Editing
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-11 w-full sm:w-auto px-8 rounded-xl text-base font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm transition-colors m-0"
                            onClick={onCancel}
                        >
                            Yes, Discard
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

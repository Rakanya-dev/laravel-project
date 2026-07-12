import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Daycare } from '@/pages/admin/daycare-management';
import type { Child } from '@/types';
import { router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Baby,
    Building2,
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit2,
    FileText,
    LayoutList,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    ShieldAlert,
    UserCircle,
    Users,
    XCircle,
    AlertTriangle,
    Trash2,
    Printer
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

import { calculateAge, formatPHDate } from '@/utils/date';
import { formatPhoneNumber } from '@/utils/phone';

interface DaycareDetailsViewProps {
    daycare: Daycare;
    onBack: () => void;
    onEdit: (daycare: Daycare) => void;
    onDelete?: (id: number) => void;
}

const formatName = (child: Child) => [child.first_name, child.middle_name, child.last_name].filter(Boolean).join(' ').trim();

const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

interface Section {
    id: number;
    name: string;
    form_type: 'record_1' | 'record_2';
    start_time: string | null;
    end_time: string | null;
    capacity: number;
}

export default function DaycareDetailsView({ daycare, onBack, onEdit }: DaycareDetailsViewProps) {
    const availableSlots = daycare.capacity - daycare.current;
    const students = (daycare.children || daycare.students || []) as (Child & { section?: { name: string } })[];
    const sections = ((daycare as any).sections as Section[]) || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSession, setActiveSession] = useState<string>('All');
    const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [isDeleteCenterOpen, setIsDeleteCenterOpen] = useState(false);
    const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<number | null>(null);
    const [sectionForm, setSectionForm] = useState({
        name: '',
        form_type: 'record_2',
        start_time: '',
        end_time: '',
        capacity: '25',
    });

    const groupedStudents = useMemo(() => {
        return students.reduce(
            (groups, student) => {
                const sessionName = student.section?.name || 'Unassigned Session';
                if (!groups[sessionName]) groups[sessionName] = [];
                groups[sessionName].push(student);
                return groups;
            },
            {} as Record<string, typeof students>,
        );
    }, [students]);

    const sessionTabs = ['All', ...Object.keys(groupedStudents).sort()];

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeSession]);

    const displayStudents = students.filter((student) => {
        const sessionName = student.section?.name || 'Unassigned Session';
        const matchesSession = activeSession === 'All' || sessionName === activeSession;

        if (!matchesSession) return false;
        if (!searchQuery.trim()) return true;

        const searchTerms = searchQuery.toLowerCase().split(/\s+/);
        const unifiedString = `${formatName(student)} ${sessionName} ${student.gender || ''}`.toLowerCase();

        return searchTerms.every(term => unifiedString.includes(term));
    });

    const totalPages = Math.max(1, Math.ceil(displayStudents.length / itemsPerPage));
    const paginatedStudents = displayStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const isFiltering = searchQuery !== '' || activeSession !== 'All';

    const confirmDeleteCenter = () => {
        router.delete(route('admin.daycare.destroy', daycare.id), {
            onSuccess: () => {
                setIsDeleteCenterOpen(false);
                toast.success('Daycare center deleted successfully.');
                onBack();
            },
            onError: () => toast.error('Failed to delete daycare center.'),
            preserveScroll: true,
        });
    };

    const handleCreateSection = () => {
        if (!sectionForm.name || !sectionForm.capacity) {
            toast.error('Missing Fields', { description: 'Please provide a session name and capacity.' });
            return;
        }

        router.post(route('admin.sections.store'), { ...sectionForm, daycare_id: daycare.id }, {
            onSuccess: () => {
                setIsAddSectionOpen(false);
                setSectionForm({ name: '', form_type: 'record_2', start_time: '', end_time: '', capacity: '25' });
                toast.success('Session created successfully!');
            },
            onError: (errors) => toast.error('Failed to create session.', { description: Object.values(errors)[0] as string }),
            preserveScroll: true,
        });
    };

    const confirmDeleteSection = () => {
        if (sectionToDelete === null) return;
        router.delete(route('admin.sections.destroy', sectionToDelete), {
            onSuccess: () => {
                toast.success('Session removed.');
                setSectionToDelete(null);
            },
            onError: () => {
                toast.error('Failed to delete session.');
                setSectionToDelete(null);
            },
            preserveScroll: true,
        });
    };

    return (
        <div className="animate-in fade-in space-y-8 duration-300 transition-colors print:space-y-6">

            {/* --- HEADER --- */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 sm:gap-6 mb-2 print:hidden">
                <div className="w-full xl:flex-1">
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white break-words">{daycare.name}</h2>
                    <div className="mt-2 flex items-center gap-2 text-base sm:text-lg font-medium text-slate-500 dark:text-slate-400">
                        <MapPin className="size-5 sm:size-6 shrink-0" />
                        <span className="truncate">{daycare.address}, {daycare.location}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
                    <Button
                        variant="destructive"
                        onClick={() => setIsDeleteCenterOpen(true)}
                        className="w-full sm:w-auto gap-2 h-14 px-6 text-lg font-bold rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white transition-colors shadow-sm"
                    >
                        <Trash2 className="size-5" /> Delete
                    </Button>

                    <Button
                        onClick={() => onEdit(daycare)}
                        className="w-full sm:w-auto gap-2 h-14 px-6 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-sm"
                    >
                        <Edit2 className="size-5" /> Edit
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onBack}
                        className="w-full sm:w-auto gap-2 h-14 px-6 text-lg font-bold bg-white dark:bg-zinc-900 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="size-5" /> Back
                    </Button>
                </div>
            </div>

            {/* --- PREMIUM STATS OVERVIEW --- */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-4">
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors print:shadow-none print:border-slate-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Active Students</CardTitle>
                        <Users className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent className="pt-6 pb-8">
                        <div className="text-5xl font-black text-slate-900 dark:text-white">{daycare.current}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors print:shadow-none print:border-slate-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Total Capacity</CardTitle>
                        <Building2 className="size-6 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent className="pt-6 pb-8">
                        <div className="text-5xl font-black text-slate-900 dark:text-white">{daycare.capacity}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors print:shadow-none print:border-slate-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Available Slots</CardTitle>
                        <CheckCircle className="size-6 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent className="pt-6 pb-8">
                        <div className="text-5xl font-black text-slate-900 dark:text-white">{availableSlots}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors flex flex-col justify-between print:shadow-none print:border-slate-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-6 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Occupancy</CardTitle>
                        <Activity className="size-6 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent className="pt-6 pb-8">
                        <div className="mb-4 text-5xl font-black text-slate-900 dark:text-white">{daycare.percentage}%</div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 print:hidden">
                            <div className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500" style={{ width: `${daycare.percentage}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-6 h-auto w-full justify-start space-x-8 rounded-none border-b border-slate-200 dark:border-slate-800 bg-transparent p-0 transition-colors overflow-x-auto print:hidden">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent px-1 py-4 font-bold tracking-wide text-lg text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors whitespace-nowrap"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="sessions"
                        className="rounded-none border-b-2 border-transparent px-1 py-4 font-bold tracking-wide text-lg text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors whitespace-nowrap"
                    >
                        Sessions
                        <Badge variant="secondary" className="ml-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 text-sm shadow-none">{sections.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="rounded-none border-b-2 border-transparent px-1 py-4 font-bold tracking-wide text-lg text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors whitespace-nowrap"
                    >
                        Students
                        <Badge variant="secondary" className="ml-3 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-1 text-sm shadow-none">{students.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview" className="print:block">
                    <div className="grid gap-6 lg:grid-cols-3 print:grid-cols-3">
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 lg:col-span-2 transition-colors print:shadow-none print:border-slate-300">
                            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl p-6 sm:p-8">
                                <CardTitle className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">About the Center</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-8 p-6 sm:p-8">
                                <div>
                                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Description</p>
                                    <p className="leading-relaxed text-lg text-slate-700 dark:text-slate-300 font-medium">{daycare.description || 'No description has been provided.'}</p>
                                </div>
                                <Separator className="bg-slate-100 dark:bg-slate-800" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 print:grid-cols-3">
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Mail className="size-5" /> Email
                                        </p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 break-all">{daycare.email}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Phone className="size-5" /> Phone
                                        </p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatPhoneNumber(daycare.phone)}</p>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Clock className="size-5" /> Established
                                        </p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{daycare.established_date || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* MULTI-TEACHER DETAILS CARD */}
                        <Card className="rounded-2xl border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/10 shadow-sm relative overflow-hidden flex flex-col h-full transition-colors print:shadow-none print:border-slate-300 print:bg-white">
                            <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl print:hidden"></div>
                            <CardHeader className="p-6 sm:p-8">
                                <CardTitle className="flex items-center gap-3 text-2xl font-black tracking-tight text-indigo-900 dark:text-indigo-300 z-10 print:text-slate-900">
                                    <Users className="size-7 text-indigo-500 dark:text-indigo-400 print:text-slate-900" /> Assigned Educators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 sm:px-8 pb-6 sm:pb-8 z-10 relative flex-1">
                                {(() => {
                                    const teachersList = (daycare as any).teachers || (daycare.principal_name ? [daycare.principal_name] : []);

                                    if (teachersList.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center text-center h-full py-10">
                                                <UserCircle className="size-20 text-indigo-200 dark:text-indigo-800/50 mb-4" />
                                                <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400">No Teachers Assigned</h3>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar print:max-h-full print:overflow-visible">
                                            {teachersList.map((teacher: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-colors print:shadow-none print:border-slate-300">
                                                    <Avatar className="size-14 shadow-sm transition-colors rounded-xl">
                                                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-black text-lg rounded-xl">
                                                            {getInitials(teacher.split(' ')[0] || '', teacher.split(' ').slice(1).join(' ') || '')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{teacher}</h3>
                                                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mt-1 print:text-slate-500">CDW</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* --- SESSIONS TAB --- */}
                <TabsContent value="sessions" className="mt-6 space-y-6 print:block">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors print:hidden">
                        <div className="flex flex-col">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Manage Sessions</h3>
                            <p className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-1">Organize students into class blocks.</p>
                        </div>
                        <Button className="w-full sm:w-auto gap-2 rounded-xl text-lg px-8 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm h-14 font-bold transition-colors" onClick={() => setIsAddSectionOpen(true)}>
                            <Plus className="size-6" /> Add Session
                        </Button>
                    </div>

                    {sections.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/30 shadow-none rounded-2xl transition-colors print:hidden">
                            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="p-6 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 transition-colors">
                                    <LayoutList className="size-12 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">No sessions created</h3>
                                <p className="mt-3 text-lg font-medium text-slate-500 dark:text-slate-400 max-w-md">
                                    Create your first session block to start organizing your students effectively.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 print:grid-cols-3">
                            {sections.map((section) => (
                                <Card key={section.id} className="group relative overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:-translate-y-1 hover:shadow-md transition-all print:shadow-none print:border-slate-300 print:hover:translate-y-0">
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500 dark:bg-indigo-600 transition-colors print:hidden" />
                                    <CardContent className="p-6 pl-8">
                                        <div className="mb-5 flex items-start justify-between">
                                            <div>
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">{section.name}</h4>
                                                <div className="mt-2 flex items-center gap-2 text-base font-bold text-slate-500 dark:text-slate-400">
                                                    <Clock className="size-5 text-indigo-500 dark:text-indigo-400 print:text-slate-500" />
                                                    {section.start_time ? section.start_time.slice(0, 5) : 'TBD'} -{' '}
                                                    {section.end_time ? section.end_time.slice(0, 5) : 'TBD'}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-3 py-1 uppercase tracking-wider transition-colors shadow-none">
                                                Max {section.capacity}
                                            </Badge>
                                        </div>
                                        <Separator className="my-5 bg-slate-100 dark:bg-slate-800 transition-colors" />
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                Form: <span className="text-indigo-600 dark:text-indigo-400 ml-1 print:text-slate-700 text-sm">{section.form_type.replace('_', ' ')}</span>
                                            </div>
                                            <button
                                                onClick={() => setSectionToDelete(section.id)}
                                                className="print:hidden text-xs font-bold text-red-500 dark:text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-700 dark:hover:text-red-300 uppercase tracking-widest"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* --- STUDENTS TAB --- */}
                <TabsContent value="students" className="mt-6 space-y-6 print:block">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50/50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors print:hidden">
                        <div className="relative flex-1 w-full min-w-[250px]">
                            <Search className="absolute top-1/2 left-4 size-6 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by name..."
                                className="pl-14 h-14 text-lg rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 shadow-sm w-full font-medium dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                    <XCircle className="size-6" />
                                </button>
                            )}
                        </div>

                        <Select value={activeSession} onValueChange={setActiveSession}>
                            <SelectTrigger className="h-14 text-lg w-full sm:w-[220px] rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm font-bold dark:text-slate-200 transition-colors">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800 rounded-xl">
                                {sessionTabs.map(session => (
                                    <SelectItem key={session} value={session} className="text-lg font-medium dark:text-slate-200 dark:focus:bg-zinc-800 rounded-lg py-3">{session === 'All' ? 'All Sessions' : session}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {isFiltering && (
                            <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveSession('All'); }} className="w-full sm:w-auto h-14 px-6 text-lg font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors">
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    <div className="px-2 text-lg font-medium text-slate-500 dark:text-slate-400 print:hidden">
                        {displayStudents.length > 0
                            ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, displayStudents.length)} of ${displayStudents.length} matching students.`
                            : 'No matching students found.'
                        }
                    </div>

                    {displayStudents.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/30 shadow-none rounded-2xl transition-colors print:hidden">
                            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="p-6 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 transition-colors">
                                    <ShieldAlert className="size-12 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">No students found</h3>
                                <p className="mt-3 text-lg font-medium text-slate-500 dark:text-slate-400">
                                    {searchQuery ? `Try adjusting your search criteria.` : `There are no students assigned to this center yet.`}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px] items-start print:grid-cols-4 print:min-h-0">
                            {paginatedStudents.map((student) => (
                                <Card
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="group cursor-pointer rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm ring-indigo-50 dark:ring-indigo-900/20 transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:ring-2 print:shadow-none print:border-slate-300 print:hover:translate-y-0 print:ring-0"
                                >
                                    <CardContent className="flex items-center justify-between p-5">
                                        <div className="flex min-w-0 items-center gap-4">
                                            <Avatar className="size-14 border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-colors rounded-xl">
                                                <AvatarFallback className="bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-lg font-bold transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-white rounded-xl">
                                                    {getInitials(student.first_name, student.last_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">{formatName(student)}</h4>
                                                <p className="mt-1 flex items-center gap-2 truncate text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                                    <Clock className="size-4" /> {(student as any).section?.name || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="size-6 shrink-0 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400 print:hidden" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-8 flex w-full items-center justify-end gap-4 pr-2 print:hidden">
                            <span className="text-lg font-medium text-slate-500 dark:text-slate-400 transition-colors">
                                Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-14 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="size-7" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-14 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    <ChevronRight className="size-7" />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* 🚀 ADD SESSION MODAL */}
            <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-colors">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
                        <DialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                                    <Clock className="size-7" strokeWidth={2.5} />
                                </div>
                                <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Create New Session
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                                Add a new time block or section for this center.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Session Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={sectionForm.name}
                                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                placeholder="e.g. Morning Block A"
                                className="h-14 text-lg rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-400 transition-colors shadow-sm"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Form Type <span className="text-red-500">*</span></Label>
                                <Select value={sectionForm.form_type} onValueChange={(val: any) => setSectionForm({ ...sectionForm, form_type: val })}>
                                    <SelectTrigger className="h-14 text-lg rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-slate-200 transition-colors shadow-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                        <SelectItem value="record_1" className="rounded-lg py-3 text-lg font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Record 1</SelectItem>
                                        <SelectItem value="record_2" className="rounded-lg py-3 text-lg font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Record 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Max Capacity <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={sectionForm.capacity}
                                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                                    className="h-14 text-xl rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-black text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Start Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.start_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, start_time: e.target.value })}
                                    className="h-14 text-lg rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">End Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.end_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, end_time: e.target.value })}
                                    className="h-14 text-lg rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <Button variant="ghost" className="h-14 w-full sm:w-auto px-6 text-lg font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors" onClick={() => setIsAddSectionOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="h-14 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-lg font-bold shadow-sm transition-colors" onClick={handleCreateSection}>
                            Save Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* 🚀 STUDENT PROFILE POP-UP MODAL */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent hideClose className="sm:max-w-[800px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200">
                    {selectedStudent && (
                        <>
                            <DialogHeader className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 text-left sm:text-left">
                                <div className="flex items-center gap-5">
                                    <Avatar className="size-20 border-4 border-white dark:border-zinc-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 transition-colors rounded-xl">
                                        <AvatarFallback className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-3xl font-black rounded-xl">
                                            {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="mt-1">
                                        <DialogTitle className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors break-words">
                                            {formatName(selectedStudent)}
                                        </DialogTitle>
                                        <DialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2 transition-colors">
                                            Learner Profile Preview
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-2 mt-0">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block transition-colors">Current Status</p>
                                    <Badge className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs px-3 py-1 shadow-none transition-colors">Active Student</Badge>
                                </div>
                            </DialogHeader>

                            <div className="p-6 sm:p-8 overflow-y-auto max-h-[65vh] space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30">
                                {/* SECTION 1: Learner Identity */}
                                <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                    <h3 className="flex items-center gap-3 text-lg font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                                        <Baby className="size-6 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                        <div className="sm:col-span-2">
                                            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Date of Birth & Age</Label>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="size-6 text-indigo-400 dark:text-indigo-500 transition-colors" />
                                                    {formatPHDate(selectedStudent.date_of_birth)}
                                                </span>
                                                <span className="hidden sm:inline text-slate-300 dark:text-slate-700 transition-colors">•</span>
                                                <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-3 py-1 rounded-lg text-base transition-colors">
                                                    <Activity className="size-5" />
                                                    {calculateAge(selectedStudent.date_of_birth)} years old
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Gender</Label>
                                            <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">{selectedStudent.gender || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Known As</Label>
                                            <p className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100 transition-colors">{selectedStudent.nickname ? `"${selectedStudent.nickname}"` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 2: Center Placement */}
                                <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-6 relative overflow-hidden transition-colors">
                                    <div className="absolute -right-8 -top-8 size-32 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-3xl transition-colors"></div>
                                    <h3 className="flex items-center gap-3 text-lg font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-100 dark:border-indigo-500/20 pb-4 relative z-10 transition-colors">
                                        <Building2 className="size-6 text-indigo-500 dark:text-indigo-400" /> Placement
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                        <div>
                                            <Label className="text-xs font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Daycare Center</Label>
                                            <p className="mt-3 text-xl font-black text-indigo-950 dark:text-indigo-100 transition-colors">{daycare.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest transition-colors">Assigned Session</Label>
                                            <p className="mt-3 text-lg font-bold text-indigo-800 dark:text-indigo-300 transition-colors">
                                                {(selectedStudent as any).section?.name || 'Unassigned Session'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 3: Unified General Notes */}
                                <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                    <h3 className="flex items-center gap-3 text-lg font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                                        <FileText className="size-6 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                                    </h3>
                                    <div>
                                        <Label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Additional Background</Label>
                                        <div className="mt-3 text-lg font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-5 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[120px] transition-colors">
                                            {(selectedStudent as any).notes ? (
                                                (selectedStudent as any).notes
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 italic transition-colors">No additional background or notes recorded.</span>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0">
                                <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="h-14 w-full sm:w-auto px-8 rounded-xl text-lg font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    Close Preview
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* 🚀 DELETE SESSION ALERT */}
            <AlertDialog open={sectionToDelete !== null} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-xl shrink-0">
                                    <AlertTriangle className="size-7" strokeWidth={2.5} />
                                </div>
                                <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Delete Session</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                                Are you sure you want to delete this session? Any students currently assigned to this block will be automatically marked as "Unassigned". This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="bg-slate-50 dark:bg-zinc-950 px-6 py-5 border-t border-slate-100 dark:border-slate-800 sm:justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <AlertDialogCancel
                            className="h-12 w-full sm:w-auto px-6 rounded-xl text-lg font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                            onClick={() => setSectionToDelete(null)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 w-full sm:w-auto px-8 rounded-xl text-lg font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm transition-colors m-0"
                            onClick={confirmDeleteSection}
                        >
                            Yes, Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* 🚀 DELETE CENTER ALERT */}
            <AlertDialog open={isDeleteCenterOpen} onOpenChange={setIsDeleteCenterOpen}>
                <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors">
                    <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900">
                        <AlertDialogHeader className="text-left">
                            <div className="flex items-center gap-4 mb-3">
                                <div className="p-3 bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-xl shrink-0">
                                    <AlertTriangle className="size-7" strokeWidth={2.5} />
                                </div>
                                <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Delete Daycare Center</AlertDialogTitle>
                            </div>
                            <AlertDialogDescription className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                                Are you sure? This action cannot be undone. All data, student links, and settings tied to this branch will be permanently removed.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="bg-slate-50 dark:bg-zinc-950 px-6 py-5 border-t border-slate-100 dark:border-slate-800 sm:justify-end gap-3 flex-col sm:flex-row transition-colors m-0">
                        <AlertDialogCancel
                            className="h-12 w-full sm:w-auto px-6 rounded-xl text-lg font-bold bg-transparent border-0 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors m-0 shadow-none"
                            onClick={() => setIsDeleteCenterOpen(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="h-12 w-full sm:w-auto px-8 rounded-xl text-lg font-bold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 shadow-sm transition-colors m-0"
                            onClick={confirmDeleteCenter}
                        >
                            Yes, Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

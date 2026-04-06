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
    Calendar,
    CalendarDays,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Edit2,
    FileText,
    HeartPulse,
    LayoutList,
    Mail,
    MapPin,
    Phone,
    Plus,
    Search,
    ShieldAlert,
    Smile,
    UserCircle,
    Users,
    X,
    XCircle,
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
    onDelete: (id: number) => void;
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

export default function DaycareDetailsView({ daycare, onBack, onEdit, onDelete }: DaycareDetailsViewProps) {
    const availableSlots = daycare.capacity - daycare.current;
    const students = (daycare.children || daycare.students || []) as (Child & { section?: { name: string } })[];
    const sections = ((daycare as any).sections as Section[]) || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [activeSession, setActiveSession] = useState<string>('All');
    const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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
        <div className="animate-in fade-in space-y-6 duration-300 transition-colors">
            {/* --- HEADER ACTIONS --- */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="-ml-4 gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors">
                    <ArrowLeft className="size-4" /> Back to Centers
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => onEdit(daycare)} className="gap-2 bg-white dark:bg-zinc-900 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors">
                        <Edit2 className="size-4" /> Edit Details
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(daycare.id)} className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 transition-colors">
                        <XCircle className="size-4" /> Delete Center
                    </Button>
                </div>
            </div>

            {/* --- TITLE SECTION --- */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{daycare.name}</h2>
                <div className="mt-2 flex items-center gap-2 font-medium text-slate-500 dark:text-slate-400">
                    <MapPin className="size-4" />
                    {daycare.address}, {daycare.location}
                </div>
            </div>

            {/* --- PREMIUM STATS OVERVIEW --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Active Students</CardTitle>
                        <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{daycare.current}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Total Capacity</CardTitle>
                        <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{daycare.capacity}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Available Slots</CardTitle>
                        <CheckCircle className="size-4 text-blue-600 dark:text-blue-400" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900 dark:text-white">{availableSlots}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Occupancy</CardTitle>
                        <Activity className="size-4 text-purple-600 dark:text-purple-400" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="mb-2 text-3xl font-black text-slate-900 dark:text-white">{daycare.percentage}%</div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500" style={{ width: `${daycare.percentage}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 h-auto w-full justify-start space-x-8 rounded-none border-b border-slate-200 dark:border-slate-800 bg-transparent p-0 transition-colors">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="sessions"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Sessions
                        <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">{sections.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 dark:text-slate-400 data-[state=active]:border-indigo-600 dark:data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Students
                        <Badge variant="secondary" className="ml-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 font-bold">{students.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-zinc-900 md:col-span-2 transition-colors">
                            <CardHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 rounded-t-2xl">
                                <CardTitle className="text-lg font-bold text-slate-800 dark:text-white">About the Center</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div>
                                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Description</p>
                                    <p className="leading-relaxed text-slate-700 dark:text-slate-300 font-medium">{daycare.description || 'No description has been provided.'}</p>
                                </div>
                                <Separator className="bg-slate-100 dark:bg-slate-800" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Mail className="size-3.5" /> Email
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{daycare.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Phone className="size-3.5" /> Phone
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{formatPhoneNumber(daycare.phone)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            <Clock className="size-3.5" /> Established
                                        </p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200">{daycare.established_date || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 🚀 MULTI-TEACHER DETAILS CARD */}
                        <Card className="rounded-2xl border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/10 shadow-sm relative overflow-hidden flex flex-col h-full transition-colors">
                            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-2xl"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-indigo-900 dark:text-indigo-300 z-10">
                                    <Users className="size-5 text-indigo-500 dark:text-indigo-400" /> Assigned Educators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 z-10 relative flex-1">
                                {(() => {
                                    const teachersList = (daycare as any).teachers || (daycare.principal_name ? [daycare.principal_name] : []);

                                    if (teachersList.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center text-center h-full py-6">
                                                <UserCircle className="size-12 text-indigo-200 dark:text-indigo-800/50 mb-2" />
                                                <h3 className="text-sm font-extrabold text-slate-500 dark:text-slate-400">No Teachers Assigned</h3>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200 dark:scrollbar-thumb-indigo-800">
                                            {teachersList.map((teacher: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm transition-colors">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-500/20 font-black text-indigo-700 dark:text-indigo-400">
                                                        {teacher.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">{teacher}</h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">CDW</p>
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
                <TabsContent value="sessions" className="mt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manage Sessions</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Organize students into class blocks (e.g., Morning/Afternoon).</p>
                        </div>
                        <Button className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-sm h-11 font-bold transition-colors" onClick={() => setIsAddSectionOpen(true)}>
                            <Plus className="size-4" /> Add Session
                        </Button>
                    </div>

                    {sections.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/30 shadow-none rounded-2xl transition-colors">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-4 transition-colors">
                                    <LayoutList className="size-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No sessions created</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">
                                    Create your first session block to start organizing your students effectively.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <Card key={section.id} className="group relative overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500 dark:bg-indigo-600 transition-colors" />
                                    <CardContent className="p-5 pl-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">{section.name}</h4>
                                                <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                                                    <Clock className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                                                    {section.start_time ? section.start_time.slice(0, 5) : 'TBD'} -{' '}
                                                    {section.end_time ? section.end_time.slice(0, 5) : 'TBD'}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider transition-colors">
                                                Max {section.capacity}
                                            </Badge>
                                        </div>
                                        <Separator className="my-3 bg-slate-100 dark:bg-slate-800 transition-colors" />
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                Form: <span className="text-indigo-600 dark:text-indigo-400">{section.form_type.replace('_', ' ')}</span>
                                            </div>
                                            <button
                                                onClick={() => setSectionToDelete(section.id)}
                                                className="text-xs font-bold text-red-500 dark:text-red-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-700 dark:hover:text-red-300 uppercase tracking-widest"
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
                <TabsContent value="students" className="mt-6 space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <div className="relative flex-1 w-full min-w-[250px]">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input
                                placeholder="Search by name"
                                className="pl-10 h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 shadow-sm w-full font-medium dark:text-white dark:placeholder:text-slate-500 transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                                    <XCircle className="size-4" />
                                </button>
                            )}
                        </div>

                        <Select value={activeSession} onValueChange={setActiveSession}>
                            <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm font-medium dark:text-slate-200 transition-colors">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-900 dark:border-slate-800">
                                {sessionTabs.map(session => (
                                    <SelectItem key={session} value={session} className="font-medium dark:text-slate-200 dark:focus:bg-zinc-800">{session === 'All' ? 'All Sessions' : session}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {isFiltering && (
                            <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveSession('All'); }} className="h-11 px-3 font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors">
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="px-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        {displayStudents.length > 0
                            ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, displayStudents.length)} of ${displayStudents.length} matching students.`
                            : 'No matching students found.'
                        }
                    </div>

                    {displayStudents.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/30 shadow-none rounded-2xl transition-colors">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-slate-700 mb-4 transition-colors">
                                    <ShieldAlert className="size-8 text-slate-400 dark:text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No students found</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    {searchQuery ? `Try adjusting your search criteria.` : `There are no students assigned to this center yet.`}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px] items-start">
                            {paginatedStudents.map((student) => (
                                <Card
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="group cursor-pointer rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm ring-indigo-50 dark:ring-indigo-900/20 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md hover:ring-2"
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/20 text-sm font-bold text-indigo-700 dark:text-indigo-400 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500 dark:group-hover:text-white">
                                                {getInitials(student.first_name, student.last_name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-extrabold text-slate-900 dark:text-slate-100">{formatName(student)}</h4>
                                                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                                    <Clock className="size-3" /> {(student as any).section?.name || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="size-4 shrink-0 text-slate-300 dark:text-slate-600 transition-colors group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-6 flex w-full items-center justify-end gap-3 pr-2">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                >
                                    <ChevronRight className="size-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* 🚀 UPGRADED: ADD SESSION MODAL */}
            <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
                    <DialogHeader className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 transition-colors">
                        <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900 dark:text-white">
                            <Clock className="size-5 text-indigo-600 dark:text-indigo-400" /> Create New Session
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400">
                            Add a new time block or section for this center.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700 dark:text-slate-300">Session Name <span className="text-red-500 dark:text-red-400">*</span></Label>
                            <Input
                                value={sectionForm.name}
                                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                placeholder="e.g. Morning Block A"
                                className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white dark:placeholder:text-slate-500 transition-colors"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Form Type <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Select value={sectionForm.form_type} onValueChange={(val: any) => setSectionForm({ ...sectionForm, form_type: val })}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-slate-200 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl dark:bg-zinc-900 dark:border-slate-800">
                                        <SelectItem value="record_1" className="font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Record 1</SelectItem>
                                        <SelectItem value="record_2" className="font-medium dark:focus:bg-zinc-800 dark:text-slate-200">Record 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Max Capacity <span className="text-red-500 dark:text-red-400">*</span></Label>
                                <Input
                                    type="number"
                                    value={sectionForm.capacity}
                                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-bold text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">Start Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.start_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, start_time: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700 dark:text-slate-300">End Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.end_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, end_time: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-slate-800 focus-visible:ring-indigo-500 font-medium text-slate-900 dark:text-white transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row justify-end items-center gap-2 transition-colors">
                        <Button variant="ghost" className="h-11 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors" onClick={() => setIsAddSectionOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="h-11 rounded-xl bg-indigo-600 font-bold hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white shadow-sm transition-colors" onClick={handleCreateSection}>
                            <Plus className="mr-2 size-4" /> Save Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- STUDENT PROFILE POP-UP MODAL --- */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-slate-100 dark:bg-zinc-950 rounded-2xl border-slate-200 dark:border-slate-800 shadow-lg transition-colors">
                    {selectedStudent && (
                        <>
                            <DialogHeader className="p-6 pb-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm z-10 flex flex-row items-center justify-between sticky top-0 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white dark:border-zinc-900 bg-indigo-50 dark:bg-indigo-500/20 text-xl font-black text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition-colors">
                                        {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                                    </div>
                                    <div className="text-left">
                                        <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white">{formatName(selectedStudent)}</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                            Learner Profile Preview
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 mt-0">
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Status</p>
                                    <Badge className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors">Active</Badge>
                                </div>
                            </DialogHeader>

                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 scrollbar-thin dark:scrollbar-thumb-zinc-700">
                                {/* SECTION 1: Learner Identity */}
                                <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
                                        <Baby className="size-4 text-indigo-500 dark:text-indigo-400" /> Learner Identity
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                        <div className="sm:col-span-2">
                                            <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Date of Birth & Age</Label>
                                            <div className="mt-1.5 flex items-center gap-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-indigo-400 dark:text-indigo-500" />
                                                    {formatPHDate(selectedStudent.date_of_birth)}
                                                </span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md text-xs transition-colors">
                                                    <Activity className="size-3" />
                                                    {calculateAge(selectedStudent.date_of_birth)} years old
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gender</Label>
                                            <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">{selectedStudent.gender || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Known As</Label>
                                            <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">{selectedStudent.nickname ? `"${selectedStudent.nickname}"` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 2: Center Placement */}
                                <section className="bg-indigo-50/30 dark:bg-indigo-500/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm space-y-5 relative overflow-hidden transition-colors">
                                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100 dark:bg-indigo-500/20 blur-2xl transition-colors"></div>
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-indigo-900 dark:text-indigo-300 uppercase border-b border-indigo-100 dark:border-indigo-500/20 pb-3 relative z-10 transition-colors">
                                        <Building2 className="size-4 text-indigo-500 dark:text-indigo-400" /> Placement
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                        <div>
                                            <Label className="text-[10px] font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest">Daycare Center</Label>
                                            <p className="mt-1.5 text-base font-extrabold text-indigo-950 dark:text-indigo-100">{daycare.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-indigo-400/80 dark:text-indigo-400/60 uppercase tracking-widest">Assigned Session</Label>
                                            <p className="mt-1.5 text-sm font-bold text-indigo-800 dark:text-indigo-300">
                                                {(selectedStudent as any).section?.name || 'Unassigned Session'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* 🚀 SECTION 3: Unified General Notes */}
                                <section className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-800 pb-3 transition-colors">
                                        <FileText className="size-4 text-indigo-500 dark:text-indigo-400" /> General Notes & Remarks
                                    </h3>
                                    <div>
                                        <Label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Additional Background</Label>
                                        <div className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 min-h-[110px] transition-colors">
                                            {(selectedStudent as any).notes ? (
                                                (selectedStudent as any).notes
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 italic">No additional background or notes recorded.</span>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <DialogFooter className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex flex-row justify-end items-center rounded-b-2xl transition-colors">
                                <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 h-11 rounded-xl font-bold w-full sm:w-auto transition-colors">
                                    <X className="mr-2 size-4" /> Close Preview
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* 🚀 UPGRADED: DELETE SESSION ALERT */}
            <AlertDialog open={sectionToDelete !== null} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent className="p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-2xl border-slate-200 dark:border-slate-800 shadow-lg sm:max-w-[425px] transition-colors">
                    <div className="p-6 pb-5 flex flex-col items-center text-center space-y-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 shadow-sm transition-colors">
                            <XCircle className="size-8" />
                        </div>
                        <AlertDialogHeader className="flex flex-col items-center">
                            <AlertDialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
                                Delete Session
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 pt-2">
                                Are you sure you want to delete this session? Any students currently assigned to this block will be automatically marked as "Unassigned". <span className="font-bold text-slate-700 dark:text-slate-300">This action cannot be undone.</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-row justify-center sm:justify-center gap-3 transition-colors">
                        <AlertDialogCancel className="h-11 rounded-xl mt-0 font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 flex-1 transition-colors" onClick={() => setSectionToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="h-11 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-red-600 flex-1 m-0 transition-colors" onClick={confirmDeleteSection}>
                            Delete Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

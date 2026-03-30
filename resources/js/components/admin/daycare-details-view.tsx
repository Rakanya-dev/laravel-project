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
        <div className="animate-in fade-in space-y-6 duration-300">
            {/* --- HEADER ACTIONS --- */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="-ml-4 gap-2 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="size-4" /> Back to Centers
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => onEdit(daycare)} className="gap-2 bg-white rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50">
                        <Edit2 className="size-4" /> Edit Details
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(daycare.id)} className="gap-2 rounded-xl bg-red-600 hover:bg-red-700">
                        <XCircle className="size-4" /> Delete Center
                    </Button>
                </div>
            </div>

            {/* --- TITLE SECTION --- */}
            <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">{daycare.name}</h2>
                <div className="mt-2 flex items-center gap-2 font-medium text-slate-500">
                    <MapPin className="size-4" />
                    {daycare.address}, {daycare.location}
                </div>
            </div>

            {/* --- PREMIUM STATS OVERVIEW --- */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">Active Students</CardTitle>
                        <Users className="size-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900">{daycare.current}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">Total Capacity</CardTitle>
                        <Building2 className="size-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900">{daycare.capacity}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">Available Slots</CardTitle>
                        <CheckCircle className="size-4 text-blue-600" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-3xl font-black text-slate-900">{availableSlots}</div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-xs font-bold tracking-widest text-slate-500 uppercase">Occupancy</CardTitle>
                        <Activity className="size-4 text-purple-600" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="mb-2 text-3xl font-black text-slate-900">{daycare.percentage}%</div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-indigo-600 transition-all duration-500" style={{ width: `${daycare.percentage}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABS NAVIGATION --- */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4 h-auto w-full justify-start space-x-8 rounded-none border-b border-slate-200 bg-transparent p-0">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="sessions"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Sessions
                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 font-bold">{sections.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="rounded-none border-b-2 border-transparent px-1 py-3 font-bold tracking-wide text-base text-slate-500 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
                    >
                        Students
                        <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-600 font-bold">{students.length}</Badge>
                    </TabsTrigger>
                </TabsList>

                {/* --- OVERVIEW TAB --- */}
                <TabsContent value="overview">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="rounded-2xl border-slate-200 shadow-sm bg-white md:col-span-2">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
                                <CardTitle className="text-lg font-bold text-slate-800">About the Center</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div>
                                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Description</p>
                                    <p className="leading-relaxed text-slate-700 font-medium">{daycare.description || 'No description has been provided.'}</p>
                                </div>
                                <Separator className="bg-slate-100" />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            <Mail className="size-3.5" /> Email
                                        </p>
                                        <p className="font-bold text-slate-800">{daycare.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            <Phone className="size-3.5" /> Phone
                                        </p>
                                        <p className="font-bold text-slate-800">{formatPhoneNumber(daycare.phone)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                                            <Clock className="size-3.5" /> Established
                                        </p>
                                        <p className="font-bold text-slate-800">{daycare.established_date || 'Not specified'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 🚀 MULTI-TEACHER DETAILS CARD */}
                        <Card className="rounded-2xl border-indigo-100 bg-indigo-50/30 shadow-sm relative overflow-hidden flex flex-col h-full">
                            <div className="absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100 blur-2xl"></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg font-bold text-indigo-900 z-10">
                                    <Users className="size-5 text-indigo-500" /> Assigned Educators
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 z-10 relative flex-1">
                                {(() => {
                                    const teachersList = (daycare as any).teachers || (daycare.principal_name ? [daycare.principal_name] : []);

                                    if (teachersList.length === 0) {
                                        return (
                                            <div className="flex flex-col items-center justify-center text-center h-full py-6">
                                                <UserCircle className="size-12 text-indigo-200 mb-2" />
                                                <h3 className="text-sm font-extrabold text-slate-500">No Teachers Assigned</h3>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-200">
                                            {teachersList.map((teacher: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-indigo-100 shadow-sm">
                                                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 font-black text-indigo-700">
                                                        {teacher.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-extrabold text-slate-900 truncate">{teacher}</h3>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">CDW</p>
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
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900">Manage Sessions</h3>
                            <p className="text-sm text-slate-500">Organize students into class blocks (e.g., Morning/Afternoon).</p>
                        </div>
                        <Button className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm h-11 font-bold" onClick={() => setIsAddSectionOpen(true)}>
                            <Plus className="size-4" /> Add Session
                        </Button>
                    </div>

                    {sections.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-none rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 rounded-full bg-white shadow-sm border border-slate-100 mb-4">
                                    <LayoutList className="size-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No sessions created</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500 max-w-sm">
                                    Create your first session block to start organizing your students effectively.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {sections.map((section) => (
                                <Card key={section.id} className="group relative overflow-hidden rounded-2xl border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-indigo-500" />
                                    <CardContent className="p-5 pl-6">
                                        <div className="mb-4 flex items-start justify-between">
                                            <div>
                                                <h4 className="text-lg font-extrabold text-slate-900">{section.name}</h4>
                                                <div className="mt-1.5 flex items-center gap-2 text-xs font-bold text-slate-500">
                                                    <Clock className="size-3.5 text-indigo-500" />
                                                    {section.start_time ? section.start_time.slice(0, 5) : 'TBD'} -{' '}
                                                    {section.end_time ? section.end_time.slice(0, 5) : 'TBD'}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider">
                                                Max {section.capacity}
                                            </Badge>
                                        </div>
                                        <Separator className="my-3 bg-slate-100" />
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Form: <span className="text-indigo-600">{section.form_type.replace('_', ' ')}</span>
                                            </div>
                                            <button
                                                onClick={() => setSectionToDelete(section.id)}
                                                className="text-xs font-bold text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-700 uppercase tracking-widest"
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
                    <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <div className="relative flex-1 w-full min-w-[250px]">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search by name"
                                className="pl-10 h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-indigo-500 shadow-sm w-full font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    <XCircle className="size-4" />
                                </button>
                            )}
                        </div>

                        <Select value={activeSession} onValueChange={setActiveSession}>
                            <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl bg-white border-slate-200 shadow-sm font-medium">
                                <SelectValue placeholder="All Sessions" />
                            </SelectTrigger>
                            <SelectContent>
                                {sessionTabs.map(session => (
                                    <SelectItem key={session} value={session} className="font-medium">{session === 'All' ? 'All Sessions' : session}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {isFiltering && (
                            <Button variant="ghost" onClick={() => { setSearchQuery(''); setActiveSession('All'); }} className="h-11 px-3 font-bold text-slate-500 hover:text-red-600 rounded-xl">
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="px-1 text-sm font-medium text-slate-500">
                        {displayStudents.length > 0
                            ? `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, displayStudents.length)} of ${displayStudents.length} matching students.`
                            : 'No matching students found.'
                        }
                    </div>

                    {displayStudents.length === 0 ? (
                        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 shadow-none rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="p-4 rounded-full bg-white shadow-sm border border-slate-100 mb-4">
                                    <ShieldAlert className="size-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No students found</h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">
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
                                    className="group cursor-pointer rounded-2xl border-slate-200 bg-white shadow-sm ring-indigo-50 transition-all duration-200 hover:border-indigo-300 hover:shadow-md hover:ring-2"
                                >
                                    <CardContent className="flex items-center justify-between p-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-sm font-bold text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                                                {getInitials(student.first_name, student.last_name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-extrabold text-slate-900">{formatName(student)}</h4>
                                                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
                                                    <Clock className="size-3" /> {(student as any).section?.name || 'Unassigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-indigo-500" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="mt-6 flex w-full items-center justify-end gap-3 pr-2">
                            <span className="text-sm font-medium text-slate-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                >
                                    <ChevronLeft className="size-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="size-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
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
                <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-lg">
                    <DialogHeader className="p-6 pb-5 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            <Clock className="size-5 text-indigo-600" /> Create New Session
                        </DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Add a new time block or section for this center.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-700">Session Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={sectionForm.name}
                                onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                                placeholder="e.g. Morning Block A"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Form Type <span className="text-red-500">*</span></Label>
                                <Select value={sectionForm.form_type} onValueChange={(val: any) => setSectionForm({ ...sectionForm, form_type: val })}>
                                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="record_1" className="font-medium">Record 1</SelectItem>
                                        <SelectItem value="record_2" className="font-medium">Record 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Max Capacity <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    value={sectionForm.capacity}
                                    onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-bold text-slate-900"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Start Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.start_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, start_time: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">End Time</Label>
                                <Input
                                    type="time"
                                    value={sectionForm.end_time}
                                    onChange={(e) => setSectionForm({ ...sectionForm, end_time: e.target.value })}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 font-medium text-slate-900"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-row justify-end items-center gap-2">
                        <Button variant="ghost" className="h-11 rounded-xl font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => setIsAddSectionOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="h-11 rounded-xl bg-indigo-600 font-bold hover:bg-indigo-700 text-white shadow-sm" onClick={handleCreateSection}>
                            <Plus className="mr-2 size-4" /> Save Session
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- STUDENT PROFILE POP-UP MODAL --- */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden bg-slate-100 rounded-2xl border-slate-200 shadow-lg">
                    {selectedStudent && (
                        <>
                            <DialogHeader className="p-6 pb-5 border-b border-slate-100 bg-white shadow-sm z-10 flex flex-row items-center justify-between sticky top-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-white bg-indigo-50 text-xl font-black text-indigo-700 shadow-sm ring-1 ring-slate-100">
                                        {getInitials(selectedStudent.first_name, selectedStudent.last_name)}
                                    </div>
                                    <div className="text-left">
                                        <DialogTitle className="text-2xl font-extrabold text-slate-900">{formatName(selectedStudent)}</DialogTitle>
                                        <DialogDescription className="text-sm font-medium text-slate-500 mt-0.5 flex items-center gap-2">
                                            Learner Profile Preview
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 mt-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Status</p>
                                    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-50">Active</Badge>
                                </div>
                            </DialogHeader>

                            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 scrollbar-thin">
                                {/* SECTION 1: Learner Identity */}
                                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                                        <Baby className="size-4 text-indigo-500" /> Learner Identity
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                        <div className="sm:col-span-2">
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth & Age</Label>
                                            <div className="mt-1.5 flex items-center gap-3 text-sm font-bold text-slate-900">
                                                <span className="flex items-center gap-2">
                                                    <CalendarDays className="size-4 text-indigo-400" />
                                                    {formatPHDate(selectedStudent.date_of_birth)}
                                                </span>
                                                <span className="text-slate-300">•</span>
                                                <span className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                                                    <Activity className="size-3" />
                                                    {calculateAge(selectedStudent.date_of_birth)} years old
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gender</Label>
                                            <p className="mt-1.5 text-sm font-bold text-slate-900">{selectedStudent.gender || 'Not specified'}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Known As</Label>
                                            <p className="mt-1.5 text-sm font-bold text-slate-900">{selectedStudent.nickname ? `"${selectedStudent.nickname}"` : 'N/A'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION 2: Center Placement */}
                                <section className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100 shadow-sm space-y-5 relative overflow-hidden">
                                    <div className="absolute -right-6 -top-6 size-24 rounded-full bg-indigo-100 blur-2xl"></div>
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-indigo-900 uppercase border-b border-indigo-100 pb-3 relative z-10">
                                        <Building2 className="size-4 text-indigo-500" /> Placement
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                        <div>
                                            <Label className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Daycare Center</Label>
                                            <p className="mt-1.5 text-base font-extrabold text-indigo-950">{daycare.name}</p>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-indigo-400/80 uppercase tracking-widest">Assigned Session</Label>
                                            <p className="mt-1.5 text-sm font-bold text-indigo-800">
                                                {(selectedStudent as any).section?.name || 'Unassigned Session'}
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* 🚀 SECTION 3: Unified General Notes */}
                                <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                                    <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-slate-800 uppercase border-b border-slate-100 pb-3">
                                        <FileText className="size-4 text-indigo-500" /> General Notes & Remarks
                                    </h3>
                                    <div>
                                        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Additional Background</Label>
                                        <div className="mt-2 text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[110px]">
                                            {(selectedStudent as any).notes ? (
                                                (selectedStudent as any).notes
                                            ) : (
                                                <span className="text-slate-400 italic">No additional background or notes recorded.</span>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <DialogFooter className="p-5 border-t border-slate-100 bg-white flex flex-row justify-end items-center rounded-b-2xl">
                                <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 h-11 rounded-xl font-bold w-full sm:w-auto">
                                    <X className="mr-2 size-4" /> Close Preview
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* 🚀 UPGRADED: DELETE SESSION ALERT */}
            <AlertDialog open={sectionToDelete !== null} onOpenChange={(open) => !open && setSectionToDelete(null)}>
                <AlertDialogContent className="p-0 overflow-hidden bg-white rounded-2xl border-slate-200 shadow-lg sm:max-w-[425px]">
                    <div className="p-6 pb-5 flex flex-col items-center text-center space-y-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100 shadow-sm">
                            <XCircle className="size-8" />
                        </div>
                        <AlertDialogHeader className="flex flex-col items-center">
                            <AlertDialogTitle className="text-xl font-extrabold text-slate-900">
                                Delete Session
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm font-medium text-slate-500 pt-2">
                                Are you sure you want to delete this session? Any students currently assigned to this block will be automatically marked as "Unassigned". <span className="font-bold text-slate-700">This action cannot be undone.</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-row justify-center sm:justify-center gap-3">
                        <AlertDialogCancel className="h-11 rounded-xl mt-0 font-bold border-slate-300 text-slate-700 hover:bg-slate-100 flex-1" onClick={() => setSectionToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction className="h-11 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 focus:ring-red-600 flex-1 m-0" onClick={confirmDeleteSection}>
                            Delete Session
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

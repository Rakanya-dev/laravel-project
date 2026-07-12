import { useState, useMemo, Fragment } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit2, ShieldAlert, BookOpen, ChevronDown, ChevronUp, Building2, Check, LayoutGrid, Search, EyeOff, XCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Settings', href: '#' },
    { title: 'Assessment Domains', href: '#' }
];

interface DaycareAvailability {
    id: number;
    name: string;
    is_active: boolean;
}

export default function DomainManagement({ domains = [], daycares = [] }: { domains: any[], daycares?: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<any>(null);
    const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [hideUnused, setHideUnused] = useState(false);

    const { data, setData, post, patch, processing, reset, errors, setError, clearErrors } = useForm({
        name: '',
        description: '',
        max_score: 20,
        is_core: false,
    });

    const openCreateModal = () => {
        setEditingDomain(null);
        reset();
        clearErrors();
        setData('is_core', false);
        setIsModalOpen(true);
    };

    const openEditModal = (e: React.MouseEvent, domain: any) => {
        e.stopPropagation();
        setEditingDomain(domain);
        clearErrors();
        setData({
            name: domain.name,
            description: domain.description || '',
            max_score: domain.max_score,
            is_core: Boolean(domain.is_core),
        });
        setIsModalOpen(true);
    };

    const toggleRow = (id: number) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();

        const formattedName = data.name.trim().toLowerCase();
        const isDuplicate = domains.some(
            (domain) => domain.name.trim().toLowerCase() === formattedName && domain.id !== editingDomain?.id
        );

        if (isDuplicate) {
            setError('name', 'A domain with this exact name already exists.');
            toast.error('Duplicate domain name prevented.');
            return;
        }

        if (editingDomain) {
            patch(route('admin.domains.update', editingDomain.id), {
                onSuccess: () => {
                    toast.success('Domain configuration updated!');
                    setIsModalOpen(false);
                },
            });
        } else {
            post(route('admin.domains.store'), {
                onSuccess: () => {
                    toast.success('New custom domain created!');
                    setIsModalOpen(false);
                },
            });
        }
    };

    const toggleDaycareAvailability = (domainId: number, daycareId: number) => {
        router.post(route('admin.domains.toggle-daycare', domainId), { daycare_id: daycareId }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => toast.success('Facility domain availability updated.')
        });
    };

    const filteredDomains = useMemo(() => {
        const safeDomains = Array.isArray(domains) ? domains : [];
        const safeDaycares = Array.isArray(daycares) ? daycares : [];

        return safeDomains.filter(domain => {
            const activeList = Array.isArray(domain.active_daycare_ids) ? domain.active_daycare_ids : [];
            const isUsed = domain.is_core || activeList.length > 0;

            if (hideUnused && !isUsed) return false;

            const domainName = domain.name || '';
            if (searchQuery && !domainName.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            return true;
        }).map(domain => {
            const activeList = Array.isArray(domain.active_daycare_ids) ? domain.active_daycare_ids : [];

            const assignedCenters = safeDaycares.map(d => ({
                id: d.id,
                name: d.name,
                is_active: activeList.includes(d.id)
            }));

            return { ...domain, assignedCenters };
        });
    }, [domains, daycares, searchQuery, hideUnused]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Domains" />

            {/* 🚀 PREMIUM PAGE WRAPPER */}
            <div className="flex-1 p-6 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">
                            Assessment Domains
                        </h2>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl transition-colors">
                            Manage official ECCD domains and selectively assign supplementary custom trackers to specific facilities.
                        </p>
                    </div>
                </div>

                <Card className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors duration-200">

                    {/* TOOLBAR */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 lg:flex-row lg:items-center lg:justify-between transition-colors">

                        {/* LEFT: Search & Filters */}
                        <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto lg:items-center">
                            <div className="relative w-full sm:w-[320px]">
                                <Search className="absolute top-1/2 -translate-y-1/2 left-4 size-5 text-slate-400 dark:text-slate-500" />
                                <Input
                                    placeholder="Search domains..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-10 h-12 text-base rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-950 dark:text-white dark:placeholder:text-slate-500 font-medium shadow-sm transition-colors focus-visible:ring-indigo-500 w-full"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
                                        <XCircle className="size-5" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 shrink-0 bg-slate-50 dark:bg-zinc-950 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 h-12 w-full sm:w-auto transition-colors">
                                <Switch id="hide-unused" checked={hideUnused} onCheckedChange={setHideUnused} />
                                <Label htmlFor="hide-unused" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                                    <EyeOff className="size-4 text-slate-400" /> Hide Unassigned
                                </Label>
                            </div>
                        </div>

                        {/* RIGHT: Actions */}
                        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:justify-end">
                            <Button
                                onClick={openCreateModal}
                                className="h-12 text-base px-6 rounded-xl bg-indigo-600 text-white font-bold shadow-sm hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors w-full sm:w-auto"
                            >
                                <Plus className="size-5 mr-2" /> Add Custom Domain
                            </Button>
                        </div>
                    </div>

                    {/* TABLE CONTENT */}
                    <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                        <Table className="w-full min-w-[900px] table-fixed">
                            <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent border-slate-100 dark:border-slate-800">
                                    <TableHead className="w-[6%] py-5"></TableHead>
                                    <TableHead className="w-[30%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Domain Name</TableHead>
                                    <TableHead className="w-[20%] py-5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Classification</TableHead>
                                    <TableHead className="w-[15%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Max Score</TableHead>
                                    <TableHead className="w-[20%] py-5 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Usage Count</TableHead>
                                    <TableHead className="w-[9%] py-5 text-right pr-6 sm:pr-8 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                                {filteredDomains.length === 0 ? (
                                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                        <TableCell colSpan={6} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center py-20 px-4">
                                                <div className="rounded-2xl bg-white dark:bg-zinc-800 p-6 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors mb-5">
                                                    <Search className="size-10 text-slate-400 dark:text-slate-500" />
                                                </div>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white transition-colors">No domains found</p>
                                                <p className="mt-2 text-base font-medium text-slate-500 dark:text-slate-400 transition-colors">Try adjusting your filters or search query.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDomains.map((domain) => {
                                        const isExpanded = !!expandedRows[domain.id];
                                        const activeCount = domain.assignedCenters.filter((c: DaycareAvailability) => c.is_active).length;

                                        return (
                                            <Fragment key={domain.id}>
                                                <TableRow
                                                    onClick={() => toggleRow(domain.id)}
                                                    className={cn(
                                                        "group transition-colors duration-200 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 border-slate-100 dark:border-slate-800 cursor-pointer select-none h-[72px]",
                                                        isExpanded && "bg-slate-50/50 dark:bg-zinc-800/30"
                                                    )}
                                                >
                                                    <TableCell className="py-4 pl-4 sm:pl-6 text-center">
                                                        <div className="flex size-8 items-center justify-center rounded-lg group-hover:bg-slate-200/50 dark:group-hover:bg-slate-700/50 transition-colors mx-auto">
                                                            {isExpanded ? <ChevronUp className="size-5 text-slate-400" /> : <ChevronDown className="size-5 text-slate-400" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-4">
                                                        <p className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors truncate">{domain.name}</p>
                                                    </TableCell>
                                                    <TableCell className="py-4 pr-4">
                                                        {domain.is_core ? (
                                                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700 px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none border">
                                                                <ShieldAlert className="size-3.5 mr-1.5" /> Core ECCD
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-white text-slate-600 border-slate-200 dark:bg-zinc-900 dark:text-slate-400 dark:border-slate-700 px-2.5 py-0.5 text-[11px] uppercase tracking-widest font-bold shadow-none border">
                                                                <BookOpen className="size-3.5 mr-1.5" /> Supplemental
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <span className="text-xl font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-zinc-950 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                                            {domain.max_score}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-center">
                                                        <span className={`text-base font-bold flex items-center justify-center gap-2 ${domain.is_core ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                                            <Building2 className="size-5 shrink-0" />
                                                            {domain.is_core ? 'All Facilities' : `${activeCount} / ${domain.assignedCenters.length}`}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="py-4 text-right pr-6 sm:pr-8">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => openEditModal(e, domain)}
                                                            className="size-12 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                        >
                                                            <Edit2 className="size-5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>

                                                {/* Expanded Details Row */}
                                                {isExpanded && (
                                                    <TableRow className="bg-slate-50/50 dark:bg-zinc-950/30 border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
                                                        <TableCell colSpan={6} className="p-0">
                                                            <div className="p-6 sm:p-8 space-y-6 lg:space-y-8 pl-16 sm:pl-20 border-l-4 border-indigo-500 dark:border-indigo-400 bg-gradient-to-r from-indigo-50/50 to-transparent dark:from-indigo-900/10">
                                                                <div>
                                                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Domain Description</h4>
                                                                    <p className="text-base font-medium text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm transition-colors">
                                                                        {domain.description || 'No descriptive guidance recorded for this assessment segment.'}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                                                                        <LayoutGrid className="size-4" /> Facility-Specific Activation Matrix
                                                                    </h4>

                                                                    {domain.is_core ? (
                                                                        <div className="p-5 sm:p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-base font-medium flex items-start gap-4 shadow-sm transition-colors">
                                                                            <Check className="size-6 shrink-0 mt-0.5" />
                                                                            <span className="leading-relaxed"><strong className="font-bold">Core ECCD Domains are globally locked</strong> and mandatorily active for all daycare operations across the municipality to maintain standardized assessment integrity.</span>
                                                                        </div>
                                                                    ) : domain.assignedCenters.length === 0 ? (
                                                                        <div className="p-5 sm:p-6 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-base font-bold shadow-sm transition-colors flex items-center gap-3">
                                                                            <ShieldAlert className="size-6 shrink-0" />
                                                                            No Daycare Centers are currently registered in the system. The toggle matrix requires active facilities.
                                                                        </div>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                                            {domain.assignedCenters.map((daycare: DaycareAvailability) => (
                                                                                <div
                                                                                    key={daycare.id}
                                                                                    className={cn(
                                                                                        "flex items-center justify-between p-5 rounded-2xl transition-all duration-300 shadow-sm border",
                                                                                        daycare.is_active
                                                                                            ? "bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-500/30"
                                                                                            : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100"
                                                                                    )}
                                                                                >
                                                                                    <span className={cn("text-base font-bold truncate pr-4", daycare.is_active ? "text-indigo-900 dark:text-indigo-300" : "text-slate-500 dark:text-slate-500")}>
                                                                                        {daycare.name}
                                                                                    </span>
                                                                                    <Switch
                                                                                        checked={daycare.is_active}
                                                                                        onCheckedChange={() => toggleDaycareAvailability(domain.id, daycare.id)}
                                                                                        className="data-[state=checked]:bg-indigo-600 shrink-0"
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>

                    {/* FOOTER */}
                    {filteredDomains.length > 0 && (
                        <div className="flex flex-col items-center justify-between gap-4 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-950/50 px-6 py-5 sm:flex-row transition-colors">
                            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                                {searchQuery || hideUnused ? `Found ` : `Showing `}
                                <span className="font-black text-slate-900 dark:text-white mx-1 text-sm">{filteredDomains.length}</span> records
                            </div>
                        </div>
                    )}
                </Card>

                {/* 🚀 PREMIUM MODAL */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent hideClose className="sm:max-w-[600px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                        {/* Standard Premium Header */}
                        <div className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors shrink-0">
                            <DialogHeader className="text-left">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shadow-sm transition-colors">
                                        {editingDomain ? <Edit2 className="size-6" strokeWidth={2.5} /> : <Plus className="size-6" strokeWidth={2.5} />}
                                    </div>
                                    <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {editingDomain ? 'Edit Domain' : 'Create Custom Domain'}
                                    </DialogTitle>
                                </div>
                                <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-base mt-2 leading-relaxed">
                                    {editingDomain ? 'Modify baseline configuration parameters for this criteria.' : 'Create a brand new structural category to assess children.'}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-zinc-950/30 p-6 sm:p-8">
                            <form id="domain-form" onSubmit={handleSubmit} className="space-y-6">

                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Domain Target Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        className={cn(
                                            "h-12 text-base font-bold bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors",
                                            errors.name && "border-red-500 ring-1 ring-red-500"
                                        )}
                                        value={data.name}
                                        onChange={e => {
                                            clearErrors('name');
                                            setData('name', e.target.value);
                                        }}
                                        placeholder="e.g., Fine Motor Integration"
                                        required
                                    />
                                    {errors.name && <p className="text-[11px] font-bold uppercase tracking-widest text-red-500 mt-2">{errors.name}</p>}
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Scope Description / Guide</Label>
                                    <Input
                                        className="h-12 text-base font-medium bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Enter descriptive rubric or assessment instructions..."
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Maximum Scoring Cap <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        className="h-12 text-lg font-black bg-white dark:bg-zinc-900 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-indigo-500 transition-colors w-full sm:w-1/2"
                                        value={data.max_score}
                                        onChange={e => setData('max_score', parseInt(e.target.value) || 0)}
                                        required
                                    />
                                </div>

                                {!editingDomain && (
                                    <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 p-5 sm:p-6 rounded-2xl shadow-sm flex gap-4 items-start transition-colors mt-8">
                                        <BookOpen className="size-6 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />
                                        <div className="text-base text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                                            <strong className="block mb-2 font-black text-lg">Supplemental Domain Framework</strong>
                                            This newly created domain scales independently per daycare and does not alter the mandatory standard ECCD baseline formulas.
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Standard Premium Footer */}
                        <DialogFooter className="px-6 py-5 bg-slate-50 dark:bg-zinc-950 border-t border-slate-100 dark:border-slate-800 flex-col sm:flex-row justify-end items-center gap-3 transition-colors m-0 shrink-0">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="mr-2 size-5" /> Cancel
                            </Button>
                            <Button
                                type="submit"
                                form="domain-form"
                                disabled={processing}
                                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                            >
                                {editingDomain ? 'Save Configuration' : 'Confirm Creation'}
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
}

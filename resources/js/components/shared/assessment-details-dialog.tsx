import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    getOverallInterpretation,
    getNextDueDate,
    getScaledScore,
    getStandardScore,
    getEccdDomainInterpretation,
    getItedDomainInterpretation
} from '@/utils/eccd-scoring-system';
import { generateAssessmentPDF } from '@/utils/export-assessment-pdf';
import { AlertTriangle, Download, Pencil, Save, X, FileSignature, CheckCircle2, ClipboardPen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// --- TYPES ---
export interface DomainScore {
    id?: number;
    domain_id?: number;
    domain: string;
    rawScore: number;
    scaledScore: number;
    maxScore: number;
    interpretation: string;
    isIncluded: boolean;
    [key: string]: any;
}

export interface AssessmentData {
    id: number;
    childName: string;
    childAge?: number;
    childMonths?: number;
    evaluation: string;
    dateCreated: string;
    completedDate?: string;
    evaluator: string;
    status: 'Completed' | 'In Progress' | 'Draft';
    category?: string;
    standardScore: number;
    sumOfScaled: number;
    domainScores: DomainScore[];
    domainScoresRaw?: any[];
    assessmentSummary: string;
    recommendation: string;
    nextAssessmentDue: string;
    daycareName?: string;
    overallRating?: string;
}

interface AssessmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assessment: AssessmentData | null;
    domains?: { id: number; name: string; max_score?: number }[];
    scaleRules?: any[];
    standardRules?: any[];
    onSave?: (data: any) => void;
    readOnly?: boolean;
}

// --- HELPERS ---
const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'TBD') return '';
    return dateString.split('T')[0];
};

// --- DATA TRANSFORMATION (DYNAMIC) ---
const processAssessmentData = (
    assessment: AssessmentData | null,
    globalDomains: any[] = [],
    scaleRules: any[] = [],
    standardRules: any[] = []
) => {
    if (!assessment) return null;

    const ageY = assessment.childAge ?? 4;
    const ageM = assessment.childMonths ?? 0;
    const isEccd = (ageY >= 3);

    const baseList = globalDomains.length > 0
        ? globalDomains.map(gd => ({
            domain_id: gd.id,
            domain: gd.name,
            maxScore: gd.max_score || 0,
            rawScore: 0,
            scaledScore: 0,
            interpretation: '',
            isIncluded: true
        }))
        : (assessment.domainScores || []);

    const scoresToUse = baseList.map(base => {
        const existing = (assessment.domainScores || []).find(
            d => d.domain_id === base.domain_id || d.id === base.domain_id || d.domain === base.domain
        );

        const raw = existing?.rawScore ?? (existing as any)?.raw_score ?? base.rawScore ?? 0;
        const max = existing?.maxScore ?? (existing as any)?.max_score ?? base.maxScore ?? 0;
        const name = existing?.domain ?? (existing as any)?.name ?? base.domain ?? 'Unknown Domain';
        const domainId = existing?.domain_id ?? existing?.id ?? base.domain_id;

        let calculatedScaled = raw;
        try {
            calculatedScaled = getScaledScore(name, raw, ageY, ageM, scaleRules);
            if (isNaN(calculatedScaled) || calculatedScaled === undefined) calculatedScaled = raw;
        } catch (e) {
            calculatedScaled = raw;
        }

        const calculatedInterp = isEccd
            ? getEccdDomainInterpretation(calculatedScaled)
            : getItedDomainInterpretation(raw, max);

        return {
            id: existing?.id,
            domain_id: domainId,
            domain: name,
            rawScore: raw,
            scaledScore: calculatedScaled,
            maxScore: max,
            interpretation: calculatedInterp,
            isIncluded: existing ? (existing.isIncluded !== false) : true,
        };
    });

    const activeDomains = scoresToUse.filter((d) => d.isIncluded);
    const calculatedSum = activeDomains.reduce((sum, d) => sum + d.scaledScore, 0);
    const calculatedStandard = isEccd ? getStandardScore(calculatedSum, standardRules) : calculatedSum;
    const totalMax = activeDomains.reduce((sum, d) => sum + d.maxScore, 0);
    const calculatedRating = getOverallInterpretation(calculatedStandard, ageY, ageM, totalMax);
    const calculatedNextDue = getNextDueDate(calculatedStandard, assessment.dateCreated);

    return {
        domainScores: scoresToUse,
        nextAssessmentDue: formatDateForInput(calculatedNextDue || assessment.nextAssessmentDue),
        assessmentSummary: assessment.assessmentSummary || '',
        recommendation: assessment.recommendation || '',
        standardScore: calculatedStandard,
        sumOfScaled: calculatedSum,
        overallRating: calculatedRating,
    };
};

export function AssessmentDetailsDialog({
    open,
    onOpenChange,
    assessment,
    domains = [],
    scaleRules = [],
    standardRules = [],
    onSave,
    readOnly = false
}: AssessmentDetailsDialogProps) {

    const [formState, setFormState] = useState(() => processAssessmentData(assessment, domains, scaleRules, standardRules));
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormState(processAssessmentData(assessment, domains, scaleRules, standardRules));
        setHasChanges(false);
        setIsEditing(false);
    }, [assessment, domains, scaleRules, standardRules]);

    if (!assessment || !formState) return null;

    const { domainScores, nextAssessmentDue, standardScore, sumOfScaled, overallRating } = formState;

    const activeDomains = domainScores.filter((d) => d.isIncluded);
    const filledDomains = activeDomains.filter((d) => d.rawScore > 0).length;
    const totalActive = activeDomains.length;

    let computedStatus: AssessmentData['status'] = 'Draft';
    if (totalActive > 0 && filledDomains === totalActive) {
        computedStatus = 'Completed';
    } else if (filledDomains > 0) {
        computedStatus = 'In Progress';
    }

    const isLocked = !isEditing || readOnly || !onSave || (assessment.status === 'Completed' && !isEditing);

    // --- HANDLERS ---
    const updateFormState = (updates: Partial<typeof formState>) => {
        setFormState((prev) => (prev ? { ...prev, ...updates } : null));
        setHasChanges(true);
    };

    const handleRawScoreChange = (index: number, newRawScore: number) => {
        if (readOnly) return;

        const newScores = [...domainScores];
        const currentDomain = newScores[index];
        const ageY = assessment.childAge ?? 4;
        const ageM = assessment.childMonths ?? 0;
        const isEccd = (ageY >= 3);

        const val = isNaN(newRawScore) ? 0 : Math.min(Math.max(0, newRawScore), currentDomain.maxScore || 999);

        let newScaled = val;
        try {
            newScaled = getScaledScore(currentDomain.domain, val, ageY, ageM, scaleRules);
            if (isNaN(newScaled) || newScaled === undefined) newScaled = val;
        } catch (e) {
            newScaled = val;
        }

        const newDomainInterp = isEccd
            ? getEccdDomainInterpretation(newScaled)
            : getItedDomainInterpretation(val, currentDomain.maxScore);

        newScores[index] = { ...currentDomain, rawScore: val, scaledScore: newScaled, interpretation: newDomainInterp };

        const active = newScores.filter((d) => d.isIncluded);
        const newSum = active.reduce((sum, d) => sum + d.scaledScore, 0);
        const newStandard = isEccd ? getStandardScore(newSum, standardRules) : newSum;
        const totalMax = active.reduce((sum, d) => sum + d.maxScore, 0);
        const newRating = getOverallInterpretation(newStandard, ageY, ageM, totalMax);
        const newNextDue = getNextDueDate(newStandard, assessment.dateCreated);

        setFormState(prev => prev ? {
            ...prev,
            domainScores: newScores,
            sumOfScaled: newSum,
            standardScore: newStandard,
            overallRating: newRating,
            nextAssessmentDue: formatDateForInput(newNextDue),
        } : null);

        setHasChanges(true);
    };

    const handleDateChange = (value: string) => {
        if (readOnly) return;
        updateFormState({ nextAssessmentDue: value });
    };

    const handleSaveAssessment = () => {
        if (!onSave) return;

        const mappedDomains = domainScores.map(d => ({
            id: d.id,
            domain_id: d.domain_id,
            domain: d.domain,
            raw_score: d.rawScore,
            scaled_score: d.scaledScore,
            interpretation: d.interpretation
        }));

        onSave({
            domainScores: mappedDomains,
            status: computedStatus,
            assessmentSummary: formState.assessmentSummary,
            recommendation: formState.recommendation,
            nextAssessmentDue: nextAssessmentDue === '' ? null : nextAssessmentDue,
            standardScore,
            sumOfScaled,
        });
        setHasChanges(false);
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        const status = isLocked ? assessment.status : computedStatus;
        const baseClasses = "px-2.5 py-1 text-[11px] uppercase tracking-widest font-bold shadow-none shrink-0 transition-colors w-fit border flex items-center gap-1.5";

        if (status === 'Completed') return <Badge variant="outline" className={cn(baseClasses, "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/50")}><CheckCircle2 className="size-3.5" /> Completed</Badge>;
        if (status === 'In Progress') return <Badge variant="outline" className={cn(baseClasses, "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-900/50")}><ClipboardPen className="size-3.5" /> In Progress</Badge>;
        return <Badge variant="outline" className={cn(baseClasses, "bg-slate-50 text-slate-600 border-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:border-slate-700")}>Draft</Badge>;
    };

    const handleExportPDF = () => {
        if (!assessment) return;
        toast.success('Preparing PDF export...');

        const includedOnly = domainScores.filter((d) => d.isIncluded).map(d => ({
            domain: d.domain,
            rawScore: d.rawScore,
            scaledScore: d.scaledScore,
            interpretation: d.interpretation,
            maxScore: d.maxScore
        }));

        generateAssessmentPDF({
            childName: assessment.childName,
            childAge: assessment.childAge,
            childMonths: assessment.childMonths,
            evaluation: (assessment as any).assessment_type || 'Assessment',
            dateCreated: assessment.dateCreated,
            evaluator: assessment.evaluator,
            status: assessment.status,
            standardScore: standardScore,
            sumOfScaled: sumOfScaled,
            domainScores: includedOnly,
            nextAssessmentDue: nextAssessmentDue || 'TBD',
            overallRating: overallRating || assessment.overallRating || 'N/A',
            daycareName: assessment.daycareName || 'N/A',
            assessmentSummary: formState.assessmentSummary,
            recommendation: formState.recommendation,
        } as any);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose className="sm:max-w-[1000px] p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl bg-white dark:bg-zinc-950 transition-colors duration-200 flex flex-col max-h-[90vh]">

                {/* Print Styles */}
                <style>{`
                    @media print {
                        body { background: white !important; }
                        .print\\:hidden { display: none !important; }
                        .print\\:block { display: block !important; }
                        .print\\:shadow-none { box-shadow: none !important; }
                        .print\\:border-slate-300 { border-color: #cbd5e1 !important; }
                        .print\\:border-none { border: none !important; }
                        .print\\:bg-transparent { background-color: transparent !important; }
                        .print\\:overflow-visible { overflow: visible !important; }
                        .print\\:max-h-full { max-height: none !important; }
                    }
                `}</style>

                {/* Print Only Header */}
                <div className="hidden print:block text-center mb-6 border-b-2 border-slate-900 pb-4 p-8">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">ECCD Scoring Report</h1>
                    <p className="text-base font-bold text-slate-500 mt-2">{assessment.childName} • {assessment.evaluation} • Generated on {new Date().toLocaleDateString()}</p>
                </div>

                {/* --- PREMIUM HEADER --- */}
                <DialogHeader className="bg-white dark:bg-zinc-900 px-6 py-6 sm:px-8 border-b border-slate-100 dark:border-slate-800 shadow-sm transition-colors flex flex-row items-center justify-between shrink-0 m-0 print:hidden">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                            <FileSignature className="size-6" strokeWidth={2.5} />
                        </div>
                        <div className="text-left mt-1">
                            <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 transition-colors">
                                {assessment.childName}
                                {assessment.category && (
                                    <span className="rounded-md border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest shrink-0 transition-colors mt-1.5 shadow-none">
                                        {assessment.category}
                                    </span>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1 transition-colors flex items-center gap-2">
                                {assessment.evaluation} <span className="text-slate-300 dark:text-slate-600">•</span> {assessment.dateCreated}
                            </DialogDescription>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 mt-0 shrink-0">
                        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Status</p>
                        {getStatusBadge()}
                    </div>
                </DialogHeader>

                {/* --- SCROLLABLE BODY --- */}
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8 custom-scrollbar bg-slate-50 dark:bg-zinc-950/30 print:overflow-visible print:max-h-full print:bg-white print:p-0">

                    {/* DATA GRID */}
                    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors print:shadow-none print:border-slate-300 print:rounded-none">

                        {/* Table Header */}
                        <div className="flex w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors print:bg-slate-100">
                            <div className="flex w-[50%] sm:w-[55%] items-center border-r border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4">Domain / Subject</div>
                            <div className="flex w-[18%] sm:w-[15%] items-center justify-center border-r border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-500/5 text-indigo-700 dark:text-indigo-400 px-2 py-4 transition-colors">
                                Raw Score
                            </div>
                            <div className="flex w-[16%] sm:w-[15%] items-center justify-center border-r border-slate-200 dark:border-slate-800 px-2 py-4">Scaled Score</div>
                            <div className="flex w-[16%] sm:w-[15%] items-center justify-center px-2 py-4">Interpretation</div>
                        </div>

                        {/* Data Rows */}
                        <div className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors print:divide-slate-300">
                            {domainScores.map((domain, index) => {
                                if (!domain.isIncluded) return null;

                                const isMonitor = domain.interpretation && domain.interpretation.toLowerCase().includes('monitor');
                                const isEditingRow = !isLocked;

                                return (
                                    <div
                                        key={domain.domain_id || index}
                                        className={cn(
                                            "group flex w-full transition-colors min-h-[60px]",
                                            isMonitor ? 'bg-red-50/30 dark:bg-red-500/5 hover:bg-red-50/50 dark:hover:bg-red-500/10' : 'bg-white dark:bg-zinc-900 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50',
                                            "print:bg-white print:hover:bg-white"
                                        )}
                                    >
                                        <div className="flex w-[50%] sm:w-[55%] items-center border-r border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 font-bold text-base text-slate-700 dark:text-slate-200 transition-colors print:border-slate-300">
                                            {domain.domain}
                                            {isMonitor && <AlertTriangle className="ml-2 size-4 text-red-500 dark:text-red-400 transition-colors print:hidden" />}
                                            {domain.maxScore > 0 && (
                                                <span className="ml-2 text-[11px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100">
                                                    (Max: {domain.maxScore})
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex w-[18%] sm:w-[15%] items-center justify-center border-r border-slate-100 dark:border-slate-800 bg-indigo-50/30 dark:bg-indigo-500/5 px-2 py-3 transition-colors print:bg-white print:border-slate-300">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={domain.maxScore || 999}
                                                value={domain.rawScore === 0 ? '' : domain.rawScore}
                                                placeholder="-"
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => handleRawScoreChange(index, parseInt(e.target.value))}
                                                className={cn(
                                                    "h-12 w-20 text-center text-base font-black shadow-sm transition-colors rounded-xl print:border-none print:shadow-none print:bg-transparent print:p-0",
                                                    isEditingRow
                                                        ? 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-indigo-500'
                                                        : 'border-transparent bg-transparent text-slate-800 dark:text-slate-200 shadow-none'
                                                )}
                                                disabled={!isEditingRow}
                                            />
                                        </div>

                                        <div className="flex w-[16%] sm:w-[15%] items-center justify-center border-r border-slate-100 dark:border-slate-800 px-2 py-3 font-black text-lg text-slate-700 dark:text-slate-200 transition-colors print:border-slate-300">
                                            {domain.scaledScore}
                                        </div>

                                        <div className={cn(
                                            "flex w-[16%] sm:w-[15%] items-center justify-center px-2 py-3 text-[11px] font-bold uppercase tracking-widest text-center transition-colors",
                                            isMonitor ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400',
                                            "print:text-slate-700"
                                        )}>
                                            {domain.interpretation || '—'}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals Row */}
                        <div className="flex w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-zinc-900/50 transition-colors min-h-[60px] print:border-slate-300 print:bg-slate-50">
                            <div className="flex w-[68%] sm:w-[70%] items-center justify-end border-r border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors print:border-slate-300">
                                Sum of Scaled Scores
                            </div>
                            <div className="flex w-[16%] sm:w-[15%] items-center justify-center border-r border-slate-200 dark:border-slate-800 px-2 py-4 text-2xl font-black text-slate-900 dark:text-white transition-colors print:border-slate-300 print:text-black">
                                {sumOfScaled}
                            </div>
                            <div className="w-[16%] sm:w-[15%] bg-slate-100 dark:bg-zinc-900/80 transition-colors print:bg-transparent"></div>
                        </div>

                        {/* Standard Score Row */}
                        <div className="flex w-full border-t border-indigo-100 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/10 transition-colors min-h-[72px] print:border-slate-300 print:bg-indigo-50/50">
                            <div className="flex w-[68%] sm:w-[70%] items-center justify-end border-r border-indigo-200 dark:border-indigo-900/50 px-4 sm:px-6 py-4 text-[11px] font-bold text-indigo-800 dark:text-indigo-400 uppercase tracking-widest transition-colors print:border-slate-300 print:text-indigo-900">
                                Standard Score (Composite)
                            </div>
                            <div className="flex w-[32%] sm:w-[30%] items-center px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <span className="flex size-12 sm:h-14 sm:w-20 shrink-0 items-center justify-center rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-zinc-950 text-2xl font-black text-indigo-700 dark:text-indigo-400 shadow-sm transition-colors print:border-slate-300 print:text-indigo-900">
                                        {standardScore}
                                    </span>
                                    <span className={cn(
                                        "text-sm font-bold uppercase tracking-widest transition-colors",
                                        formState.standardScore === 0 ? 'text-slate-400 dark:text-slate-500' : 'text-indigo-700 dark:text-indigo-300',
                                        "print:text-indigo-900"
                                    )}>
                                        {formState.overallRating || 'Assessment'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info Section */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 print:grid-cols-3 print:break-inside-avoid">
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm lg:col-span-2 transition-colors print:shadow-none print:border-slate-300">
                            <h4 className="mb-4 text-[11px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors print:border-slate-300">Score Interpretation Guide</h4>
                            <div className="grid grid-cols-2 gap-x-6 sm:gap-x-10 gap-y-4">
                                <div className="space-y-2.5">
                                    <p className="mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Scaled Scores (Per Domain)</p>
                                    <LegendRow range="1 - 3" label="Monitor (3mo)" color="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500" />
                                    <LegendRow range="4 - 6" label="Monitor (6mo)" color="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-l-2 border-orange-500" />
                                    <LegendRow range="7 - 13" label="Average" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500" />
                                    <LegendRow range="14 - 19" label="Advanced" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500" />
                                </div>
                                <div className="space-y-2.5">
                                    <p className="mb-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Standard Scores (Composite)</p>
                                    <LegendRow range="≤ 69" label="Monitor (3mo)" color="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500" />
                                    <LegendRow range="70 - 79" label="Monitor (6mo)" color="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-l-2 border-orange-500" />
                                    <LegendRow range="80 - 119" label="Average" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500" />
                                    <LegendRow range="≥ 120" label="Advanced" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* NEXT DUE */}
                        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-sm transition-colors h-full print:shadow-none print:border-slate-300">
                            <div>
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">Next Assessment</Label>
                                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1.5 transition-colors">Calculated automatically</p>
                            </div>
                            <div className="mt-5 flex justify-end">
                                <Input
                                    type="date"
                                    value={nextAssessmentDue}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className={cn(
                                        "h-12 w-full text-base font-bold rounded-xl shadow-sm transition-colors print:border-none print:shadow-none print:p-0 print:bg-transparent print:justify-end print:flex",
                                        isLocked
                                            ? 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                                            : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus-visible:ring-indigo-500'
                                    )}
                                    disabled={isLocked && computedStatus !== 'Completed'}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- PREMIUM FOOTER ACTIONS --- */}
                <DialogFooter className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-zinc-900 flex-col sm:flex-row justify-between items-center gap-3 transition-colors m-0 shrink-0 print:hidden">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-12 w-full sm:w-auto px-6 rounded-xl text-base font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <X className="mr-2 size-5" /> Close
                    </Button>

                    <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-3">
                        <Button
                            onClick={handleExportPDF}
                            variant="outline"
                            className="h-12 w-full sm:w-auto px-6 rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Download className="mr-2 size-5" /> Export PDF
                        </Button>

                        {!readOnly && onSave && !isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-base font-bold shadow-sm transition-colors"
                            >
                                <Pencil className="mr-2 size-5" /> Edit Score
                            </Button>
                        )}
                        {isEditing && (
                            <Button
                                onClick={handleSaveAssessment}
                                className="h-12 w-full sm:w-auto px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-base font-bold shadow-sm transition-colors"
                            >
                                <Save className="mr-2 size-5" /> Save Changes
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function LegendRow({ range, label, color }: { range: string; label: string; color: string }) {
    return (
        <div className={cn("flex items-center justify-between rounded-xl px-3 py-2 text-[11px] transition-colors", color)}>
            <span className="font-bold text-xs">{range}</span>
            <span className="font-bold uppercase tracking-widest text-[11px]">{label}</span>
        </div>
    );
}

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    getOverallInterpretation,
    getNextDueDate,
    getScaledScore,
    getStandardScore,
    getEccdDomainInterpretation,
    getItedDomainInterpretation
} from '@/utils/eccd-scoring-system';
import { generateAssessmentPDF } from '@/utils/export-assessment-pdf';
import { AlertTriangle, Download, Pencil, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// --- TYPES ---
export interface DomainScore {
    id?: number;
    domain: string;
    rawScore: number;
    scaledScore: number;
    maxScore: number;
    interpretation: string;
    isIncluded: boolean;
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
    onSave?: (data: any) => void;
    readOnly?: boolean;
}

// --- HELPERS ---
const getDomainInterpretation = (scaledScore: number) => {
    if (scaledScore <= 3) return 'Monitor (3mo)';
    if (scaledScore <= 6) return 'Monitor (6mo)';
    if (scaledScore <= 13) return 'Average';
    if (scaledScore <= 16) return 'Slightly Adv.';
    return 'Highly Adv.';
};

const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'TBD') return '';
    return dateString.split('T')[0];
};

// --- DATA TRANSFORMATION ---
const processAssessmentData = (assessment: AssessmentData | null) => {
    if (!assessment) return null;

    const ageY = assessment.childAge ?? 4;
    const ageM = assessment.childMonths ?? 0;
    const isEccd = (ageY >= 3);

    let scoresToUse: DomainScore[] = [];

    if (assessment.domainScores && assessment.domainScores.length > 0) {
        scoresToUse = assessment.domainScores.map((d) => {
            const raw = d.rawScore || 0;
            const calculatedScaled = getScaledScore(d.domain, raw, ageY, ageM);

            const calculatedInterp = isEccd
                ? getEccdDomainInterpretation(calculatedScaled)
                : getItedDomainInterpretation(raw, d.maxScore);

            return {
                ...d,
                rawScore: raw,
                scaledScore: calculatedScaled,
                interpretation: calculatedInterp,
                isIncluded: (d as any).isIncluded !== false,
            };
        });
    }

    const activeDomains = scoresToUse.filter((d) => d.isIncluded);
    const calculatedSum = activeDomains.reduce((sum, d) => sum + d.scaledScore, 0);
    const calculatedStandard = isEccd ? getStandardScore(calculatedSum) : calculatedSum;

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

export function AssessmentDetailsDialog({ open, onOpenChange, assessment, onSave, readOnly = false }: AssessmentDetailsDialogProps) {
    const [formState, setFormState] = useState(() => processAssessmentData(assessment));
    const [hasChanges, setHasChanges] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormState(processAssessmentData(assessment));
        setHasChanges(false);
        setIsEditing(false);
    }, [assessment]);

    if (!assessment || !formState) return null;

    const { domainScores, nextAssessmentDue, standardScore, sumOfScaled, overallRating } = formState;
    const childAge = assessment.childAge ?? 4;

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

        const val = isNaN(newRawScore) ? 0 : Math.min(Math.max(0, newRawScore), currentDomain.maxScore);
        const newScaled = getScaledScore(currentDomain.domain, val, ageY, ageM);

        const newDomainInterp = isEccd
            ? getEccdDomainInterpretation(newScaled)
            : getItedDomainInterpretation(val, currentDomain.maxScore);

        newScores[index] = { ...currentDomain, rawScore: val, scaledScore: newScaled, interpretation: newDomainInterp };

        const active = newScores.filter((d) => d.isIncluded);
        const newSum = active.reduce((sum, d) => sum + d.scaledScore, 0);
        const newStandard = isEccd ? getStandardScore(newSum) : newSum;

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
        updateFormState({
            nextAssessmentDue: value,
        });
    };

    const handleSaveAssessment = () => {
        if (!onSave) return;
        onSave({
            domainScores,
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
        if (status === 'Completed') return <Badge className="bg-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400 hover:bg-emerald-600 border-none">✓ Completed</Badge>;
        if (status === 'In Progress') return <Badge className="bg-blue-500 dark:bg-blue-500/20 dark:text-blue-400 hover:bg-blue-600 border-none">⟳ In Progress</Badge>;
        return <Badge className="bg-slate-400 dark:bg-slate-500/20 dark:text-slate-400 hover:bg-slate-500 border-none">⏱ Draft</Badge>;
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
            <DialogContent className="flex h-[90vh] w-full max-w-[90vw] flex-col gap-0 overflow-hidden rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-950 p-0 md:max-w-[1100px] transition-colors duration-200">
                <DialogTitle className="sr-only">Assessment Details</DialogTitle>
                <DialogDescription className="sr-only">Score Sheet</DialogDescription>

                {/* Header */}
                <div className="shrink-0 bg-slate-900 dark:bg-black px-6 py-4 text-white transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">{assessment.childName}</h2>
                                <p className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                                    {assessment.evaluation} • {assessment.dateCreated}
                                </p>
                            </div>
                            {assessment.category && (
                                <Badge variant="outline" className="border-blue-400/30 text-[10px] text-blue-200 bg-blue-500/10">
                                    {assessment.category}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {getStatusBadge()}
                            {!readOnly && onSave && !isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    size="sm"
                                    className="h-8 gap-2 border border-blue-500 dark:border-blue-600 bg-blue-600 dark:bg-blue-600/80 px-3 text-xs hover:bg-blue-700 text-white transition-colors"
                                >
                                    <Pencil className="size-3" /> Edit Score
                                </Button>
                            )}
                            {isEditing && (
                                <Button
                                    onClick={handleSaveAssessment}
                                    size="sm"
                                    className="h-8 gap-2 bg-emerald-600 dark:bg-emerald-600/80 px-3 text-xs hover:bg-emerald-700 text-white transition-colors"
                                >
                                    <Save className="size-3" /> Save Changes
                                </Button>
                            )}
                            <Button onClick={handleExportPDF} size="sm" variant="secondary" className="h-8 gap-2 px-3 text-xs bg-white/10 dark:bg-white/5 hover:bg-white/20 text-white border-none transition-colors">
                                <Download className="size-3" /> Export PDF
                            </Button>
                            <button onClick={() => onOpenChange(false)} className="ml-2 text-slate-400 hover:text-white transition-colors">
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 transition-colors">
                    <div className="flex flex-col border border-slate-300 dark:border-slate-800 bg-white dark:bg-zinc-900 shadow-sm transition-colors">
                        {/* Table Header */}
                        <div className="flex w-full border-b border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-zinc-900/50 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-400 uppercase transition-colors">
                            <div className="flex w-[55%] items-center border-r border-slate-300 dark:border-slate-800 px-4 py-3">Domain / Subject</div>
                            <div className="flex w-[15%] items-center justify-center border-r border-slate-300 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-500/5 px-2 py-3 text-blue-800 dark:text-blue-400">
                                Raw Score
                            </div>
                            <div className="flex w-[15%] items-center justify-center border-r border-slate-300 dark:border-slate-800 px-2 py-3">Scaled Score</div>
                            <div className="flex w-[15%] items-center justify-center px-4 py-3">Interpretation</div>
                        </div>

                        {/* Data Rows */}
                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                            {domainScores.map((domain, index) => {
                                if (!domain.isIncluded) return null;

                                const isMonitor = domain.interpretation && domain.interpretation.toLowerCase().includes('monitor');
                                const isEditingRow = !isLocked;

                                return (
                                    <div
                                        key={index}
                                        className={`group flex w-full text-sm transition-colors ${isMonitor ? 'bg-red-50/30 dark:bg-red-500/5' : 'even:bg-slate-50 dark:even:bg-zinc-900/50 hover:bg-slate-100 dark:hover:bg-zinc-800/50'
                                            }`}
                                    >
                                        <div className="flex w-[55%] items-center border-r border-slate-200 dark:border-slate-800 px-4 py-2 font-medium text-slate-700 dark:text-slate-300">
                                            {domain.domain}
                                            {isMonitor && <AlertTriangle className="ml-2 size-3 text-red-500 dark:text-red-400" />}
                                            <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                (Max: {domain.maxScore})
                                            </span>
                                        </div>

                                        <div className="flex w-[15%] items-center justify-center border-r border-slate-200 dark:border-slate-800 bg-blue-50/10 dark:bg-blue-500/5 px-2 py-1">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={domain.maxScore}
                                                value={domain.rawScore === 0 ? '' : domain.rawScore}
                                                placeholder="0"
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => handleRawScoreChange(index, parseInt(e.target.value))}
                                                className={`h-8 w-16 text-center text-sm transition-colors ${isEditingRow
                                                    ? 'bg-white dark:bg-zinc-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500/50'
                                                    : 'border-transparent bg-transparent font-bold text-slate-800 dark:text-slate-200'
                                                    }`}
                                                disabled={!isEditingRow}
                                            />
                                        </div>

                                        <div className="flex w-[15%] items-center justify-center border-r border-slate-200 dark:border-slate-800 px-2 py-2 font-bold text-slate-700 dark:text-slate-200">
                                            {domain.scaledScore}
                                        </div>

                                        <div
                                            className={`flex w-[15%] items-center justify-center px-2 py-2 text-xs font-medium ${isMonitor ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}
                                        >
                                            {domain.interpretation}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totals Row */}
                        <div className="flex w-full border-t-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-zinc-900 transition-colors">
                            <div className="flex w-[70%] items-center justify-end border-r border-slate-300 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                                Sum of Scaled Scores
                            </div>
                            <div className="flex w-[15%] items-center justify-center border-r border-slate-300 dark:border-slate-800 px-2 py-3 text-base font-bold text-slate-900 dark:text-white">
                                {sumOfScaled}
                            </div>
                            <div className="w-[15%] bg-slate-200 dark:bg-zinc-800"></div>
                        </div>

                        {/* Standard Score Row */}
                        <div className="flex w-full border-t border-slate-200 dark:border-slate-800 bg-blue-50 dark:bg-blue-500/10 transition-colors">
                            <div className="flex w-[70%] items-center justify-end border-r border-blue-200 dark:border-blue-900/50 px-4 py-3 text-sm font-bold text-blue-900 dark:text-blue-400 uppercase">
                                Standard Score (Composite)
                            </div>
                            <div className="flex w-[30%] items-center px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-10 w-16 items-center justify-center rounded border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-zinc-950 text-xl font-bold text-blue-700 dark:text-blue-400 shadow-sm transition-colors">
                                        {standardScore}
                                    </span>
                                    <span
                                        className={`text-xs font-medium ${formState.standardScore === 0 ? 'text-slate-400 dark:text-slate-600 italic' : 'text-blue-600 dark:text-blue-400'}`}
                                    >
                                        {formState.overallRating || 'Assessment'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-sm lg:col-span-2 transition-colors">
                            <h4 className="mb-3 text-xs font-bold tracking-wide text-slate-900 dark:text-white uppercase">Score Interpretation Guide</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                <div className="space-y-1.5">
                                    <p className="mb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Scaled Scores (Per Domain)</p>
                                    <LegendRow range="1 - 3" label="Monitor (3mo)" color="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500 dark:border-red-500" />
                                    <LegendRow
                                        range="4 - 6"
                                        label="Monitor (6mo)"
                                        color="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-l-2 border-orange-500 dark:border-orange-500"
                                    />
                                    <LegendRow range="7 - 13" label="Average" color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500 dark:border-emerald-500" />
                                    <LegendRow range="14 - 19" label="Advanced" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500 dark:border-blue-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="mb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Standard Scores (Composite)</p>
                                    <LegendRow range="≤ 69" label="Monitor (3mo)" color="bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-l-2 border-red-500 dark:border-red-500" />
                                    <LegendRow
                                        range="70 - 79"
                                        label="Monitor (6mo)"
                                        color="bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-l-2 border-orange-500 dark:border-orange-500"
                                    />
                                    <LegendRow
                                        range="80 - 119"
                                        label="Average"
                                        color="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-l-2 border-emerald-500 dark:border-emerald-500"
                                    />
                                    <LegendRow range="≥ 120" label="Advanced" color="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500 dark:border-blue-500" />
                                </div>
                            </div>
                        </div>

                        {/* NEXT DUE */}
                        <div className="flex flex-col justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-zinc-900 p-4 shadow-sm transition-colors">
                            <div className="mb-2 text-right">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Next Assessment</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">Calculated automatically</p>
                            </div>
                            <div className="flex justify-end">
                                <Input
                                    type="date"
                                    value={nextAssessmentDue}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    className={`h-10 w-full font-medium transition-colors ${isLocked ? 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-600' : 'bg-white dark:bg-zinc-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 dark:focus:ring-indigo-500/50'}`}
                                    disabled={isLocked && computedStatus !== 'Completed'}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function LegendRow({ range, label, color }: { range: string; label: string; color: string }) {
    return (
        <div className={`flex items-center justify-between rounded px-2 py-1 text-[10px] transition-colors ${color}`}>
            <span className="font-medium">{range}</span>
            <span className="font-bold uppercase">{label}</span>
        </div>
    );
}

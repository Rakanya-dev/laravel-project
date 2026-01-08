import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateAssessmentPDF } from '@/utils/export-assessment-pdf';
import { AlertTriangle, Calendar, CheckCircle, Download, FileText, Pencil, Save, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface DomainScore {
    id?: number;
    domain: string;
    rawScore: number;
    scaledScore: number;
    interpretation: string;
}

export interface AssessmentData {
    id: number;
    childName: string;
    evaluation: string;
    dateCreated: string;
    completedDate?: string;
    evaluator: string;
    status: 'Completed' | 'In Progress' | 'Draft';
    standardScore: number;
    sumOfScaled: number;
    domainScores: DomainScore[];
    domainScoresRaw?: any[];
    assessmentSummary: string;
    recommendation: string;
    nextAssessmentDue: string;
    daycareName?: string;
}

interface AssessmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assessment: AssessmentData | null;
    onSave?: (data: any) => void;
    readOnly?: boolean;
}

// --- DOMAIN CONFIGURATION ---
const DOMAIN_MAX_SCORES: Record<string, number> = {
    'Gross Motor': 24,
    'Fine Motor': 17,
    'Self-Help': 40,
    'Receptive Language': 9,
    'Expressive Language': 16,
    Cognitive: 25,
    'Social-Emotional': 35,
    default: 30,
};

// --- SCORING LOGIC ---
const convertRawToScaled = (rawScore: number, domainName: string): number => {
    if (rawScore === 0) return 0;
    const maxPossible = DOMAIN_MAX_SCORES[domainName] || DOMAIN_MAX_SCORES['default'];
    const ratio = (rawScore / maxPossible) * 19;
    return Math.min(Math.max(Math.round(ratio), 1), 19);
};

const calculateStandardScore = (sumOfScaled: number): number => {
    if (sumOfScaled === 0) return 0;
    return Math.round(100 + (sumOfScaled - 70) * 1.5);
};

const getInterpretation = (scaledScore: number): string => {
    if (scaledScore === 0) return 'Not assessed';
    if (scaledScore <= 3) return 'Monitor after 3 months';
    if (scaledScore <= 6) return 'Monitor after 6 months';
    if (scaledScore <= 13) return 'Average overall';
    if (scaledScore <= 16) return 'Slightly advanced';
    return 'Highly advanced';
};

const getStandardInterpretation = (score: number): string => {
    if (score <= 69) return 'Monitor after 3 months';
    if (score <= 79) return 'Monitor after 6 months';
    if (score <= 119) return 'Average overall';
    if (score <= 129) return 'Slightly advanced';
    return 'Highly advanced';
};

const generateSummary = (score: number, childName: string): string => {
    const interpretation = getStandardInterpretation(score);
    return `${childName} has a Standard Score of ${score}, which suggests ${interpretation.toLowerCase()} development.`;
};

const generateRecommendation = (score: number): string => {
    if (score <= 69) return 'Immediate intervention and close monitoring required. Re-assess in 3 months.';
    if (score <= 79) return 'Targeted activities recommended to boost specific domains. Re-assess in 6 months.';
    if (score <= 119) return 'Continue with standard developmental activities.';
    return 'Provide enrichment activities to support advanced development.';
};

const getNextAssessmentDate = (score: number): string => {
    const date = new Date();
    if (score <= 69) date.setMonth(date.getMonth() + 3);
    else if (score <= 79) date.setMonth(date.getMonth() + 6);
    else date.setMonth(date.getMonth() + 12);
    return date.toISOString().split('T')[0];
};

// --- DATA TRANSFORMATION HELPER ---
const processAssessmentData = (assessment: AssessmentData | null) => {
    if (!assessment) return null;

    let scoresToUse: DomainScore[] = [];

    if (assessment.domainScoresRaw) {
        scoresToUse = assessment.domainScoresRaw.map((s: any) => {
            const raw = Number(s.score) || 0;
            const domainName = s.domain?.name || 'Unknown';
            const scaled = convertRawToScaled(raw, domainName);
            return {
                id: s.id,
                domain: domainName,
                rawScore: raw,
                scaledScore: scaled,
                interpretation: getInterpretation(scaled),
            };
        });
    } else {
        scoresToUse = assessment.domainScores || [];
    }

    let validDate = '';
    if (assessment.nextAssessmentDue && assessment.nextAssessmentDue !== 'TBD') {
        const dateObj = new Date(assessment.nextAssessmentDue);
        if (!isNaN(dateObj.getTime())) {
            validDate = dateObj.toISOString().split('T')[0];
        }
    }

    if (!validDate) {
        const filled = scoresToUse.filter((d) => d.rawScore > 0).length;
        if (scoresToUse.length > 0 && filled === scoresToUse.length) {
            const sum = scoresToUse.reduce((acc, d) => acc + d.scaledScore, 0);
            const std = calculateStandardScore(sum);
            validDate = getNextAssessmentDate(std);
        }
    }

    return {
        domainScores: scoresToUse,
        assessmentSummary: assessment.assessmentSummary || '',
        recommendation: assessment.recommendation || '',
        nextAssessmentDue: validDate,
        isManuallyEdited: {
            summary: !!assessment.assessmentSummary,
            rec: !!assessment.recommendation,
            due: !!validDate,
        },
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

    const { domainScores, assessmentSummary, recommendation, nextAssessmentDue, isManuallyEdited } = formState;

    const sumOfScaled = domainScores.reduce((sum, domain) => sum + domain.scaledScore, 0);
    const standardScore = calculateStandardScore(sumOfScaled);

    const filledDomains = domainScores.filter((d) => d.rawScore > 0).length;
    const totalDomains = domainScores.length;

    let computedStatus: AssessmentData['status'] = 'Draft';
    if (totalDomains > 0 && filledDomains === totalDomains) {
        computedStatus = 'Completed';
    } else if (filledDomains > 0) {
        computedStatus = 'In Progress';
    }

    const isLocked = !isEditing || readOnly || !onSave || assessment.status === 'Completed';

    // --- Handlers Helper to Update State ---
    const updateFormState = (updates: Partial<typeof formState>) => {
        setFormState((prev) => (prev ? { ...prev, ...updates } : null));
        setHasChanges(true);
    };

    const handleRawScoreChange = (index: number, newRawScore: number) => {
        if (isLocked) return;

        const newScores = [...domainScores];
        const currentDomain = newScores[index].domain;

        const maxScore = DOMAIN_MAX_SCORES[currentDomain] || DOMAIN_MAX_SCORES['default'];

        const val = isNaN(newRawScore) ? 0 : Math.min(Math.max(0, newRawScore), maxScore);

        const scaledScore = convertRawToScaled(val, currentDomain);

        newScores[index] = {
            ...newScores[index],
            rawScore: val,
            scaledScore: scaledScore,
            interpretation: getInterpretation(scaledScore),
        };

        const newFilled = newScores.filter((d) => d.rawScore > 0).length;
        const isNowComplete = newFilled === newScores.length;

        let updates: any = { domainScores: newScores };

        if (isNowComplete) {
            const newSum = newScores.reduce((sum, domain) => sum + domain.scaledScore, 0);
            const newStd = calculateStandardScore(newSum);

            if (!isManuallyEdited.summary) updates.assessmentSummary = generateSummary(newStd, assessment.childName);
            if (!isManuallyEdited.rec) updates.recommendation = generateRecommendation(newStd);
            if (!isManuallyEdited.due) updates.nextAssessmentDue = getNextAssessmentDate(newStd);
        }

        updateFormState(updates);
    };

    const handleManualEdit = (field: 'summary' | 'rec' | 'due', value: string) => {
        if (isLocked) return;

        const updates: any = {};
        const newEdited = { ...isManuallyEdited };

        if (field === 'summary') {
            updates.assessmentSummary = value;
            newEdited.summary = true;
        }
        if (field === 'rec') {
            updates.recommendation = value;
            newEdited.rec = true;
        }
        if (field === 'due') {
            updates.nextAssessmentDue = value;
            newEdited.due = true;
        }

        updates.isManuallyEdited = newEdited;
        updateFormState(updates);
    };

    const handleSaveAssessment = () => {
        if (!onSave) return;
        onSave({
            domainScores,
            status: computedStatus,
            assessmentSummary,
            recommendation,
            nextAssessmentDue,
            standardScore,
        });
        setHasChanges(false);
        setIsEditing(false);
    };

    const getStatusBadge = () => {
        const status = isLocked ? assessment.status : computedStatus;
        if (status === 'Completed') return <Badge className="bg-green-500 hover:bg-green-600">✓ Completed</Badge>;
        if (status === 'In Progress') return <Badge className="bg-blue-500 hover:bg-blue-600">⟳ In Progress</Badge>;
        return <Badge className="bg-gray-400 hover:bg-gray-500">⏱ Draft</Badge>;
    };

    const handleExportPDF = () => {
        toast.success('Preparing PDF export...');
        generateAssessmentPDF({
            childName: assessment.childName,
            evaluation: assessment.evaluation,
            dateCreated: assessment.dateCreated,
            evaluator: assessment.evaluator,
            standardScore: standardScore,
            sumOfScaled: sumOfScaled,
            domainScores: domainScores,
            assessmentSummary: assessmentSummary || 'No summary provided.',
            recommendation: recommendation || 'No recommendation provided.',
            nextAssessmentDue: nextAssessmentDue || 'TBD',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex h-[960px] max-h-[98vh] w-full flex-col gap-0 overflow-hidden rounded-xl border-0 p-0 sm:max-w-[700px]">
                <DialogTitle className="sr-only">Assessment Details</DialogTitle>
                <DialogDescription className="sr-only">View/Edit details</DialogDescription>

                {/* Header */}
                <div className="shrink-0 bg-slate-900 p-5 text-white">
                    <div className="mb-5 flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{assessment.childName}</h2>
                            <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                                Assessment Report {isLocked ? '(View Only)' : '(Editing)'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge()}

                            {!readOnly && onSave && assessment.status !== 'Completed' && !isEditing && (
                                <Button onClick={() => setIsEditing(true)} size="sm" className="h-7 gap-1.5 bg-blue-600 text-xs hover:bg-blue-700">
                                    <Pencil className="size-3" /> Edit
                                </Button>
                            )}

                            {isEditing && (
                                <Button onClick={handleSaveAssessment} size="sm" className="h-7 gap-1.5 bg-green-600 text-xs hover:bg-green-700">
                                    <Save className="size-3" /> Save
                                </Button>
                            )}

                            <Button onClick={handleExportPDF} size="sm" className="h-7 gap-1.5 bg-white text-xs text-slate-900 hover:bg-gray-100">
                                <Download className="size-3" /> Export PDF
                            </Button>
                            <button onClick={() => onOpenChange(false)} className="ml-1 rounded-lg p-1 hover:bg-white/10">
                                <X className="size-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <HeaderInfoBox icon={FileText} label="Evaluation" value={assessment.evaluation} />
                        <HeaderInfoBox icon={Calendar} label="Date" value={assessment.dateCreated} />
                        <HeaderInfoBox icon={User} label="Evaluator" value={assessment.evaluator} />
                        <HeaderInfoBox icon={CheckCircle} label="Daycare" value={assessment.daycareName || 'N/A'} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    {/* Scores Table */}
                    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
                            <div className="rounded bg-blue-50 p-1">
                                <FileText className="size-4 text-blue-600" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Domain Scores</h3>
                        </div>

                        <div className="p-5 pt-2">
                            <div className="mb-2 grid grid-cols-12 gap-4 px-2 text-xs font-medium tracking-wider text-gray-500 uppercase">
                                <div className="col-span-5">Domain</div>
                                <div className="col-span-2 text-center">Raw Score</div>
                                <div className="col-span-2 text-center">Scaled Score</div>
                                <div className="col-span-3">Interpretation</div>
                            </div>
                            <div className="mb-3 h-px bg-gray-100"></div>

                            <div className="space-y-2">
                                {domainScores.map((domain, index) => {
                                    const isMonitor = domain.interpretation.toLowerCase().includes('monitor');

                                    return (
                                        <div
                                            key={index}
                                            className={`grid grid-cols-12 items-center gap-4 rounded-md px-2 py-2 transition-colors ${
                                                isMonitor ? 'border border-red-100 bg-red-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="col-span-5 flex items-center gap-2 text-sm font-medium text-gray-700">
                                                {domain.domain}
                                                {isMonitor && <AlertTriangle className="size-3 text-red-500" />}
                                                <span className="text-[10px] font-normal text-gray-400">
                                                    (Max: {DOMAIN_MAX_SCORES[domain.domain] || 30})
                                                </span>
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <Input
                                                    type="number"
                                                    value={domain.rawScore === 0 ? '' : domain.rawScore}
                                                    placeholder="0"
                                                    onFocus={(e) => e.target.select()}
                                                    onChange={(e) => handleRawScoreChange(index, parseInt(e.target.value))}
                                                    className={`h-9 w-16 text-center placeholder:text-gray-400 ${
                                                        isLocked ? 'cursor-not-allowed border-transparent bg-gray-50 text-gray-600' : 'bg-white'
                                                    }`}
                                                    disabled={isLocked}
                                                />
                                            </div>

                                            <div className="col-span-2 flex justify-center">
                                                <div
                                                    className={`flex h-7 w-12 items-center justify-center rounded text-sm font-bold ${
                                                        isMonitor ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                                                    }`}
                                                >
                                                    {domain.scaledScore}
                                                </div>
                                            </div>
                                            <div className={`col-span-3 text-sm ${isMonitor ? 'font-medium text-red-600' : 'text-gray-500'}`}>
                                                {domain.interpretation}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="my-3 h-px bg-gray-100"></div>

                            {/* Sum of Scaled Scores */}
                            <div className="grid grid-cols-12 items-center gap-4 px-2">
                                <div className="col-span-5 text-sm font-bold text-gray-900">Sum of Scaled Scores</div>
                                <div className="col-span-2 text-center text-gray-300">-</div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex h-8 w-14 items-center justify-center rounded border border-gray-200 bg-gray-100 text-sm font-bold text-gray-700">
                                        {sumOfScaled}
                                    </div>
                                </div>
                                <div className="col-span-3 text-xs font-bold tracking-wider text-gray-400 uppercase">Total</div>
                            </div>

                            {/* Standard Score Row */}
                            <div className="mt-2 grid grid-cols-12 items-center gap-4 px-2">
                                <div className="col-span-5 text-sm font-bold text-blue-900">Standard Score</div>
                                <div className="col-span-2 text-center text-gray-300">-</div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="flex h-8 w-14 items-center justify-center rounded border border-blue-200 bg-blue-50 text-sm font-bold text-blue-700">
                                        {standardScore}
                                    </div>
                                </div>
                                <div className="col-span-3 text-xs font-bold tracking-wider text-blue-400 uppercase">Converted</div>
                            </div>
                        </div>
                    </div>

                    {/* Interpretation Legend */}
                    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <h4 className="mb-3 text-sm font-semibold text-gray-900">Score Interpretation Guide</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-1.5">
                                <p className="mb-1 text-[10px] font-bold text-gray-400 uppercase">Scaled Scores (Per Domain)</p>
                                <LegendRow range="1 - 3" label="Monitor after 3 months" color="bg-red-50 text-red-700 border-l-4 border-red-500" />
                                <LegendRow
                                    range="4 - 6"
                                    label="Monitor after 6 months"
                                    color="bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                                />
                                <LegendRow
                                    range="7 - 13"
                                    label="Average overall development"
                                    color="bg-green-50 text-green-700 border-l-4 border-green-500"
                                />
                                <LegendRow
                                    range="14 - 16"
                                    label="Slightly advanced development"
                                    color="bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                                />
                                <LegendRow
                                    range="17 - 19"
                                    label="Highly advanced development"
                                    color="bg-purple-50 text-purple-700 border-l-4 border-purple-500"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <p className="mb-1 text-[10px] font-bold text-gray-400 uppercase">Standard Scores (Total)</p>
                                <LegendRow range="≤ 69" label="Monitor after 3 months" color="bg-red-50 text-red-700 border-l-4 border-red-500" />
                                <LegendRow
                                    range="70 - 79"
                                    label="Monitor after 6 months"
                                    color="bg-orange-50 text-orange-700 border-l-4 border-orange-500"
                                />
                                <LegendRow
                                    range="80 - 119"
                                    label="Average overall development"
                                    color="bg-green-50 text-green-700 border-l-4 border-green-500"
                                />
                                <LegendRow
                                    range="120 - 129"
                                    label="Slightly advanced development"
                                    color="bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                                />
                                <LegendRow
                                    range="≥ 130"
                                    label="Highly advanced development"
                                    color="bg-purple-50 text-purple-700 border-l-4 border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Summary */}
                        <div className="flex flex-col rounded-xl border border-blue-100 bg-blue-50 p-4 shadow-sm md:col-span-3">
                            <div className="mb-2 flex items-center gap-2 text-blue-700">
                                <FileText className="size-4" />
                                <p className="text-xs font-bold tracking-wide uppercase">Summary</p>
                            </div>
                            <Textarea
                                value={assessmentSummary}
                                onChange={(e) => handleManualEdit('summary', e.target.value)}
                                className={`min-h-20 resize-y border-blue-200 bg-white text-sm ${isLocked ? 'cursor-not-allowed bg-gray-50 text-gray-600' : ''}`}
                                placeholder="Auto-generated on completion..."
                                disabled={isLocked}
                            />
                        </div>

                        {/* Recommendation */}
                        <div className="flex flex-col rounded-xl border border-green-100 bg-green-50 p-4 shadow-sm md:col-span-2">
                            <div className="mb-2 flex items-center gap-2 text-green-700">
                                <CheckCircle className="size-4" />
                                <p className="text-xs font-bold tracking-wide uppercase">Recommendation</p>
                            </div>
                            <Textarea
                                value={recommendation}
                                onChange={(e) => handleManualEdit('rec', e.target.value)}
                                className={`min-h-20 grow resize-none border-green-200 bg-white text-sm ${isLocked ? 'cursor-not-allowed bg-gray-50 text-gray-600' : ''}`}
                                placeholder="Auto-generated based on score..."
                                disabled={isLocked}
                            />
                        </div>

                        {/* Next Due */}
                        <div className="flex h-fit flex-col rounded-xl border border-orange-100 bg-orange-50 p-4 shadow-sm md:col-span-1">
                            <div className="mb-2 flex items-center gap-2 text-orange-700">
                                <Calendar className="size-4" />
                                <p className="text-xs font-bold tracking-wide uppercase">Next Due</p>
                            </div>
                            <div className="grow">
                                <Input
                                    type="date"
                                    value={nextAssessmentDue}
                                    onChange={(e) => handleManualEdit('due', e.target.value)}
                                    className={`h-10 border-orange-200 bg-white font-medium text-orange-900 ${isLocked ? 'cursor-not-allowed bg-gray-50' : ''}`}
                                    disabled={isLocked && computedStatus !== 'Completed'}
                                />
                                {!isLocked && computedStatus !== 'Completed' && (
                                    <p className="mt-1.5 text-[10px] leading-tight text-orange-600/80">
                                        Calculates automatically when all domains are scored.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white p-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    {!readOnly && hasChanges && !isLocked && (
                        <Button onClick={handleSaveAssessment} className="bg-blue-600 text-white shadow-sm hover:bg-blue-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HeaderInfoBox({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-slate-600/50 bg-[#334155] p-2.5">
            <div className="rounded bg-slate-700 p-1.5">
                <Icon className="size-4 text-blue-400" />
            </div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">{label}</p>
                <p className="truncate text-sm font-medium" title={value}>
                    {value}
                </p>
            </div>
        </div>
    );
}

function LegendRow({ range, label, color }: { range: string; label: string; color: string }) {
    return (
        <div className={`flex items-center justify-between rounded px-2 py-1 ${color}`}>
            <span className="text-[10px] font-medium">{range}</span>
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
    );
}

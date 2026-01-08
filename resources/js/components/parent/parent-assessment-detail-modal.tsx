import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Download, Calendar, User, FileText, Printer, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface DomainScore {
  domain: string;
  rawScore: number;
  scaledScore: number;
  interpretation: string;
}

interface Assessment {
  id: number;
  evaluation: string;
  dateCreated: string;
  evaluator: string;
  standardScore: number;
  sumOfScaled: number;
  domainScores: DomainScore[];
  assessmentSummary: string;
  recommendation: string;
  nextAssessmentDue: string;
}

interface ParentAssessmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
  childName: string;
}

export default function ParentAssessmentDetailModal({
  open,
  onOpenChange,
  assessment,
  childName
}: ParentAssessmentDetailModalProps) {

  if (!assessment) return null;

  const handleExportPDF = () => {
    toast.success('Downloading PDF report...');
  };

  const getStatusBadge = () => {
     return <Badge className="bg-green-500 text-white border-0 hover:bg-green-600">Completed</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[1000px] max-w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden flex flex-col rounded-xl border-0">
        <DialogHeader className="sr-only">
            <DialogTitle>Assessment Details for {childName}</DialogTitle>
            <DialogDescription>Detailed view of assessment results</DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="bg-slate-900 text-white p-5 shrink-0">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h2 className="text-xl font-bold">{childName}</h2>
              <p className="text-slate-400 text-xs uppercase tracking-wide font-medium">Assessment Report</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button onClick={handleExportPDF} size="sm" className="gap-1.5 bg-white text-slate-900 hover:bg-gray-100 border-0 h-7 text-xs">
                <Download className="size-3" /> PDF
              </Button>
              <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors ml-1 text-white">
                <X className="size-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-[#334155] rounded-lg p-2.5 border border-slate-600/50 flex items-center gap-3">
                <div className="bg-slate-700 p-1.5 rounded"><FileText className="size-4 text-blue-400"/></div>
                <div><p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Evaluation</p><p className="text-sm font-medium">{assessment.evaluation}</p></div>
             </div>
             <div className="bg-[#334155] rounded-lg p-2.5 border border-slate-600/50 flex items-center gap-3">
                <div className="bg-slate-700 p-1.5 rounded"><Calendar className="size-4 text-blue-400"/></div>
                <div><p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Date</p><p className="text-sm font-medium">{assessment.dateCreated}</p></div>
             </div>
             <div className="bg-[#334155] rounded-lg p-2.5 border border-slate-600/50 flex items-center gap-3">
                <div className="bg-slate-700 p-1.5 rounded"><User className="size-4 text-blue-400"/></div>
                <div><p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Evaluator</p><p className="text-sm font-medium">{assessment.evaluator}</p></div>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">

            {/* Scores Table (Read Only) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
                    <div className="bg-blue-50 p-1 rounded"><FileText className="size-4 text-blue-600" /></div>
                    <h3 className="font-semibold text-gray-900 text-sm">Domain Scores</h3>
                </div>
                <div className="p-5 pt-2">
                    <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Domain</div>
                        <div className="col-span-2 text-center">Raw</div>
                        <div className="col-span-2 text-center">Scaled</div>
                        <div className="col-span-3">Interpretation</div>
                    </div>
                    <div className="h-px bg-gray-100 mb-3"></div>
                    <div className="space-y-2">
                        {assessment.domainScores.map((domain, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center px-2 py-2 hover:bg-gray-50 rounded-md transition-colors">
                                <div className="col-span-5 text-sm font-medium text-gray-700">{domain.domain}</div>
                                <div className="col-span-2 text-center text-sm font-mono text-gray-600">{domain.rawScore}</div>
                                <div className="col-span-2 flex justify-center">
                                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-700 font-bold rounded-full text-xs">
                                        {domain.scaledScore}
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-gray-600 font-medium">{domain.interpretation}</div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-gray-100 my-3"></div>
                    <div className="grid grid-cols-12 gap-4 items-center px-2">
                        <div className="col-span-5 text-sm font-bold text-gray-900">Sum of Scaled</div>
                        <div className="col-span-2 text-center text-gray-300">-</div>
                        <div className="col-span-2 flex justify-center"><div className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 font-bold rounded-full text-xs">{assessment.sumOfScaled}</div></div>
                        <div className="col-span-3 text-xs text-gray-400 uppercase tracking-wider font-bold">Total</div>
                    </div>
                </div>
            </div>

            {/* Standard Score Card (Read Only) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-[#1d4ed8] rounded-xl p-5 text-white shadow-lg flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-20 bg-blue-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <span className="text-blue-100 text-xs font-medium uppercase tracking-wide">Standard Score</span>
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px]">Overall</Badge>
                    </div>
                    <div className="mt-2 relative z-10">
                        <span className="text-6xl font-bold tracking-tighter">{assessment.standardScore}</span>
                    </div>
                </div>

                {/* Summary (Wide) */}
                <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                        <FileText className="size-4" />
                        <p className="text-xs font-bold uppercase tracking-wide">Summary</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed flex-grow">
                        {assessment.assessmentSummary || "No summary provided."}
                    </p>
                </div>
            </div>

            {/* Recommendation & Next Due */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm flex flex-col">
                    <div className="flex items-center gap-2 mb-3 text-green-700">
                        <CheckCircle className="size-4" />
                        <p className="text-xs font-bold uppercase tracking-wide">Recommendation</p>
                    </div>
                    <p className="text-sm text-green-900 leading-relaxed">
                        {assessment.recommendation || "No specific recommendations."}
                    </p>
                </div>
                <div className="md:col-span-1 bg-orange-50 border border-orange-100 rounded-xl p-4 shadow-sm flex flex-col h-fit">
                    <div className="flex items-center gap-2 mb-3 text-orange-700">
                        <Calendar className="size-4" />
                        <p className="text-xs font-bold uppercase tracking-wide">Next Assessment Due</p>
                    </div>
                    <p className="text-lg font-bold text-orange-900">
                        {assessment.nextAssessmentDue || 'TBD'}
                    </p>
                </div>
             </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

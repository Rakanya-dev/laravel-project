import { useState, useMemo } from 'react';
import { Search, Filter, ClipboardList, ChevronDown, ChevronUp, Eye, Download, Printer } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Assessment {
  id: number;
  evaluation: string;
  evaluator: string;
  dateCreated: string;
  standardScore: number;
  sumOfScaled: number;
  assessmentSummary: string;
  recommendation: string;
  nextAssessmentDue: string;
  domainScores: Array<{
    domain: string;
    rawScore: number;
    scaledScore: number;
    interpretation: string;
  }>;
}

interface ChildAssessmentsListProps {
  assessments: Assessment[];
  onViewDetails: (assessment: Assessment) => void;
  onDownload: (id: number) => void;
  onPrint: (id: number) => void;
}

export function ChildAssessmentsList({ assessments, onViewDetails, onDownload, onPrint }: ChildAssessmentsListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>('all');
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});

  const filteredData = useMemo(() => {
    let data = [...assessments];
    if (filter === 'completed') data = data.filter(a => a.standardScore > 0);
    if (filter === 'in-progress') data = data.filter(a => !a.standardScore); // Assuming 0 or null means in-progress

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(a =>
        a.evaluation.toLowerCase().includes(q) ||
        a.evaluator.toLowerCase().includes(q) ||
        a.assessmentSummary?.toLowerCase().includes(q)
      );
    }
    return data.sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
  }, [assessments, search, filter]);

  const getScoreBadge = (score: number) => {
    if (score >= 115) return { label: 'Above Average', color: 'text-green-700 bg-green-100 border-green-200' };
    if (score >= 85) return { label: 'Average', color: 'text-blue-700 bg-blue-100 border-blue-200' };
    return { label: 'Below Average', color: 'text-orange-700 bg-orange-100 border-orange-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <CardTitle>Assessment History</CardTitle>
        <Badge variant="outline" className="text-neutral-500">
          {filteredData.length} Records
        </Badge>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <Input
            placeholder="Search assessments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="w-[180px] bg-white">
            <div className="flex items-center gap-2 text-neutral-600">
              <Filter className="size-3.5" /> <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assessments</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredData.length === 0 ? (
        <Card className="bg-neutral-50 border-dashed">
          <CardContent className="py-12 text-center">
            <ClipboardList className="mx-auto mb-3 size-10 text-neutral-300" />
            <p className="text-neutral-500 font-medium">No assessments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredData.map((assessment) => {
             const badge = getScoreBadge(assessment.standardScore);
             const isExpanded = expandedItems[assessment.id];

             return (
               <Collapsible
                 key={assessment.id}
                 open={isExpanded}
                 onOpenChange={(open) => setExpandedItems(p => ({...p, [assessment.id]: open}))}
               >
                 <Card className="overflow-hidden transition-all hover:border-blue-200">
                   <div className="p-5 flex items-start gap-4">
                      {/* Left: Summary */}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                           <h4 className="font-semibold text-lg text-slate-900">{assessment.evaluation}</h4>
                           <Badge className={`border ${badge.color}`}>{badge.label}</Badge>
                        </div>
                        <div className="text-sm text-neutral-500 flex items-center gap-2">
                           <span>{new Date(assessment.dateCreated).toLocaleDateString()}</span>
                           <span>•</span>
                           <span>{assessment.evaluator}</span>
                        </div>

                        {!isExpanded && (
                           <div className="mt-3 flex items-center gap-6 text-sm">
                              <div>
                                 <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">Standard Score</span>
                                 <p className="font-medium text-slate-900 text-lg">{assessment.standardScore}</p>
                              </div>
                              <div>
                                 <span className="text-neutral-400 uppercase text-[10px] tracking-wider font-bold">Next Due</span>
                                 <p className="font-medium text-slate-900">{assessment.nextAssessmentDue}</p>
                              </div>
                           </div>
                        )}
                      </div>

                      {/* Right: Trigger */}
                      <CollapsibleTrigger asChild>
                         <Button variant="ghost" size="icon" className="text-neutral-400">
                            {isExpanded ? <ChevronUp /> : <ChevronDown />}
                         </Button>
                      </CollapsibleTrigger>
                   </div>

                   <CollapsibleContent>
                      <div className="px-5 pb-5 border-t pt-4 bg-slate-50/50 space-y-5">
                          {/* Expanded Content Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Summary</h5>
                                  <p className="text-sm text-neutral-700 leading-relaxed bg-white p-3 rounded border border-neutral-100">
                                      {assessment.assessmentSummary || 'No summary provided.'}
                                  </p>
                              </div>
                              <div>
                                  <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Recommendation</h5>
                                  <p className="text-sm text-neutral-700 leading-relaxed bg-white p-3 rounded border border-neutral-100">
                                      {assessment.recommendation || 'No recommendation provided.'}
                                  </p>
                              </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                              <Button size="sm" variant="outline" onClick={() => onViewDetails(assessment)}>
                                  <Eye className="size-4 mr-2" /> View Full Details
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onDownload(assessment.id)}>
                                  <Download className="size-4 mr-2" /> Download
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => onPrint(assessment.id)}>
                                  <Printer className="size-4 mr-2" /> Print
                              </Button>
                          </div>
                      </div>
                   </CollapsibleContent>
                 </Card>
               </Collapsible>
             );
          })}
        </div>
      )}
    </div>
  );
}

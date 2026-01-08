import { Search, Download, MoreVertical, Eye, FileText, TrendingUp, Play, Calendar, Clock, Plus, Trash2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // 👈 Added Imports
import { Progress } from '@/components/ui/progress';
import { useState, useMemo } from 'react';

export interface TransformedAssessment {
    id: number;
    childName: string;
    evaluation: string;
    type: string;
    dateCreated: string;
    evaluator: string;
    status: 'Completed' | 'In Progress' | 'Draft';
    standardScore: number;
    sumOfScaled: number;
    daycareName: string;
    [key: string]: any;
}

interface AssessmentTeacherListProps {
  assessments: TransformedAssessment[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onExportAll: () => void;
  onViewAssessment: (assessment: TransformedAssessment) => void;
  onContinueAssessment: (assessment: TransformedAssessment) => void;
  onStartAssessment: (assessment: TransformedAssessment) => void;
  onNewAssessment: () => void;
  onDeleteAssessment: (id: number) => void;
}

// --- Helper Functions ---
const getStatusBadge = (status: TransformedAssessment['status']) => {
    switch (status) {
        case 'Completed':
            return <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1] hover:bg-green-50">Completed</Badge>;
        case 'In Progress':
            return <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd] hover:bg-[#eff6fe]">In Progress</Badge>;
        case 'Draft':
            return <Badge className="bg-gray-50 text-[#697280] border-[#f3f4f5] hover:bg-gray-50">Draft</Badge>;
        default:
            return <Badge>{status}</Badge>;
    }
};

const getTypeBadge = (type: string) => {
    const t = type?.toLowerCase() || 'regular';
    if (t.includes('initial')) {
        return <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">Initial</Badge>;
    } else if (t.includes('follow')) {
        return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Follow-up</Badge>;
    }
    return <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">Regular</Badge>;
};

const getScoreColor = (score: number, status: string) => {
    if (status !== 'Completed') return 'text-neutral-600';
    if (score >= 120) return 'text-green-600';
    if (score >= 100) return 'text-blue-600';
    return 'text-orange-600';
};

// --- Use a named export ---
export function AssessmentTeacherList({
    assessments,
    searchQuery,
    onSearchChange,
    onExportAll,
    onViewAssessment,
    onContinueAssessment,
    onStartAssessment,
    onNewAssessment,
    onDeleteAssessment,
}: AssessmentTeacherListProps) {

  // --- Pagination & Filter State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all'); // 👈 New Filter State
  const itemsPerPage = 10;

  // --- Sorting, Filtering & Pagination Logic ---
  const processedAssessments = useMemo(() => {
      // 1. Filter Logic
      let filtered = assessments.filter(a => {
          // Status Filter
          if (statusFilter !== 'all' && a.status !== statusFilter) return false;

          if (searchQuery && !a.childName.toLowerCase().includes(searchQuery.toLowerCase())) {
          }
          return true;
      });

      // 2. Sort: Draft -> In Progress -> Completed. Within groups, sort by date (newest first).
      const sorted = filtered.sort((a, b) => {
          const getPriority = (status: string) => {
              // Priority 0: Draft (Top)
              if (status === 'Draft') return 0;
              // Priority 1: In Progress (Middle)
              if (status === 'In Progress') return 1;
              // Priority 2: Completed (Bottom)
              if (status === 'Completed') return 2;
              return 3;
          };

          const prioA = getPriority(a.status);
          const prioB = getPriority(b.status);

          if (prioA !== prioB) {
              return prioA - prioB; // Lower priority number comes first
          }

          // Secondary sort: Date descending (Newest first)
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      });

      return sorted;
  }, [assessments, statusFilter, searchQuery]); // Added dependencies

  // Calculate pagination slices
  const totalPages = Math.ceil(processedAssessments.length / itemsPerPage);
  const paginatedAssessments = processedAssessments.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  // Handlers
  const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Stats Calculations
  const completedCount = assessments.filter(a => a.status === 'Completed').length;
  const inProgressCount = assessments.filter(a => a.status === 'In Progress').length;
  const draftCount = assessments.filter(a => a.status === 'Draft').length;
  const totalCount = assessments.length;
  const averageScore = completedCount > 0
    ? Math.round(
        assessments.filter(a => a.status === 'Completed').reduce((sum, a) => sum + a.standardScore, 0) / completedCount
      )
    : 0;

  const stats = [
    { title: 'My Assessments', value: completedCount.toString(), subtitle: `${totalCount} total`, icon: FileText, bgColor: 'bg-blue-50', iconColor: 'text-blue-600' },
    { title: 'In Progress', value: inProgressCount.toString(), subtitle: 'Needs to complete', subtitleColor: 'text-orange-600', icon: Clock, bgColor: 'bg-orange-50', iconColor: 'text-orange-600' },
    { title: 'Average Score', value: averageScore.toString(), subtitle: 'My class average', icon: TrendingUp, bgColor: 'bg-green-50', iconColor: 'text-green-600' },
    { title: 'Draft', value: draftCount.toString(), subtitle: 'Not started', icon: Calendar, bgColor: 'bg-purple-50', iconColor: 'text-purple-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black text-2xl font-semibold">My Assessments</h2>
          <p className="text-neutral-600">Create and manage assessments for your students</p>
        </div>
        <Button className="gap-2 bg-black hover:bg-black/90" onClick={onNewAssessment}>
            <Plus className="size-4" />
            New Assessment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-neutral-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-[32px] text-black -mt-1">{stat.value}</p>
                  {stat.subtitle && (
                    <div className={`flex items-center gap-1 text-[11px] ${stat.subtitleColor || 'text-neutral-500'}`}>
                      <span>{stat.subtitle}</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <stat.icon className={`size-5 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assessment Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[20px] text-green-600">{completedCount}</span>
                <span className="text-[13px] text-neutral-600">Completed</span>
              </div>
              <Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[20px] text-blue-600">{inProgressCount}</span>
                <span className="text-[13px] text-neutral-600">In Progress</span>
              </div>
              <Progress value={totalCount > 0 ? (inProgressCount / totalCount) * 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[20px] text-black">{draftCount}</span>
                <span className="text-[13px] text-neutral-600">Draft</span>
              </div>
              <Progress value={totalCount > 0 ? (draftCount / totalCount) * 100 : 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Records Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Assessment Records</CardTitle>
              <CardDescription className="mt-1">Track and manage all student assessments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onExportAll}>
              <Download className="mr-2 size-4" />
              Export All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search assessments by child name..."
                value={searchQuery}
                onChange={(e) => {
                    onSearchChange(e.target.value);
                    setCurrentPage(1); // Reset to page 1 on search
                }}
                className="pl-10"
              />
            </div>

            <div className="w-full md:w-[200px]">
                <Select value={statusFilter} onValueChange={(val) => {
                    setStatusFilter(val);
                    setCurrentPage(1);
                }}>
                    <SelectTrigger>
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <SelectValue placeholder="Filter by status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Child</TableHead>
                  <TableHead className="text-center">Evaluation</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead className="text-center">Created</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Standard Score</TableHead>
                  <TableHead className="text-right">Menu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                      No assessments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="text-black">{assessment.childName}</TableCell>
                      <TableCell className="text-center text-black">{assessment.evaluation}</TableCell>
                      <TableCell className="text-center">
                        {getTypeBadge(assessment.type)}
                      </TableCell>
                      <TableCell className="text-center text-black">
                        <div className="flex items-center justify-center gap-2">
                          <Calendar className="size-4 text-neutral-500" />
                          {assessment.dateCreated}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(assessment.status)}
                      </TableCell>
                      <TableCell className={`text-center ${getScoreColor(assessment.standardScore, assessment.status)}`}>
                        {assessment.status === 'Completed' ? assessment.standardScore : '-'}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {/* View Action */}
                            <DropdownMenuItem onClick={() => onViewAssessment(assessment)}>
                              <Eye className="mr-2 size-4" /> View Details
                            </DropdownMenuItem>

                            {/* Continue Action */}
                            {assessment.status === 'In Progress' && (
                                <DropdownMenuItem onClick={() => onContinueAssessment(assessment)}>
                                    <TrendingUp className="mr-2 size-4" /> Continue
                                </DropdownMenuItem>
                            )}

                            {/* Start Action */}
                            {assessment.status === 'Draft' && (
                                <DropdownMenuItem onClick={() => onStartAssessment(assessment)}>
                                    <Play className="mr-2 size-4" /> Start Assessment
                                </DropdownMenuItem>
                            )}

                            {/* Delete Action */}
                            {assessment.status === 'Draft' && (
                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => onDeleteAssessment(assessment.id)}>
                                    <Trash2 className="mr-2 size-4" /> Delete Draft
                                </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
                <div className="text-xs text-neutral-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, processedAssessments.length)} of {processedAssessments.length} results
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

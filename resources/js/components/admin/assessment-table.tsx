import { useState, useMemo } from 'react';
import { Search, Download, MoreVertical, Eye, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface FormattedAssessment {
    id: number;
    childName: string;
    childId: number;
    evaluation: string;
    dateCreated: string;
    evaluator: string;
    daycareName: string;
    status: string;
    standardScore: number;
    sumOfScaled: number;
    original: any;
}

interface AssessmentTableProps {
    assessments: FormattedAssessment[];
    daycares: { id: number; name: string }[];
    evaluators: { id: number; first_name: string; last_name: string }[];
    onViewDetails: (assessment: any) => void;
}

export function AssessmentTable({ assessments, daycares, evaluators, onViewDetails }: AssessmentTableProps) {
    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterDaycare, setFilterDaycare] = useState<string>('all');
    const [filterEvaluator, setFilterEvaluator] = useState<string>('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredAssessments = useMemo(() => {
        return assessments.filter(assessment => {
            // Strictly enforce showing only Completed assessments
            if (assessment.status !== 'Completed') return false;

            const matchesSearch =
                assessment.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                assessment.evaluator.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesDaycare = filterDaycare === 'all' || assessment.daycareName === filterDaycare;
            const matchesEvaluator = filterEvaluator === 'all' || assessment.evaluator === filterEvaluator;

            return matchesSearch && matchesDaycare && matchesEvaluator;
        });
    }, [assessments, searchQuery, filterDaycare, filterEvaluator]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
    const paginatedAssessments = filteredAssessments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Helpers
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleFilterChange = (setter: (value: string) => void, value: string) => {
        setter(value);
        setCurrentPage(1); // Reset to page 1 when filtering
    };

    const handleExportCSV = () => {
        const headers = ['Child Name', 'Evaluation', 'Date Created', 'Evaluator', 'Status', 'Standard Score', 'Daycare'];
        const rows = filteredAssessments.map(a => [
            a.childName, a.evaluation, a.dateCreated, a.evaluator, a.status, a.standardScore.toString(), a.daycareName
        ]);
        const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `assessments-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success(`Exported ${filteredAssessments.length} rows`);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed': return <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1] hover:bg-green-50">Completed</Badge>;
            case 'In Progress': return <Badge className="bg-[#eff6fe] text-[#4b7ae8] border-[#d7e9fd] hover:bg-[#eff6fe]">In Progress</Badge>;
            case 'Draft': return <Badge variant="outline" className="bg-gray-50 text-gray-600 hover:bg-gray-50">Draft</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getScoreColor = (score: number, status: string) => {
        if (!score || status !== 'Completed') return 'text-[#636363]';
        if (score >= 120) return 'text-[#1c71fa]';
        if (score >= 100) return 'text-[#33b233]';
        return 'text-[#ff8821]';
    };

    const handleViewClick = (assessment: FormattedAssessment) => {

        const dialogData = {
            id: assessment.id,
            childName: assessment.childName,
            evaluation: assessment.evaluation,
            dateCreated: assessment.dateCreated,
            evaluator: assessment.evaluator,
            daycareName: assessment.daycareName,
            status: assessment.status,
            standardScore: assessment.standardScore,
            sumOfScaled: assessment.sumOfScaled,


            domainScoresRaw: assessment.original.scores || [],

            assessmentSummary: assessment.original.assessment_summary || assessment.original.overall_notes || '',

            recommendation: assessment.original.recommendation || assessment.original.recommendations || '',

            nextAssessmentDue: assessment.original.next_assessment_date || '',
        };
        onViewDetails(dialogData);
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex flex-col gap-4 mb-6">
                    {/* Top Row: Title and Export */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="text-black font-medium">System Assessment Overview</h3>
                        <Button variant="outline" size="sm" className="gap-2 w-full md:w-auto" onClick={handleExportCSV}>
                            <Download className="size-4" />
                            Export CSV
                        </Button>
                    </div>

                    {/* Filter Row: Search and Dropdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                            <Input
                                placeholder="Search child or evaluator..."
                                value={searchQuery}
                                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                                className="w-full bg-[#f8f8f8] border-neutral-300 pl-10"
                            />
                        </div>

                        {/* Status Filter Removed */}

                        <Select value={filterDaycare} onValueChange={(val) => handleFilterChange(setFilterDaycare, val)}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Daycare" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Daycares</SelectItem>
                                {daycares.map(d => (
                                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterEvaluator} onValueChange={(val) => handleFilterChange(setFilterEvaluator, val)}>
                            <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Evaluator" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Evaluators</SelectItem>
                                {evaluators.map(e => (
                                    <SelectItem key={e.id} value={`${e.first_name} ${e.last_name}`}>
                                        {e.first_name} {e.last_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Child</TableHead>
                                <TableHead>Evaluation</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead>Evaluator</TableHead>
                                <TableHead>Daycare</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAssessments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-neutral-500 py-8">
                                        No completed assessments found matching your filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAssessments.map((assessment) => (
                                    <TableRow key={assessment.id}>
                                        <TableCell className="font-medium">{assessment.childName}</TableCell>
                                        <TableCell>{assessment.evaluation}</TableCell>
                                        <TableCell>{assessment.dateCreated}</TableCell>
                                        <TableCell>{assessment.evaluator}</TableCell>
                                        <TableCell className="text-sm text-neutral-600">{assessment.daycareName}</TableCell>
                                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                                        <TableCell className={`text-center font-semibold ${getScoreColor(assessment.standardScore, assessment.status)}`}>
                                            {assessment.status === 'Completed' ? assessment.standardScore : '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewClick(assessment)}>
                                                        <Eye className="size-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
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
                            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAssessments.length)} of {filteredAssessments.length} results
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
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
                                onClick={() => handlePageChange(currentPage + 1)}
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
    );
}

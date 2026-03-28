import { Assessment, Child, User } from '@/types';
import { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PrintReportProps extends PageProps {
    student: Child;
    assessments: Assessment[];
    domains: { id: number; name: string; max_score: number }[];
    teacherName: string;
}

export default function PrintReport({ student, assessments, domains, teacherName }: PrintReportProps) {

    // Auto-trigger the print dialog when the page loads
    useEffect(() => {
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    const parentName = student.parents && student.parents.length > 0
        ? `${student.parents[0].first_name} ${student.parents[0].last_name}`
        : 'N/A';

    // Helper to find a specific score for a specific assessment type
    const getScore = (type: string, domainId: number) => {
        const assessment = assessments.find(a => a.assessment_type === type);
        if (!assessment || !assessment.scores) return '-';

        const scoreRecord = assessment.scores.find((s: any) => s.domain_id === domainId);
        return scoreRecord ? scoreRecord.scaled_score : '-';
    };

    return (
        <div className="min-h-screen bg-gray-200 p-8 print:bg-white print:p-0">
            <Head title={`Report Card - ${student.first_name}`} />

            {/* Floating Action Bar (Hidden when printing) */}
            <div className="mx-auto mb-6 flex max-w-[210mm] items-center justify-between rounded-lg bg-white p-4 shadow-md print:hidden">
                <div>
                    <h2 className="text-lg font-bold text-slate-800">Print Preview</h2>
                    <p className="text-sm text-slate-500">Ensure your printer is set to A4 paper size.</p>
                </div>
                <Button onClick={() => window.print()} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Printer className="size-4" /> Print Document
                </Button>
            </div>

            {/* The Actual A4 Document */}
            <div className="mx-auto bg-white p-[20mm] shadow-lg print:shadow-none" style={{ width: '210mm', minHeight: '297mm' }}>

                {/* Header Section */}
                <div className="mb-8 text-center border-b-2 border-slate-800 pb-6">
                    <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                        {student.daycare?.name || 'Daycare Center'}
                    </h1>
                    <h2 className="mt-1 text-lg font-bold text-slate-600 uppercase">
                        Early Childhood Care and Development (ECCD)
                    </h2>
                    <h3 className="mt-2 text-md font-semibold text-slate-500">
                        Consolidated Assessment Report
                    </h3>
                </div>

                {/* Student Info Grid */}
                <div className="mb-8 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p><span className="font-bold">Student Name:</span> {student.first_name} {student.middle_name} {student.last_name}</p>
                        <p><span className="font-bold">Date of Birth:</span> {new Date(student.date_of_birth).toLocaleDateString()}</p>
                        <p><span className="font-bold">Gender:</span> {student.gender}</p>
                    </div>
                    <div>
                        <p><span className="font-bold">Parent/Guardian:</span> {parentName}</p>
                        <p><span className="font-bold">Teacher:</span> {teacherName}</p>
                        <p><span className="font-bold">Status:</span> <span className="uppercase font-bold text-slate-900">{student.status}</span></p>
                    </div>
                </div>

                {/* Assessment Table */}
                <div className="mb-12">
                    <h4 className="mb-3 font-bold text-slate-800 border-b border-slate-300 pb-1">Domain Score Breakdown</h4>
                    <table className="w-full border-collapse border border-slate-300 text-sm">
                        <thead>
                            <tr className="bg-slate-100">
                                <th className="border border-slate-300 p-2 text-left w-1/2">Development Domain</th>
                                <th className="border border-slate-300 p-2 text-center">1st Eval</th>
                                <th className="border border-slate-300 p-2 text-center">2nd Eval</th>
                                <th className="border border-slate-300 p-2 text-center">3rd Eval</th>
                            </tr>
                        </thead>
                        <tbody>
                            {domains.map((domain) => (
                                <tr key={domain.id} className="border-b border-slate-200">
                                    <td className="border border-slate-300 p-2 font-medium">{domain.name}</td>
                                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">
                                        {getScore('1st Assessment', domain.id)}
                                    </td>
                                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">
                                        {getScore('2nd Assessment', domain.id)}
                                    </td>
                                    <td className="border border-slate-300 p-2 text-center font-bold text-slate-700">
                                        {getScore('3rd Assessment', domain.id)}
                                    </td>
                                </tr>
                            ))}
                            {/* Overall Score Row */}
                            <tr className="bg-slate-50 border-t-2 border-slate-400">
                                <td className="border border-slate-300 p-2 font-black text-right uppercase">Overall Standard Score:</td>
                                <td className="border border-slate-300 p-2 text-center font-black text-lg">
                                    {assessments.find(a => a.assessment_type === '1st Assessment')?.overall_score || '-'}
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-black text-lg">
                                    {assessments.find(a => a.assessment_type === '2nd Assessment')?.overall_score || '-'}
                                </td>
                                <td className="border border-slate-300 p-2 text-center font-black text-lg">
                                    {assessments.find(a => a.assessment_type === '3rd Assessment')?.overall_score || '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div className="mt-20 grid grid-cols-2 gap-16 pt-8">
                    <div className="text-center">
                        <div className="border-b border-slate-800 pb-1 font-bold text-slate-800">{teacherName}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase">ECCD Teacher</div>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-slate-800 pb-1 font-bold text-slate-800">{parentName}</div>
                        <div className="text-xs text-slate-500 mt-1 uppercase">Parent / Guardian Signature</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

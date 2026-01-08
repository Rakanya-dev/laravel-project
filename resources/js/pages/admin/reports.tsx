import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ReportsOverviewTab } from '@/components/reports/reports-overview-tab';
import { ReportsAnalyticsTab } from '@/components/reports/reports-analytics-tab';
import { ReportsTemplatesTab } from '@/components/reports/reports-templates-tab';
import { ReportsExportsTab } from '@/components/reports/reports-exports-tab';
import { ReportsGeneratedTab } from '@/components/reports/reports-generated-tab';
import { ReportGenerator } from '@/components/reports/report-generator';

interface ReportsPageProps {
    overviewStats: any;
    analytics: any;
    recentReports: any[];
    generatedReports: any[];
    templates: any[];
    students: any[];
    exportCounts: Record<string, number>;
}

export default function Reports({
    overviewStats,
    analytics,
    recentReports,
    generatedReports = [],
    templates,
    students,
    exportCounts = {}
}: ReportsPageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showGenerator, setShowGenerator] = useState(false);

    const [preSelectedTemplateId, setPreSelectedTemplateId] = useState<string | undefined>(undefined);

    const safeGeneratedReports = generatedReports || [];
    const safeRecentReports = recentReports || [];
    const safeTemplates = templates || [];
    const safeStudents = students || [];

    const safeAnalytics = analytics || {
        monthlyTrends: [],
        domainPerformance: [],
        outcomeDistribution: []
    };

    const safeOverviewStats = overviewStats || {
        total: 0,
        uniqueChildren: 0,
        avgScore: 0,
        completionRate: 0,
        growth: 0
    };

    const handleUseTemplate = (template: any) => {
        setPreSelectedTemplateId(String(template.id));
        setShowGenerator(true);
    };

    const handleCreateNew = () => {
        setPreSelectedTemplateId(undefined);
        setShowGenerator(true);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Reports & Analytics', href: '/admin/reports' }]}>
            <Head title="Reports & Analytics" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-black text-2xl font-semibold">Reports & Analytics</h2>
                        <p className="text-neutral-600">Comprehensive reporting and data analysis tools</p>
                    </div>
                    <Button
                        className="bg-[#6366f1] hover:bg-[#4f46e5]"
                        onClick={handleCreateNew}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Create New Report
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-[#ececf0] p-1 h-[50px] w-full max-w-4xl rounded-full">
                        {['overview', 'analytics', 'generated', 'templates', 'exports'].map(tab => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="flex-1 rounded-full text-sm capitalize data-[state=active]:bg-white data-[state=active]:shadow-sm"
                            >
                                {tab === 'generated' ? 'Generated Reports' : tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <ReportsOverviewTab stats={safeOverviewStats} recentReports={safeRecentReports} />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <ReportsAnalyticsTab data={safeAnalytics} />
                    </TabsContent>

                    <TabsContent value="generated" className="mt-6">
                        <ReportsGeneratedTab reports={safeGeneratedReports} />
                    </TabsContent>

                    <TabsContent value="templates" className="mt-6">
                        <ReportsTemplatesTab
                            initialTemplates={safeTemplates}
                            onUseTemplate={handleUseTemplate}
                        />
                    </TabsContent>

                    <TabsContent value="exports" className="mt-6">
                        <ReportsExportsTab counts={exportCounts} />
                    </TabsContent>
                </Tabs>
            </div>

            <ReportGenerator
                open={showGenerator}
                onClose={() => setShowGenerator(false)}
                templates={safeTemplates}
                students={safeStudents}
                initialTemplateId={preSelectedTemplateId}
            />
        </AppLayout>
    );
}

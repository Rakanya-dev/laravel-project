import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';
import { useState } from 'react';

import { ReportGenerator } from '@/components/reports/report-generator';
import { ReportsAnalyticsTab } from '@/components/reports/reports-analytics-tab';
import { ReportsGeneratedTab } from '@/components/reports/reports-generated-tab';
import { ReportsOverviewTab } from '@/components/reports/reports-overview-tab';

interface ReportsPageProps {
    overviewStats: any;
    analytics: any;
    recentReports: any[];
    generatedReports: any[];
    templates: any[];
    students: any[];
}

export default function TeacherReports({ overviewStats, analytics, recentReports, generatedReports = [], templates, students }: ReportsPageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showGenerator, setShowGenerator] = useState(false);


    const safeAnalytics = {
        monthlyTrends: analytics?.monthlyTrends || [],
        domainPerformance: analytics?.domainPerformance || [],
        outcomeDistribution: analytics?.outcomeDistribution || [],
        ...analytics,
    };
    const safeOverviewStats = overviewStats || { total: 0, uniqueChildren: 0, avgScore: 0, completionRate: 0 };

    return (
        <AppLayout breadcrumbs={[{ title: 'My Reports', href: '/teacher/reports' }]}>
            <Head title="Reports & Analytics" />

            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-black">My Reports</h2>
                        <p className="text-neutral-600">Track student progress and generate reports</p>
                    </div>
                    <Button className="bg-black hover:bg-neutral-800" onClick={() => setShowGenerator(true)}>
                        <FileText className="mr-2 h-4 w-4" />
                        New Report
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="h-[50px] w-full max-w-xl rounded-full bg-[#ececf0] p-1">
                        {['overview', 'analytics', 'generated'].map((tab) => (
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
                        <ReportsOverviewTab stats={safeOverviewStats} recentReports={recentReports} />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <ReportsAnalyticsTab data={safeAnalytics} />
                    </TabsContent>

                    <TabsContent value="generated" className="mt-6">
                        <ReportsGeneratedTab reports={generatedReports} />
                    </TabsContent>
                </Tabs>
            </div>

            <ReportGenerator open={showGenerator} onClose={() => setShowGenerator(false)} templates={templates} students={students} />
        </AppLayout>
    );
}

import { useMemo } from 'react';
import ParentOverviewStats from '@/components/parent/parent-overview-stats';
import ParentRecentMessages from '@/components/parent/parent-recent-messages';
import ParentQuickActions from '@/components/parent/parent-quick-actions';

interface Child {
  id: number;
  name: string;
  age: number;
  daycare: string;
}

interface Assessment {
  id: number;
  dateCreated: string;
  standardScore: number;
}

interface ParentDashboardOverviewProps {
  child: Child;
  assessments: Assessment[];
  onNavigateToMessages: () => void;
  onNavigateToReports: () => void;
}

export default function ParentDashboardOverview({
  child,
  assessments,
  onNavigateToMessages,
  onNavigateToReports
}: ParentDashboardOverviewProps) {
  // Get current date
  const currentDate = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const completedAssessments = assessments.filter(a => a.standardScore > 0);
    // Sort by date descending
    const sorted = [...completedAssessments].sort((a, b) =>
        new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
    );
    const lastAssessment = sorted.length > 0 ? sorted[0] : null;

    const overallScore = lastAssessment
      ? `${Math.round((lastAssessment.standardScore / 120) * 100)}%`
      : 'N/A';

    const lastAssessmentDate = lastAssessment
      ? new Date(lastAssessment.dateCreated).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      : 'Not assessed';

    return {
      overallScore,
      lastAssessmentDate,
      activitiesCount: 12,
      attendanceRate: '96%'
    };
  }, [assessments]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-md">
        <h1 className="text-[32px] mb-2 font-bold">Welcome back, Parent!</h1>
        <p className="text-blue-100 font-medium">{currentDate}</p>
        <p className="text-blue-100 mt-2 text-sm opacity-90">
          Viewing: <span className="text-white font-bold text-base ml-1">{child.name}</span> • {child.daycare}
        </p>
      </div>

      {/* Stats Grid */}
      <ParentOverviewStats
        overallScore={stats.overallScore}
        lastAssessmentDate={stats.lastAssessmentDate}
        activitiesCount={stats.activitiesCount}
        milestonesMet={8}
      />

      {/* Main Content Grid - Adjusted Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Quick Actions */}
        <div className="h-full">
          <ParentQuickActions
            onMessageTeacher={onNavigateToMessages}
            onViewReports={onNavigateToReports}
          />
        </div>

        {/* Right Column: Messages */}
        <div className="h-full">
          <ParentRecentMessages onViewAll={onNavigateToMessages} />
        </div>
      </div>
    </div>
  );
}

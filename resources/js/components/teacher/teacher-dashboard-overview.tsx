import { TeacherOverviewStats } from './teacher-overview-stats';
import { TeacherQuickActions } from './teacher-quick-actions';
import { TeacherRecentStudents } from './teacher-recent-students';
import type { Student } from '@/pages/teacher/dashboard';

interface TeacherDashboardOverviewProps {
  teacherName: string;
  daycareName: string;
  students: Student[];
  totalStudents: number;
  assessmentsDue: number;
  completedAssessments: number;
  classAverage: number;
  onNewAssessment: () => void;
  onViewStudents: () => void;
  onViewMessages: () => void;
  onViewAssessments: () => void;
  onStudentClick: (student: Student) => void;
}

export function TeacherDashboardOverview({
  teacherName,
  daycareName,
  students = [],
  totalStudents = 0,
  assessmentsDue = 0,
  completedAssessments = 0,
  classAverage = 0,
  onNewAssessment,
  onViewStudents,
  onViewMessages,
  onViewAssessments,
  onStudentClick
}: TeacherDashboardOverviewProps) {


  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-black text-2xl font-semibold">Dashboard Overview</h2>
          <p className="text-neutral-600">Welcome back, {teacherName}</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
          <span className="relative flex h-2 w-2">
             <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Updates automatically
        </div>
      </div>

      {/* Stats Cards */}
      <TeacherOverviewStats
        totalStudents={totalStudents}
        assessmentsDue={assessmentsDue}
        completedAssessments={completedAssessments}
        classAverage={classAverage}
        daycareName={daycareName}
      />

      {/* Quick Actions & Recent Students */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TeacherQuickActions
          onNewAssessment={onNewAssessment}
          onViewStudents={onViewStudents}
          onViewMessages={onViewMessages}
          onViewAssessments={onViewAssessments}
        />

        <TeacherRecentStudents
          students={students}
          onStudentClick={onStudentClick}
          maxStudents={5}
        />
      </div>
    </div>
  );
}

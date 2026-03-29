import { TeacherOverviewStats } from './teacher-overview-stats';
import { TeacherQuickActions } from './teacher-quick-actions';
import { TeacherRecentStudents } from './teacher-recent-students';
import type { Student } from '@/pages/teacher/dashboard';
import { Sparkles, Activity } from 'lucide-react'; // Added for visual flair

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
    onStudentClick,
}: TeacherDashboardOverviewProps) {
    // A simple greeting based on time of day for that extra personal touch
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* --- HERO BANNER --- */}
            <div className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 shadow-lg shadow-indigo-200">
                {/* Decorative background elements so it isn't just a flat color */}
                <div className="absolute -right-10 -top-24 size-72 rounded-full bg-indigo-500/50 blur-3xl" />
                <div className="absolute -bottom-24 left-10 size-56 rounded-full bg-purple-500/30 blur-3xl" />

                <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-100 mb-2">
                            <Sparkles className="size-4" />
                            <span className="text-sm font-bold tracking-wider uppercase">
                                {daycareName} Dashboard
                            </span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                            {greeting}, {teacherName.split(' ')[0]}!
                        </h2>
                        <p className="max-w-xl text-indigo-100/80 font-medium mt-2">
                            Here is what's happening in your classroom today. You have {assessmentsDue} {assessmentsDue === 1 ? 'assessment' : 'assessments'} pending.
                        </p>
                    </div>

                    {/* The "Live" Indicator */}
                    <div className="flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/20 shadow-sm">
                        <Activity className="size-3.5 text-emerald-400 animate-pulse" />
                        Live Sync Active
                    </div>
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="relative z-20 -mt-12 px-4 sm:px-6">
                <TeacherOverviewStats
                    totalStudents={totalStudents}
                    assessmentsDue={assessmentsDue}
                    completedAssessments={completedAssessments}
                    classAverage={classAverage}
                    daycareName={daycareName}
                />
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid gap-6 lg:grid-cols-12 pt-2">
                {/* Quick Actions (Takes up 5 columns on desktop) */}
                <div className="lg:col-span-5 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Quick Actions</h3>
                        <p className="text-sm text-slate-500">Fast access to your daily tasks</p>
                    </div>
                    <TeacherQuickActions
                        onNewAssessment={onNewAssessment}
                        onViewStudents={onViewStudents}
                        onViewMessages={onViewMessages}
                        onViewAssessments={onViewAssessments}
                    />
                </div>

                {/* Recent Students (Takes up 7 columns on desktop) */}
                <div className="lg:col-span-7 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Your Roster</h3>
                        <p className="text-sm text-slate-500">Students needing attention</p>
                    </div>
                    <TeacherRecentStudents
                        students={students}
                        onStudentClick={onStudentClick}
                        maxStudents={5}
                    />
                </div>
            </div>
        </div>
    );
}

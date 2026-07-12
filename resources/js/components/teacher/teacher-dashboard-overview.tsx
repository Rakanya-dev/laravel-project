import { TeacherOverviewStats } from './teacher-overview-stats';
import { TeacherQuickActions } from './teacher-quick-actions';
import { TeacherRecentStudents } from './teacher-recent-students';
import type { Student } from '@/pages/teacher/dashboard';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

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
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // 🚀 1. Convert props to Local State for INSTANT mutation
    const [liveStudents, setLiveStudents] = useState(students);
    const [liveDue, setLiveDue] = useState(assessmentsDue);
    const [liveCompleted, setLiveCompleted] = useState(completedAssessments);

    // Keep state synced if a normal page reload happens
    useEffect(() => {
        setLiveStudents(students);
        setLiveDue(assessmentsDue);
        setLiveCompleted(completedAssessments);
    }, [students, assessmentsDue, completedAssessments]);

    // 🚀 2. ZERO-LATENCY WEBSOCKET LISTENER
    useEffect(() => {
        // @ts-ignore
        if (typeof window !== 'undefined' && window.Echo) {
            // @ts-ignore
            window.Echo.channel('students')
                .listen('AssessmentUpdated', (event: any) => {
                    const updatedAssessment = event.assessment;

                    // If a teacher just completed an assessment...
                    if (updatedAssessment.status === 'Completed') {
                        // Instantly update the stats cards!
                        setLiveDue(prev => Math.max(0, prev - 1));
                        setLiveCompleted(prev => prev + 1);

                        // Instantly remove the student from the "Action Needed" roster!
                        setLiveStudents(prev => prev.filter(s => s.id !== updatedAssessment.student_id));
                    }
                })
                .listen('AssessmentCreated', (event: any) => {
                    // Instantly bump the "Due" counter when a new draft is made!
                    setLiveDue(prev => prev + 1);
                });
        }

        // Cleanup listener when the component unmounts
        return () => {
            // @ts-ignore
            if (typeof window !== 'undefined' && window.Echo) {
                // @ts-ignore
                window.Echo.leave('students');
            }
        };
    }, []);

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">

            {/* --- HERO BANNER --- */}
            <div className="relative overflow-hidden rounded-3xl bg-indigo-600 dark:bg-indigo-600/90 border border-indigo-500/30 dark:border-indigo-400/20 p-8 sm:p-10 pb-20 sm:pb-24 shadow-lg transition-colors">

                {/* Decorative Glowing Orbs */}
                <div className="absolute -right-10 -top-24 size-96 rounded-full bg-indigo-500/50 dark:bg-indigo-400/30 blur-3xl transition-colors" />
                <div className="absolute -bottom-24 left-10 size-72 rounded-full bg-purple-500/30 dark:bg-purple-400/20 blur-3xl transition-colors" />

                <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-indigo-100 dark:text-indigo-200 mb-3 transition-colors">
                            <Sparkles className="size-5" />
                            <span className="text-[11px] font-bold tracking-widest uppercase">
                                {daycareName} Dashboard
                            </span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white transition-colors">
                            {greeting}, {teacherName.split(' ')[0]}!
                        </h2>
                        <p className="max-w-2xl text-indigo-100/90 dark:text-indigo-100/90 font-medium text-base sm:text-lg leading-relaxed mt-3 transition-colors">
                            Here is what's happening in your classroom today. You have <strong className="text-white font-black">{liveDue}</strong> {liveDue === 1 ? 'assessment' : 'assessments'} pending.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- STATS CARDS --- */}
            <div className="relative z-20 -mt-16 sm:-mt-20 px-3 sm:px-6">
                <TeacherOverviewStats
                    totalStudents={totalStudents}
                    assessmentsDue={liveDue} // 🚀 Using live state
                    completedAssessments={liveCompleted} // 🚀 Using live state
                    classAverage={classAverage}
                    daycareName={daycareName}
                />
            </div>

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid gap-8 lg:grid-cols-12 pt-4">

                {/* Left Column: Quick Actions */}
                <div className="lg:col-span-5 flex flex-col space-y-5">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Quick Actions</h3>
                        <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">Fast access to your daily tasks.</p>
                    </div>
                    <TeacherQuickActions
                        onNewAssessment={onNewAssessment}
                        onViewStudents={onViewStudents}
                        onViewMessages={onViewMessages}
                        onViewAssessments={onViewAssessments}
                    />
                </div>

                {/* Right Column: Action Needed */}
                <div className="lg:col-span-7 flex flex-col space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Action Needed</h3>
                            <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-1.5 transition-colors">Students requiring evaluation.</p>
                        </div>
                    </div>
                    <TeacherRecentStudents
                        students={liveStudents} // 🚀 Using live state
                        onStudentClick={onStudentClick}
                        maxStudents={5}
                    />
                </div>

            </div>
        </div>
    );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ChevronRight, User } from 'lucide-react';
import { router } from '@inertiajs/react';

export interface Student {
    id: number;
    name: string;
    age: number;
    daycare: string;
    progress: {
        name: string;
        score: number;
        max: number;
        percentage: number;
    }[];
    attendance: number;
    last_assessment_date: string;
}

interface StudentCardProps {
    student: Student;
}

export function StudentCard({ student }: StudentCardProps) {

    const getInitials = (name: string) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const initials = getInitials(student.name);

    const handleViewProfile = () => {

        router.visit(route('parent.child-profile'));
    };

    return (
        <Card className="hover:border-blue-200 transition-all duration-200">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-slate-900">{student.name}</CardTitle>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                            Age {student.age}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{student.daycare}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4 mt-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> Last Assessment
                        </span>
                        <span className="font-medium text-slate-900">{student.last_assessment_date}</span>
                    </div>

                    {/* Progress Preview */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-semibold">
                            <span>Recent Progress</span>
                            <span>{student.attendance}% Attendance</span>
                        </div>

                        {student.progress && student.progress.length > 0 ? (
                            student.progress.slice(0, 2).map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-medium text-slate-700">{item.name}</span>
                                        <span className="text-slate-500">{item.score}/{item.max}</span>
                                    </div>
                                    <Progress value={item.percentage} className="h-1.5" />
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-2 text-sm text-slate-400 italic bg-slate-50 rounded">
                                No assessment data available yet.
                            </div>
                        )}
                    </div>

                    <Button onClick={handleViewProfile} className="w-full mt-2 bg-slate-900 hover:bg-slate-800 gap-2 group">
                        View Full Profile
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

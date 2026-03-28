import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Clock, User } from 'lucide-react';

interface StudentGroup {
    studentId: number;
    childName: string;
    childAge: number;
    assessments: any[];
}

interface AssessmentStudentGridProps {
    students: StudentGroup[];
    searchQuery: string;
    onStudentClick: (student: StudentGroup) => void;
}

export function AssessmentStudentGrid({ students, searchQuery, onStudentClick }: AssessmentStudentGridProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((group) => (
                <Card
                    key={group.studentId}
                    onClick={() => onStudentClick(group)}
                    className="cursor-pointer border-l-4 border-l-transparent transition-shadow hover:border-l-blue-500 hover:shadow-md"
                >
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <Avatar className="h-12 w-12 border-2 border-white bg-blue-100 shadow-sm">
                            <AvatarFallback className="font-bold text-blue-700">
                                {group.childName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <CardTitle className="truncate text-base">{group.childName}</CardTitle>
                            <CardDescription>{group.childAge} years old</CardDescription>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Evaluations:</span>
                            <Badge variant="secondary" className="font-mono">
                                {group.assessments.length}
                            </Badge>
                        </div>
                        {group.assessments.length > 0 ? (
                            <div className="mt-3 flex items-center gap-2 border-t pt-3 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>Latest: {group.assessments[0].dateCreated}</span>
                                <Badge
                                    variant="outline"
                                    className={`ml-auto h-5 text-[10px] ${
                                        group.assessments[0].status === 'Completed'
                                            ? 'border-green-200 bg-green-50 text-green-700'
                                            : group.assessments[0].status === 'In Progress'
                                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {group.assessments[0].status}
                                </Badge>
                            </div>
                        ) : (
                            <div className="mt-3 border-t pt-3 text-xs text-gray-400 italic">
                                No assessments yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {students.length === 0 && (
                <div className="col-span-full rounded-lg border-2 border-dashed py-12 text-center text-gray-500">
                    <User className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                    <p>No students found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Student } from '@/pages/teacher/dashboard';

interface TeacherRecentStudentsProps {
  students: Student[];
  onStudentClick?: (student: Student) => void;
  maxStudents?: number;
}

export function TeacherRecentStudents({
  students,
  onStudentClick = () => {},
  maxStudents = 5
}: TeacherRecentStudentsProps) {

  const getFullName = (student: Student) => {
    return `${student.firstName}${student.middleName ? ' ' + student.middleName : ''} ${student.lastName}`.trim();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1]">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-50 text-[#1d4ed8] border-[#bfdbfe]">In Progress</Badge>;
      case 'Not Started':
        return <Badge className="bg-[#fefbe9] text-[#a56105] border-[#ffee8e]">Not Started</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const displayStudents = students.slice(0, maxStudents);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Students</CardTitle>
        <CardDescription>Your recently assessed students</CardDescription>
      </CardHeader>
      <CardContent>
        {displayStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No students yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayStudents.map((student) => {
              const fullName = getFullName(student);
              const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  onClick={() => onStudentClick(student)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-black">{fullName}</p>
                      <p className="text-sm text-neutral-500">{student.age} years old</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(student.status)}
                    {student.score && (
                      <p className="text-sm text-neutral-500 mt-1">Score: {student.score}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

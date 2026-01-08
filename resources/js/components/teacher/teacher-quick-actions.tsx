import { Plus, Users, MessageSquare, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  iconBg: string;
  onClick: () => void;
}

interface TeacherQuickActionsProps {
  onNewAssessment?: () => void;
  onViewStudents?: () => void;
  onViewMessages?: () => void;
  onViewAssessments?: () => void;
}

export function TeacherQuickActions({
  onNewAssessment = () => {},
  onViewStudents = () => {},
  onViewMessages = () => {},
  onViewAssessments = () => {}
}: TeacherQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: Plus,
      label: 'New Assessment',
      description: 'Create assessment for student',
      color: 'text-blue-600',
      iconBg: 'bg-blue-100',
      onClick: onNewAssessment
    },
    {
      icon: Users,
      label: 'View All Students',
      description: 'Manage your student list',
      color: 'text-purple-600',
      iconBg: 'bg-purple-100',
      onClick: onViewStudents
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      description: 'Communicate with parents & admin',
      color: 'text-green-600',
      iconBg: 'bg-green-100',
      onClick: onViewMessages
    },
    {
      icon: ClipboardList,
      label: 'Assessments',
      description: 'View and manage assessments',
      color: 'text-orange-600',
      iconBg: 'bg-orange-100',
      onClick: onViewAssessments
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex items-center justify-start gap-3 py-4"
                onClick={action.onClick}
              >
                <div className={`rounded-full ${action.iconBg} p-3`}>
                  <Icon className={`size-5 ${action.color}`} />
                </div>
                <div className="text-left">
                  <p className="text-black">{action.label}</p>
                  <p className="text-neutral-500">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

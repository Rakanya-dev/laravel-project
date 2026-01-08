import { MessageSquare, Calendar, FileText, Bell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  iconBg: string;
  borderColor: string;
  onClick: () => void;
}

interface ParentQuickActionsProps {
  onMessageTeacher?: () => void;
  onRequestAppointment?: () => void;
  onViewReports?: () => void;
  onManageNotifications?: () => void;
}

export default function ParentQuickActions({
  onMessageTeacher = () => {},
  onRequestAppointment = () => {},
  onViewReports = () => {},
  onManageNotifications = () => {}
}: ParentQuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon: MessageSquare,
      label: 'Message Teacher',
      description: 'Contact for updates',
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
      borderColor: 'border-blue-100',
      onClick: onMessageTeacher
    },
    {
      icon: Calendar,
      label: 'Appointments',
      description: 'Schedule meeting',
      color: 'text-green-600',
      iconBg: 'bg-green-50',
      borderColor: 'border-green-100',
      onClick: onRequestAppointment
    },
    {
      icon: FileText,
      label: 'View Reports',
      description: 'Check progress',
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
      borderColor: 'border-purple-100',
      onClick: onViewReports
    },
    {
      icon: Bell,
      label: 'Alerts',
      description: 'Manage notifications',
      color: 'text-orange-600',
      iconBg: 'bg-orange-50',
      borderColor: 'border-orange-100',
      onClick: onManageNotifications
    }
  ];

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              className={`flex items-center gap-3 p-3 rounded-lg border ${action.borderColor} bg-white hover:shadow-md transition-all duration-200 text-left group`}
            >
              <div className={`${action.iconBg} p-2.5 rounded-lg shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className={`size-5 ${action.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{action.label}</p>
                <p className="text-xs text-slate-500 truncate">{action.description}</p>
              </div>
              <ChevronRight className="size-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

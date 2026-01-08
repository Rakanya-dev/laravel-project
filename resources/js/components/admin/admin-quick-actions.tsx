import { UserPlus, Building2, BarChart3, Users as UsersIcon } from 'lucide-react';
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

interface AdminQuickActionsProps {
    onAddTeacher?: () => void;
    onManageParents?: () => void;
    onAddDaycare?: () => void;
    onViewReports?: () => void;
}

export default function AdminQuickActions({
    onAddTeacher = () => {},
    onManageParents = () => {},
    onAddDaycare = () => {},
    onViewReports = () => {}
}: AdminQuickActionsProps) {
    const actions: QuickAction[] = [
        {
            icon: UserPlus,
            label: 'Add Teacher',
            description: 'Create new account',
            color: 'text-blue-600',
            iconBg: 'bg-blue-100',
            onClick: onAddTeacher
        },
        {
            icon: UsersIcon,
            label: 'Manage Parents',
            description: 'Review applications',
            color: 'text-yellow-600',
            iconBg: 'bg-yellow-100',
            onClick: onManageParents
        },
        {
            icon: Building2,
            label: 'Add Daycare',
            description: 'Register new center',
            color: 'text-green-600',
            iconBg: 'bg-green-100',
            onClick: onAddDaycare
        },
        {
            icon: BarChart3,
            label: 'View Reports',
            description: 'System analytics',
            color: 'text-purple-600',
            iconBg: 'bg-purple-100',
            onClick: onViewReports
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {actions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                className="h-auto flex-col gap-3 py-6"
                                onClick={action.onClick}
                            >
                                <div className={`rounded-full ${action.iconBg} p-3`}>
                                    <Icon className={`size-6 ${action.color}`} />
                                </div>
                                <div className="text-center">
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

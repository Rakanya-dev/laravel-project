import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface SystemAlert {
    id: number;
    type: 'warning' | 'info' | 'success' | 'error';
    message: string;
    time: string;
}

interface AdminSystemAlertsProps {
    alerts: SystemAlert[];
    maxAlerts?: number;
}

const defaultAlerts: SystemAlert[] = [
    { id: 1, type: 'warning', message: 'Central Branch approaching capacity (98%)', time: '2 hours ago' },
    { id: 2, type: 'info', message: 'New assessment template available', time: '5 hours ago' },
    { id: 3, type: 'success', message: 'System backup completed successfully', time: '1 day ago' }
];

export default function AdminSystemAlerts({
    alerts = defaultAlerts,
    maxAlerts = 5
}: AdminSystemAlertsProps) {
    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="size-4 text-orange-600" />;
            case 'success':
                return <CheckCircle2 className="size-4 text-green-600" />;
            case 'error':
                return <AlertTriangle className="size-4 text-red-600" />;
            default:
                return <Info className="size-4 text-blue-600" />;
        }
    };

    const getAlertStyle = (type: string) => {
        switch (type) {
            case 'warning':
                return 'border-orange-200 bg-orange-50';
            case 'success':
                return 'border-green-200 bg-green-50';
            case 'error':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    const displayAlerts = alerts.slice(0, maxAlerts);

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent notifications and updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayAlerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <CheckCircle2 className="size-12 mx-auto mb-3 text-green-500" />
                        <p>No alerts</p>
                        <p className="text-sm mt-1">System is running smoothly</p>
                    </div>
                ) : (
                    displayAlerts.map((alert) => (
                        <Alert key={alert.id} className={getAlertStyle(alert.type)}>
                            <div className="flex items-start gap-3">
                                {getAlertIcon(alert.type)}
                                <div className="flex-1">
                                    <AlertDescription className="text-black">
                                        {alert.message}
                                    </AlertDescription>
                                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                                </div>
                            </div>
                        </Alert>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

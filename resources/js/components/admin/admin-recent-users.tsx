import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

// --- Reused Type ---
interface User {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phone: string;
    daycare: string;
    status: string;
    role: string;
}
// --------------------

interface AdminRecentUsersProps {
    users: User[];
    maxUsers?: number;
    onUserClick?: (user: User) => void;
}

export default function AdminRecentUsers({
    users,
    maxUsers = 5,
    onUserClick = () => {}
}: AdminRecentUsersProps) {
    const getFullName = (user: User) => {
        return `${user.firstName}${user.middleName ? ' ' + user.middleName : ''} ${user.lastName}`.trim();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <Badge className="bg-[#fefbe9] text-[#a56105] border-[#ffee8e] hover:bg-[#fefbe9]">Pending</Badge>;
            case 'Active':
                return <Badge className="bg-blue-50 text-[#1d4ed8] border-[#bfdbfe] hover:bg-blue-50">Active</Badge>;
            case 'Rejected':
                return <Badge className="bg-red-50 text-[#dc2626] border-[#fecaca] hover:bg-red-50">Rejected</Badge>;
            default:
                return <Badge className="bg-green-50 text-[#27815f] border-[#baf7d1] hover:bg-green-50">Approved</Badge>;
        }
    };

    const getRoleBadge = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'teacher') {
            return <Badge variant="outline" className="bg-purple-50 text-purple-700">Teacher</Badge>;
        }
        if (lowerRole === 'parent') {
            return <Badge variant="outline" className="bg-green-50 text-green-700">Parent</Badge>;
        }
        return <Badge variant="outline">{role}</Badge>;
    };

    const displayUsers = users.slice(0, maxUsers);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Newly registered accounts</CardDescription>
            </CardHeader>
            <CardContent>
                {displayUsers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent users</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayUsers.map((user) => {
                            const fullName = getFullName(user);
                            const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                    onClick={() => onUserClick(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="bg-blue-100 text-blue-600">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-black">{fullName}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {getRoleBadge(user.role)}
                                                <span className="text-sm text-neutral-500">{user.daycare}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {getStatusBadge(user.status)}
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

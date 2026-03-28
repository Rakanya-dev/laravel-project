import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    daycare: string;
    role: string;
    lastActive: string;
}

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

    const getRoleBadge = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'teacher') {
            return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">CDW / Teacher</Badge>;
        }
        if (lowerRole === 'parent') {
            return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Parent</Badge>;
        }
        return <Badge variant="outline">{role}</Badge>;
    };

    const displayUsers = users.slice(0, maxUsers);

    return (
        <Card className="shadow-sm h-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg">Recent User Activity</CardTitle>
                <CardDescription>Latest logins across all centers</CardDescription>
            </CardHeader>
            <CardContent>
                {displayUsers.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        <p>No recent user activity</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayUsers.map((user) => {
                            const fullName = `${user.firstName} ${user.lastName}`.trim();
                            const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

                            return (
                                <div
                                    key={user.id}
                                    className="flex items-center justify-between cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-100 transition-colors"
                                    onClick={() => onUserClick(user)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="size-10 rounded-xl">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold rounded-xl">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-slate-900">{fullName}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {getRoleBadge(user.role)}
                                                <span className="text-xs text-slate-500 font-medium truncate max-w-[150px] sm:max-w-none">
                                                    {user.daycare}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-slate-400">Last Active</p>
                                        <p className="text-sm font-medium text-slate-600">{user.lastActive}</p>
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

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Hash } from 'lucide-react';

interface ChildProfileHeaderProps {
    child: any;
    parentName: string;
}

export function ChildProfileHeader({ child, parentName }: ChildProfileHeaderProps) {

    // 1. Construct the full name safely
    // If child.name exists, use it. Otherwise combine first/last.
    const fullName = child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim() || 'Unknown Child';

    // 2. Safely generate initials
    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    // 3. Format Date of Birth safely
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-r from-blue-50 to-white">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">

                    {/* Avatar / Photo */}
                    <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage src={child.profile_photo || ''} alt={fullName} />
                        <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                            {getInitials(fullName)}
                        </AvatarFallback>
                    </Avatar>

                    {/* Child Info */}
                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                {child.status || 'Active'}
                            </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {/* Access Code */}
                            {child.access_code && (
                                <div className="flex items-center gap-1">
                                    <Hash className="h-4 w-4 text-gray-400" />
                                    <span>Code: {child.access_code}</span>
                                </div>
                            )}

                            {/* DOB */}
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>Born: {formatDate(child.date_of_birth)}</span>
                            </div>

                            {/* Location / Daycare */}
                            {child.daycare && (
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    <span>{child.daycare.name || child.daycare}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Parent Info (Right Side) */}
                    <div className="hidden md:block text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Primary Guardian</p>
                        <p className="text-sm font-medium text-gray-900">{parentName}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

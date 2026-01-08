import { ArrowLeft, Mail, Phone, MapPin, Edit2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import type { Daycare } from '@/pages/admin/daycare-management';
import type { Child } from '@/types';

interface DaycareDetailsViewProps {
    daycare: Daycare;
    onBack: () => void;
    onEdit: (daycare: Daycare) => void;
    onDelete: (id: number) => void;
}

const calculateAge = (birthdate: string) => {
    const birth = new Date(birthdate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
    return age;
};

const formatName = (child: Child) => [child.first_name, child.middle_name, child.last_name].filter(Boolean).join(' ');


export default function DaycareDetailsView({ daycare, onBack, onEdit, onDelete }: DaycareDetailsViewProps) {
    const availableSlots = daycare.capacity - daycare.current;
    const students = daycare.children || daycare.students || [];

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
                <ArrowLeft className="size-4" /> Back to All Daycares
            </Button>
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-black text-3xl font-semibold">{daycare.name}</h2>
                    <div className="flex items-center gap-2 text-neutral-600 mt-1"><MapPin className="size-4" /> {daycare.location}</div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => onEdit(daycare)} className="gap-2">
                        <Edit2 className='size-4'/> Edit Details
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(daycare.id)} className="gap-2">
                        <XCircle className='size-4'/> Delete
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-6">
                <Card><CardContent className="p-6"><p className="text-[11px] uppercase text-neutral-500">Current</p><p className="text-[32px] text-black -mt-1">{daycare.current}</p><p className="text-[11px] text-green-600">Active Students</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-[11px] uppercase text-neutral-500">Capacity</p><p className="text-[32px] text-black -mt-1">{daycare.capacity}</p><p className="text-[11px] text-neutral-500">Max Slots</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-[11px] uppercase text-neutral-500">Available Slots</p><p className="text-[32px] text-black -mt-1">{availableSlots}</p><p className="text-[11px] text-blue-600">Remaining</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-[11px] uppercase text-neutral-500">Occupancy Rate</p><p className="text-[32px] text-black -mt-1">{daycare.percentage}%</p><div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200"><div className="h-full rounded-full bg-black" style={{ width: `${daycare.percentage}%` }} /></div></CardContent></Card>
            </div>

            {/* Tabs for Details */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-semibold mb-3">General Information</h3>
                            <div className='grid md:grid-cols-2 gap-4'>
                                <div className="space-y-1"><p className="text-sm text-neutral-500">Full Address</p><p className="font-medium">{daycare.address}</p><p className="text-sm text-neutral-600">{daycare.city}, {daycare.province} {daycare.postal_code}</p></div>
                                <div className="space-y-1"><p className="text-sm text-neutral-500">Description</p><p className="text-black">{daycare.description || 'No description provided.'}</p></div>
                            </div>
                            <Separator />
                            <div className='grid md:grid-cols-3 gap-4 pt-2'>
                                <div className="space-y-1"><p className="text-sm text-neutral-500 flex items-center gap-1"><Mail className='size-4'/> Center Email</p><p className="font-medium text-black">{daycare.email}</p></div>
                                <div className="space-y-1"><p className="text-sm text-neutral-500 flex items-center gap-1"><Phone className='size-4'/> Center Phone</p><p className="font-medium text-black">{daycare.phone}</p></div>
                                <div className="space-y-1"><p className="text-sm text-neutral-500 flex items-center gap-1"><Clock className='size-4'/> Established</p><p className="font-medium text-black">{daycare.established_date || 'N/A'}</p></div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="teacher" className="mt-4">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-xl font-semibold mb-2">{daycare.principal_name}</h3>
                            <Badge variant="outline" className='bg-purple-100 text-purple-700'>Teacher</Badge>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="students" className="mt-4">
                    <Card className='py-0'>
                        <CardContent className="p-0">
                            <div className="overflow-hidden rounded-xl border border-neutral-200">
                                <table className="min-w-full divide-y divide-neutral-200">
                                    <thead className="bg-neutral-50">
                                        <tr><th className="px-6 py-3 text-left">Student Name</th><th className="px-6 py-3 text-left">Age</th><th className="px-6 py-3 text-left">Status</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-200">
                                        {students.length === 0 ? (
                                            <tr><td colSpan={3} className="py-8 text-center text-neutral-500">No students currently enrolled.</td></tr>
                                        ) : (
                                            students.map((student) => (
                                                <tr key={student.id} className='hover:bg-neutral-50 transition-colors'>
                                                    <td className="px-6 py-4 text-sm font-medium">{formatName(student)}</td>
                                                    <td className="px-6 py-4 text-sm">{calculateAge(student.date_of_birth)} years old</td>
                                                    <td className="px-6 py-4 text-sm"><Badge className='bg-green-50 text-green-700 border-green-200'>Active</Badge></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

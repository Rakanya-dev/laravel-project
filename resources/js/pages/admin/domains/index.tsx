import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { DomainFormDialog } from '@/components/admin/domain-form-dialog'; // See step 4
import { toast } from 'sonner';

export default function DomainsIndex({ domains }: { domains: any[] }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDomain, setEditingDomain] = useState<any>(null);

    const handleEdit = (domain: any) => {
        setEditingDomain(domain);
        setIsDialogOpen(true);
    };

    const handleCreate = () => {
        setEditingDomain(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure? This might affect existing assessments.')) {
            router.delete(route('admin.domains.destroy', id), {
                onSuccess: () => toast.success('Domain deleted')
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Assessment Configuration', href: '/admin/domains' }]}>
            <Head title="Assessment Domains" />
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Assessment Domains</h1>
                        <p className="text-muted-foreground">Manage subjects and their maximum scores.</p>
                    </div>
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Add Domain</Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Sort</TableHead>
                                    <TableHead>Domain Name</TableHead>
                                    <TableHead>Max Score</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {domains.map((domain) => (
                                    <TableRow key={domain.id}>
                                        <TableCell>{domain.sort_order}</TableCell>
                                        <TableCell className="font-medium">
                                            {domain.name}
                                            <p className="text-xs text-muted-foreground">{domain.description}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50">
                                                / {domain.max_score || 30}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {domain.is_active
                                                ? <Badge className="bg-green-500">Active</Badge>
                                                : <Badge variant="secondary">Inactive</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(domain)}>
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(domain.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <DomainFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    domain={editingDomain}
                />
            </div>
        </AppLayout>
    );
}

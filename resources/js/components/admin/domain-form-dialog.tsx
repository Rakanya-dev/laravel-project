import { useForm } from '@inertiajs/react';
// 👇 1. Import DialogDescription
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function DomainFormDialog({ open, onOpenChange, domain }: any) {
    const isEditing = !!domain;

    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        max_score: 10,
        sort_order: 1,
        is_active: true,
    });

    useEffect(() => {
        if (domain) {
            setData({
                name: domain.name,
                description: domain.description || '',
                max_score: domain.max_score || 10,
                sort_order: domain.sort_order || 1,
                is_active: Boolean(domain.is_active),
            });
        } else {
            reset();
        }
    }, [domain, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                toast.success(`Domain ${isEditing ? 'updated' : 'created'} successfully`);
                onOpenChange(false);
                reset();
            },
        };

        if (isEditing) {
            put(route('admin.domains.update', domain.id), options);
        } else {
            post(route('admin.domains.store'), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Domain' : 'Add New Domain'}</DialogTitle>
                    {/* 👇 2. Added DialogDescription (Required for accessibility/console warnings) */}
                    <DialogDescription>Configure the subject details and scoring limits below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Domain Name</Label>
                        <Input value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="e.g. Mathematics" />
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Max Score</Label>
                            <Input
                                type="number"
                                // 👇 3. Fix NaN error: Handle empty string by defaulting to 0
                                value={data.max_score}
                                onChange={(e) => setData('max_score', parseInt(e.target.value) || 0)}
                            />
                            <p className="text-muted-foreground text-[10px]">Highest possible score for this subject.</p>

                            {errors.max_score && <p className="text-sm text-red-500">{errors.max_score}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Sort Order</Label>
                            <Input
                                type="number"
                                // 👇 4. Fix NaN error here too
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Switch checked={data.is_active} onCheckedChange={(val) => setData('is_active', val)} />
                        <Label>Active</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

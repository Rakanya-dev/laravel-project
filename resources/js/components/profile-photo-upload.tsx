import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useInitials } from '@/hooks/use-initials'; // 👈 1. Import your hook

export default function ProfilePhotoUpload({ user }: { user: any }) {
    const getInitials = useInitials(); // 👈 2. Initialize the hook

    const { data, setData, post, processing, errors, reset } = useForm<{ photo: File | null }>({
        photo: null,
    });

    const [preview, setPreview] = useState(user.profile_photo_url);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    // 👈 3. Apply your specific naming logic
    const fullName = `${user.first_name ?? ''} ${user.middle_name ?? ''} ${user.last_name ?? ''}`.trim();
    const initials = getInitials(
        user.first_name ?? undefined,
        user.middle_name ?? undefined,
        user.last_name ?? undefined
    );

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ message: 'Profile photo updated successfully!', type: 'success' });
                reset('photo');
            },
        });
    };

    const confirmDelete = () => {
        setIsConfirmingDelete(false);
        router.delete('/profile/photo', {
            preserveScroll: true,
            onSuccess: () => {
                setNotification({ message: 'Photo removed successfully.', type: 'info' });
                reset('photo');
            }
        });
    };

    return (
        <div className="relative overflow-hidden bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 max-w-xl transition-colors duration-200">

            {/* Delete Confirmation Overlay */}
            {isConfirmingDelete && (
                <div className="absolute inset-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 text-center transition-colors">
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 mb-4 transition-colors">
                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">Remove Photo?</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6 transition-colors">This will revert your profile to your initials.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 rounded-xl shadow-sm transition-colors">Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white transition-colors">Profile Picture</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage how you appear to others.</p>
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 transition-colors ${notification.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
                    : 'bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                    }`}>
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-8">

                {/* 👈 4. Avatar now uses your calculated initials and full name */}
                <div className="relative group">
                    <Avatar className="w-32 h-32 border-[6px] border-white dark:border-zinc-900 shadow-xl ring-1 ring-slate-100 dark:ring-slate-800 transition-colors">
                        <AvatarImage
                            src={data.photo || user.profile_photo ? preview : undefined}
                            alt={fullName}
                            className="object-cover"
                        />

                        {/* This will now show "JC" perfectly whenever the src above is undefined */}
                        <AvatarFallback className="text-3xl bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-slate-500 font-bold uppercase transition-colors">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-3 w-full sm:flex-1">
                    {!data.photo ? (
                        <>
                            <label className="cursor-pointer flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 rounded-xl text-sm font-bold text-white dark:text-slate-900 shadow-sm hover:bg-slate-800 dark:hover:bg-slate-200 transition-all active:scale-95">
                                <span>Change Photo</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                            </label>

                            {user.profile_photo && (
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Remove
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-500 active:scale-95 transition-all">
                                {processing ? 'Updating...' : 'Save New Photo'}
                            </button>
                            <button type="button" onClick={() => { reset('photo'); setPreview(user.profile_photo_url); }} className="px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all">
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {errors.photo && <div className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-900/50 rounded-xl text-sm text-red-800 dark:text-red-400 font-medium transition-colors">{errors.photo}</div>}
        </div>
    );
}

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
        <div className="relative overflow-hidden bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-xl transition-all">

            {/* Delete Confirmation Overlay */}
            {isConfirmingDelete && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 text-center">
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900">Remove Photo?</h4>
                        <p className="text-sm text-neutral-500 mt-1 mb-6">This will revert your profile to your initials.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setIsConfirmingDelete(false)} className="px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors">Cancel</button>
                            <button onClick={confirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors">Yes, Remove</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Profile Picture</h3>
                <p className="text-sm text-neutral-500 mt-1">Manage how you appear to others.</p>
            </div>

            {notification && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
                    }`}>
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-8">

                {/* 👈 4. Avatar now uses your calculated initials and full name */}
                <div className="relative group">
                    <Avatar className="w-32 h-32 border-[6px] border-white shadow-xl ring-1 ring-neutral-100">
                        <AvatarImage
                            src={data.photo || user.profile_photo ? preview : undefined}
                            alt={fullName}
                            className="object-cover"
                        />

                        {/* This will now show "JC" perfectly whenever the src above is undefined */}
                        <AvatarFallback className="text-3xl bg-neutral-100 text-neutral-400 font-bold uppercase">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-3 w-full sm:flex-1">
                    {!data.photo ? (
                        <>
                            <label className="cursor-pointer flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-900 rounded-xl text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all active:scale-95">
                                <span>Change Photo</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                            </label>

                            {user.profile_photo && (
                                <button
                                    type="button"
                                    onClick={() => setIsConfirmingDelete(true)}
                                    className="px-5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    Remove
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button type="submit" disabled={processing} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
                                {processing ? 'Updating...' : 'Save New Photo'}
                            </button>
                            <button type="button" onClick={() => { reset('photo'); setPreview(user.profile_photo_url); }} className="px-5 py-2.5 bg-neutral-100 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-200 transition-all">
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            </div>

            {errors.photo && <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800 font-medium">{errors.photo}</div>}
        </div>
    );
}

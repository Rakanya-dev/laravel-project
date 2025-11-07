import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Fragment } from 'react';

type Props = {
    isOpen: boolean;
    onClose: () => void;
    daycares: { id: number; name: string }[];
};

export default function AddTeacherModal({ isOpen, onClose, daycares }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        contact_number: '',
        password: '',
        password_confirmation: '',
        daycare_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="bg-opacity-25 bg-gray fixed inset-0 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-100"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
                                <Dialog.Title className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Add Teacher
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* First Name */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.first_name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.first_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Middle Name */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Middle Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.middle_name}
                                            onChange={(e) => setData('middle_name', e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    {/* Last Name */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.last_name && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.last_name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                                        )}
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="mb-1 block text-sm">Contact Number</label>
                                        <input
                                            type="text"
                                            value={data.contact_number}
                                            maxLength={11}
                                            onChange={(e) =>
                                                setData('contact_number', e.target.value)
                                            }
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.contact_number && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.contact_number}
                                            </p>
                                        )}
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                        {errors.password && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            value={data.password_confirmation}
                                            onChange={(e) =>
                                                setData('password_confirmation', e.target.value)
                                            }
                                            className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    {/* Daycare Dropdown */}
                                    <div>
                                        <label className="mb-1 block text-sm dark:text-gray-300">
                                            Assign to Daycare
                                        </label>
                                        <select
                                            value={data.daycare_id}
                                            onChange={(e) => setData('daycare_id', e.target.value)}
                                            className="w-full rounded border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">-- Select Daycare --</option>
                                            {daycares.map((daycare) => (
                                                <option key={daycare.id} value={daycare.id}>
                                                    {daycare.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.daycare_id && (
                                            <p className="mt-1 text-xs text-red-500">
                                                {errors.daycare_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 active:bg-blue-700 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-offset-gray-800 dark:active:bg-blue-700"
                                        >
                                            {processing ? 'Creating...' : 'Create Teacher'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

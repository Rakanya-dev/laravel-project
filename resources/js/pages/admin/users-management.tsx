import AddTeacherModal from '@/components/add-teacher-modal';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User } from '@/types';
import { Menu, Transition } from '@headlessui/react';
import type { PageProps } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, Edit, MoreVertical, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { Fragment, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users Management', href: '/admin/users-management' }];

export default function UsersManagement() {
    type UsersManagementPageProps = PageProps & {
        teachers: { data: User[]; meta: any };
        parents: { data: User[]; meta: any };
        daycares: { id: number; name: string }[];
    };

    const { teachers, parents, daycares } = usePage<UsersManagementPageProps>().props;
    const [userType, setUserType] = useState<'teachers' | 'parents'>('teachers');
    const collection = userType === 'teachers' ? teachers : parents;

    const handleApprove = async (id: number) => {
        await axios.post(route('admin.users.approve', id));
        window.location.reload();
    };

    const handleReject = async (id: number) => {
        await axios.post(route('admin.users.reject', id));
        window.location.reload();
    };

    const [showAddTeacher, setShowAddTeacher] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="flex items-center justify-between gap-4 p-4 pb-4">
                <div className="flex gap-2">
                    <button
                        onClick={() => setUserType('teachers')}
                        className={`rounded px-4 py-2 font-medium transition-colors duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                            userType === 'teachers'
                                ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:active:bg-blue-700'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500'
                        }`}
                    >
                        Teachers
                    </button>
                    <button
                        onClick={() => setUserType('parents')}
                        className={`rounded px-4 py-2 font-medium transition-colors duration-150 focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                            userType === 'parents'
                                ? 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:active:bg-blue-700'
                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500'
                        }`}
                    >
                        Parents
                    </button>
                </div>

                {userType === 'teachers' && (
                    <>
                        <button
                            onClick={() => setShowAddTeacher(true)}
                            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-500 focus:ring-2 focus:ring-offset-2 focus:outline-none active:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-offset-gray-800 dark:active:bg-blue-700"
                        >
                            <PlusCircle /> Add Teacher
                        </button>
                        <AddTeacherModal
                            isOpen={showAddTeacher}
                            onClose={() => setShowAddTeacher(false)}
                            daycares={daycares}
                        />
                    </>
                )}
            </div>

            <div className="mb-6 gap-4 overflow-x-auto border-gray-200 p-4 shadow-sm dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-700 dark:divide-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-100 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Contact Number</th>
                            <th className="px-6 py-3">Assigned Daycare</th>
                            {userType === 'parents' && <th className="px-6 py-3">Status</th>}
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {collection.data.map((user) => (
                            <tr
                                key={user.id}
                                className="transition hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <td className="px-6 py-4 font-medium">
                                    {[user.first_name, user.middle_name, user.last_name]
                                        .filter(Boolean)
                                        .join(' ')}
                                </td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.contact_number ?? '-'}</td>
                                <td className="px-6 py-4">{user.daycare?.name ?? '-'}</td>

                                {userType === 'parents' && (
                                    <td className="px-6 py-4 capitalize">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                user.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-200/10 dark:text-yellow-400'
                                                    : user.status === 'rejected'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-200/10 dark:text-red-400'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-200/10 dark:text-green-400'
                                            }`}
                                        >
                                            {user.status ?? 'active'}
                                        </span>
                                    </td>
                                )}

                                <td className="relative px-6 py-4 text-right">
                                    <Menu as="div" className="relative inline-block text-left">
                                        <Menu.Button className="rounded-full p-1 transition hover:bg-gray-200 dark:hover:bg-gray-700">
                                            <MoreVertical size={18} />
                                        </Menu.Button>
                                        <Transition
                                            as={Fragment}
                                            enter="transition ease-out duration-100"
                                            enterFrom="opacity-0"
                                            enterTo="opacity-100"
                                            leave="transition ease-in duration-75"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                        >
                                            <Menu.Items className="ring-opacity-5 absolute right-0 z-20 mt-2 w-44 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black focus:outline-none dark:divide-gray-700 dark:bg-gray-800 dark:ring-gray-700">
                                                <div className="py-1">
                                                    {userType === 'teachers' ? (
                                                        <>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <Link
                                                                        href={route(
                                                                            'admin.users.show',
                                                                            user.id,
                                                                        )}
                                                                        className={`${
                                                                            active
                                                                                ? 'text-primary dark:text-primary-400 bg-gray-100 dark:bg-gray-700'
                                                                                : ''
                                                                        } flex items-center gap-2 px-4 py-2 text-sm`}
                                                                    >
                                                                        <Edit size={16} /> Edit
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() =>
                                                                            alert('Delete logic here')
                                                                        }
                                                                        className={`${
                                                                            active
                                                                                ? 'bg-gray-100 text-red-600 dark:bg-gray-700 dark:text-red-400'
                                                                                : ''
                                                                        } flex w-full items-center gap-2 px-4 py-2 text-left text-sm`}
                                                                    >
                                                                        <Trash2 size={16} /> Delete
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {user.status === 'pending' && (
                                                                <>
                                                                    <Menu.Item>
                                                                        {({ active }) => (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleApprove(
                                                                                        user.id,
                                                                                    )
                                                                                }
                                                                                className={`${
                                                                                    active
                                                                                        ? 'bg-gray-100 text-green-600 dark:bg-gray-700 dark:text-green-400'
                                                                                        : ''
                                                                                } flex w-full items-center gap-2 px-4 py-2 text-left text-sm`}
                                                                            >
                                                                                <CheckCircle size={16} />{' '}
                                                                                Approve
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                    <Menu.Item>
                                                                        {({ active }) => (
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleReject(
                                                                                        user.id,
                                                                                    )
                                                                                }
                                                                                className={`${
                                                                                    active
                                                                                        ? 'bg-gray-100 text-red-600 dark:bg-gray-700 dark:text-red-400'
                                                                                        : ''
                                                                                } flex w-full items-center gap-2 px-4 py-2 text-left text-sm`}
                                                                            >
                                                                                <XCircle size={16} />{' '}
                                                                                Reject
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                </>
                                                            )}
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <Link
                                                                        href={route(
                                                                            'admin.users.show',
                                                                            user.id,
                                                                        )}
                                                                        className={`${
                                                                            active
                                                                                ? 'text-primary dark:text-primary-400 bg-gray-100 dark:bg-gray-700'
                                                                                : ''
                                                                        } flex items-center gap-2 px-4 py-2 text-sm`}
                                                                    >
                                                                        <Edit size={16} /> Edit
                                                                    </Link>
                                                                )}
                                                            </Menu.Item>
                                                            <Menu.Item>
                                                                {({ active }) => (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (
                                                                                confirm(
                                                                                    'Are you sure you want to delete this parent?',
                                                                                )
                                                                            ) {
                                                                                // Call your delete endpoint here
                                                                            }
                                                                        }}
                                                                        className={`${
                                                                            active
                                                                                ? 'bg-gray-100 text-red-600 dark:bg-gray-700 dark:text-red-400'
                                                                                : ''
                                                                        } flex w-full items-center gap-2 px-4 py-2 text-left text-sm`}
                                                                    >
                                                                        <Trash2 size={16} /> Delete
                                                                    </button>
                                                                )}
                                                            </Menu.Item>
                                                        </>
                                                    )}
                                                </div>
                                            </Menu.Items>
                                        </Transition>
                                    </Menu>
                                </td>
                            </tr>
                        ))}

                        {collection.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={userType === 'parents' ? 6 : 5}
                                    className="px-6 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                                >
                                    No {userType} found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}

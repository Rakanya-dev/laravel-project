import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface Student {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    access_code: string;
}

interface Props {
    students: Student[];
    daycareName: string;
}

export default function PrintStudents({ students, daycareName }: Props) {

    useEffect(() => {
        window.print();
    }, []);

    const getFullName = (s: Student) =>
        `${s.first_name} ${s.middle_name || ''} ${s.last_name}`.trim();

    return (
        <div className="bg-white min-h-screen p-8 text-black">
            <Head title="Print Access Codes" />

            {/* Title for the page (visible on screen, helpful context) */}
            <div className="mb-8 text-center print:hidden">
                <h1 className="text-2xl font-bold">Ready to Print</h1>
                <p className="text-gray-600">
                    If the print dialog didn't open automatically, press <kbd className="font-mono bg-gray-100 px-1">Ctrl + P</kbd>
                </p>
            </div>

            {/* The Grid of Cards */}
            <div className="grid grid-cols-2 gap-4">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="break-inside-avoid border-2 border-dashed border-gray-400 rounded-lg p-6 bg-white"
                    >
                        <div className="text-center border-b border-gray-200 pb-4 mb-4">
                            <h3 className="text-lg font-bold uppercase tracking-wide text-gray-800">
                                {daycareName}
                            </h3>
                            <p className="text-sm text-gray-500">Parent Access Invitation</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Student Name:</p>
                                <p className="text-xl font-medium text-gray-900">{getFullName(student)}</p>
                            </div>

                            <div className="bg-gray-100 p-4 rounded-md text-center">
                                <p className="text-xs text-gray-500 uppercase mb-1">Your Access Code</p>
                                <p className="text-3xl font-mono font-bold text-black tracking-wider">
                                    {student.access_code}
                                </p>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>Instructions:</strong></p>
                                <ol className="list-decimal list-inside pl-1">
                                    <li>Go to <u>{window.location.origin}/register</u></li>
                                    <li>Enter the code above.</li>
                                    <li>Create your parent account.</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Simple CSS to ensure clean printing */}
            <style>{`
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; }
                    .print\\:hidden { display: none !important; }
                }
            `}</style>
        </div>
    );
}

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AssessmentPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

export function AssessmentPagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: AssessmentPaginationProps) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col items-center justify-between gap-4 rounded-b-2xl border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-zinc-900/50 p-6 sm:flex-row sm:px-8 transition-colors print:hidden">

            {/* Left: Item Counter */}
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                Showing <span className="mx-1 font-black text-slate-900 dark:text-white">{startItem}-{endItem}</span> of <span className="mx-1 font-black text-slate-900 dark:text-white">{totalItems}</span> students
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-5">
                <span className="hidden sm:block text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 transition-colors">
                    Page <span className="mx-1 font-black text-slate-900 dark:text-white">{currentPage}</span> of <span className="mx-1 font-black text-slate-900 dark:text-white">{totalPages}</span>
                </span>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-12 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-400 dark:hover:bg-zinc-800"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="size-6" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-12 rounded-xl border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-400 dark:hover:bg-zinc-800"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="size-6" />
                    </Button>
                </div>
            </div>

        </div>
    );
}

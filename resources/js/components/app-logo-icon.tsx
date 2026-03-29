import { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            // inline-flex and justify-center ensure it sits perfectly in the middle of its container
            // select-none prevents accidental highlighting so it feels like a real logo
            className={`inline-flex items-center justify-center font-black tracking-tight select-none ${className}`}
        >
            <span className="text-2xl text-indigo-600 drop-shadow-sm">KID</span>
            <span className="text-2xl text-slate-800 dark:text-slate-100 drop-shadow-sm">TRAK</span>

            {/* Professional layered pulse effect aligned to the text baseline */}
            <div className="relative ml-1 mb-1.5 self-end flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
            </div>
        </div>
    );
}

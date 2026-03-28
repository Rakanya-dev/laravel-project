import { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            {...props}
            className={`flex items-center font-black tracking-tighter text-indigo-600 ${props.className}`}
        >
            <span className="text-xl">KID</span>
            <span className="text-xl text-slate-800">TRAK</span>
            <div className="ml-1 h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        </div>
    );
}

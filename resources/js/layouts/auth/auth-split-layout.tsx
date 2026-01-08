import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Baby } from 'lucide-react'; // Swapped for the icon used in your new design
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* LEFT SIDE: Branding & Quote */}
            <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />

                {/* Logo Area */}
                <Link href={route('home')} className="relative z-20 flex items-center text-lg font-medium">
                    <Baby className="mr-2 h-6 w-6" />
                    {name}
                </Link>

                {/* Quote Area */}
                {quote && (
                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.message}&rdquo;</p>
                            <footer className="text-sm text-zinc-400">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>

            {/* RIGHT SIDE: Content Form */}
            <div className="p-4 lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">

                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Link href={route('home')} className="mb-4 flex items-center justify-center lg:hidden">
                            <Baby className="h-10 w-10 text-zinc-900 dark:text-white" />
                        </Link>

                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm text-muted-foreground text-balance">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* The Form Content */}
                    <div className="grid gap-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

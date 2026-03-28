import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    // 🚀 1. We no longer need to extract 'daycare' directly from props
    const { auth } = usePage<any>().props;
    const user = auth?.user;

    // Default fallback
    let displayName = "Child Development Center";

    if (user) {
        if (user.role === 'admin') {
            displayName = "GMA ECCD Portal";
        }
        else if (user.role === 'parent') {
            displayName = "Parent Portal";
        }
        // 🚀 2. Access daycare from INSIDE the user object
        else if (user.daycare && user.daycare.name) {
            displayName = user.daycare.name;
        }
    }

    return (
        <>
            {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img
                    src="/images/gma-logo.png"
                    alt="General Mariano Alvarez Logo"
                    className="object-contain size-7 rounded-sm"
                />
            </div> */}
            <div className="ml-1 grid flex-1 text-left text-sm overflow-hidden">
                <span
                    className="mb-0.5 truncate leading-none font-semibold"
                    title={displayName}
                >
                    {displayName}
                </span>
            </div>
        </>
    );
}

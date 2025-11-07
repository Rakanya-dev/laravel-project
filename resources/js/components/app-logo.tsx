export default function AppLogo() {
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img
                    src="/images/gma-logo.png"
                    alt="GMA Logo"
                    className="object-contain size-7 rounded-sm"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Daycare Center</span>
            </div>
        </>
    );
}

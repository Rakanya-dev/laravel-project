import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/gma-logo.png"
            alt="GMA Logo"
            className="object-contain"
            {...props}
        />
    );
}

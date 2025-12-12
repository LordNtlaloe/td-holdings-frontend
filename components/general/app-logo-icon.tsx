import { cn } from '@/lib/utils';
import Image from 'next/image';

type AppLogoIconProps = {
    className?: string;
    width?: number;
    height?: number;
};

export default function AppLogoIcon({ className, width = 1000, height = 1000 }: AppLogoIconProps) {
    return (
        <Image
            src="/Images/TD-Logo.png"
            alt="App Logo"
            width={width}
            height={height}
            className={cn('object-contain rounded-lg', className)}
        />
    );
}

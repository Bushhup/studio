
'use client';

import { useEffect, useState } from 'react';
import { useRouter }from 'next/navigation';
import { cn } from '@/lib/utils';

const GlitteringLogo = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="96" 
        height="96" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="h-24 w-24"
    >
        <defs>
            <linearGradient id="glitterGradient" x1="0%" y1="0%" x2="200%" y2="0%">
                <stop offset="0%" style={{stopColor: '#ff0000'}} />
                <stop offset="25%" style={{stopColor: '#ff00ff'}} />
                <stop offset="50%" style={{stopColor: '#0000ff'}} />
                <stop offset="75%" style={{stopColor: '#00ff00'}} />
                <stop offset="100%" style={{stopColor: '#ffff00'}} />
                <animate attributeName="x1" from="0%" to="200%" dur="5s" repeatCount="indefinite" />
                <animate attributeName="x2" from="200%" to="400%" dur="5s" repeatCount="indefinite" />
            </linearGradient>
        </defs>
        <path d="M22 10v6M2 10v6" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M6 12v-2a3 3 0 0 1 6 0v2" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M12 12v-2a3 3 0 0 0-6 0v2" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M14 22V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v18" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M18 10a2 2 0 1 0-4 0" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M6 10a2 2 0 1 1 4 0" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
        <path d="M6 14.01V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1.99" fill="url(#glitterGradient)" stroke="url(#glitterGradient)"/>
    </svg>
);


export default function RootPage() {
    const router = useRouter();
    const [isFadingOut, setIsFadingOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFadingOut(true);
        }, 3000); // Wait for 3 seconds

        const redirectTimer = setTimeout(() => {
            router.replace('/landing');
        }, 4000); // Redirect after fade out (3s + 1s fade)

        return () => {
            clearTimeout(timer);
            clearTimeout(redirectTimer);
        };
    }, [router]);

    return (
        <div className={cn(
            "flex min-h-screen items-center justify-center bg-background p-4 transition-opacity duration-1000 ease-in-out",
            isFadingOut ? "opacity-0" : "opacity-100"
        )}>
            <div className="flex flex-col items-center gap-6">
                 <GlitteringLogo />
            </div>
      </div>
    );
}

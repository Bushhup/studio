
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraduationCap } from 'lucide-react';


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
                 <svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animated-gradient">
                    <defs>
                        <linearGradient id="theme-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{stopColor: 'hsl(var(--primary))'}} />
                            <stop offset="100%" style={{stopColor: 'hsl(var(--accent))'}} />
                        </linearGradient>
                    </defs>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" stroke="url(#theme-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="url(#theme-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
      </div>
    );
}

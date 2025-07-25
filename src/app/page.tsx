
'use client';

import { useEffect, useState } from 'react';
import { useRouter }from 'next/navigation';
import { cn } from '@/lib/utils';

const AnimatedLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="96"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#theme-gradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-24 w-24"
    >
      <defs>
        <linearGradient id="theme-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
          <animate attributeName="x1" values="0%;100%;0%" dur="5s" repeatCount="indefinite" />
          <animate attributeName="y1" values="0%;100%;0%" dur="5s" repeatCount="indefinite" />
          <animate attributeName="x2" values="100%;0%;100%" dur="5s" repeatCount="indefinite" />
          <animate attributeName="y2" values="100%;0%;100%" dur="5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <path d="M22 10v6M2 10v6" />
      <path d="M6 12v-2a3 3 0 0 1 6 0v2" />
      <path d="m12 12-3.4 5.9a2 2 0 0 1-1.6 1H6" />
      <path d="m12 12 3.4 5.9a2 2 0 0 0 1.6 1H18" />
      <path d="M14 22V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v18" />
      <path d="M18 10a2 2 0 1 0-4 0" />
      <path d="M6 10a2 2 0 1 1 4 0" />
      <path d="M6 14.01V16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1.99" />
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
                 <AnimatedLogo />
            </div>
      </div>
    );
}

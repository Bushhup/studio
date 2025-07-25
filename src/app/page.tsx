
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const AnimatedLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="96"
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#theme-gradient)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="theme-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
          <animate attributeName="x1" values="-100%;200%" dur="2s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0%;300%" dur="2s" repeatCount="indefinite" />
        </linearGradient>
      </defs>
      <path d="m22 10-10-4-10 4 10 4 10-4v4" />
      <path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5" />
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

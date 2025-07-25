'use client';

import { useEffect, useState } from 'react';
import { useRouter }from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

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
                 <GraduationCap className="h-24 w-24 bg-gradient-to-r from-primary via-purple-500 to-accent animated-gradient" />
            </div>
      </div>
    );
}

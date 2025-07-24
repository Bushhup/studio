
'use client';

import { useEffect } from 'react';
import { useRouter }from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/landing');
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
      </div>
    );
}

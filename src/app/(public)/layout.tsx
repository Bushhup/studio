
import { Header } from '@/components/layout/header';
import { GraduationCap } from 'lucide-react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <GraduationCap className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p>&copy; {new Date().getFullYear()} MCA Department. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

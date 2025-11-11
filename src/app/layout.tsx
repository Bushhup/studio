
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/layout/theme-provider';
import AuthProvider from '@/components/layout/auth-provider';

export const metadata: Metadata = {
  title: 'MCA Dept - MCA Department Management',
  description: 'Streamlined communication and academic tracking for MCA departments.',
  icons: {
    icon: [],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
              {children}
              <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

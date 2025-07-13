
import type { Metadata } from 'next';
import { Inter, Space_Grotesk, UnifrakturCook } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/layout/theme-provider';
import AuthProvider from '@/components/layout/auth-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', weight: ['300', '400', '500', '600', '700'] });
const unifrakturCook = UnifrakturCook({ subsets: ['latin'], variable: '--font-unifrak-cook', weight: ['700']});

export const metadata: Metadata = {
  title: 'MCA Dept - MCA Department Management',
  description: 'Streamlined communication and academic tracking for MCA departments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${unifrakturCook.variable} font-body antialiased`}>
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

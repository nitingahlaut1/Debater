import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import ThemeBody from '@/components/ThemeBody';
import ThemeFooter from '@/components/ThemeFooter';
import { ThemeProvider } from '@/lib/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'AI Debate Arena — Multi-Agent LLM Debate Platform',
  description:
    'Watch two Grok-powered AI agents clash in rigorous debate while an impartial AI judge scores logic, evidence, and persuasiveness to declare the victor.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} selection:bg-cyan-500/30 selection:text-cyan-200`}>
        <ThemeProvider>
          <ThemeBody>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {children}
            </main>
            <ThemeFooter />
          </ThemeBody>
        </ThemeProvider>
      </body>
    </html>
  );
}

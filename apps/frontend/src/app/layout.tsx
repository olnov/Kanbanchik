import type { Metadata } from 'next';
import { Geist } from "next/font/google";
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

const geist = Geist({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Kanbanchik',
  description: 'Kanban board',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

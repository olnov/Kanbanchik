import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Kanbanchik',
  description: 'Kanban board',
};

const layoutStyle = {
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
};

const mainStyle = {
  flex: 1,
  overflow: 'auto',
  padding: '24px',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={layoutStyle}>
          <Sidebar />
          <main style={mainStyle}>{children}</main>
        </div>
      </body>
    </html>
  );
}

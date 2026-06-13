import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'RemediAX - Enterprise AI Security Dashboard',
  description: 'Advanced AI-powered security monitoring and threat intelligence platform',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ fontSize: '16px' }}>
      <body style={{ backgroundColor: '#0A0F1E', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', WebkitTextSizeAdjust: '100%', textSizeAdjust: '100%' }}>
        {children}
      </body>
    </html>
  );
}

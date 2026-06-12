import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RemediAX - Enterprise AI Security Dashboard',
  description: 'Advanced AI-powered security monitoring and threat intelligence platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ backgroundColor: '#0A0F1E', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}

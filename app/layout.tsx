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
    <html lang="en" className="dark" style={{ fontSize: '16px' }}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
      </head>
      <body style={{ backgroundColor: '#0A0F1E', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', WebkitTextSizeAdjust: '100%', textSizeAdjust: '100%' } as React.CSSProperties}>
        {children}
      </body>
    </html>
  );
}

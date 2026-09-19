import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEMORA — An intimate personal archive',
  description: 'Your second memory. A private personal memory engine for documents, agreements, tickets, and receipts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

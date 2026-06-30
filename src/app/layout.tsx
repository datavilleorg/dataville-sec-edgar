import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dataville — SEC Filing Analyzer',
  description: 'Analyze SEC EDGAR filings, financials, and insider transactions for public companies, powered by the Dataville API.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

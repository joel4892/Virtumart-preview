import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datasynth AI',
  description: 'High-compliance data ingestion, annotation, and export'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-neutral-950 text-neutral-100 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <header className="flex items-center justify-between pb-6 border-b border-neutral-800">
            <h1 className="text-xl font-semibold">Datasynth AI</h1>
            <nav className="text-sm space-x-4">
              <a href="/" className="hover:text-brand-600">Dashboard</a>
              <a href="/upload" className="hover:text-brand-600">Upload</a>
              <a href="/annotate" className="hover:text-brand-600">Annotate</a>
              <a href="/compliance" className="hover:text-brand-600">Compliance</a>
              <a href="/export" className="hover:text-brand-600">Export</a>
              <a href="/admin" className="hover:text-brand-600">Admin</a>
            </nav>
          </header>
          <main className="py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
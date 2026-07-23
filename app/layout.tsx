import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import './globals.css';

export const metadata: Metadata = buildMetadata({});

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Guyana Lottery Results',
  url: 'https://www.guyanalottoresults.com',
  description:
    'Latest Guyana lottery results for Lotto Supa 6, Daily Millions, Lucky 3, Pick 2, Draw De Line, Pay Day, Multi X, and Play 4.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.guyanalottoresults.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <JsonLd data={siteJsonLd} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

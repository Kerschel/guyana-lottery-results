import Link from 'next/link';
import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({ title: 'Page Not Found' });

export default function NotFound() {
  return (
    <section className="max-w-6xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-gray-400 mb-6">This page could not be found.</p>
      <Link href="/" className="btn-primary">
        Back to Home
      </Link>
    </section>
  );
}

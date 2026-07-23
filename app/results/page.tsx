import type { Metadata } from 'next';
import { GAMES } from '@/lib/games';
import { getLatestResults } from '@/lib/results';
import { buildMetadata } from '@/lib/metadata';
import GameCard from '@/components/GameCard';
import AdPlaceholder from '@/components/AdPlaceholder';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = buildMetadata({
  title: 'All Lottery Results',
  description:
    'View all Guyana lottery results at a glance — Lotto Supa 6, Daily Millions, Lucky 3, Pick 2, Draw De Line, Pay Day, Multi X, and Play 4.',
  path: 'results',
});

export default function AllResultsPage() {
  const latest = getLatestResults();

  const resultsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Guyana Lottery Results',
    description:
      'Complete latest results for all Guyana Lottery Company games.',
    url: 'https://www.guyanalottoresults.com/results/',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.guyanalottoresults.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'All Results',
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={resultsJsonLd} />
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-guyana-gold transition-colors">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-300">All Results</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          All Lottery Results
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Latest winning numbers for every Guyana lottery game.
        </p>

        {/* Banner Ad */}
        <AdPlaceholder position="banner" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {GAMES.map((game) => (
            <GameCard
              key={game.slug}
              game={game}
              latestResult={latest[game.slug]}
            />
          ))}
        </div>

        {/* Inline Ad */}
        <AdPlaceholder position="inline" />
      </section>
    </>
  );
}

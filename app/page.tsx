import { GAMES, type GameResult } from '@/lib/games';
import { getLatestResults } from '@/lib/results';
import { buildMetadata } from '@/lib/metadata';
import GameCard from '@/components/GameCard';
import AdPlaceholder from '@/components/AdPlaceholder';
import JsonLd from '@/components/JsonLd';
import type { Metadata } from 'next';

export const metadata: Metadata = buildMetadata({
  title: 'Guyana Lottery Results Today',
  description:
    'Check the latest Guyana lottery results for Lotto Supa 6, Daily Millions, Lucky 3, Pick 2, Draw De Line, Pay Day, Multi X, and Play 4. Updated after every draw.',
});

export default function HomePage() {
  const latest = getLatestResults();
  const hasAnyResults = Object.values(latest).some(
    (r): r is GameResult => !!r
  );

  const homeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Guyana Lottery Results Today',
    description:
      'Latest lottery results for all Guyana Lottery Company games.',
    url: 'https://www.guyanalottoresults.com',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: GAMES.map((game, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://www.guyanalottoresults.com/${game.slug}/`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={homeJsonLd} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Guyana Lottery Results Today
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Latest winning numbers for Lotto Supa 6, Daily Millions, Lucky 3,
            Pick 2, Draw De Line, Pay Day, Multi X, and Play 4 — updated after
            every draw.
          </p>
        </div>
      </section>

      {/* Banner Ad */}
      <div className="max-w-6xl mx-auto px-4">
        <AdPlaceholder position="banner" />
      </div>

      {/* Results Grid */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Latest Results</h2>
          <a href="/results/" className="text-xs text-guyana-green-light hover:underline">
            View All &rarr;
          </a>
        </div>

        {hasAnyResults ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map((game) => (
              <GameCard
                key={game.slug}
                game={game}
                latestResult={latest[game.slug]}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-10 text-center">
            <p className="text-gray-400 mb-2">No results available yet</p>
            <p className="text-sm text-gray-500">
              Results will appear here once the scraper runs and populates the
              data. Check back after the next draw!
            </p>
          </div>
        )}

        {/* Inline Ad (mobile) */}
        <div className="lg:hidden mt-6">
          <AdPlaceholder position="inline" />
        </div>
      </section>

      {/* Side-by-side: sidebar ad (desktop) */}
      <div className="max-w-6xl mx-auto px-4 pb-8 hidden lg:block">
        <AdPlaceholder position="sidebar" className="float-right ml-6 mb-6" />
      </div>
    </>
  );
}

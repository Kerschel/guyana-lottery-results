import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GAME_MAP, GAME_SLUGS } from '@/lib/games';
import { getResultsForGame } from '@/lib/results';
import { buildGameMetadata } from '@/lib/metadata';
import ResultsTable from '@/components/ResultsTable';
import JsonLd from '@/components/JsonLd';
import HistoryFilters from './HistoryFilters';

interface HistoryPageProps {
  params: { gameSlug: string };
}

export function generateStaticParams() {
  return GAME_SLUGS.map((slug) => ({ gameSlug: slug }));
}

export function generateMetadata({ params }: HistoryPageProps): Metadata {
  const game = GAME_MAP[params.gameSlug];
  return buildGameMetadata(params.gameSlug);
}

export default function HistoryPage({ params }: HistoryPageProps) {
  const { gameSlug } = params;
  const game = GAME_MAP[gameSlug];
  if (!game) notFound();

  const allResults = getResultsForGame(gameSlug);

  const historyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${game.name} Full History`,
    description: `Complete historical results for ${game.name} with date range filtering.`,
    url: `https://www.guyanalottoresults.com/${gameSlug}/history/`,
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
          name: `${game.name} Results`,
          item: `https://www.guyanalottoresults.com/${gameSlug}/`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Full History',
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={historyJsonLd} />
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-guyana-gold transition-colors">Home</a>
          <span className="mx-2">/</span>
          <a href={`/${gameSlug}/`} className="hover:text-guyana-gold transition-colors">
            {game.name} Results
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-300">Full History</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {game.name} &mdash; Full History
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          Complete historical results with date range filtering.
        </p>

        <HistoryFilters
          allResults={allResults.map((r) => ({
            ...r,
            index: `${r.drawDate}-${r.drawTime}`,
          }))}
          game={game}
        />
      </section>
    </>
  );
}

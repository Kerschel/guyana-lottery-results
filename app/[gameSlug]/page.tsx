import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { GAMES, GAME_MAP, GAME_SLUGS } from '@/lib/games';
import { getLatestResult, getResultsForGame } from '@/lib/results';
import { buildGameMetadata } from '@/lib/metadata';
import NumberBall from '@/components/NumberBall';
import ResultsTable from '@/components/ResultsTable';
import AdPlaceholder from '@/components/AdPlaceholder';
import JsonLd from '@/components/JsonLd';

interface GamePageProps {
  params: { gameSlug: string };
}

export function generateStaticParams() {
  return GAME_SLUGS.map((slug) => ({ gameSlug: slug }));
}

export function generateMetadata({ params }: GamePageProps): Metadata {
  return buildGameMetadata(params.gameSlug);
}

export default function GamePage({ params }: GamePageProps) {
  const { gameSlug } = params;
  const game = GAME_MAP[gameSlug];
  if (!game) notFound();

  const latest = getLatestResult(gameSlug);
  const recent20 = getResultsForGame(gameSlug, 20);

  const gameJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${game.name} Results`,
    description: `Latest ${game.name} lottery results and historical data. ${game.format}.`,
    url: `https://www.guyanalottoresults.com/${gameSlug}/`,
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
        },
      ],
    },
  };

  return (
    <>
      <JsonLd data={gameJsonLd} />
      <section className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4" aria-label="Breadcrumb">
          <a href="/" className="hover:text-guyana-gold transition-colors">Home</a>
          <span className="mx-2">/</span>
          <span className="text-gray-300">{game.name} Results</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {game.name} Results
        </h1>
        <p className="text-gray-400 text-sm mb-2">{game.description}</p>
        <p className="text-xs text-gray-500 mb-6">
          {game.format} &middot; Draws {game.drawDays} at {game.drawTimes.join(' & ')}
        </p>

        {/* Banner Ad */}
        <AdPlaceholder position="banner" />

        {/* Latest Result */}
        <section className="my-6">
          <h2 className="section-title">Latest Draw</h2>
          {latest ? (
            <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-guyana-gold">
                  {latest.drawDate}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                  {latest.drawTime}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {latest.numbers.map((num, i) => (
                  <NumberBall key={`${num}-${i}`} value={num} />
                ))}
                {latest.bonus && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-1">Bonus:</span>
                    <NumberBall value={latest.bonus} type="bonus" />
                  </div>
                )}
                {latest.letter && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 mr-1">Letter:</span>
                    <NumberBall value={latest.letter} type="letter" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-8 text-center">
              <p className="text-gray-400">No results yet for {game.name}.</p>
            </div>
          )}
        </section>

        {/* Recent Results */}
        <section className="my-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Results</h2>
            <a
              href={`/${gameSlug}/history/`}
              className="text-xs text-guyana-green-light hover:underline"
            >
              Full History &rarr;
            </a>
          </div>
          {recent20.length > 0 ? (
            <ResultsTable
              results={recent20}
              showBonus={!!game.hasBonus}
              showLetter={!!game.hasLetter}
            />
          ) : (
            <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-8 text-center">
              <p className="text-gray-400">No results available yet.</p>
            </div>
          )}
        </section>

        {/* Inline Ad */}
        <AdPlaceholder position="inline" />
      </section>
    </>
  );
}

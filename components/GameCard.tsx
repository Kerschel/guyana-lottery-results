import Link from 'next/link';
import type { Game, GameResult } from '@/lib/games';
import NumberBall from './NumberBall';

interface GameCardProps {
  game: Game;
  latestResult?: GameResult;
}

export default function GameCard({ game, latestResult }: GameCardProps) {
  return (
    <article className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 sm:p-5 shadow-lg hover:border-gray-600 transition-colors">
      <Link href={`/${game.slug}/`} className="block">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">{game.name}</h3>
          <span className="text-xs text-gray-400">{game.drawDays}</span>
        </div>

        {latestResult ? (
          <div>
            <div className="flex items-center gap-1 mb-2">
              <span className="text-xs text-guyana-gold font-medium">
                {latestResult.drawDate}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                {latestResult.drawTime}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {latestResult.numbers.map((num, i) => (
                <NumberBall key={`${num}-${i}`} value={num} />
              ))}
              {latestResult.bonus && (
                <NumberBall value={latestResult.bonus} type="bonus" />
              )}
              {latestResult.letter && (
                <NumberBall value={latestResult.letter} type="letter" />
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-sm text-gray-500">No results yet</p>
            <p className="text-xs text-gray-600 mt-1">
              Check back after the next draw
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center gap-1 text-xs text-guyana-green-light font-medium">
          View details
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </article>
  );
}

import { GAME_SLUGS, type GameResult } from './games';
import resultsData from '@/data/results.json';

const results = resultsData as GameResult[];

export function getAllResults(): GameResult[] {
  return results;
}

export function getLatestResult(gameSlug: string): GameResult | undefined {
  const gameResults = results
    .filter((r) => r.gameSlug === gameSlug)
    .sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.drawTime.localeCompare(a.drawTime);
    });
  return gameResults[0];
}

export function getLatestResults(): Record<string, GameResult | undefined> {
  const latest: Record<string, GameResult | undefined> = {};
  for (const slug of GAME_SLUGS) {
    latest[slug] = getLatestResult(slug);
  }
  return latest;
}

export function getResultsForGame(
  gameSlug: string,
  limit?: number
): GameResult[] {
  const gameResults = results
    .filter((r) => r.gameSlug === gameSlug)
    .sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.drawTime.localeCompare(a.drawTime);
    });
  return limit ? gameResults.slice(0, limit) : gameResults;
}

export function getResultsByDateRange(
  gameSlug: string,
  startDate: string,
  endDate: string
): GameResult[] {
  return results
    .filter(
      (r) =>
        r.gameSlug === gameSlug &&
        r.drawDate >= startDate &&
        r.drawDate <= endDate
    )
    .sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.drawTime.localeCompare(a.drawTime);
    });
}

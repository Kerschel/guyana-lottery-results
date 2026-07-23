import type { Metadata } from 'next';
import { GAME_MAP } from './games';

const SITE_NAME = 'Guyana Lottery Results';
const SITE_URL = 'https://www.guyanalottoresults.com';
const DEFAULT_DESCRIPTION =
  'Latest Guyana lottery results for Lotto Supa 6, Daily Millions, Lucky 3, Pick 2, Draw De Line, Pay Day, Multi X, and Play 4. Updated daily after each draw.';

export function buildMetadata({
  title,
  description,
  path = '',
}: {
  title?: string;
  description?: string;
  path?: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const fullDescription = description || DEFAULT_DESCRIPTION;

  return {
    title: fullTitle,
    description: fullDescription,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: path ? `${SITE_URL}/${path}` : SITE_URL },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      siteName: SITE_NAME,
      type: 'website',
    },
  };
}

export function buildGameMetadata(gameSlug: string): Metadata {
  const game = GAME_MAP[gameSlug];
  if (!game) {
    return buildMetadata({ title: 'Game Not Found' });
  }
  return buildMetadata({
    title: `${game.name} Results`,
    description: `Latest ${game.name} lottery results and historical data. ${game.format}. Draws ${game.drawDays} at ${game.drawTimes.join(' & ')}.`,
    path: gameSlug,
  });
}

export interface Game {
  slug: string;
  name: string;
  description: string;
  drawDays: string;
  drawTimes: string[];
  format: string;
  numberRange?: { min: number; max: number; count?: number };
  hasBonus?: boolean;
  hasLetter?: boolean;
  letterRange?: string;
  digits?: number;
}

export interface GameResult {
  gameSlug: string;
  drawDate: string;
  drawTime: string;
  numbers: string[];
  bonus?: string | null;
  letter?: string | null;
  createdAt?: string;
}

export const GAMES: Game[] = [
  {
    slug: 'lotto-supa-6',
    name: 'Lotto Supa 6',
    description: "Guyana's premier lottery game — pick 6 numbers plus a bonus and letter for the jackpot.",
    drawDays: 'Wed, Sat',
    drawTimes: ['7PM'],
    format: '6 numbers (1-28) + 1 bonus (1-28) + 1 letter (A-O)',
    numberRange: { min: 1, max: 28, count: 6 },
    hasBonus: true,
    hasLetter: true,
    letterRange: 'A-O',
  },
  {
    slug: 'daily-millions',
    name: 'Daily Millions',
    description: 'Win millions daily — match 5 numbers from 1 to 26.',
    drawDays: 'Mon-Sat',
    drawTimes: ['7PM'],
    format: '5 numbers (1-26)',
    numberRange: { min: 1, max: 26, count: 5 },
  },
  {
    slug: 'lucky-3',
    name: 'Lucky 3',
    description: 'Pick 3 digits — two draws daily at 1PM and 7PM.',
    drawDays: 'Mon-Sat',
    drawTimes: ['1PM', '7PM'],
    format: '3 digits (0-9 each)',
    digits: 3,
  },
  {
    slug: 'pick-2',
    name: 'Pick 2',
    description: 'Simple 2-digit game with two draws daily.',
    drawDays: 'Mon-Sat',
    drawTimes: ['1PM', '7PM'],
    format: '2 digits (0-9 each)',
    digits: 2,
  },
  {
    slug: 'draw-de-line',
    name: 'Draw De Line',
    description: 'Match 7 numbers from 1 to 26 for a win.',
    drawDays: 'Mon-Sat',
    drawTimes: ['7PM'],
    format: '7 numbers (1-26)',
    numberRange: { min: 1, max: 26, count: 7 },
  },
  {
    slug: 'pay-day',
    name: 'Pay Day',
    description: 'Five chances to win — drawn four weekdays and Saturday.',
    drawDays: 'Mon, Tue, Wed, Thu, Sat',
    drawTimes: ['7PM'],
    format: '5 numbers (1-26)',
    numberRange: { min: 1, max: 26, count: 5 },
  },
  {
    slug: 'multi-x',
    name: 'Multi X',
    description: 'Multiplier game — results show the multiplier for each draw.',
    drawDays: 'Mon-Sat',
    drawTimes: ['1PM', '7PM'],
    format: 'Multiplier result (e.g. 2X, 5X, FP)',
  },
  {
    slug: 'play-4',
    name: 'Play 4',
    description: 'Pick 4 digits — two draws daily at 1PM and 7PM.',
    drawDays: 'Mon-Sat',
    drawTimes: ['1PM', '7PM'],
    format: '4 digits (0-9 each)',
    digits: 4,
  },
];

export const GAME_MAP: Record<string, Game> = Object.fromEntries(
  GAMES.map((g) => [g.slug, g])
);

export const GAME_SLUGS = GAMES.map((g) => g.slug);

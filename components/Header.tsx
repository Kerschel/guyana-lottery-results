import Link from 'next/link';
import { GAMES } from '@/lib/games';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🇬🇾</span>
            <span className="text-lg font-bold text-white hidden sm:inline">
              Guyana Lotto Results
            </span>
            <span className="text-lg font-bold text-white sm:hidden">
              GY Results
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {GAMES.map((g) => (
              <Link
                key={g.slug}
                href={`/${g.slug}/`}
                className="text-xs text-gray-400 hover:text-guyana-gold transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </nav>
          <Link
            href="/results/"
            className="text-xs px-3 py-1.5 rounded-md bg-guyana-green text-white hover:bg-guyana-green-dark transition-colors"
          >
            All Results
          </Link>
        </div>
        {/* Mobile nav: horizontal scroll */}
        <nav className="md:hidden mt-2 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {GAMES.map((g) => (
            <Link
              key={g.slug}
              href={`/${g.slug}/`}
              className="text-xs text-gray-400 hover:text-guyana-gold whitespace-nowrap transition-colors"
            >
              {g.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

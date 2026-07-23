import Link from 'next/link';
import { GAMES } from '@/lib/games';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-sm font-semibold text-white mb-3">Games</h4>
            <ul className="space-y-1.5">
              {GAMES.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/${g.slug}/`}
                    className="text-xs text-gray-400 hover:text-guyana-gold transition-colors"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Pages</h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/" className="text-xs text-gray-400 hover:text-guyana-gold transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/results/" className="text-xs text-gray-400 hover:text-guyana-gold transition-colors">
                  All Results
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Draw Days</h4>
            <ul className="space-y-1.5">
              <li className="text-xs text-gray-500">Mon-Sat: 1PM &amp; 7PM</li>
              <li className="text-xs text-gray-500">Lotto Supa 6: Wed &amp; Sat 7PM</li>
              <li className="text-xs text-gray-500">Pay Day: Mon-Thu &amp; Sat 7PM</li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-sm font-semibold text-white mb-3">Disclaimer</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Not affiliated with the Guyana Lottery Company. For official
              results visit{' '}
              <a
                href="https://guyana-lottery.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-guyana-green-light hover:underline"
              >
                guyana-lottery.com
              </a>
              . Results are provided for informational purposes only.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Guyana Lottery Results. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { GameResult } from '@/lib/games';
import NumberBall from './NumberBall';

interface ResultsTableProps {
  results: GameResult[];
  showDate?: boolean;
  showTime?: boolean;
  showNumbers?: boolean;
  showBonus?: boolean;
  showLetter?: boolean;
  compact?: boolean;
}

export default function ResultsTable({
  results,
  showDate = true,
  showTime = true,
  showNumbers = true,
  showBonus = true,
  showLetter = true,
  compact = false,
}: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-8 text-center">
        <p className="text-gray-400">No results to display.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-800 text-xs uppercase text-gray-400">
          <tr>
            {showDate && <th className="px-3 py-3">Date</th>}
            {showTime && <th className="px-3 py-3">Time</th>}
            {showNumbers && <th className="px-3 py-3">Numbers</th>}
            {showBonus && <th className="px-3 py-3">Bonus</th>}
            {showLetter && <th className="px-3 py-3">Letter</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {results.map((r, i) => (
            <tr
              key={`${r.gameSlug}-${r.drawDate}-${r.drawTime}-${i}`}
              className="bg-gray-800/30 hover:bg-gray-800/60 transition-colors"
            >
              {showDate && (
                <td className="px-3 py-2.5 text-gray-200 whitespace-nowrap">
                  {r.drawDate}
                </td>
              )}
              {showTime && (
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                    {r.drawTime}
                  </span>
                </td>
              )}
              {showNumbers && (
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {r.numbers.map((num, j) => (
                      <NumberBall
                        key={`${num}-${j}`}
                        value={num}
                        type="number"
                      />
                    ))}
                  </div>
                </td>
              )}
              {showBonus && (
                <td className="px-3 py-2.5">
                  {r.bonus ? (
                    <NumberBall value={r.bonus} type="bonus" />
                  ) : (
                    <span className="text-gray-600">--</span>
                  )}
                </td>
              )}
              {showLetter && (
                <td className="px-3 py-2.5">
                  {r.letter ? (
                    <NumberBall value={r.letter} type="letter" />
                  ) : (
                    <span className="text-gray-600">--</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

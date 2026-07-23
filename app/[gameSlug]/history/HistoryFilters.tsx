'use client';

import { useState, useMemo } from 'react';
import type { Game, GameResult } from '@/lib/games';
import ResultsTable from '@/components/ResultsTable';

interface HistoryEntry extends GameResult {
  index: string;
}

interface HistoryFiltersProps {
  allResults: HistoryEntry[];
  game: Game;
}

export default function HistoryFilters({
  allResults,
  game,
}: HistoryFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => {
    if (!startDate && !endDate) return allResults;
    return allResults.filter((r) => {
      if (startDate && r.drawDate < startDate) return false;
      if (endDate && r.drawDate > endDate) return false;
      return true;
    });
  }, [allResults, startDate, endDate]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800/40">
        <div>
          <label
            htmlFor="start-date"
            className="block text-xs text-gray-400 mb-1"
          >
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-gray-600 bg-gray-900 px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-guyana-green"
          />
        </div>
        <div>
          <label
            htmlFor="end-date"
            className="block text-xs text-gray-400 mb-1"
          >
            End Date
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-gray-600 bg-gray-900 px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-guyana-green"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-3 py-1.5 text-xs rounded-md border border-gray-600 text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors"
          >
            Clear Filters
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filtered.length > 0 ? (
        <ResultsTable
          results={filtered}
          showBonus={!!game.hasBonus}
          showLetter={!!game.hasLetter}
        />
      ) : (
        <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-8 text-center">
          <p className="text-gray-400">
            {allResults.length === 0
              ? 'No results available yet.'
              : 'No results match your date range.'}
          </p>
        </div>
      )}
    </div>
  );
}

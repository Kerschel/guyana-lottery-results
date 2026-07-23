# Guyana Lottery Results

Mobile-first, SEO-optimized website displaying the latest Guyana lottery results. Built with Next.js 14 and automatically updated via a Python scraper running on GitHub Actions.

**Live site:** `https://www.guyanalottoresults.com` (after deployment)

## Games Covered

| Game | Draw Days | Draw Times | Format |
|---|---|---|---|
| Lotto Supa 6 | Wed, Sat | 7PM | 6 numbers (1-28) + 1 bonus + 1 letter (A-O) |
| Daily Millions | Mon-Sat | 7PM | 5 numbers (1-26) |
| Lucky 3 | Mon-Sat | 1PM, 7PM | 3 digits (0-9 each) |
| Pick 2 | Mon-Sat | 1PM, 7PM | 2 digits (0-9 each) |
| Draw De Line | Mon-Sat | 7PM | 7 numbers (1-26) |
| Pay Day | Mon, Tue, Wed, Thu, Sat | 7PM | 5 numbers (1-26) |
| Multi X | Mon-Sat | 1PM, 7PM | Multiplier result (e.g. 2X, 5X, FP) |
| Play 4 | Mon-Sat | 1PM, 7PM | 4 digits (0-9 each) |

## Tech Stack

- **Framework:** Next.js 14 (App Router, static export)
- **Styling:** Tailwind CSS 3
- **Language:** TypeScript
- **Scraper:** Python 3 + BeautifulSoup 4 + Requests
- **Automation:** GitHub Actions (runs twice daily)

## Running Locally

### Website

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

### Scraper

```bash
pip install -r scraper/requirements.txt
python3 scraper/scrape.py
```

The scraper fetches results from the official Guyana Lottery Company results archive and writes them to `data/results.json`.

## How the Scraper Works

1. **Fetch** — Requests `https://guyana-lottery.com/lottery/results-archive`
2. **Parse** — BeautifulSoup extracts `<table>` elements, identifies each game by preceding `<h2>`/`<h3>` headings, and parses the numbers, dates, bonus, and letter values.
3. **Validate** — Each parsed result is validated against game-specific rules (number count, ranges, date format).
4. **Merge** — New results are merged into `data/results.json`, deduplicating by `(gameSlug, drawDate, drawTime)`.
5. **Write** — The full validated payload is written back atomically.

### Manual Entries

If you need to add results manually (e.g., if the scraper source is temporarily unavailable), add entries to `data/manual-entry.json`. The scraper merges manual entries alongside scraped ones so both sources coexist. Example:

```json
[
  {
    "gameSlug": "daily-millions",
    "drawDate": "2026-07-22",
    "drawTime": "7PM",
    "numbers": ["1", "8", "15", "18", "22"],
    "bonus": null,
    "letter": null
  }
]
```

## Automation (GitHub Actions)

The workflow at `.github/workflows/scrape.yml` runs on schedule:

- **01:00 UTC daily** — covers the 7PM draws
- **18:00 UTC daily** — covers the 1PM draws

It can also be triggered manually via `workflow_dispatch`. If new results are found, they are automatically committed and pushed.

## Domain Setup

1. Buy a domain (e.g. `guyanalottoresults.com`)
2. Point the DNS to your hosting provider (Railway, Vercel, Netlify, etc.)
3. Update `SITE_URL` in `lib/metadata.ts` and `public/sitemap.xml` to match
4. Rebuild and deploy

## Data Model

Results are stored as a flat JSON array in `data/results.json`:

```json
{
  "gameSlug": "lotto-supa-6",
  "drawDate": "2026-07-22",
  "drawTime": "7PM",
  "numbers": ["5", "6", "8", "9", "11", "24"],
  "bonus": "20",
  "letter": "G"
}
```

## SEO Features

- Per-page `<title>` and `<meta name="description">`
- JSON-LD structured data (WebSite, CollectionPage, BreadcrumbList)
- Static `sitemap.xml` with all game and history pages
- `robots.txt` allowing all crawlers with sitemap reference
- Semantic HTML (`<main>`, `<article>`, `<section>`, `<table>`)
- Mobile-first responsive design via Tailwind CSS

## Disclaimer

Not affiliated with the Guyana Lottery Company. For official results visit [guyana-lottery.com](https://guyana-lottery.com). Results are provided for informational purposes only.

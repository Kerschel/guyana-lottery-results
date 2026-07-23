#!/usr/bin/env python3
"""
Guyana Lottery Results Scraper
================================
Scrapes results from https://guyana-lottery.com/lottery/results-archive
and merges them into /data/results.json (plus /data/manual-entry.json).

Usage:
    python3 scraper/scrape.py
"""

import json
import os
import re
import sys
from datetime import datetime
from typing import Optional

import requests
from bs4 import BeautifulSoup

# ---------- Config ----------

SOURCE_URL = "https://guyana-lottery.com/lottery/results-archive"
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RESULTS_PATH = os.path.join(REPO_ROOT, "data", "results.json")
MANUAL_PATH = os.path.join(REPO_ROOT, "data", "manual-entry.json")

REQUEST_TIMEOUT = 30

# Maps the heading text on the source page to our game slug.
# We skip combined-game tables (Multi X Play 4, Lucky3 MultiX)
# because standalone tables for Play 4 and Multi X already cover them.
HEADING_TO_SLUG = {
    "Lotto Supa 6 Archive": "lotto-supa-6",
    "Daily Millions Archive": "daily-millions",
    "Lucky 3 Archive": "lucky-3",
    "Play 4 Archive": "play-4",
    "Pick 2": "pick-2",
    "Draw De Line": "draw-de-line",
    "Pay Day Archive": "pay-day",
    "Multi X": "multi-x",
}

# ---------- Logging ----------


def log(level: str, msg: str) -> None:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {level}: {msg}", flush=True)


# ---------- Date parsing ----------


def parse_date(raw: str) -> Optional[str]:
    """Parse 'Wednesday, July 22, 2026' → '2026-07-22'."""
    raw = raw.strip().rstrip(",")
    for fmt in ("%A %B %d %Y", "%A, %B %d %Y", "%B %d %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(raw, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None


# ---------- Number parsing ----------


def parse_numbers(raw: str, expected_count: Optional[int] = None) -> list[str]:
    """
    Parse a raw number cell into a list of strings.
    Handles:
      - "5       6       8       9       11       24" (multi-space)
      - "1, 7, 8, 9, 15" (comma)
      - "9\\n,\\n8" (newline comma for Pick 2)
      - "8    5    7" (space-separated digits)
      - "3861" (Play 4 — 4-digit string)
      - "5X", "FP", "2X" (Multiplier values)
    """
    raw = raw.strip()
    if not raw:
        return []

    # Multiplier values like "5X", "FP", "2X" — treat as single result
    if re.match(r"^[\d]+X$", raw, re.IGNORECASE) or raw.upper() == "FP":
        return [raw.upper()]

    # Pick 2 format: "9,8" or "9\n,\n8" → ["9", "8"]
    if re.match(r"^\d[\s\n]*,[\s\n]*\d$", raw):
        digits = re.findall(r"\d", raw)
        return digits

    # Comma-separated: "1, 7, 8, 9, 15"
    if "," in raw:
        parts = [p.strip() for p in raw.split(",") if p.strip()]
        return parts

    # Space-separated: "5       6       8       9       11       24"
    parts = raw.split()
    if len(parts) > 1:
        # Could be space-separated numbers or space-separated digits
        # Check if all are single digits — if so, might be Lucky 3 "8 5 7"
        if all(re.match(r"^\d$", p) for p in parts):
            return parts
        # Otherwise, numbers
        return parts

    # Single string: could be "3861" (Play 4 digits)
    if re.match(r"^\d+$", raw):
        if expected_count and len(raw) == expected_count:
            return list(raw)
        # Default: treat as one number
        return [raw]

    return [raw]


# ---------- Table-level parsing ----------


def parse_table(table, heading: str) -> list[dict]:
    """
    Parse a single <table> into a list of result dicts.
    Each dict: {gameSlug, drawDate, drawTime, numbers, bonus, letter}
    """
    slug = HEADING_TO_SLUG.get(heading)
    if not slug:
        log("INFO", f"Skipping table under heading '{heading}'")
        return []

    rows = table.find_all("tr")
    if len(rows) < 2:
        return []

    # Detect column layout from first row (header)
    header_cells = [th.get_text(strip=True).lower() for th in rows[0].find_all(["th", "td"])]
    results = []

    for row in rows[1:]:
        cells = row.find_all(["td", "th"])
        cell_texts = [c.get_text(" ", strip=True) for c in cells]

        if not cell_texts or len(cell_texts) < 2:
            continue

        # Skip rows that are just blank or contain only the game name
        non_empty = [t for t in cell_texts if t]
        if not non_empty:
            continue

        try:
            parsed = _parse_row(cell_texts, header_cells, slug)
            if parsed:
                results.extend(parsed)
        except Exception as e:
            log(
                "ERROR",
                f"Failed to parse row in '{heading}': {cell_texts[:60]}... — {e}",
            )

    return results


def _parse_row(
    cell_texts: list[str], header_cells: list[str], slug: str
) -> list[dict]:
    """Parse one table row, returning 1 or 2 result entries (afternoon + evening)."""
    # Clean: remove the first cell if it's a game-name label
    cleaned = cell_texts[:]
    # First cell is often the game name label — skip it when it contains game-like text
    if cleaned and re.match(
        r"(?i)(lotto|daily|lucky|pick|draw|pay|multi|play|super)",
        cleaned[0],
    ):
        cleaned = cleaned[1:]

    if not cleaned:
        return []

    # Determine column layout based on headers
    has_afternoon = any("afternoon" in h for h in header_cells)
    has_evening = any("evening" in h for h in header_cells)
    has_bonus = any("bonus" in h for h in header_cells)
    has_letter = any("letter" in h for h in header_cells)

    # For tables with afternoon/evening columns, date is typically the last column.
    # For single-column tables, date is the last column and numbers are first.

    entries: list[dict] = []

    if has_afternoon and has_evening:
        # Layout: numbers_afternoon, numbers_evening, date
        # Or for Multi X: afternoon_multiplier, evening_multiplier, date
        afternoon_val = cleaned[0] if len(cleaned) > 0 else ""
        evening_val = cleaned[1] if len(cleaned) > 1 else ""
        date_raw = cleaned[-1] if len(cleaned) > 2 else cleaned[-1]

        date_str = parse_date(date_raw)
        if not date_str:
            log("WARNING", f"Could not parse date: '{date_raw}'")
            return []

        # Afternoon entry (1PM)
        if afternoon_val and afternoon_val.strip():
            nums = parse_numbers(afternoon_val)
            if nums:
                entries.append(
                    {
                        "gameSlug": slug,
                        "drawDate": date_str,
                        "drawTime": "1PM",
                        "numbers": nums,
                        "bonus": None,
                        "letter": None,
                    }
                )

        # Evening entry (7PM)
        if evening_val and evening_val.strip():
            nums = parse_numbers(evening_val)
            if nums:
                entries.append(
                    {
                        "gameSlug": slug,
                        "drawDate": date_str,
                        "drawTime": "7PM",
                        "numbers": nums,
                        "bonus": None,
                        "letter": None,
                    }
                )

    elif has_bonus and has_letter:
        # Lotto Supa 6 layout: numbers, bonus, letter, date
        # After skipping the label cell, we have [numbers, bonus, letter, date]
        if len(cleaned) >= 4:
            numbers_raw, bonus_raw, letter_raw, date_raw = (
                cleaned[0],
                cleaned[1],
                cleaned[2],
                cleaned[3],
            )
        elif len(cleaned) >= 3:
            numbers_raw, bonus_raw, letter_raw = cleaned[0], cleaned[1], cleaned[2]
            date_raw = letter_raw  # fallback
        else:
            return []

        date_str = parse_date(date_raw)
        if not date_str:
            return []

        numbers = parse_numbers(numbers_raw)
        bonus = bonus_raw.strip() if bonus_raw.strip() else None
        letter = letter_raw.strip().upper() if letter_raw.strip() else None

        if numbers:
            entries.append(
                {
                    "gameSlug": slug,
                    "drawDate": date_str,
                    "drawTime": "7PM",
                    "numbers": numbers,
                    "bonus": bonus,
                    "letter": letter if letter and re.match(r"^[A-O]$", letter) else None,
                }
            )

    else:
        # Single column: numbers, date
        # After label skip: [numbers, date]
        if len(cleaned) >= 2:
            numbers_raw = cleaned[0]
            date_raw = cleaned[-1]
        else:
            return []

        date_str = parse_date(date_raw)
        if not date_str:
            return []

        numbers = parse_numbers(numbers_raw)

        if numbers:
            entries.append(
                {
                    "gameSlug": slug,
                    "drawDate": date_str,
                    "drawTime": "7PM",
                    "numbers": numbers,
                    "bonus": None,
                    "letter": None,
                }
            )

    return entries


# ---------- Validation ----------


GAME_VALIDATION = {
    "lotto-supa-6": {
        "min_numbers": 6,
        "max_numbers": 6,
        "min_num_val": 1,
        "max_num_val": 28,
        "has_bonus": True,
        "has_letter": True,
    },
    "daily-millions": {
        "min_numbers": 5,
        "max_numbers": 5,
        "min_num_val": 1,
        "max_num_val": 26,
    },
    "lucky-3": {
        "min_numbers": 3,
        "max_numbers": 3,
        "min_num_val": 0,
        "max_num_val": 9,
    },
    "pick-2": {
        "min_numbers": 2,
        "max_numbers": 2,
        "min_num_val": 0,
        "max_num_val": 9,
    },
    "draw-de-line": {
        "min_numbers": 7,
        "max_numbers": 7,
        "min_num_val": 1,
        "max_num_val": 26,
    },
    "pay-day": {
        "min_numbers": 5,
        "max_numbers": 5,
        "min_num_val": 1,
        "max_num_val": 26,
    },
    "multi-x": {"min_numbers": 1, "max_numbers": 1},  # single multiplier string
    "play-4": {
        "min_numbers": 4,
        "max_numbers": 4,
        "min_num_val": 0,
        "max_num_val": 9,
    },
}


def validate_result(entry: dict) -> bool:
    """Validate a parsed result entry against game rules."""
    slug = entry["gameSlug"]
    rules = GAME_VALIDATION.get(slug)
    if not rules:
        log("WARNING", f"No validation rules for game '{slug}'")
        return True

    # Check numbers count
    nums = entry["numbers"]
    if "min_numbers" in rules:
        if len(nums) < rules["min_numbers"] or len(nums) > rules["max_numbers"]:
            log(
                "WARNING",
                f"Invalid number count for {slug}: got {len(nums)}, expected {rules['min_numbers']}-{rules['max_numbers']}. Numbers: {nums}",
            )
            return False

    # Check number ranges (skip for multi-x which has string values like "5X", "FP")
    if slug != "multi-x" and "min_num_val" in rules:
        for n in nums:
            try:
                val = int(n)
                if val < rules["min_num_val"] or val > rules["max_num_val"]:
                    log(
                        "WARNING",
                        f"Number out of range for {slug}: {val} not in [{rules['min_num_val']}, {rules['max_num_val']}]",
                    )
                    return False
            except ValueError:
                log("WARNING", f"Non-numeric value in {slug}: '{n}'")
                return False

    # Check bonus number
    if rules.get("has_bonus") and entry.get("bonus"):
        try:
            b = int(entry["bonus"])
            if b < 1 or b > 28:
                log("WARNING", f"Bonus out of range: {b}")
                return False
        except ValueError:
            log("WARNING", f"Non-numeric bonus: {entry['bonus']}")
            return False

    # Check letter
    if rules.get("has_letter") and entry.get("letter"):
        if not re.match(r"^[A-O]$", entry["letter"]):
            log("WARNING", f"Invalid letter: {entry['letter']}")
            return False

    # Validate date format
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", entry["drawDate"]):
        log("WARNING", f"Invalid date format: {entry['drawDate']}")
        return False

    # Validate time
    if entry["drawTime"] not in ("1PM", "7PM"):
        log("WARNING", f"Invalid draw time: {entry['drawTime']}")
        return False

    return True


# ---------- Main ----------


def load_existing() -> list[dict]:
    """Load existing results from results.json and manual-entry.json."""
    existing = []

    for path, source in [(RESULTS_PATH, "results.json"), (MANUAL_PATH, "manual-entry.json")]:
        if os.path.exists(path):
            try:
                with open(path, "r") as f:
                    data = json.load(f)
                if isinstance(data, list):
                    for entry in data:
                        if isinstance(entry, dict) and "gameSlug" in entry:
                            existing.append(entry)
                    log("INFO", f"Loaded {len(data)} entries from {source}")
            except (json.JSONDecodeError, IOError) as e:
                log("ERROR", f"Failed to read {source}: {e}")

    return existing


def merge_results(existing: list[dict], new: list[dict]) -> tuple[list[dict], dict[str, int]]:
    """
    Merge new results into existing, deduplicating by (gameSlug, drawDate, drawTime).
    Returns (merged_list, counts_by_game).
    """
    # Build dedup key set
    seen = set()
    merged = []
    counts: dict[str, int] = {}

    # Process existing first
    for entry in existing:
        key = (entry["gameSlug"], entry["drawDate"], entry["drawTime"])
        if key not in seen:
            seen.add(key)
            merged.append(entry)

    # Process new entries
    for entry in new:
        key = (entry["gameSlug"], entry["drawDate"], entry["drawTime"])
        if key not in seen:
            seen.add(key)
            merged.append(entry)
            slug = entry["gameSlug"]
            counts[slug] = counts.get(slug, 0) + 1

    # Sort by date descending
    merged.sort(key=lambda e: (e["drawDate"], e["drawTime"]), reverse=True)

    return merged, counts


def main():
    log("INFO", "Scraping started")

    # 1. Fetch page
    try:
        resp = requests.get(SOURCE_URL, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        log("INFO", f"Fetched {SOURCE_URL} — {len(resp.text)} bytes")
    except requests.RequestException as e:
        log("ERROR", f"Failed to fetch source: {e}")
        sys.exit(1)

    # 2. Parse HTML
    soup = BeautifulSoup(resp.text, "lxml")

    # Find all tables and the preceding h2/h3 headings
    all_parsed: list[dict] = []
    tables = soup.find_all("table")

    if not tables:
        log("ERROR", "No tables found on page — HTML structure may have changed")
        sys.exit(1)

    log("INFO", f"Found {len(tables)} tables")

    # Find the heading that precedes each table to identify the game
    # Headings are h2/h3 tags; look for the nearest preceding heading
    for table in tables:
        # Search backwards for a heading
        heading_text = ""
        for sibling in table.find_all_previous(["h2", "h3"], limit=1):
            heading_text = sibling.get_text(strip=True)
            break

        # Also try parent's previous siblings
        if not heading_text:
            parent = table.find_parent()
            if parent:
                for sibling in parent.find_all_previous(["h2", "h3"], limit=1):
                    heading_text = sibling.get_text(strip=True)
                    break

        if heading_text in HEADING_TO_SLUG:
            parsed = parse_table(table, heading_text)
            valid = [p for p in parsed if validate_result(p)]
            if valid:
                log(
                    "INFO",
                    f"  {heading_text} → {HEADING_TO_SLUG[heading_text]}: {len(valid)} result(s)",
                )
                all_parsed.extend(valid)
            else:
                log("WARNING", f"  {heading_text}: parsed {len(parsed)} but 0 valid")
        elif heading_text:
            log("INFO", f"  Skipping heading '{heading_text}' (not in game list)")

    if not all_parsed:
        log("ERROR", "No valid results parsed — possible HTML structure change")
        sys.exit(1)

    log("INFO", f"Total parsed results: {len(all_parsed)}")

    # 3. Load existing + merge
    existing = load_existing()
    merged, new_counts = merge_results(existing, all_parsed)

    # 4. Log summary
    total_new = sum(new_counts.values())
    if total_new > 0:
        log("INFO", f"New results: {total_new}")
        for slug, count in sorted(new_counts.items()):
            log("INFO", f"  {slug}: {count} new")
    else:
        log("INFO", "No new results to add")

    # 5. Validate full payload
    for entry in merged:
        required = ["gameSlug", "drawDate", "drawTime", "numbers"]
        for key in required:
            if key not in entry:
                log("ERROR", f"Missing required key '{key}' in entry: {entry}")
                sys.exit(1)

    # 6. Write back
    try:
        with open(RESULTS_PATH, "w") as f:
            json.dump(merged, f, indent=2)
            f.write("\n")
        log("INFO", f"Wrote {len(merged)} entries to {RESULTS_PATH}")
    except IOError as e:
        log("ERROR", f"Failed to write results: {e}")
        sys.exit(1)

    log("INFO", "Scraping complete")


if __name__ == "__main__":
    main()

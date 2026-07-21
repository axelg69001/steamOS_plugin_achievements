# CriticDeck Documentation

CriticDeck brings **Steam user review scores directly into Steam Deck library pages** so you can evaluate games at a glance without leaving Gaming Mode.

**Latest update (v1.0.1):** Switched from Metacritic to the official Steam Reviews API for more reliable and accurate score retrieval — no more title matching issues.

![CriticDeck preview](https://images.steamusercontent.com/ugc/12628921612687895720/62D2DA8FF0F13E28B5B3A24B200BE3236D316D35/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false)

**Author:** bloodshine

## Overview

CriticDeck is a Decky Loader plugin that patches Steam library routes and overlays each game page with a Steam review score badge. It uses the official Steam Reviews API — no scraping, no title matching — just the `appid` that Decky already provides.

## Highlights

- Injects a review score badge into Steam Deck library app/detail pages.
- Displays **Recent Reviews** and **All Reviews** labels (e.g. "Very Positive", "Overwhelmingly Positive").
- Shows the **score percentage** and **total review count**.
- Opens the game's Steam review page directly from the badge.
- Uses the **official Steam Reviews API** — reliable and always up to date.
- 6-hour local cache to minimize API calls.

## Data Displayed

| Field | Example |
|---|---|
| Recent Reviews | Very Positive (2,615) |
| All Reviews | Overwhelmingly Positive (172,480) |
| Score | 94.40% |

## How It Works

1. **Route patching** — Frontend patches library app/detail routes and mounts the CriticDeck badge component.
2. **Score lookup** — Plugin backend calls `store.steampowered.com/appreviews/{appid}` using the game's Steam `appid` (no title matching needed).
3. **Result mapping** — Frontend maps the response into review labels, score percentage, and review counts.
4. **User action** — Tapping the badge opens the Steam review page for that game.

## Installation

1. Download the latest ZIP release from the repository releases page.
2. Transfer the ZIP file to your Steam Deck.
3. Open Decky settings on Steam Deck.
4. Go to **Developer**.
5. Select **Install Plugin from ZIP file**.

## Usage

1. Open a game page in Steam Deck Gaming Mode.
2. Open Decky and ensure CriticDeck is enabled.
3. Return to the game page to see the CriticDeck badge.
4. Tap the badge to open the full Steam reviews page.

## API Reference

The plugin exposes one backend method:

```python
get_steam_reviews(appid: int) -> Dict
```

Returns:

```json
{
  "found": true,
  "appid": 1234567,
  "all_reviews_label": "Overwhelmingly Positive",
  "all_reviews_positive": 172480,
  "all_reviews_total": 177600,
  "all_reviews_negative": 5120,
  "all_reviews_score_pct": 97.12,
  "recent_reviews_label": "Very Positive",
  "recent_reviews_positive": 2615,
  "recent_reviews_total": 3000,
  "store_url": "https://store.steampowered.com/app/1234567/#app_reviews_hash"
}
```

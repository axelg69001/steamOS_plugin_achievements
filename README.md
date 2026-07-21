# Steam Achievements

A [Decky Loader](https://decky.xyz/) plugin for Steam Deck that shows your achievement progress directly on the game's library page — no need to open the Steam overlay or scroll down to the achievements tab.

![Version](https://img.shields.io/badge/Version-1.2-informational)
![Decky Loader](https://img.shields.io/badge/Decky%20Loader-Plugin-blueviolet)
![Platform](https://img.shields.io/badge/Steam%20Deck-Game%20Mode-blue)

## Features

- Small badge overlaid on the library app page showing `X / Y` achievements unlocked and the completion percentage.
- Score color scales smoothly from red (0%) to green (100%) based on your completion percentage.
- Automatically hides itself:
  - on non-Steam games / shortcuts with no achievement data,
  - once you scroll down into the native Activity / Your Stuff / Community / Game Info section (Steam already shows its own achievement progress there).
- Adjustable badge position (top-left, top-right, top-center) and horizontal/vertical offset from the plugin's Quick Access Menu settings panel.
- Local caching (30 min) to avoid hammering the Steam Web API.

## How it works

The plugin patches the `/library/app/:appid` route to inject the badge, then calls the official [Steam Web API](https://steamcommunity.com/dev) (`ISteamUserStats/GetPlayerAchievements`) through a small Python backend to fetch your unlocked/total achievement counts for the currently displayed game.

## Requirements

Since achievement data is tied to your account, you need:

1. **A Steam Web API key** — generate one for free at [steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey) (any domain name works, e.g. `localhost`).
2. **Your SteamID64** — find it at [steamid.io](https://steamid.io) by pasting your profile URL, or check your Steam profile URL directly if it contains `/profiles/765611...`.
3. Your Steam profile's **game details / achievement showcase must be public** (Steam privacy settings), otherwise the API will return no data even with a valid key.

## Installation

1. Download the latest release ZIP (or clone this repo).
2. Transfer it to your Steam Deck.
3. Open the Decky Loader settings → **Developer** tab.
4. Select **Install Plugin from ZIP file** and pick the plugin ZIP.

## Configuration

1. Open the Quick Access Menu (`...` button) → **Steam Achievements**.
2. Enter your **Steam Web API key** and **SteamID64** in the settings panel.
3. Adjust the badge's position and offset to your liking.
4. Open any Steam game's library page — the badge should appear automatically.

## Project structure

```
.
├── main.py        # Python backend: calls the Steam Web API, manages settings
├── index.js        # Frontend: badge UI, route patching, settings panel
├── plugin.json     # Decky plugin manifest
└── package.json    # Node package metadata (build tooling)
```

## Known limitations

- Only works for native Steam games with achievements — non-Steam shortcuts (EmuDeck/ROMs) are not supported.
- Requires your own Steam Web API key and a public profile; there is no way around this due to how Steam's API works for player-specific achievement data.

## Credits

Built for personal use on Steam Deck. UI patching approach and Steam icon inspired by the open-source [Achievement Companion](https://github.com/CodeNode-Automation/achievement-companion) Decky plugin.

## License

GPL-2.0-or-later

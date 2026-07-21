import asyncio
import json
import ssl
import time
import urllib.request
from pathlib import Path
from typing import Any, Dict, Optional

import decky_plugin
from settings import SettingsManager


PLAYER_ACHIEVEMENTS_ENDPOINT = (
    "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/"
    "?key={key}&steamid={steamid}&appid={appid}&l=english"
)
USER_AGENT = "SteamDeckPlugin/1.0"
CACHE_TTL_SECONDS = 60 * 30  # 30 min

# Decky Loader's bundled Python doesn't ship a system CA bundle, so
# ssl.create_default_context() alone can fail with "unable to get local
# issuer certificate". Look for a real CA bundle on disk first, falling
# back to the `certifi` package if it happens to be installed.
_BACKEND_HTTP_CA_CANDIDATES = (
    Path("/etc/ssl/cert.pem"),
    Path("/etc/ssl/certs/ca-certificates.crt"),
    Path("/etc/ca-certificates/extracted/tls-ca-bundle.pem"),
)


def _select_ca_bundle():
    for candidate in _BACKEND_HTTP_CA_CANDIDATES:
        if candidate.exists():
            return str(candidate)
    try:
        import certifi
        candidate = Path(certifi.where())
        if candidate.exists():
            return str(candidate)
    except Exception:
        pass
    return None


def _build_ssl_context() -> ssl.SSLContext:
    ca_file = _select_ca_bundle()
    if ca_file is not None:
        try:
            return ssl.create_default_context(cafile=ca_file)
        except OSError:
            pass
    return ssl.create_default_context()


class SteamAchievementsClient:
    """
    Fallback client using the official Steam Web API.
    NOTE: GetPlayerAchievements requires a Steam Web API key + the user's
    SteamID64, even for a public profile (unlike the review endpoint, which
    is public). The frontend (index.js) tries the local Decky achievement
    cache first and only calls this backend if that fails.
    """

    def __init__(self) -> None:
        self._ssl_context = _build_ssl_context()
        self._cache: Dict[str, Dict[str, Any]] = {}

    def lookup(self, appid: int, api_key: str, steamid: str) -> Dict[str, Any]:
        key = f"{appid}:{steamid}"
        now = time.time()
        cached = self._cache.get(key)
        if cached and now - cached["timestamp"] < CACHE_TTL_SECONDS:
            return cached["data"]

        data = self._fetch_achievements(appid, api_key, steamid)
        if data.get("found"):
            self._cache[key] = {"timestamp": now, "data": data}
        return data

    def _fetch_achievements(self, appid: int, api_key: str, steamid: str) -> Dict[str, Any]:
        if not appid:
            return {"found": False, "error": "Missing appid"}
        if not api_key or not steamid:
            return {"found": False, "error": "Missing Steam API key or SteamID64 (set them in the plugin settings)"}

        url = PLAYER_ACHIEVEMENTS_ENDPOINT.format(key=api_key, steamid=steamid, appid=appid)
        try:
            payload = self._request_json(url)
        except Exception as err:
            return {"found": False, "error": f"Request failed: {err}"}

        stats = payload.get("playerstats", {})
        if not stats.get("success"):
            return {
                "found": False,
                "error": stats.get("error", "No stats available (private profile or game has no achievements)"),
            }

        achievements = stats.get("achievements", [])
        total = len(achievements)
        unlocked = sum(1 for a in achievements if a.get("achieved") == 1)
        pct = round((unlocked / total) * 100, 1) if total > 0 else None

        return {
            "found": True,
            "appid": appid,
            "game_name": stats.get("gameName", ""),
            "achievements_total": total,
            "achievements_unlocked": unlocked,
            "achievements_locked": total - unlocked,
            "achievements_pct": pct,
        }

    def _request_json(self, url: str) -> Dict[str, Any]:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, context=self._ssl_context, timeout=15) as res:
            payload = res.read()
            return json.loads(payload)


class Plugin:
    def __init__(self) -> None:
        self.settings: Optional[SettingsManager] = None
        self._steam_achievements = SteamAchievementsClient()

    async def _main(self) -> None:
        self.settings = SettingsManager(
            name="config", settings_directory=decky_plugin.DECKY_PLUGIN_SETTINGS_DIR
        )

    async def _unload(self) -> None:
        pass

    async def set_setting(self, key: str, value: Any) -> None:
        if not self.settings:
            return
        self.settings.setSetting(key, value)

    async def get_setting(self, key: str, default: Any = None) -> Any:
        if not self.settings:
            return default
        return self.settings.getSetting(key, default)

    async def get_achievements(self, appid: int) -> Dict[str, Any]:
        """
        Fallback lookup via the Steam Web API. Reads api_key / steamid64
        from settings (configurable from the plugin's settings panel).

        Returns:
            {
                found: bool,
                appid: int,
                game_name: str,
                achievements_total: int,
                achievements_unlocked: int,
                achievements_locked: int,
                achievements_pct: float,   e.g. 62.5
            }
        """
        if not self.settings:
            return {"found": False, "error": "Settings not initialized"}

        api_key = self.settings.getSetting("api_key", "")
        steamid = self.settings.getSetting("steamid64", "")

        loop = asyncio.get_running_loop()
        try:
            result = await loop.run_in_executor(
                None, self._steam_achievements.lookup, appid, api_key, steamid
            )
            return result
        except Exception as err:
            decky_plugin.logger.error(f"Steam achievements lookup failed: {err}")
            return {"found": False, "error": "Lookup failed"}
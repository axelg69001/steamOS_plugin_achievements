// Decky Loader will pass this api in, it's versioned to allow for backwards compatibility.
// @ts-ignore

const manifest = {"name":"steam-achievements"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const routerHook = api.routerHook;
const call = api.call;

// ─── Icons (from Achievement Companion reference plugin) ─────────────────────

function AchievementIcon(props) {
    const size = props.size || 22;
    return SP_REACT.createElement("svg", {
        "aria-hidden": "true", viewBox: "0 0 24 24", focusable: "false",
        style: { width: size, height: size, display: 'block', flexShrink: 0, ...(props.style || {}) }
    },
        SP_REACT.createElement("path", { d: "M5 2 Q4 9 6.5 13 Q8.5 17 12 18 Q15.5 17 17.5 13 Q20 9 19 2 Z", fill: "#e6b020" }),
        SP_REACT.createElement("path", { d: "M5 4 Q1 4 1 9 Q1 13 5 13", fill: "none", stroke: "#e6b020", "stroke-width": "2", "stroke-linecap": "round" }),
        SP_REACT.createElement("path", { d: "M19 4 Q23 4 23 9 Q23 13 19 13", fill: "none", stroke: "#e6b020", "stroke-width": "2", "stroke-linecap": "round" }),
        SP_REACT.createElement("rect", { x: "10.5", y: "18", width: "3", height: "3", rx: "0.5", fill: "#c49010" }),
        SP_REACT.createElement("path", { d: "M7 21 Q12 23 17 21 L16.5 23 Q12 24.5 7.5 23 Z", fill: "#e6b020" }),
        SP_REACT.createElement("circle", { cx: "12", cy: "9", r: "3.5", fill: "white", opacity: "0.12" }),
        SP_REACT.createElement("path", { d: "M12 5 L13 8 L16 8 L13.5 10 L14.5 13 L12 11 L9.5 13 L10.5 10 L8 8 L11 8 Z", fill: "white", opacity: "0.94" })
    );
}

// Official Steam icon PNG, embedded exactly as used by the reference plugin.
const STEAM_ICON_DATA_URI = 'data:image/png;base64,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';

function SteamIconImg(props) {
    const size = props.size || 20;
    return SP_REACT.createElement("img", {
        src: STEAM_ICON_DATA_URI,
        alt: "Steam",
        width: size,
        height: size,
        style: { display: 'inline-block', ...(props.style || {}) }
    });
}

// ─── Settings ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'steam-achievements.settings';
const POSITION_OPTIONS = [
    { value: 'top-right', label: 'Top right' },
    { value: 'top-left', label: 'Top left' },
    { value: 'top-center', label: 'Top center' }
];
const defaultSettings = {
    position: 'top-right',
    horizontalOffset: 0,
    verticalOffset: 56
};
const readSettings = () => {
    if (typeof localStorage === 'undefined') return defaultSettings;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return defaultSettings;
        return { ...defaultSettings, ...JSON.parse(raw) };
    } catch (_error) {
        return defaultSettings;
    }
};

let _globalSettings = readSettings();
const _listeners = new Set();
const _notifyListeners = () => { _listeners.forEach(fn => fn(_globalSettings)); };
const _setGlobal = (partial) => {
    _globalSettings = { ..._globalSettings, ...partial };
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_globalSettings));
    }
    _notifyListeners();
};

const useSettings = () => {
    const [settings, setSettings] = SP_REACT.useState(_globalSettings);
    SP_REACT.useEffect(() => {
        const handler = (s) => setSettings({ ...s });
        _listeners.add(handler);
        setSettings({ ..._globalSettings });
        return () => { _listeners.delete(handler); };
    }, []);
    const setPartialSetting = SP_REACT.useCallback((partial) => { _setGlobal(partial); }, []);
    return { settings, setSetting: setPartialSetting };
};

// ─── Backend settings (API key / SteamID64 for fallback) ─────────────────────

const safeCall = async (...args) => {
    if (typeof call !== 'function') {
        console.warn('[steam-achievements] api.call is not available in this @decky/api version — backend fallback disabled.');
        return undefined;
    }
    try {
        return await call(...args);
    } catch (err) {
        console.error(`[steam-achievements] call(${JSON.stringify(args[0])}) failed:`, err);
        return undefined;
    }
};

const useBackendCreds = () => {
    const [apiKey, setApiKeyState] = SP_REACT.useState('');
    const [steamId, setSteamIdState] = SP_REACT.useState('');
    SP_REACT.useEffect(() => {
        safeCall('get_setting', 'api_key', '').then(val => val && setApiKeyState(val));
        safeCall('get_setting', 'steamid64', '').then(val => val && setSteamIdState(val));
    }, []);
    const setApiKey = (val) => { setApiKeyState(val); safeCall('set_setting', 'api_key', val); };
    const setSteamId = (val) => { setSteamIdState(val); safeCall('set_setting', 'steamid64', val); };
    return { apiKey, setApiKey, steamId, setSteamId };
};

// ─── Settings Panel ───────────────────────────────────────────────────────────

const SettingsPanel = () => {
    const { settings, setSetting } = useSettings();
    const { apiKey, setApiKey, steamId, setSteamId } = useBackendCreds();
    const posIdx = POSITION_OPTIONS.findIndex(o => o.value === settings.position);
    return (SP_REACT.createElement(DFL.PanelSection, { title: "Steam Achievements" },
        SP_REACT.createElement(DFL.PanelSectionRow, null,
            SP_REACT.createElement(DFL.Field, { label: "Card position" },
                SP_REACT.createElement(DFL.ButtonItem, {
                    layout: "below",
                    onClick: () => {
                        const next = POSITION_OPTIONS[(posIdx + 1) % POSITION_OPTIONS.length];
                        setSetting({ position: next.value });
                    }
                }, POSITION_OPTIONS[posIdx]?.label ?? settings.position))),
        SP_REACT.createElement(DFL.PanelSectionRow, null,
            SP_REACT.createElement(DFL.SliderField, {
                label: "Horizontal offset (- left / + right)", value: settings.horizontalOffset,
                min: -300, max: 300, step: 4,
                onChange: (val) => setSetting({ horizontalOffset: val })
            })),
        SP_REACT.createElement(DFL.PanelSectionRow, null,
            SP_REACT.createElement(DFL.SliderField, {
                label: "Vertical offset", value: settings.verticalOffset,
                min: 0, max: 900, step: 8,
                onChange: (val) => setSetting({ verticalOffset: val })
            })),
        SP_REACT.createElement(DFL.PanelSectionRow, null,
            SP_REACT.createElement(DFL.TextField, {
                label: "Steam Web API key (fallback only)",
                description: "Only needed if local achievement data isn't available. Get one at steamcommunity.com/dev/apikey",
                value: apiKey,
                onChange: (e) => setApiKey(e.target.value)
            })),
        SP_REACT.createElement(DFL.PanelSectionRow, null,
            SP_REACT.createElement(DFL.TextField, {
                label: "Your SteamID64",
                value: steamId,
                onChange: (e) => setSteamId(e.target.value)
            }))
    ));
};

// ─── Route params ──────────────────────────────────────────────────────────────

const useParams = Object.values(DFL.ReactRouter).find((val) => /return (\w)\?\1\.params:{}/.test(`${val}`));

// ─── Achievements: local Decky cache first, backend fallback ─────────────────

const CACHE_KEY = 'steam-achievements.cache.v3';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

const getCached = (key) => {
    if (typeof localStorage === 'undefined') return undefined;
    try {
        const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const entry = parsed[key];
        if (!entry) return undefined;
        if (Date.now() - entry.timestamp > CACHE_TTL_MS) return undefined;
        return entry.payload;
    } catch (_err) {
        return undefined;
    }
};
const setCached = (key, payload) => {
    if (typeof localStorage === 'undefined') return;
    try {
        const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        parsed[key] = { timestamp: Date.now(), payload };
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    } catch (_err) { /* ignore */ }
};

const queryAchievements = async (appid) => {
    // The reference plugin (Achievement Companion) doesn't rely on any client-side
    // Decky achievement cache — it always resolves through its backend / the Steam
    // Web API. We do the same here: always call the Python backend directly.
    const result = await safeCall('get_achievements', appid);
    console.log(`[steam-achievements] backend result for appid ${appid}:`, result);
    if (!result) return { found: false, error: 'No response from backend' };
    return { ...result, source: 'api' };
};

const useAchievements = (appid) => {
    const [data, setData] = SP_REACT.useState(() => getCached(String(appid)) || undefined);
    const [loading, setLoading] = SP_REACT.useState(() => !getCached(String(appid)));
    const [error, setError] = SP_REACT.useState();

    const refresh = SP_REACT.useCallback(async () => {
        if (!appid) return;
        setLoading(true);
        setError(undefined);
        try {
            const result = await queryAchievements(appid);
            if (result.found) setCached(String(appid), result);
            setData(result);
            if (result.error) setError(result.error);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unexpected error');
        } finally {
            setLoading(false);
        }
    }, [appid]);

    SP_REACT.useEffect(() => {
        refresh();
    }, [appid, refresh]);

    return { data, loading, error, refresh };
};

// ─── Tone helpers ─────────────────────────────────────────────────────────────

// Continuous red -> green gradient based on percentage (0% = red, 100% = green)
const colorForPct = (pct) => {
    if (typeof pct !== 'number') return '#fff';
    const clamped = Math.max(0, Math.min(100, pct));
    const hue = (clamped / 100) * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 75%, 55%)`;
};

// ─── CSS ──────────────────────────────────────────────────────────────────────

const achievementsStyle = (SP_REACT.createElement("style", null, `
    .achdeck-badge-root {
      position: absolute;
      z-index: 2;
      --achdeck-offset-x: 24px;
      --achdeck-offset-y: 56px;
    }
    .achdeck-badge-root[data-position='top-right'] { top: var(--achdeck-offset-y); right: var(--achdeck-offset-x); }
    .achdeck-badge-root[data-position='top-left'] { top: var(--achdeck-offset-y); left: var(--achdeck-offset-x); }
    .achdeck-badge-root[data-position='top-center'] { top: var(--achdeck-offset-y); left: 50%; transform: translateX(calc(-50% + var(--achdeck-offset-x))); }

    .achdeck-card {
      min-width: 150px;
      min-height: 36px;
      width: fit-content;
      background: rgba(10, 10, 10, 0.5);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 10px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
      color: #f5f5f5;
      font-family: var(--font-family, "Motiva Sans");
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
      backdrop-filter: blur(6px);
    }
    .achdeck-scores { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%; }
    .achdeck-row { display: flex; align-items: center; justify-content: center; gap: 5px; white-space: nowrap; width: 100%; }
    .achdeck-brand-row { padding-bottom: 2px; gap: 8px; align-items: center; }
    .achdeck-label { font-size: 11px; line-height: 1; font-weight: 700; letter-spacing: 0.06em; color: rgba(255,255,255,0.50); text-transform: uppercase; flex-shrink: 0; display: inline-flex; align-items: center; }
    .achdeck-value { font-size: 14px; line-height: 1; font-weight: 600; color: #fff; display: inline-flex; align-items: center; }
    .achdeck-pct { font-size: 13px; line-height: 1; color: rgba(255,255,255,0.45); display: inline-flex; align-items: center; }
    .achdeck-divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); margin: 2px 0; }
`));

// ─── Badge Component ──────────────────────────────────────────────────────────

// Detects the native "Activity / Your Stuff / Community / Game Info" tabbed
// sub-page (reached from the app details page). It isn't a route change we
// The Activity/Your Stuff/Community/Game Info section isn't a separate page —
// it's further down the same scrollable app-details page. We hide the badge
// once the user has scrolled down past the hero area, and bring it back at
// the top.
const useScrolledDown = (rootRef) => {
    const [scrolled, setScrolled] = SP_REACT.useState(false);
    SP_REACT.useEffect(() => {
        const findScrollableAncestor = (el) => {
            let node = el?.parentElement;
            while (node && node !== document.body && node !== document.documentElement) {
                try {
                    const style = window.getComputedStyle(node);
                    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 4) {
                        return node;
                    }
                } catch (_err) { /* ignore */ }
                node = node.parentElement;
            }
            return null;
        };

        let target = null;

        const getScrollTop = () => {
            const winTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const targetTop = target ? target.scrollTop : 0;
            return Math.max(winTop, targetTop);
        };

        const onScroll = () => {
            const top = getScrollTop();
            console.log('[steam-achievements] scrollTop:', top);
            setScrolled(top > 40);
        };

        target = rootRef.current ? findScrollableAncestor(rootRef.current) : null;
        window.addEventListener('scroll', onScroll, { passive: true });
        document.addEventListener('scroll', onScroll, { passive: true, capture: true });
        if (target) target.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return () => {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('scroll', onScroll, { capture: true });
            if (target) target.removeEventListener('scroll', onScroll);
        };
    }, [rootRef]);
    return scrolled;
};

const AchievementsBadge = () => {
    const { appid } = useParams();
    const numericAppid = appid ? parseInt(appid, 10) : undefined;
    console.log('[steam-achievements] AchievementsBadge appid from route:', appid, '-> numeric:', numericAppid);
    const { data, loading, error } = useAchievements(Number.isNaN(numericAppid) ? undefined : numericAppid);
    const { settings } = useSettings();
    const { position, horizontalOffset, verticalOffset } = settings;
    const rootRef = SP_REACT.useRef(null);
    const scrolledDown = useScrolledDown(rootRef);

    const scoreColor = SP_REACT.useMemo(() => colorForPct(data?.achievements_pct), [data?.achievements_pct]);

    if (!numericAppid) return SP_REACT.createElement(SP_REACT.Fragment, null);

    // Hide once the user has scrolled down into the Activity/Your Stuff/etc. section.
    if (scrolledDown) return SP_REACT.createElement(SP_REACT.Fragment, null);

    // No data at all (typically a non-Steam game/shortcut) once we're done
    // trying — render nothing rather than an empty-looking badge.
    if (!loading && !data?.found) return SP_REACT.createElement(SP_REACT.Fragment, null);

    const renderScores = () => {
        if (loading && !data) return SP_REACT.createElement("div", { className: "achdeck-scores" },
            SP_REACT.createElement("div", { className: "achdeck-row" },
                SP_REACT.createElement("span", { className: "achdeck-label" }, "Loading\u2026")));

        return SP_REACT.createElement("div", { className: "achdeck-scores" },
            SP_REACT.createElement("div", { className: "achdeck-row" },
                SP_REACT.createElement(AchievementIcon, { size: 15 }),
                SP_REACT.createElement("span", { className: "achdeck-label" }, "ACHIEVEMENTS:"),
                SP_REACT.createElement("span", { className: "achdeck-value", style: { color: scoreColor } },
                    `${data.achievements_unlocked} / ${data.achievements_total}`),
                data.achievements_pct != null ? SP_REACT.createElement("span", { className: "achdeck-pct" }, `(${data.achievements_pct}%)`) : null
            )
        );
    };

    return (SP_REACT.createElement("div", {
        ref: rootRef,
        id: "steam-achievements-badge-container",
        className: "achdeck-badge-root",
        "data-position": position,
        style: {
            '--achdeck-offset-x': `${horizontalOffset || 0}px`,
            '--achdeck-offset-y': `${verticalOffset || 0}px`
        }
    },
        achievementsStyle,
        SP_REACT.createElement("div", { className: "achdeck-card" },
            renderScores())));
};

// ─── Error boundary ────────────────────────────────────────────────────────────
// Isolates any crash inside the badge so it can never take down the whole
// library page (this is what causes the "Shared SteamUI_..." black screen).

class AchievementsErrorBoundary extends SP_REACT.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(err) {
        console.error('[steam-achievements] badge crashed, disabling for this session:', err);
    }
    render() {
        if (this.state.hasError) return null;
        return this.props.children;
    }
}

// ─── Route Patch ─────────────────────────────────────────────────────────────

function patchLibraryApp() {
    return routerHook.addPatch('/library/app/:appid', (tree) => {
        let routeProps;
        try {
            routeProps = DFL.findInReactTree(tree, (x) => x?.renderFunc);
        } catch (err) {
            console.error('[steam-achievements] findInReactTree(routeProps) failed:', err);
            return tree;
        }
        if (!routeProps) {
            console.warn('[steam-achievements] routeProps (renderFunc) not found — route shape may have changed.');
            return tree;
        }

        const patchHandler = DFL.createReactTreePatcher([
            (root) => {
                try {
                    const found = DFL.findInReactTree(root, (node) => node?.props?.children?.props?.overview)?.props?.children;
                    if (!found) console.warn('[steam-achievements] "overview" node not found in tree.');
                    return found;
                } catch (err) {
                    console.error('[steam-achievements] node lookup failed:', err);
                    return undefined;
                }
            }
        ], (_nodes, ret) => {
            try {
                const container = DFL.findInReactTree(ret, (element) =>
                    Array.isArray(element?.props?.children) &&
                    typeof element?.props?.className === 'string' &&
                    element.props.className.includes(DFL.appDetailsClasses?.InnerContainer ?? '\u0000__never__')
                );
                if (!container) {
                    console.warn('[steam-achievements] InnerContainer not found — DFL.appDetailsClasses.InnerContainer =', DFL.appDetailsClasses?.InnerContainer);
                    return ret;
                }

                const hasBadge = container.props.children.some(
                    (child) => child?.props?.id === 'steam-achievements-badge-container'
                );
                if (!hasBadge) {
                    const nextChildren = container.props.children.slice();
                    nextChildren.splice(1, 0,
                        SP_REACT.createElement(AchievementsErrorBoundary, { key: "steam-achievements" },
                            SP_REACT.createElement(AchievementsBadge, null))
                    );
                    container.props.children = nextChildren;
                    console.log('[steam-achievements] badge inserted into InnerContainer.');
                }
                return ret;
            } catch (err) {
                console.error('[steam-achievements] patch render failed, skipping badge:', err);
                return ret;
            }
        });

        DFL.afterPatch(routeProps, 'renderFunc', patchHandler);
        return tree;
    });
}

// ─── Plugin Entry ─────────────────────────────────────────────────────────────

var index = DFL.definePlugin(() => {
    const libraryPatch = patchLibraryApp();
    return {
        title: SP_REACT.createElement("div", { className: DFL.staticClasses.Title }, "Steam Achievements"),
        icon: SP_REACT.createElement(AchievementIcon, null),
        content: SP_REACT.createElement(AchievementsErrorBoundary, null, SP_REACT.createElement(SettingsPanel, null)),
        onDismount() {
            routerHook.removePatch('/library/app/:appid', libraryPatch);
        }
    };
});

export { index as default };
# SpotiKit API & Spicetify Migration Reference

## 1. Spicetify to SpotiKit API Mapping

| Spicetify API / Pattern | SpotiKit Equivalent | Notes |
| :--- | :--- | :--- |
| `while (!Spicetify?.Platform) await sleep(100)` | `export default async function start(ctx)` | SpotiKit waits for `SpotiKit.ready` before invoking `start(ctx)`. |
| `Spicetify.Player` | `SpotiKit.Player` | Playback state, controls, and events (`Player.on("track", cb)`). |
| `Spicetify.Platform.*` | `SpotiKit.Platform.*` or `Platform.get(name)` | Direct access to Spotify's ~100 internal services. |
| `Spicetify.CosmosAsync.get/post/put/del/sub` | `SpotiKit.Http.get/post/put/patch/delete/subscribe` | Routes `sp://`, `wg://`, `hm://` via Cosmos; attaches auth tokens to `spclient` and `api.spotify.com`. |
| `Spicetify.GraphQL` | `SpotiKit.GraphQL` | Native GraphQL query client (`SpotiKit.GraphQL.query(...)`). |
| `Spicetify.showNotification(msg, isError)` | `SpotiKit.notify(msg, options?)` | Displays a snackbar message in Spotify. |
| `Spicetify.LocalStorage` | `SpotiKit.Storage.scope("extension-id")` | Scoped persistent key-value store (`.get(key, default)`, `.set(key, val)`). |
| `Spicetify.URI` | `SpotiKit.URI` | URI parsing, type checking (`URI.is(uri, ["track"])`), and URL conversion (`URI.toUrl`). |
| `Spicetify.ContextMenu.Item` | `SpotiKit.ContextMenu.add({ label, icon, when, onSelect })` | Automatically removed when the extension stops. |
| `Spicetify.Menu.Item` | `SpotiKit.ProfileMenu.add(...)` | Adds items to the user profile dropdown menu. |
| `Spicetify.Playbar.Button` / `Widget` | `SpotiKit.Playbar.add(...)` / `Playbar.addWidget(...)` | Returns a handle with `.active` and `.remove()`. |
| `Spicetify.Topbar.Button` | `SpotiKit.Topbar.add(...)` | Adds a button to the global top navigation bar. |
| `Spicetify.PopupModal` | `SpotiKit.Dialog.open(...)` | Opens a modal dialog with Spotify React contexts attached. |
| `Spicetify.Keyboard` / `Mousetrap` | `SpotiKit.Keyboard.add(...)` | Registers keyboard shortcuts; auto-cleaned on stop. |
| `document.createElement("style")` | `ctx.style(cssString)` | Appended after Spotify's stylesheets and auto-removed on stop. |
| `Spicetify.React` / `ReactDOM` | `SpotiKit.React` / `SpotiKit.ReactDOM` | Spotify's internal React instance; `createRoot` inherits Spotify contexts. |

## 2. Extension Context (`SpotiKit.ExtensionContext`)

Passed to `export default function start(ctx)`:

- `ctx.id` (`string`): The extension's identifier inside SpotiKit.
- `ctx.signal` (`AbortSignal`): Aborted when the extension stops. Pass directly to `addEventListener(..., { signal })` or `fetch(url, { signal })`.
- `ctx.onStop(fn)` (`(fn: () => void) => void`): Registers a teardown callback executed in LIFO order when the extension stops.
- `ctx.style(css)` (`(css: string) => HTMLStyleElement`): Injects a stylesheet after Spotify's own styles and removes it on stop.
- `ctx.url(path)` (`(path: string) => string`): Resolves a relative path to a bundled asset (images, fonts) next to the script.
- `ctx.use(id)` (`(id: string) => any`): Returns the exports of a dependency listed under `"dependencies"` in `spotikit.json`.

## 3. Common `SpotiKit.Platform` Internal Services

Available after `SpotiKit.ready` resolves:

- `Platform.PlayerAPI`: Playback state and queue operations.
- `Platform.PlaybackAPI`: Volume and audio output control.
- `Platform.LibraryAPI`: Library operations (`add`, `remove`, `contains`).
- `Platform.PlaylistAPI` & `Platform.RootlistAPI`: Playlist and folder management.
- `Platform.ConnectAPI`: Spotify Connect device management.
- `Platform.ClipboardAPI`: `copy(text)` clipboard helper.
- `Platform.History`: Main view navigation history.
- `Platform.Cosmos`: Internal `sp://` request transport.
- `Platform.GraphQLLoader`: Internal GraphQL loader.
- `Platform.AuthorizationAPI`: Access token provider.
- `Platform.ProductStateAPI`: Account product state and feature flags (`ads`, `catalogue`, `product`).
- `Platform.AdManagers`: Internal ad controllers (`audio`, `billboard`, `inStreamApi`, `vto`, `leaderboard`).
- `Platform.get(name)`: Lookup any internal Spotify service by its registration name (for example `SpotiKit.Platform.get("PlaybackFiltersAPI")`).

## 4. SpotiKit Semantic CSS Class Map

| UI Element | Semantic Class Name |
| :--- | :--- |
| Main view container | `.main-view-panel` |
| Left library sidebar | `.left-sidebar-panel` |
| Right sidebar | `.right-sidebar` |
| Action bar row (Play, Shuffle, Follow) | `.action-bar-row` |
| Track list row | `.track-list-row` |
| Bottom playback bar | `.now-playing-bar` |
| Track info & Like widget in playbar | `.now-playing-widget-v2` (`.now-playing-widget` on 1.3.5) |
| Top bar right action buttons | `.global-nav-bar-actions` |
| Home page shortcut cards | `.home-shortcut` |

## 5. CLI Commands (`spotikit-kit`)

- `npm create spotikit <name> -- --type extension --ts`: Scaffold a new TypeScript extension project.
- `npx spotikit-kit build`: Bundle `source` (`src/extension.ts`) into `main` (`dist/extension.js`).
- `npx spotikit-kit check`: Validate `spotikit.json`, file paths, TypeScript types, syntax, and check for forbidden hashed Spotify class names.
- `npx spotikit-kit dev --launch`: Launch Spotify with Live Preview and hot-reload on every file save.
- `npx spotikit-kit pack`: Package a release `.zip` archive and print its SHA-256 checksum.

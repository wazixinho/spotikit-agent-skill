---
name: spotikit-extension-dev
description: Build, port, and validate SpotiKit extensions, themes, custom apps, and CSS snippets for Spotify on Windows. Use when the user asks to create a SpotiKit extension, migrate a Spicetify extension or theme to SpotiKit, configure spotikit.json, use spotikit-kit CLI commands, map Spicetify APIs to SpotiKit APIs, or debug SpotiKit runtime hooks and class names.
---

# SpotiKit Extension Dev

Build native SpotiKit extensions and migrate legacy Spotify modloader scripts (such as Spicetify extensions) into clean, hot-reloadable SpotiKit TypeScript or JavaScript packages.

## When to Use

- Creating a new SpotiKit extension, theme, custom app, or CSS snippet from scratch
- Porting or migrating a Spicetify extension (`Spicetify.*`) to SpotiKit (`SpotiKit.*`)
- Writing or validating a `spotikit.json` manifest
- Fixing `npx spotikit-kit build` or `npx spotikit-kit check` errors and warnings
- Mapping obfuscated Spotify class names to SpotiKit semantic class names

## Steps

### Step 1: Inspect the Workspace and Type Definitions

Before writing or modifying code, inspect the project files in the workspace:

1. Read `spotikit.d.ts` first. Treat `spotikit.d.ts` as the single source of truth for all `SpotiKit.*` namespaces, method signatures, event names, and lifecycle types.
2. Read `spotikit.json`, `package.json`, and `tsconfig.json` (or `jsconfig.json`) to confirm whether the project uses TypeScript (`"source": "src/extension.ts"`, `"main": "dist/extension.js"`) or plain JavaScript (`"main": "extension.js"`).
3. If migrating an existing script (for example from `_reference/` or a pasted Spicetify file), catalog every `Spicetify.*` call, timer, DOM listener, observer, and injected stylesheet before translating.
4. Read `references/api-and-migration.md` for the full Spicetify-to-SpotiKit mapping table, internal `SpotiKit.Platform` services list, and semantic CSS class map.

### Step 2: Configure `spotikit.json`

Ensure `spotikit.json` at the project root satisfies all SpotiKit manifest rules:

1. Set `"type"` to match the target folder (`"extension"`, `"theme"`, `"app"`, or `"snippet"`).
2. Provide a non-empty `"name"` and a one-sentence `"description"`.
3. Set `"spotify"` to a closed version or range (for example `"1.3.5 - 1.3.8"` or `"1.3.8"`). Never use open-ended ranges like `>=1.3.5`.
4. For TypeScript projects, include both `"source": "src/extension.ts"` and `"main": "dist/extension.js"`. SpotiKit and the Marketplace only load `"main"`.
5. Declare any required extension libraries under `"dependencies"` and consume them via `ctx.use("owner/repo")`.

### Step 3: Implement the Extension Lifecycle (`start` and Teardown)

Write the extension as an ES module exporting a default `start` function so SpotiKit can toggle, update, and hot-reload it without restarting Spotify:

```ts
export default async function start(ctx: SpotiKit.ExtensionContext) {
  const { onStop, signal, style } = ctx;

  // 1. Inject styles via ctx.style (auto-removed on stop)
  style(`
    .main-view-panel [data-testid="upgrade-button"] {
      display: none !important;
    }
  `);

  // 2. Register SpotiKit listeners/UI (auto-removed on stop)
  SpotiKit.Player.on("track", (state) => {
    if (!state?.item) return;
  });

  // 3. Clean up timers, observers, DOM listeners, and monkey-patches
  const timer = window.setInterval(() => {}, 5000);
  onStop(() => window.clearInterval(timer));

  window.addEventListener("resize", () => {}, { signal });
}
```

Follow these core rules during implementation:

- **No polling loops for readiness:** Remove `while (!Spicetify?.Platform)` loops. SpotiKit calls `start(ctx)` after `SpotiKit.ready` resolves. (Only use `await SpotiKit.ready` in raw DevTools console snippets).
- **Mandatory manual teardown:** SpotiKit automatically cleans up items registered through `SpotiKit.*` (`ContextMenu`, `ProfileMenu`, `Topbar`, `Playbar`, `Panels`, `Dialog`, `Apps`, `Keyboard`, `*.on()`, `Http.subscribe`, and `ctx.style()`). You must clean up all `setInterval`, `setTimeout`, `MutationObserver`, `window`/`document` listeners (`{ signal: ctx.signal }`), and monkey-patched `Platform` methods inside `ctx.onStop(() => ...)`.
- **Defensive `Platform` access:** Wrap calls to `SpotiKit.Platform.*` or `SpotiKit.Platform.get("ServiceName")` in optional chaining (`?.`) or `try/catch` blocks because internal Spotify services can change across builds.
- **Semantic CSS selectors only:** Never use generated Spotify class hashes (such as `.Ix6_BK8pqqB_TtYr8HgO`). Use SpotiKit's semantic classes (`.main-view-panel`, `.left-sidebar-panel`, `.right-sidebar`, `.action-bar-row`, `.track-list-row`, `.now-playing-bar`, `.now-playing-widget-v2`, `.global-nav-bar-actions`, `.home-shortcut`) or `[data-testid="..."]`.
- **Keep React external and respect Web API limits:** Use `SpotiKit.React` and `SpotiKit.ReactDOM` rather than bundling a separate React copy. Avoid frequent `api.spotify.com` REST requests (which trigger `429` rate limits); prefer `SpotiKit.GraphQL`, `SpotiKit.Player`, `SpotiKit.Queue`, and `SpotiKit.Platform`.

### Step 4: Build and Verify

Run the verification pipeline inside the project directory before finishing:

1. Ensure dependencies are installed with `npm install`. If `esbuild` postinstall scripts were blocked on Windows, run:

```powershell
npm install-scripts approve esbuild
npm rebuild esbuild
```

2. Build the TypeScript bundle into `dist/`:

```bash
npx spotikit-kit build
```

3. Validate manifest rules, TypeScript types, syntax, and CSS selectors:

```bash
npx spotikit-kit check
```

4. Confirm `dist/extension.js` exists and `npx spotikit-kit check` exits with `0 error(s)`. Remove any temporary `_reference/` migration files before concluding.

## Gotchas

- **Forgetting `export default function start`:** A script without a default export runs once at startup like legacy Spicetify scripts, cannot be hot-reloaded in Live Preview, and forces a full Spotify restart when toggled off.
- **Stacking timers in Live Preview:** Every file save in Live Preview re-runs `start()`. Any `setInterval`, `MutationObserver`, or monkey-patch not undone in `ctx.onStop()` will duplicate on every save.
- **Committing only `src/` to Git:** The SpotiKit Marketplace loads the file named in `"main"` (`dist/extension.js`) directly from the repository. Always keep `dist/` built and tracked in Git.
- **Hashed CSS selectors failing `check`:** `npx spotikit-kit check` scans code and styles for obfuscated Spotify class hashes and flags them. Replace them with SpotiKit semantic class names or `data-testid` selectors.

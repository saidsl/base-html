## Repo Overview

- **What this is:** a minimal, classless HTML template project using Vite + Vue (via CDN). The source root is `src/` and the dev server serves files from there.
- **Primary files:** [package.json](package.json), [vite.config.js](vite.config.js), [src/index.html](src/index.html), [src/js/main.js](src/js/main.js).

## Architecture & Data Flow (big picture)

- Dev server root: `src/` (see `vite.config.js`). Build output is `dist/` (root-level `dist`).
- Vue is included from CDN in `src/index.html` and used as a global `Vue` object inside `src/js/main.js` (no SFCs or build-time Vue compilation).
- Partials: `src/partials/*.html` are imported at runtime via `import.meta.glob(..., { query: '?raw' })` in `src/js/main.js` and registered as components named `site-<filename>` (e.g., `src/partials/header.html` → `<site-header>`).
- Data: JSON datasets live in `src/data/*.json` and are fetched at runtime with `new URL('../data/<name>.json', import.meta.url)` and injected into a shared reactive state provided to partial components.

Key flow: dev server serves `src/index.html` → `main.js` registers partials and mounts Vue app → `onMounted` fetches `nav`, `aside`, `footer` JSON → partials read those arrays via inject/proxy.

## Development workflow & commands

- Start dev server: `npm start` (runs `vite`). Dev server defaults to port `4080` per `vite.config.js`.
- Build production bundle: `npm run build` (runs `vite build`). Output goes to `dist/`.
- Note: `npm test` is an alias to the build script in `package.json`.

## Project-specific conventions (important for code authors / agents)

- Partials as components:
  - Add a partial as `src/partials/<name>.html` (must export a single template root element). Component tag becomes `<site-<name>>`.
  - If the partial needs local props, accept a `state` prop (convention used in `main.js`) and merge with the injected global state.
  - Example: `src/partials/header.html` uses `nav` from the injected state: see [src/partials/header.html](src/partials/header.html).

- Data shape & naming:
  - Add JSON files as `src/data/<key>.json`. The app loads `nav`, `aside`, and `footer` by name. The loaded dataset is assigned to `state[<key>]`.
  - Example: [src/data/nav.json](src/data/nav.json) shows expected array-of-items with `id`, `title`, `href`.

- Asset & path rules:
  - Because Vite `root` is `src/`, reference static files relative to `src/` (e.g., `./css/core-classless.css` in `src/index.html`).

- Vue usage pattern:
  - The project uses the global `Vue` object. `main.js` destructures `createApp`, `reactive`, `provide`, `inject`, etc. Avoid adding build-time Vue plugins expecting single-file components unless you change the bundler setup.
  - Partials are registered using `app.component(componentName, { template: html, props: { state: Object }, setup(props) { ... } })` — follow this pattern when creating inline components programmatically.

## Editing guidance (concrete examples)

- Adding a new site block:
  1. Create `src/partials/gallery.html` with a single root element.
  2. Use `<site-gallery></site-gallery>` in `src/index.html` or another partial.
  3. If `gallery` needs data, add `src/data/gallery.json` and it will be available at `state.gallery` after mount.

- Passing local state to a partial:
  - Use the `state` prop: `<site-header :state="{ customTitle: 'X' }"></site-header>` and read `customTitle` inside the partial.

## Debugging tips specific to this repo

- If partial templates don't render, check that `import.meta.glob('../partials/*.html', { eager: true, query: '?raw' })` finds them and that filenames match component tag conventions.
- If JSON fails to load, the app logs errors with `console.error` in `main.js` — verify fetch URL resolution (`new URL('../data/<name>.json', import.meta.url)`) and that file exists under `src/data/`.
- CSS changes: edit files in `src/css/` — `src/index.html` links `./css/core-classless.css` by default.

## Files to inspect for patterns

- `src/js/main.js` — partial registration, global state, data-loading pattern.
- `src/partials/*.html` — component templates (use these as examples for new partials).
- `src/data/*.json` — canonical data shapes for `nav`, `aside`, `footer`.
- `vite.config.js` — confirms `root` and `server.port` and `build.outDir`.

## Do not assume / gotchas

- Vue is loaded from CDN in `src/index.html`; adding build-time Vue features will require changing how Vue is provided.
- Partials are plain HTML, not SFCs. Treat them as template strings (raw HTML imports).

--
If any of these conventions are unclear or you want the file to include examples for a specific change (add a partial, add data, change build), tell me which area to expand and I'll update this file.

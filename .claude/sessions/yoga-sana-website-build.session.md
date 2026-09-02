# Session — Yoga Sana website, full build

**Date:** 2026-09-01 → 2026-09-02
**Branch:** `feat/yoga-sana-website` (24 commits, HEAD `23cfa6a`)
**Spec:** `.claude/designs/yoga-sana-website.design.md`
**Method:** `/subagent-driven-development` — 9 tasks, each implement → spec review → code-quality review → fix

---

## 1. What this project is

Static Astro 5 marketing site for a one-person yoga studio (Yoga Sana, Natalia, Catarroja/València).
Spanish only, no backend, no database, no secrets. GitHub Pages, €0 hosting. Most traffic is phones
arriving from Instagram on 4G. **Every conversion path is a pre-filled WhatsApp message — there is no
contact form anywhere on the site, deliberately.**

Two sections (Horarios, Actividades) are editable by the owner from her phone via a Google Sheet,
with a committed snapshot guaranteeing the site never renders empty.

---

## 2. Current state

**All 9 build tasks complete.** 8 pages build, 141 tests pass, `tsc`/`astro check` clean.

```
/                        landing
/clases-de-yoga          6 yoga classes + weekly grid + PNG export + centro gallery
/talleres-y-experiencias 7 talleres + sesiones individuales
/sanergia                deep dive (2 placeholders)
/online                  membership, 30 €/mes
/sobre-mi                (2 placeholders)
/aviso-legal             LSSI-CE (2 placeholders)
/privacidad              RGPD (5 placeholders)
```

**The site cannot deploy yet, by design.** `pnpm check:pendiente` walks `dist/` and exits 1 while any
page contains `PENDIENTE DE TEXTO`; `deploy.yml` gates on it. 11 placeholders remain (see §4).

### Commands
```
pnpm dev · build · preview · test · check (astro check) · types (astro sync && tsc --noEmit)
pnpm snapshot          regenerate src/data/snapshot.json (falls back to seed/ when no Sheet configured)
pnpm images            regenerate public/img/ derivatives (atomic: stages then swaps)
pnpm logo              re-trace the logo (needs potrace: brew install potrace)
pnpm check:pendiente   the placeholder ship-gate — RED ON PURPOSE today
```

### Layout
```
src/data/       sheet.ts (CSV parse/validate) · snapshot.ts (SNAPSHOT, ajuste()) · snapshot.json
                live-refresh.ts · sheet-config.ts · site.ts (waLink, CTAS) · imagenes.ts · seo.ts
src/components/ Horario.astro + horario-grid.ts + horario-markup.ts · DescargarHorario.astro +
                horario-png.ts · ActividadCard · Tarjetas · Banda · Foto · Icono · Section ·
                WaButton · Pendiente · Legal · DatosTitular
src/layouts/    Base.astro
src/pages/      8 pages + sitemap.xml.ts + robots.txt.ts
src/styles/     tokens.css · base.css (.boton .rejilla .apunte .lead .intro .columna .alternativa)
scripts/        fetch-snapshot.mjs · process-images.mjs · trace-logo.mjs · check-pendiente.mjs
.github/workflows/ snapshot.yml · deploy.yml
assets/         icons/ (14 SVGs) · logo/ (2 traced SVGs)
seed/           horarios.csv · actividades.csv · ajustes.csv
```

---

## 3. Decisions made during the build (not all in the design doc)

- **Palette corrected for contrast, measured not eyeballed.** `--pizarra` `#7D9199`→`#8A9CA3`,
  `--rosa` `#C97B7B`→`#CD8686` (lightness only) so `--tinta` clears 4.5:1. Added `--oliva-oscuro
  #6A7353` for small olive text *and* the primary button fill (`--oliva` on `--marfil` was 3.78:1).
  `--oliva` itself unchanged, used for headers/eyebrow/decorative at AA-Large sizes. Design §5 updated.
- **Fonts: latin subset only.** The `latin-ext` Fontsource files carry no `unicode-range`, so they
  shadowed the real faces and shipped 43% dead bytes. If a page ever needs a character outside
  U+0000-00FF, bring latin-ext back via the per-weight `<weight>.css` files, never the per-subset ones.
- **Phosphor rejected for the workshop icons.** It has no `lungs` icon at all, and `hand-heart`/`bed`/
  `bowl-steam` read wrong. All 8 non-yoga marks are hand-drawn solid fills matching the traced
  silhouettes. Nothing third-party vendored, so no attribution file.
- **Horario: one renderer for build and browser.** `renderHorario()` produces the markup; the `.astro`
  component injects it with `set:html`, the client reassigns the same function's output on live refresh.
  Because `set:html` content gets no `data-astro-cid-*`, inner CSS is written `.horario :global(…)` —
  **only the root carries the scope**. Desktop/mobile switch is a **container query at 836px container
  width** (= 900px viewport inside `Section`), chosen so the PNG export's offscreen 1600px host renders
  the desktop table even when tapped from a phone.
- **PNG export clones the live `.horario` node** (`cloneNode(true)`, then `removeAttribute('data-horario')`
  so a live refresh can't blow away the clone mid-rasterisation). `html-to-image` copies computed style
  onto its clone, so `style: { position:'static', top:'0', left:'0' }` is required or the PNG comes out
  fully transparent. Embedded-browser fallback renders the blob as an on-page `<img>` to long-press —
  no user-gesture token needed, unlike `window.open`.
- **Landing horario is a link, not a second grid** — the export button resolves a single
  `[data-horario]`, so a landing grid would be a grid you can't download.
- **Sitemap routes are a literal `RUTAS` array**, not `import.meta.glob` (which emitted 404 URLs for
  nested `index.astro`, `_`-prefixed partials, `404.astro` and dynamic routes). No `@astrojs/sitemap`.
- **`enlacesDe` throws loudly on a renamed Sheet row but returns `{}` for an empty list** — otherwise
  the owner hiding every taller for a month would fail the whole build.
- **`Foto.astro` caps every image at its native width** (from the shared `imagenes.ts` manifest), so
  resolution-capped sources (`yoga1` 501px, `yoga3` 640px) can never upscale on any page.

---

## 4. BLOCKING — what the owner must supply

11 placeholders, all marked `PENDIENTE DE TEXTO — Natalia:`:

| # | Needed | Page(s) |
|---|---|---|
| 1 | **Full legal name** (as on her DNI) | aviso-legal, privacidad |
| 2 | **Studio address** (calle, número, CP, población) | aviso-legal, privacidad |
| 3 | What she does with WhatsApp conversations — data seen, purpose, lawful basis | privacidad |
| 4 | Retention and erasure practice | privacidad |
| 5 | Who she shares with (gestoría? non-EU tools?) | privacidad |
| 6 | What Sanergía is (deep dive) | sanergia |
| 7 | What Espacio Raíz is | sanergia |
| 8 | The long "Sobre mí" text | sobre-mi |
| 9 | A portrait she confirms is her | sobre-mi |

Items 3–5 were **invented in a first pass and removed** — asserting a real person's data-handling
practices without confirmation is not acceptable on an RGPD page.

Also to raise with her:
- Her **NIF is published** on `/aviso-legal`. That is what LSSI-CE requires of a sole trader, not a slip.
- **Image provenance for `yoga2` and `consciencia-corporal`** — §10 reads both as stock or AI. If
  licensed, check the licence; if unknown, replace. The aviso legal deliberately claims no ownership.
- `yoga1`/`meditacion-sentada` is still unconfirmed as her, so it is used nowhere.
- The centro photos would gain more from a **daylight reshoot with the curtains open** than from any
  further processing. The lime table in `centro-camilla` is toned down but still lime.
- Open questions: class durations (an optional `hora_fin` column would render "9:30 – 10:45");
  which talleres are genuinely available online (the global modality line is off the talleres page
  because it is plainly wrong for gimnasia pasiva and baño de cuencos); whether gimnasia pasiva is
  offered as an individual session.

---

## 5. BLOCKING — infrastructure, none of it done

1. **Register `yogasana.es`** — confirmed NXDOMAIN on 2026-09-01. It is the only part of this project
   someone else can take. Then point DNS at GitHub Pages per design §9.
2. **Create the Google Sheet**: import `seed/*.csv` into three tabs, publish each as CSV, then
   **re-verify the URL shape** — `csvUrl` builds `/spreadsheets/d/<id>/pub`, but the publish dialog
   hands out `/spreadsheets/d/e/2PACX-…/pub`. `.env.example` documents which segment to paste.
   Verify CORS against the real URLs (only the 404 path has ever been tested).
3. **Set 4 repo variables**: `PUBLIC_SHEET_ID`, `PUBLIC_SHEET_GID_ACTIVIDADES`, `_HORARIOS`, `_AJUSTES`.
   Without them Vite dead-code-eliminates the entire live-refresh path and the deployed site silently
   never refreshes. Both workflows warn loudly when they are unset.
4. **Enable Pages with Source = GitHub Actions**, then set the custom domain in Settings → Pages and
   tick Enforce HTTPS. **Do not add `public/CNAME`** — GitHub ignores it when deploying from a custom
   workflow.
5. **Merge to `main`** — the workflows trigger on `main` and have never run.
6. Re-enable `deploy.yml`'s daily cron once `check:pendiente` goes green (removed so it doesn't email
   a failed run every morning).

**Unverified until it actually runs:** the artifact/deploy handshake, the `github-pages` environment,
`git push origin HEAD:$RAMA` under branch protection, cron punctuality.
**First-run check:** run Snapshot manually via `workflow_dispatch`, then Deploy — it *should* fail at
the "Ningún texto pendiente" step. That failure is the gate proving it works.

---

## 6. Also unverified

- **The PNG export has never run on the owner's Android device.** Untested there: the `blob:` +
  detached `<a download>` save path, the in-app-browser UA sniff matching her Instagram build, and
  canvas allocation for 3200×3538 plus ~274 KB of font CSS on a mid-range phone. The fallback fails
  safe (an on-page image to long-press) either way.
- Google's edge cache TTL (~5 min, believed) and whether `&_=${Date.now()}` defeats it. **Tell her
  "a few minutes", not instant.**
- The legal pages are conservative and assert nothing unverifiable, but they are **not lawyer-reviewed**.
- OG image is 960×612, under Facebook's recommended 1200×630. A purpose-made card is the clean fix.

---

## 7. Environment notes for a future agent

- **`agent-browser` cannot rasterise in this environment.** `screenshot` (`Page.captureScreenshot`) and
  the PNG export both time out; navigation, `eval`, `snapshot`, `click` and `console` all work fine.
  Use eval-based measurement, not pixels. Subagents running their own Chrome sessions *did* produce
  real 3200×3538 PNGs, so this is environmental, not a site bug.
- Kill stray `astro dev`/`preview` servers before verifying — a squatter on 4321 caused one reviewer
  to test the dev build instead of production. Always `pnpm build` + `astro preview`.
- Don't run two subagents concurrently if one writes probe files: a read-only reviewer saw the other's
  temporary `src/pages/` probes and reported them as fabricated tool output.
- `scripts/*.mjs` import `.ts` files and rely on **Node's native type stripping** — needs Node ≥22.18
  (24 pinned in CI). Throws `ERR_UNKNOWN_FILE_EXTENSION` on Node 20.

---

## 8. Verification actually performed (2026-09-02, in-browser)

All 8 pages 200, plus `/sitemap.xml`, `/robots.txt`, the OG image. One `<h1>` each; canonicals and
OG tags present; landing heading outline matches design §6's section order exactly.
Zero horizontal overflow at 320/360/390/768/1280 on every page.
Horario flips at **exactly 900px viewport** (899 → stacked list, 900 → real `<table>`); 17 classes in
both views. WhatsApp hrefs decode byte-exact against §7; chip aria-labels name class + day + time.
Hamburger `aria-expanded` false→true→false, Escape closes and restores focus.
PNG export mounts a 1600px offscreen lámina rendering the **desktop table** while the visible 390px
page shows the stacked list; rasterisation then timed out *in this environment* and the failure ladder
behaved correctly — Spanish error, node removed, button re-enabled, no uncaught errors.

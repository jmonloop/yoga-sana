# Yoga Sana — Website Design

**Date:** 2026-09-01
**Status:** Validated, ready for implementation
**Owner:** Natalia — Yoga Sana, Catarroja (València)
**NIF:** 26759918Q · **Domain:** `yogasana.es`
**WhatsApp:** +34 677 808 098 · **Instagram:** @yoga_sanacatarroja

---

## 1. Summary

Static marketing site for a one-person yoga studio. No backend, no database, no
secrets. Every conversion path is a pre-filled WhatsApp message. Two sections —
**Horarios** and **Actividades** — are editable by the owner from her phone via a
Google Sheet, with a committed snapshot guaranteeing the site never renders empty.

Total running cost: **€0** hosting, plus `yogasana.es` at ~€10–12/year — the only
recurring expense.

---

## 2. Decision log

| # | Decision | Rationale |
|---|---|---|
| 1 | Google Sheets as CMS, **not** the WhatsApp catalog | See §2.1 |
| 2 | Committed snapshot + live runtime fetch | Instant paint, live edits, never empty |
| 3 | Landing + 5 subpages | Matches the owner's own CTA list; one search intent per page |
| 4 | Astro + GitHub Pages | Static HTML output, shared layout across 6 pages, €0 hosting |
| 5 | Client-side PNG export | Owner is on Android; export always matches what's on screen |
| 6 | Icons: her yoga silhouettes + Phosphor for workshops | Keeps the distinctive assets, fills the rest for free |
| 7 | Runtime Sheet fetch kept, disclosed in the privacy policy | Minutes-fresh content beats zero third-party requests |
| 8 | Olive WhatsApp buttons, not `#25D366` | The brand green fights the whole palette |
| 9 | Apex `yogasana.es`, `www` redirects to it | Shorter, and the aviso legal names one canonical origin |

### 2.1 Why not the WhatsApp catalog

The original ask was to drive these sections from the owner's WhatsApp Business
catalog. Investigated and rejected on evidence:

- **`wa.me/c/34677808098` returns HTTP 400** to a normal HTTP client (verified by
  request). There is no scrapeable public catalog page.
- The official read path is the Meta Graph API `GET /{catalog_id}/products`, which
  needs the `catalog_management` permission. Meta's permission reference lists it
  under **App Review**, with `business_management` as a dependency, and states the
  allowed use cases as "ecommerce platforms, travel platforms and dynamic ads" — a
  single-instructor yoga studio does not fit. Business Verification (company
  documents) sits on top of that.
- A token cannot live in a browser, so this would force a CI-only refresh anyway.
- A catalog product (name, price, image, description) is a poor container for a
  weekly timetable.

Net: high setup cost, real rejection risk, and a data-model mismatch — it fails the
"without much overhead" requirement at setup even if it works at runtime. The
WhatsApp catalog stays as WhatsApp's own shop surface, unlinked from the site.

**Verified alternative:** `docs.google.com/spreadsheets/.../pub?output=csv` and
`/gviz/tq` both return `access-control-allow-origin` reflecting the request `Origin`.
Caveat: tested against an invalid sheet ID, so this is the 404 handler path. Re-verify
against the real sheet during implementation.

---

## 3. Architecture and data flow

**Build time** — GitHub Actions, on push and on a daily cron:

1. `scripts/fetch-snapshot.mjs` fetches both published Sheet tabs as CSV.
2. Validates and normalises them.
3. Writes and commits `src/data/snapshot.json`.
4. Astro renders every page to static HTML with the snapshot baked into the markup.
5. Deploy to GitHub Pages.

**Runtime** — visitor's browser:

1. Page paints immediately from the baked-in snapshot. The timetable is visible
   before any network call — this matters on a phone on 4G.
2. A small script fetches the live Sheet CSV.
3. If it parses cleanly **and differs** from the snapshot, the grid re-renders in place.

### Failure ladder

Each rung is silent to the visitor:

| Condition | Behaviour |
|---|---|
| Live CSV unreachable or malformed | Keep the baked snapshot |
| Individual row invalid | Drop that row, render the rest |
| Unknown `grupo` value | Route to a fallback bucket, never drop silently |
| Snapshot missing at build | **Fail the build loudly** rather than ship an empty section |

There is no state in which a visitor sees an empty Horarios or Actividades section.

### Freshness

Google caches published-to-web sheets at the edge — believed around 5 minutes, **not
verified**. A cache-busting `&_=${Date.now()}` param usually defeats CDN caching but is
unconfirmed against this endpoint. **Set the owner's expectation at "a few minutes",
not instant.** The daily cron exists only to keep the committed snapshot current so
the instant-paint stays accurate.

---

## 4. Data model

Google Sheet, three tabs, each published individually via
*Archivo → Compartir → Publicar en la web → CSV*.

> **Warning to give the owner explicitly:** publishing makes that tab publicly
> readable by URL. Nothing private goes in this spreadsheet, ever.

### Tab `actividades`

| nombre | grupo | descripcion | etiqueta | icono | orden | activo | *color* | *mensaje_wa* |
|---|---|---|---|---|---|---|---|---|
| Hatha Yoga | yoga | Equilibrio entre fuerza, flexibilidad y respiración. | | hatha | 1 | SI | | |
| Yoga Dinámico | yoga | Energía, movimiento y vitalidad para cuerpo y mente. | | dinamico | 2 | SI | | |
| Yoga Suave | yoga | Clases suaves y conscientes para soltar tensiones. | | suave | 3 | SI | | |
| Yoga Adaptado | yoga | Prácticas adaptadas a tus necesidades y ritmo. | | adaptado | 4 | SI | | |
| Yoga Relajante | yoga | Relajación profunda para liberar el estrés y calmar la mente. | | relajante | 5 | SI | | |
| Yoga para Niños | yoga | Yoga y juegos para crecer en equilibrio corporal y emocional. | | ninos | 6 | SI | | |
| Gestión Emocional | taller | Talleres y sesiones individuales para comprender y gestionar tus emociones. | PARA EMPRESAS | mente | 1 | SI | | |
| Breathwork | taller | Talleres de respiración consciente para liberar, renovar y conectar contigo. | TALLERES 1 VEZ AL MES | pulmones | 2 | SI | | |
| Rebirthing Consciente | taller | Respiración conectada para liberar bloqueos emocionales y transformar tu energía. | GRUPO FIJO UN JUEVES CADA 15 DÍAS | espiral | 3 | SI | | |
| Constelaciones Familiares | taller | Sanar, comprender y liberar patrones para vivir en armonía con tu sistema familiar. | | familia | 4 | SI | | |
| Gimnasia Pasiva en Camilla | taller | Relajación profunda a través del movimiento pasivo. Libera tensiones y restaura tu energía. | | camilla | 5 | SI | | |
| Baño de Cuencos | taller | Relajación profunda con sonido y vibración que armonizan cuerpo y mente. | TALLERES 1 VEZ AL MES | cuencos | 6 | SI | | |
| Sanergía | taller | Técnica energética que armoniza cuerpo, mente y emociones a través de la imposición de manos y la canalización de energía universal. | | loto-manos | 7 | SI | | |

Italic columns are optional overrides.

- `grupo` — closed set: `yoga` \| `taller`. Unknown values land in a visible
  "Otras actividades" fallback rather than disappearing.
- `etiqueta` — free-text badge. Captures "PARA EMPRESAS", "1 VEZ AL MES",
  "UN JUEVES CADA 15 DÍAS" without hardcoding.
- `icono` — keyword from a shipped set. Use Sheets data validation to give her a
  dropdown; the six yoga values match the traced filenames in `assets/icons/`
  (`hatha`, `dinamico`, `suave`, `adaptado`, `relajante`, `ninos`). Blank or unknown
  → default lotus.
- `mensaje_wa` — optional override for the generated WhatsApp message.

**Modality is not a column.** Everything is available presencial *and* online; this is
stated once globally rather than repeated per row.

### Tab `horarios`

Confirmed September grid — 17 rows. Machine-readable copy in **`seed/horarios.csv`**.

| dia | hora | actividad | nota | activo |
|---|---|---|---|---|
| Lunes | 9:30 | Yoga Sana | | SI |
| Martes | 9:30 | Yoga Sana | | SI |
| Miércoles | 9:30 | Yoga Sana | | SI |
| Jueves | 9:30 | Yoga Sana | | SI |
| Viernes | 10:00 | Yoga Relajante | | SI |
| Lunes | 11:00 | Yoga Suave | | SI |
| Martes | 11:00 | Yoga Suave | | SI |
| Miércoles | 11:00 | Yoga Suave | | SI |
| Jueves | 11:00 | Yoga Suave | | SI |
| Lunes | 17:30 | Yoga Sana | | SI |
| Miércoles | 17:30 | Yoga Sana | | SI |
| Jueves | 17:30 | Yoga Infantil | | SI |
| Viernes | 18:00 | Yoga Relajante | | SI |
| Lunes | 19:00 | Yoga Sana | | SI |
| Miércoles | 19:00 | Yoga Sana | | SI |
| Martes | 20:00 | Yoga Relajante | | SI |
| Viernes | 20:00 | Meditación guiada | Reserva anticipada | SI |

`nota` is a free-text qualifier rendered under the chip — currently only
"Reserva anticipada".

**Two corrections against the Canva image**, supplied by the owner:

1. **Yoga Infantil is Jueves 17:30, not Martes.** Treated as a move, so Martes 17:30
   is now empty. *If it was meant as an addition rather than a correction, add the
   Martes row back.*
2. **"Meditación" → "Meditación guiada"**, with the `reserva anticipada` note.

### Tab `ajustes`

Key/value. Machine-readable copy in **`seed/ajustes.csv`**.

| clave | valor |
|---|---|
| mes | Septiembre |
| tagline | Tu espacio para respirar, conectar y reconectar contigo |
| nota_pie | Clases para todos los niveles. Escucha tu cuerpo, honra tu proceso. |
| color.Yoga Sana | salvia |
| color.Yoga Suave | lavanda |
| color.Yoga Relajante | pizarra |
| color.Yoga Infantil | melocoton |
| color.Meditación guiada | rosa |

`color.*` keys pin a timetable class to a palette token. Needed because the five
timetable class names don't all exist in `actividades` (`Yoga Sana` and
`Meditación guiada` have no card; `Yoga Infantil` is called `Yoga para Niños` there),
so auto-assignment could not reproduce her exact Canva colours. Any class without a
`color.*` key still falls back to auto-assignment.

### Robustness rules

1. **Read by header name, never column index.** She can reorder or add columns freely.
2. **`activo` = SI/NO instead of deleting rows.** Hide a class for August, bring it
   back in September without retyping it.
3. **`hora`: parse leniently for ordering, display the raw string verbatim.** A
   tolerant regex reads hour and minute for sorting; unparseable values sort last
   rather than throwing. This also absorbs Sheets exporting `9:30` as `9:30:00`,
   which is normalised for display.
4. **`dia` matched case- and accent-insensitively** against the seven Spanish weekday
   names. Unrecognised days sort last.
5. **Loose name matching between tabs.** `Yoga Sana` and `Meditación` appear in the
   timetable but not in the activity list. Unmatched timetable entries still render,
   they just take an auto-assigned colour.
6. **Header normalisation:** lowercase, strip accents, trim.
7. **Missing required column → reject the whole tab**, keep the snapshot.

Parsing uses `papaparse`. Hand-rolling CSV quoting is a reliable source of bugs.
Validation is three small hand-written functions — no schema library needed at this size.

---

## 5. Design system

Colour and type are lifted from the owner's own Canva graphics, **not** from
omtheyoga.com. omtheyoga informs layout rhythm and whitespace only.

### Colour tokens

```
--crema        #F7F3E9   page ground
--marfil       #FDFBF6   cards
--oliva        #7B8560   primary: headers, buttons
--tinta        #2E332A   text (matches the logo)
--salvia-tint  #E4E9DA   icon circles
```

Class chip fills as shipped: sage `#C3D0A8` · lavanda `#C9AFD4` · pizarra `#8A9CA3` ·
melocotón `#E8A96A` · rosa `#C97B7B` → `#CD8686`.

**Implementation note (measured, supersedes the sampled hex).** Pizarra and rosa were
sampled from the Canva graphics as `#7D9199` and `#C97B7B`. Measured, `--tinta` on those
fills gives only 3.93:1 and 4.07:1, under the 4.5:1 AA floor. Both were nudged lighter —
hue and saturation held, lightness only — to `#8A9CA3` (4.54:1) and `#CD8686` (4.53:1).
The other three fills already passed: salvia 7.95, lavanda 6.51, melocotón 6.35.

**Accessibility correction to her palette.** Several chip colours fail contrast —
slate on white is ≈3.0:1 and peach on white is well below that, against the 4.5:1 AA
floor. Fix: keep the light originals as chip *fills* with `--tinta` on top, and derive
slightly darkened variants of slate and rose for any use as *text*. The grid stays
visually near-identical to her Canva version and becomes readable.

Two further measured corrections, both applied in `src/styles/tokens.css`:

- `--oliva #7B8560` as a button fill gives only 3.78:1 against `--marfil`, failing AA for
  normal text. A darkened `--oliva-oscuro #6A7353` (4.85:1) carries the primary button
  fill *and* small olive text. `--oliva` itself is unchanged and still used for headers,
  the script eyebrow and decorative rules, where AA Large applies.
- Text variants of the two problem chips: `--pizarra-text #627278` and
  `--rosa-text #9B5F5F`, both 4.84:1 on `--marfil`.

### Type

Three families, all self-hosted via Fontsource. Zero CDN calls — this is both a
performance win and an RGPD win, since it removes the third-party font request.

| Family | Role |
|---|---|
| **Cormorant Garamond** | Display. Uppercase, `letter-spacing: 0.12em` for section titles. Matches "HORARIO" and the logo's serif. |
| **Jost** | Body, labels, nav, buttons. Geometric humanist, matches the logo's letterspaced subtitle. |
| **Parisienne** | Script accent only — "Septiembre", "Un lugar para ti", "Respira. Conecta. Fluye." Decorative, never load-bearing, always paired with a real text equivalent. |

### Layout

- Max width 1120px; text measure 65ch.
- Section padding 112px desktop / 64px mobile.
- Radii: pills full, cards 18px, icon circles full.
- Fade-up on scroll, gated behind `prefers-reduced-motion`.
- Hamburger nav below **1024px** (not the usual 768px) — the two long nav labels
  need the room.

---

## 6. Page map

| Page | Content | Sheet-driven |
|---|---|---|
| `/` | Hero · ¿Qué puedes encontrar? · three teaser blocks · horario preview · Nuestro centro band · online membership · Sanergía teaser · Sobre mí teaser · ¿Te apetece empezar? · contacto | teasers only |
| `/clases-de-yoga` | The 6 yoga classes · full weekly grid + PNG export · centro gallery | **yes**, both halves |
| `/talleres-y-experiencias` | The 7 talleres · Sesiones Individuales block | **yes** |
| `/sanergia` | Sanergía deep dive · Espacio Raíz in full | no |
| `/online` | 1 clase nueva/semana · 4/mes · 1h + 15min relajación · repetible · 30 €/mes | no |
| `/sobre-mi` | The long Natalia text | no |
| `/aviso-legal`, `/privacidad` | Legal | no |

Nav: **Clases de Yoga · Talleres y Experiencias · Sanergía · Online · Sobre mí**.
The logo is the home link (no "Inicio" item). WhatsApp is a persistent button, not a
nav item.

**Why talleres are separate from clases:** breathwork is monthly, rebirthing is every
other Thursday, constelaciones is ad hoc. Putting them on a Monday–Friday grid would
misrepresent when they actually happen.

**Sanergía appears twice** — as a card in `/talleres-y-experiencias` linking onward,
and as its own page. Deliberate: the owner asked for a dedicated "saber más"
destination, and it is the offering with the most explaining to do.

### CTA mapping

| Owner's button | Destination |
|---|---|
| `[QUIERO EMPEZAR]` | WhatsApp |
| `[VER HORARIOS]` | `/clases-de-yoga#horario` |
| `[SABER MÁS SOBRE SANERGÍA]` | `/sanergia` |
| `[CONÓCEME]` | `/sobre-mi` |
| `[QUIERO UNIRME]` | `/online` |
| `[RESERVAR SESIÓN]` / `[... ONLINE]` | WhatsApp, two distinct messages |
| `[HABLAR POR WHATSAPP]` | WhatsApp |

### SEO

One intent per page: *yoga Catarroja* · *talleres breathwork València* · *sanergía* ·
*yoga online España* · her name. A single-page site would have had all five competing
in one document.

---

## 7. WhatsApp CTA system

Single helper `waLink(mensaje)` that URL-encodes and prefixes
`https://wa.me/34677808098?text=`. **No contact form anywhere** — WhatsApp is the form.

| Trigger | Message |
|---|---|
| `[QUIERO EMPEZAR]` (hero, cierre) | ¡Hola Natalia! Me gustaría empezar en Yoga Sana. ¿Me cuentas cómo funciona? |
| Timetable slot | ¡Hola Natalia! Me gustaría reservar plaza en {actividad} del {día} a las {hora}. ¿Queda sitio? |
| Yoga class card | ¡Hola Natalia! Me interesa {actividad}. ¿Me cuentas horarios y precios? |
| Taller card | ¡Hola Natalia! Me interesa el taller de {actividad}. ¿Cuándo es el próximo? |
| `[RESERVAR SESIÓN]` | ¡Hola Natalia! Me gustaría reservar una sesión de Sanergía presencial en Catarroja. |
| `[RESERVAR SESIÓN ONLINE]` | ¡Hola Natalia! Me gustaría reservar una sesión de Sanergía online. |
| Espacio Raíz | ¡Hola Natalia! Me interesa Espacio Raíz, el acompañamiento individual. ¿Me cuentas más? |
| `[QUIERO UNIRME]` | ¡Hola Natalia! Quiero unirme a Yoga Sana Online (30 €/mes). ¿Cómo lo hacemos? |
| `PARA EMPRESAS` badge | ¡Hola Natalia! Me interesa el programa de bienestar emocional para equipos. |
| Sesiones individuales | ¡Hola Natalia! Me gustaría reservar una sesión individual. ¿Qué disponibilidad tienes? |
| Contacto | ¡Hola Natalia! Tengo una duda sobre Yoga Sana. |

Sheet-driven cards generate their message from `nombre` + `grupo` via template, with
the optional `mensaje_wa` column as an override. Optional, so zero overhead by default.

**On modality:** follow the owner's brief rather than being clever. Where she wrote two
buttons (Sanergía), there are two. Everywhere else one button, and presencial-vs-online
is settled in conversation — faster for the visitor than choosing before they've spoken
to anyone.

Every link carries an `aria-label` naming the class, day and time, so screen readers
don't hear "WhatsApp" eleven times. Links use `target="_blank" rel="noopener"`.
Instagram `@yoga_sanacatarroja` is the secondary channel for anyone without WhatsApp.

---

## 8. Horarios component

### Grid generation

- **Columns** = distinct `dia` values in canonical Spanish weekday order. Adding
  Sábado to the Sheet makes a column appear with no code change.
- **Rows** = distinct `hora` values, sorted chronologically.
- Two entries sharing a day and hour → chips stack in the cell.
- **Band separator:** a gap of more than two hours between consecutive rows inserts
  the spacer seen between 11:00 and 17:00 in the Canva version. Automatic, no column.
- **Colours:** resolved in order — `color.*` key in `ajustes` → `color` column in
  `actividades` → auto-assignment from the palette in stable order.

### Two deliberate divergences from the Canva grid

1. **Empty time rows disappear.** Her image lists 9:30, 10:00, 11:00, 17:00, 17:30,
   18:00, 18:30, 19:00, 20:00; the data only contains 7 distinct times, so 17:00 and
   18:30 never render. They carry no information — in the Canva version they exist to
   suggest class *duration* through vertical chip spans, which we cannot reproduce
   without duration data.
2. **No separator between 19:00 and 20:00.** Her design has a rule there; our
   >2h heuristic sees a 1h gap and skips it. Cosmetic.

**If duration matters to students** — and it probably does — the clean fix is an
optional `hora_fin` column, rendering "9:30 – 10:45" instead of a bare start time.
That is more useful than the visual spans it replaces. Not in scope for v1; raise
with the owner.

### Responsive

- **≥900px** — real `<table>` with `scope`d `<th>` for days and hours. Screen-reader
  navigable, which the published image never was.
- **<900px** — flips to a stacked per-day list (day heading → time → class). A
  five-column grid on a phone means horizontal scrolling, and most traffic will be
  phones arriving from Instagram.

### PNG export

Button lazy-imports `html-to-image` (~15KB gzip) on click, so it never touches first
paint. It renders a **hidden fixed-width 1600px node**, not the visible DOM — so the
PNG is always the full desktop grid with her header (logo, "HORARIO", script month
from `ajustes.mes`, tagline, footer note) even when tapped from a phone showing the
stacked list.

- `pixelRatio: 2`
- Fonts embedded as base64 via `fontEmbedCSS` (self-hosted, so this is possible)
- Logo inlined as a same-origin image so the canvas does not taint
- Offscreen node positioned `fixed; left: -9999px` — **not** `display:none`, which
  would remove layout
- `aria-hidden` on the offscreen node
- Downloads as `horario-septiembre-yoga-sana.png`

Net effect: she edits the Sheet, opens `/clases-de-yoga`, taps *Descargar horario*,
and has the WhatsApp-status image she used to build in Canva.

---

## 9. Repo, build, hosting

```
.github/workflows/   snapshot.yml (cron + push), deploy.yml — TBD
seed/                horarios.csv · actividades.csv · ajustes.csv
sources/             images/ — the untouched original archive (15 files)
assets/icons/        14 marks: 6 traced poses (hatha, dinamico, suave,
                     adaptado, relajante, ninos) + 8 drawn (mente, pulmones,
                     espiral, familia, camilla, cuencos, loto-manos, loto)
assets/logo/         logo-figura.svg · logo-texto.svg — traced, `pnpm logo`
scripts/             fetch-snapshot.mjs · process-images.mjs · trace-logo.mjs
src/data/            snapshot.json · sheet.ts · site.ts · sheet-config.ts
                     live-refresh.ts · snapshot.ts (+ a .test.ts each)
src/components/      Icono · WaButton · Section (Horario · ActividadCard TBD)
src/layouts/         Base.astro
src/pages/           index (clases-de-yoga · talleres-y-experiencias · sanergia
                     online · sobre-mi · aviso-legal · privacidad all TBD)
src/styles/          tokens.css · base.css
public/img/          62 committed avif/webp/jpg derivatives, 1.16 MB
```

**Hosting: €0** on GitHub Pages.

### Domain — `yogasana.es`

Confirmed. **Checked 2026-09-01: `yogasana.es` returns NXDOMAIN — unregistered and
available.** Register it before anything else; the name is the only part of this
project someone else can take. Cost ~€10–12/year, the project's only recurring expense.

DNS at the registrar (values from GitHub's Pages documentation):

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `<usuario>.github.io` |

The four A records are verified live (`dig A github.io`); the AAAA set is from the
docs, not independently resolved.

**Gotcha worth not rediscovering:** because we deploy from a **custom Actions
workflow** rather than from a branch, GitHub does *not* create a `CNAME` file and
**ignores any `CNAME` file in the repo**. Do not add `public/CNAME` and expect it to
work — set the custom domain in *Settings → Pages* instead, then tick **Enforce
HTTPS** once the Let's Encrypt certificate provisions.

Canonical origin is `https://yogasana.es` for `<link rel="canonical">`, `sitemap.xml`,
Open Graph URLs and Astro's `site` config. Redirect `www` → apex.

---

## 10. Imagery

Source files live in `sources/images/`. **`nuestro-centro3.txt` and
`nuestro-centro4.txt` are JPEGs with the wrong extension** (re-verified with `file`).
`sources/` is left as the untouched original archive: `scripts/process-images.mjs`
reads them under their wrong names — sharp sniffs the format — and writes correctly
typed derivatives, so nothing in `sources/` is renamed or edited.

| File | px | Content | Use |
|---|---|---|---|
| `logo.jpeg` | 994×967 | Logo on pale-green ground | Header — **traced, see below** |
| `yoga1.jpeg` | 501×716 | Woman meditating, cream romper, pampas | `/sobre-mi` portrait — **confirm this is Natalia** |
| `yoga2.jpeg` | 1254² | Studio pose, sage kit, warm light | `/clases-de-yoga` hero |
| `yoga3.jpeg` | 640² | Backbend by a river, golden hour | Landing mood band / `/online` |
| `consciencia-corporal.jpg` | 600×1017 | Dancing, joyful, motion blur | `/sanergia` → Espacio Raíz |
| `nuestro-centro2.jpg` | 1600×1200 | Room with green mats, salt lamp | **Primary "nuestro centro"** |
| `nuestro-centro.jpg` | 1600×1200 | Empty room, wide | Secondary / gallery |
| `nuestro-centro3` | 1600×1200 | Shelf detail: olive bolsters, cork blocks | Texture band |
| `nuestro-centro4` | 1600×1200 | Treatment room, massage table | `/talleres-y-experiencias` → gimnasia pasiva, sesiones individuales |
| `yoga-pose1..6.png` | 1024² | Yoga silhouettes, no alpha, 4.4 MB total | Class icons — **trace to SVG first**, see below |

### Known problems

1. **Colour cast.** The four centro shots are phone snaps under fluorescent light —
   grey ceiling tiles, grey curtains, cool cast — fighting the warm cream/sage brand.
   Mitigate with a warm grade and tighter crops that push the ceiling out of frame.
   They will not look art-directed. *The highest-value thing the owner could do is
   reshoot two of them in daylight with the curtains open.*
2. **The lime table** in `nuestro-centro4` is a loud yellow-green clashing with sage.
   Crop tight to the bolster shelf; let the table be a corner, not the subject.
**Applied (`scripts/process-images.mjs`, `pnpm images`).** One deterministic crop and
grade per source, then avif + webp at every responsive width plus one jpeg fallback:
62 files, 1.16 MB, all committed — no build-time or runtime image processing. The warm
grade is a per-channel `linear` gain (R ×1.055, G ×1.012, B ×0.94 at full strength) plus
a small saturation/brightness lift; the four centro shots take it at full strength, and
`centro-camilla` takes it desaturated (0.9) to stop the lime table shouting.
Ceiling tiles and fluorescent panels are cropped out of all four. `yoga3` is graded
*cooler* (warm −0.3, saturation 0.88) — it is the one source with a magenta, not a cool,
cast. Output names stay neutral about who is in frame while `yoga1` is
unconfirmed. Caps respected: `meditacion-sentada` tops out at 501 px and `yoga-al-aire-libre` at
640 px, and `resize({ withoutEnlargement: true })` makes the no-upscaling rule explicit
rather than a property of the current widths.

**The manifest deliberately covers 8 of the 15 tracked sources**, plus `logo.jpeg`
handled by `scripts/trace-logo.mjs` — nine in total. The remaining six,
`yoga-pose1..6.png`, are **inputs to the icon trace, not page imagery**, so they have no
derivatives and never reach `public/img/`.

**Both scripts write non-destructively.** `process-images.mjs` renders every derivative
into `public/img.tmp` and only swaps it over `public/img/` once all 62 succeed (files it
does not own — a future `og-image.png` — are carried across, and the staging directory is
removed in a `finally`, so a mid-run failure leaves the committed outputs and `git status`
untouched). `trace-logo.mjs` runs potrace for both parts before writing either, so a
failure on the second cannot leave the first overwritten. Both were verified by
deliberately failing them mid-run.

3. **Mixed provenance.** `yoga2` and `consciencia-corporal` read as stock or AI;
   `yoga1`, `yoga3` and the centro shots read as genuinely hers. Put the authentic
   ones anywhere the page says "me" or "my space"; keep the polished ones for abstract
   mood. Do not mix them within one band.
4. **Resolution caps.** `yoga1` (501px) and `yoga3` (640px) cannot be full-bleed
   desktop heroes — portrait columns and cards only.

### Icons

Hybrid, 13 total.

**6 yoga silhouettes — supplied** as `sources/images/yoga-pose1..6.png`, 1024×1024
PNG, RGB with **no alpha channel**. Flat two-tone: dark olive figure on a pale sage
circle on a cream ground.

**Traced to SVG — done.** Output in `assets/icons/`, one file per `icono` keyword used
in `seed/actividades.csv`. Three reasons the raw PNGs could not ship:

1. **Weight.** 4.4 MB for six icons (~750 KB each). Traced SVG is ~2–5 KB each — a
   ~1000× reduction. Shipping the PNGs would dominate the entire page budget.
2. **No transparency.** The sage circle and cream ground are baked in, so the icons
   cannot sit on any background but their own.
3. **Inconsistent colour.** Sampled from the actual files:

   | File | Ground | Circle | Figure |
   |---|---|---|---|
   | `yoga-pose1` | `#F6F4EB` | `#CFD9BF` | — |
   | `yoga-pose2` | `#F9F8F1` | `#DCE7CF` | — |
   | `yoga-pose3` | `#F8F4EA` | `#DBE4CA` | `#535E3B` |
   | `yoga-pose4` | `#F8F7F0` | — | `#59683D` |
   | `yoga-pose5` | `#FAF4E3` | `#D5E1C3` | — |
   | `yoga-pose6` | `#FAF8EF` | — | `#505F39` |

   Grounds span `#F6F4EB` → `#FAF4E3` and circles span `#CFD9BF` → `#DCE7CF`. Side by
   side in a six-up grid these read as mismatched tiles. None match `--crema #F7F3E9`
   or `--salvia-tint #E4E9DA`, and the figure olive `≈#535E3B` is darker than
   `--oliva #7B8560`.

### Trace pipeline

Reproducible, zero-cost:

1. Threshold the RGB PNG on luminance < 140 to isolate the dark figure, discarding the
   baked circle and ground.
2. Crop to the figure's bounding box, squared and centred, with 6% padding — this
   normalises framing across all six.
3. Write a 1-bit PBM and pipe it to potrace on stdin:
   `potrace -b svg --flat -a 1.2 -O 0.25 -t 6 -o - -`.
4. Post-process: strip the DOCTYPE comment and fixed `width`/`height`, swap
   `fill="#000000"` for `fill="currentColor"`.

**Prerequisite: potrace.** It is a system binary, not an npm dependency — `pnpm logo`
needs `brew install potrace` (or the distro equivalent) and says so with a plain message
instead of a raw `ENOENT` when it is missing. `pnpm images` needs nothing beyond sharp.

Result: one `<path>` per file, square viewBox, transparent, inheriting colour from CSS.
The sage circle becomes a CSS element using `--salvia-tint`, so all six match exactly
and recolour for free.

| File | Bytes | vs PNG |
|---|---|---|
| `hatha.svg` | 2.3 KB | 322× |
| `dinamico.svg` | 2.1 KB | 370× |
| `suave.svg` | 2.4 KB | 339× |
| `adaptado.svg` | 3.0 KB | 241× |
| `relajante.svg` | 1.6 KB | 442× |
| `ninos.svg` | 2.0 KB | 383× |
| **Total** | **13.4 KB** | **338×** |

Verified by render on both `--crema` and `--oliva` grounds: silhouettes are clean and
`currentColor` inheritance works in both directions.

### Pose-to-class assignment

**Arbitrary, by owner's decision.** The supplied poses are not semantically matched to
the class names — `relajante.svg` is a cobra/sphinx, `ninos.svg` is a shoulderstand,
and `adaptado.svg` is a near-duplicate of `hatha.svg`. This was raised and explicitly
waived; filenames map positionally to `yoga-pose1..6`. If it is ever revisited, the
two worth replacing are a reclining savasana for Yoga Relajante and an adult-plus-child
for Yoga para Niños, which is what the original infographic used.

**Minor open nit:** optical sizing varies — the wide, low poses (`relajante`, `suave`)
read smaller than the upright ones at the same box size. Normalising by rendered area
rather than bounding box would even this out. Cosmetic, not blocking.

**8 workshop marks — drawn, not Phosphor (measured, supersedes the plan below).**
Phosphor 2.1.1 was rendered side by side with the six silhouettes at thin, bold and
fill weights before deciding. Thin failed exactly as predicted — two systems. Bold and
fill matched the weight acceptably, but the set failed on substance: it has **no
`lungs` icon at all** (0 of 1512), `hand-heart` is illegible at icon size and is not
"loto-manos", `bed` reads as a hotel and `bowl-steam` as soup. Four of the eight would
have had to be drawn anyway, so all eight are drawn instead, as solid fills in the
silhouettes' own language — several are human figures, which is what actually makes the
fourteen read as one set. Nothing third-party is vendored, so no attribution file.

| File | Bytes | Mark |
|---|---|---|
| `espiral.svg` | 271 | 2½-turn coil, even 38-unit band, round terminals |
| `mente.svg` | 406 | bust with a heart in the head |
| `cuencos.svg` | 455 | bowl radiating symmetric sound arcs |
| `camilla.svg` | 463 | figure reclining on a treatment table |
| `pulmones.svg` | 578 | lungs and trachea |
| `familia.svg` | 620 | two adults and a child |
| `loto.svg` | 836 | five-petal lotus on a water line |
| `loto-manos.svg` | 1314 | two open palms under a lotus |
| **Total** | **4943** | 38 % of the traced six (12 852 B) |

**`espiral` redrawn.** The first version was a generated ~90-point polyline of a ribbon
that tapered to nothing: 2202 B, the heaviest file in the set, and it read as a thin line
next to thirteen solid marks even though its ink coverage (27.4 %) was mid-band — area is
not weight. It is now six half-turn arcs on one path, stroked at a constant 38 units with
round caps, matching the band weight of `cuencos`' sound arcs: 271 B, 24.9 % coverage, and
legible down to the 37 px the icon actually renders at. Rendered beside the other thirteen
on `--crema` and `--oliva`, at 64 px and 37 px, it now sits with them.

Ink coverage was measured at 256², to keep the two groups in one weight band: traced six
9.3–29.4 %, drawn eight 18.2–31.6 % (`familia` was redrawn down from 44.9 %). All eight
use `viewBox="0 0 512 512"` and no fixed width/height; seven are `fill="currentColor"`
and `espiral` is a `stroke="currentColor"` band, as `cuencos` already was in part.

**Optical sizing nit — measured, not fixable by scaling.** Equalising *rendered area*
would need `relajante` ~1.7× larger, but its bounding box already fills 94 % of the box
width, so it would overflow. The wide, low poses reading smaller than the upright ones
is inherent to putting a wide silhouette in a circle. Left as is.

**Preamble stripped.** The six traced files still carried potrace's XML declaration and
DOCTYPE; both are removed now, since `Icono.astro` inlines the markup into HTML.

**Original plan, superseded:** 7 workshop marks from Phosphor thin (MIT), restyled as
olive strokes, with a heavier stroke weight to match the solid silhouettes.

### Logo

**Traced cleanly — no raster fallback needed.** The logo is single-tone dark line art on
a pale-green ground, so the same pipeline works on it: `scripts/trace-logo.mjs`
(`pnpm logo`) thresholds it, finds its three ink bands (`figura`, `texto`, `lema` — the
manifest names them, and the one with no output file is the tagline it deliberately
drops), bounding-boxes the two it emits and runs the same potrace flags. Serif detail survives, checked by
rendering the wordmark far above the size the header uses.

| File | Bytes | viewBox |
|---|---|---|
| `assets/logo/logo-figura.svg` | 5969 | 390×362 |
| `assets/logo/logo-texto.svg` | 5182 | 975×197 |

The stacked original cannot work in a 78 px header — the wordmark would render at ~10 px
— so the header uses a **horizontal lockup**: figure left, wordmark right, `Catarroja`
kept as the sub-line. The tagline band ("Yoga, meditación y talleres") is deliberately
not traced; nothing on the site uses it.

**Sizing is continuous, with no breakpoint of its own:** `height: clamp(26px, 8vw, 43px)`
on the figure and `clamp(14px, 4.5vw, 24px)` on the wordmark, both reaching their cap at
~537 px — the same shape as the `clamp()` text wordmark they replaced. A first attempt
used two fixed pixel heights with a ≤479 px step-down; measurement showed the step fired
60–80 px earlier than the layout needed (at 480 px the full lockup still had 64 px of
slack) and jumped brand width +66 % across the boundary, so it is gone.

Measured on the built header at 16 viewport widths from 320 to 1440: the brand, CTA and
burger stay on **one row everywhere**, with the tightest fit 9.5 px of slack at 320 px
(79.1 px at 420 px, 81.1 px at 480 px, growing from there). Header height is 77 px up to
~508 px — where the 44 px nav toggle plus the 1 px bottom border is the tallest child —
then rises continuously to **78.09 px from ~535 px up**, once the brand lockup overtakes
the toggle. `scroll-padding-top` is 94 px, so anchor targets clear that 78.09 px maximum
at every width.

*Correction to an earlier claim here:* the swap was described as leaving the header
height "identical to before" at nine widths. It was not, at 480 px — the pre-swap text
lockup measured 77 px there (its `clamp()` only capped between 500 and 540 px) while the
first traced version stepped up to 78.09. Harmless, but wrong; the numbers above are the
current ones, re-measured.

### Botanical motifs

Her graphics lean on watercolour leaves. Rebuild as inline SVG — free, sharp,
themeable, no image weight.

---

## 11. Legal (Spain)

- **Aviso legal** (LSSI-CE). Required fields, now known except the address:
  - Titular: Natalia — *full legal name still needed*
  - NIF: **26759918Q** (checksum validated: 26759918 mod 23 = 16 → `Q`)
  - Domicilio: *still needed* — the Catarroja studio address
  - Contacto: WhatsApp +34 677 808 098
  - Dominio: `yogasana.es`

  Note the NIF is published openly on that page. That is what LSSI-CE requires of a
  sole trader, not an oversight — but the owner should know it will be public.
- **Política de privacidad** (RGPD), which **must disclose** that the Google Sheets
  runtime fetch sends the visitor's IP to Google.
- **No cookie banner.** Self-hosted fonts, no analytics, no cookies. This only stays
  true if nobody adds Google Analytics later. If she wants numbers, GoatCounter's free
  tier is cookieless.

---

## 12. Risks and unverified claims

| Claim | Status |
|---|---|
| `wa.me/c/` is not scrapeable | **Verified** — HTTP 400 |
| Google Sheets pub endpoints send CORS headers | **Verified on the 404 path only.** Re-verify against the real sheet |
| Google edge cache TTL ≈5 min | **Unverified.** Tell the owner "a few minutes" |
| `&_=${Date.now()}` defeats that cache | **Unverified.** Test during implementation |
| `catalog_management` requires App Review | Per Meta's permission reference; not tested end-to-end |
| `html-to-image` renders correctly on her device | Android Chrome assumed. **Test on her actual phone** |
| Chip contrast ratios | Estimated from sampled hex. Re-measure the final tokens |

Additional risks: Google could change the publish-to-web feature (mitigated by the
committed snapshot, which keeps the site working indefinitely); the owner may not have
the icon originals.

---

## 13. Out of scope

Booking/payment system · user accounts · the online class video library (Natalia
delivers those directly) · blog · newsletter · analytics · multi-language (Spanish
only; Valencian is a possible later addition).

---

## 14. Next steps

1. **Register `yogasana.es`** — confirmed available on 2026-09-01, and it is the only
   part of this project someone else can take. Then point DNS at GitHub Pages per §9.
2. Create the Google Sheet by importing `seed/*.csv` into the three tabs, publish each
   as CSV, verify CORS against the real URLs.
3. Request from the owner: her full legal name and the studio address for the aviso
   legal, confirmation that `yoga1` is her, and whether class durations should be shown
   (`hora_fin`).
4. Draw or source the 7 workshop icons to match the traced silhouettes' weight.
5. Scaffold Astro, tokens, layout, components.
6. Build `/clases-de-yoga` first — it exercises the Sheet pipeline, the grid, and the
   export in one page.
7. Remaining pages, legal pages, image processing.
8. Deploy to GitHub Pages; test the export on the owner's actual phone.

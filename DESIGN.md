# Design Brief

## Direction

Slate Ledger — a calm, precision light-mode operations console for cross-border daigou order tracking, built on deep space blue and cool gray.

## Tone

Restrained modern productivity software: dense information, zero decoration, every pixel earning its place.

## Differentiation

Money is the protagonist — every figure is tabular-numeral aligned, profit reads in muted emerald, and a single deep-slate accent rail ties the whole ledger together.

## Color Palette

| Token      | OKLCH             | Role                                      |
| ---------- | ----------------- | ----------------------------------------- |
| background | 0.972 0.004 250   | Cool light-gray page canvas               |
| foreground | 0.255 0.028 253   | Slate ink for all body text               |
| card       | 1 0 0             | Pure white elevated surfaces              |
| primary    | 0.322 0.041 254   | Deep space blue #1E293B — buttons, header |
| accent     | 0.945 0.018 250   | Soft slate wash for active/selected rows  |
| muted      | 0.958 0.006 250   | Table headers, filter chips, footers      |
| success    | 0.56 0.108 163    | Net profit, 已签收/已结款 badges          |
| warning    | 0.72 0.135 70     | 国际运输中 badge, invalid-rate hint       |
| info       | 0.55 0.115 245    | 已采购 badge                              |

## Typography

- Display: Space Grotesk — app title, page headings, KPI values, card titles
- Body: Figtree — table cells, labels, forms, buttons, Chinese UI text
- Mono: JetBrains Mono — exchange rate value, foreign currency figures
- Scale: page title `text-2xl md:text-3xl font-bold tracking-tight`, KPI value `text-3xl font-semibold text-numeric`, section label `text-xs font-semibold tracking-widest uppercase text-muted-foreground`, body `text-sm`

## Elevation & Depth

White cards on a cool gray canvas separated by hairline borders and a two-step shadow ladder (`shadow-subtle` default, `shadow-elevated` for modals/popovers); no glow, no gradients beyond a 2% vertical card sheen.

## Structural Zones

| Zone    | Background          | Border                   | Notes                                          |
| ------- | ------------------- | ------------------------ | ---------------------------------------------- |
| Header  | `bg-card`           | `border-b border-border` | Sticky, logo mark + 汇率 pill + avatar         |
| Content | `bg-background`     | —                        | KPI row, then white table card with 24px gaps  |
| Footer  | `bg-muted/40`       | `border-t border-border` | Copyright + last-updated rate, small muted text |

## Spacing & Rhythm

Page padding 24–32px, 16px gap between KPI cards, 24px between major blocks, 12–14px table cell padding; group filters and search in one 12px-radius toolbar above the table.

## Component Patterns

- Buttons: 8px radius; primary = deep slate gradient with white text, secondary = white with border, destructive = outline red on hover only; 0.22s transition
- Cards: 12px radius, white, 1px border, `shadow-subtle`; KPI cards carry a 2px left accent bar in status color
- Badges: full pill, tinted background at 12% + solid text of the status hue, 11px semibold
- Inputs: 8px radius, white, `border-input`, focus ring `ring-2 ring-ring/30`

## Motion

- Entrance: KPI cards and table rows `animate-fade-in-up` staggered 40ms
- Hover: table rows `bg-accent/60`, action icons reveal at full opacity, 0.22s
- Decorative: `animate-value-flash` on KPI numbers after any data mutation

## Constraints

- Light mode only; all text ≥ 4.5:1 contrast on its surface
- All money uses `text-numeric` with ¥ prefix, two decimals, thousands separators
- Never use raw hex or arbitrary color classes — semantic tokens only

## Signature Detail

A thin vertical status rail on each table row's left edge, colored by order stage, turning the table into a scannable pipeline.

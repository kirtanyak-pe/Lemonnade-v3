# Chart

> Price charts — candles, line or area — and a small sparkline for lists.

- Group: Data display
- Lifecycle: done
- Status: Figma synced
- Version: 1.0.0
- Figma: https://www.figma.com/design/lxQ6QIXGOv5mmx0khh5sJn/?node-id=5386-678
- Source: `src/components/Chart`
- Also called: Graph, candlestick, price chart, line chart, area chart, sparkline, trend line

## Import

```tsx
import { Chart, Sparkline } from './components/Chart' // path relative to src/
```

## Overview

### Which chart

**Candle** for trading views (asset page, Scalp Pro). **Line** for simple price history. **Area** for portfolio value or P&L over time. **Sparkline** is a tiny trend line for watchlist and holdings rows — always next to the price and % change as text.

### Keep the trend honest

Up is green and down is red, from the first to the last price. In mockups, pick the Trend that matches the change shown on the screen — a falling price uses Trend = Down. Hide volume, grid, axes or the last-price tag when the space is small.

Pass `data` (open, high, low, close, volume); `trend` defaults to first vs last close. The SVG is a 360×200 viewBox that scales to its container, with a text summary for screen readers.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `{ open, high, low, close, volume? }[]` |  | Oldest first. Line and Area use close. |
| `type` | `'candle' \| 'line' \| 'area'` | `'candle'` | Figma Type. |
| `trend` | `'up' \| 'down'` |  | Figma Trend; defaults to first vs last close. |
| `timeLabels` | `string[]` |  | Spread along the x axis. |
| `showVolume · showGrid · showAxes · showLastPrice` | `boolean` | `true` | Figma 👁️ toggles. |
| `format` | `(value) => string` |  | Axis and last-price formatting. |
| `label` | `string` |  | What the chart shows; read with the trend and range. Required. |
| `Sparkline` | `{ data: number[]; trend?; label? }` |  | Figma L3: Sparkline, 64×24. Decorative unless label is set. |

## Tokens used

- `surface/accent/indicator/up · down -default (candles)`
- `surface/accent/indicator/* -light (volume, area)`
- `gradient-stop-0/accent/indicator/* -light (area fade)`
- `border/accent/indicator/* -default (line)`
- `border/light (grid) · border/intense (price line)`
- `surface/inverted + content/inverted (last price)`
- `Description/10 · Label/10`

## Recent changes

- **1.0.0** (2026-10-09) New component: Chart: Candle, Line and Area price charts with a price axis, time labels, grid, volume and a last-price tag; and Sparkline, a small trend line for lists. Green up, red down. New Figma components L3: Chart (Type × Trend, 👁️ Volume · Grid · Axes · Last price, ✏️ Last price) and L3: Sparkline (Trend). SVG, 360×200 viewBox scaling to the container; role="img" with a trend + range summary.

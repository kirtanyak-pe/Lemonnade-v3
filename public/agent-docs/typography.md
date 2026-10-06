# Typography

> Manrope in three roles — Heading (750), Label (650) and Description (500) — 20 text styles, each a single font token.

- Group: Foundations
- Lifecycle: wip
- Version: 3.0.1

## Recent changes

- **3.0.1** (2026-10-06) Figma variable names: Figma weight variables renamed to L3/typography/base/weight/heading · label · description (750 · 650 · 500). No visual change.
- **3.0.0** (2026-10-05) Three roles: Five roles merged into three: Heading (weight 750, sizes 10–36), Label (650, 10–18) and Description (500, 10–18, with paragraph spacing). Tokens renamed: --l3-text-heading-*, --l3-text-label-*, --l3-text-description-*. Heading primary/secondary and the Section style merge into Heading; Label secondary uses move to Description. Manrope is loaded as a variable font (200–800) so 750 and 650 render. Figma styles still to be updated to these weights.
- **2.0.0** (2026-10-04) Typography from Figma roles: Synced with Figma "🅰️ Typography": base variables (size, line height, weight, paragraph spacing) and 34 role styles. Tokens are named after the Figma styles: --l3-text-heading-primary-*, heading-secondary-* (+ section), label-primary-*, label-secondary-*, description-* (with paragraph spacing). Removed the weight-named tokens (--l3-text-semibold-12 …), Regular, and the Display / Paragraph roles — Heading primary replaces Display, Description replaces Paragraph. Every component and docs page migrated.

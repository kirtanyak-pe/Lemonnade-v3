#!/usr/bin/env bash
# Publishes the docs site to the public repo kirtanyak-pe/lemonnade-v3-docs (GitHub Pages).
# Only the built site is pushed; this source repo stays private.
# Usage: npm run deploy:docs
set -euo pipefail

DOCS_REPO="https://github.com/kirtanyak-pe/lemonnade-v3-docs.git"
SITE_URL="https://kirtanyak-pe.github.io/lemonnade-v3-docs/"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$(mktemp -d)"
trap 'rm -rf "$OUT"' EXIT

cd "$ROOT"
PAGES_BASE=/lemonnade-v3-docs/ npm run build

# Never publish source maps: they would expose the original source.
if find dist -name '*.map' | grep -q .; then
  echo "Source maps found in dist/ — refusing to publish." >&2
  exit 1
fi

cp -R dist/. "$OUT"
touch "$OUT/.nojekyll"
printf '# Lemonnade V3 docs\n\nBuilt docs site for the L3 design system, published at %s\n\nThis repo only holds the compiled site. The source is private.\n' "$SITE_URL" > "$OUT/README.md"

cd "$OUT"
git init -q -b main
git add -A
git -c user.name="$(git -C "$ROOT" config user.name)" -c user.email="$(git -C "$ROOT" config user.email)" \
  commit -q -m "Deploy docs site ($(git -C "$ROOT" rev-parse --short HEAD))"
git push -q -f "$DOCS_REPO" main

echo "Deployed. Live in about a minute at $SITE_URL"

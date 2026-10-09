// Development-only checks (console warnings when a component is misused) run outside production builds.
// `process.env.NODE_ENV` is replaced at build time by every common bundler — Vite, webpack, Next.js, Rspack, esbuild,
// Parcel — so this works in any React app (Vite's `import.meta.env` would crash elsewhere). Declared here so the
// components don't need Node's types.
declare const process: { env: { NODE_ENV?: string } }

export const isDev = process.env.NODE_ENV !== 'production'

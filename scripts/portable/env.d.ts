// What a typical React app (Next.js, webpack, Create React App) declares for CSS Modules — and nothing Vite-specific,
// so the portability check type-checks the components the way an app that copies them would.
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
declare module '*.css'

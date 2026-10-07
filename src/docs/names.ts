/**
 * How the docs site writes a variable or style name: parts joined with "-" (surface-secondary, spacing-16,
 * heading-16). Figma uses "/" only to group names in its panels; the site never shows it.
 */
export function docName(name: string): string {
  const style = /^(?:L3\/)?(Heading|Label|Description)\/(.+)$/.exec(name)
  if (style) return `${style[1].toLowerCase()}-${style[2]}`.replaceAll('/', '-')
  return name.replaceAll('/', '-')
}

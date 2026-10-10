// Types for compile.js (the local half of the L3 kit) — used by scripts/figma/kit.ts.
export type PlanNode = string | [string, Record<string, unknown> | 0, PlanNode[]?]
export interface Plan {
  flow: Record<string, unknown>
  screens: PlanNode[]
  names: string[]
  used: { el: Set<string>; comp: Set<string>; icons: Set<string>; styles: Set<string> }
  errors: string[]
  warnings: string[]
  fixes: string[]
}
export interface Compiler {
  parse(src: string): unknown[]
  lint(src: string | unknown[]): { screens: unknown[]; errors: string[]; warnings: string[]; fixes: string[] }
  plan(src: string, opts?: { only?: string[] }): Plan
  toJsx(node: PlanNode, indent?: string): string
  EL: Record<string, { b?: number; c?: string[]; e?: Record<string, string[]> }>
}
export function createCompiler(): Compiler

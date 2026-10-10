// L3 kit CLI — the local half of "write JSX, get L3 screens in Figma" (docs/agent/GENERATE.md).
//
//   node scripts/kit.mjs build <flow.jsx> --parent <page|section id> [--only "A,B"] [--snap 0.5|false] [--no-check]
//        lint → compile → bundle only the runtime parts this flow uses → <flow>.figma.js (one or more files, each
//        < 50,000 characters). Paste each file as the `code` of one use_figma call, in order.
//   node scripts/kit.mjs lint <flow.jsx>      rules only (no files)
//   node scripts/kit.mjs icons <query>        icon names in the 👁️ Lemonnade V3 → Icons index
//   node scripts/kit.mjs outline <id|url> …   read-only intake: old screens → compact text outline (for redesigns)
//   node scripts/kit.mjs jsx <spec.json>      turn a screen spec stored in Figma (l3kit/spec) back into JSX
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createCompiler } from './compile.js';
// Runs from the repo (scripts/figma/kit.ts) or from the standalone skill (scripts/kit.mjs + data/ + runtime files)
const selfDir = dirname(fileURLToPath(import.meta.url));
const skill = existsSync(join(selfDir, '..', 'data', 'figma-library.json'));
const root = skill ? join(selfDir, '..') : join(selfDir, '..', '..');
const FILE = skill
    ? { lib: 'data/figma-library.json', map: 'data/colors.json', icons: 'data/icons.json', runtime: 'scripts/runtime.js', compile: 'scripts/compile.js', outline: 'scripts/outline.js', doc: 'SKILL.md', examples: 'examples' }
    : { lib: 'docs/migration/figma-library.json', map: 'docs/migration/d2-to-l3.json', icons: 'docs/agent/icons.json', runtime: 'scripts/figma/kit/runtime.js', compile: 'scripts/figma/kit/compile.js', outline: 'scripts/figma/kit/outline.js', doc: 'docs/agent/GENERATE.md', examples: 'scripts/figma/kit/examples' };
const read = (k) => readFileSync(join(root, FILE[k]), 'utf8');
const lib = JSON.parse(read('lib'));
const map = JSON.parse(read('map'));
const icons = JSON.parse(read('icons')).icons;
const runtime = read('runtime');
let minifySync = null;
try {
    minifySync = (await import('rolldown/experimental')).minifySync;
}
catch {
    minifySync = null;
}
const strip = (c) => c.split('\n').filter((l) => !/^\s*\/\//.test(l)).map((l) => l.replace(/\s+\/\/ [^'"`]*$/, '').trim()).filter(Boolean).join('\n');
const squeeze = (c) => { if (!minifySync)
    return strip(c); const m = minifySync('kit.js', c, { compress: true, mangle: false, codegen: { removeWhitespace: true } }); if (m.errors && m.errors.length)
    throw new Error('minify: ' + JSON.stringify(m.errors).slice(0, 300)); return m.code.replace(/;(?=(const|let|async function|function|RENDER\.)\b)/g, ';\n'); };
const LIMIT = 49000;
// ---- runtime regions: //#core … //#end, //#el Name uses A B … //#end ------------------------------------------------
const regions = new Map();
for (const m of runtime.matchAll(/^\/\/#(core|el ([\w]+)(?: uses ([\w ]+))?)\n([\s\S]*?)^\/\/#end/gm))
    regions.set(m[2] || 'core', { uses: (m[3] || '').split(' ').filter(Boolean), code: m[4] });
function code(els) {
    const need = new Set();
    const add = (n) => { if (need.has(n) || !regions.has(n))
        return; need.add(n); for (const u of regions.get(n).uses)
        add(u); };
    for (const e of els)
        add(e);
    if (els.has('BottomSheet'))
        add('BottomSheet');
    return [regions.get('core').code, ...[...regions.keys()].filter((k) => k !== 'core' && need.has(k)).map((k) => regions.get(k).code)].join('\n');
}
const VERSION = 'kit-' + createHash('sha1').update(runtime + read('compile')).digest('hex').slice(0, 7);
// JSON with unquoted identifier keys (shorter plans; still a plain JS literal)
function js(v) {
    if (Array.isArray(v))
        return '[' + v.map(js).join(',') + ']';
    if (v && typeof v === 'object')
        return '{' + Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ':' + js(x)).join(',') + '}';
    return JSON.stringify(v);
}
function near(x, list) {
    const d = (a, b) => { const m = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++)
        m[0][j] = j; for (let i = 1; i <= a.length; i++)
        for (let j = 1; j <= b.length; j++)
            m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return m[a.length][b.length]; };
    return list.filter((k) => k.includes(x) || x.includes(k) || d(x, k) <= 2).slice(0, 4);
}
function bundle(p, screens, opt, el) {
    // components = what the plan uses + every library component the included runtime code makes (it declares its needs)
    const src = code(el);
    const named = new Set([...src.matchAll(/'(L3[^']*)'/g)].map((m) => m[1]));
    const comps = [...new Set([...p.used.comp, ...named])], styles = [...p.used.styles].filter((s) => lib.textStyles[s]);
    const c = {};
    for (const x of lib.components)
        if (comps.includes(x.name))
            c[x.name] = x.key;
    const i = {};
    for (const n of p.used.icons)
        if (icons[n])
            i[n] = icons[n];
    const s = {};
    for (const n of styles)
        s[n] = lib.textStyles[n];
    const block = Object.entries(createCompiler().EL).filter(([, d]) => d.b).map(([n]) => n);
    const DATA = { v: VERSION, c, s, i, k: { theme: lib.collections.theme.key, number: lib.collections.number.key, density: lib.collections.density.key }, p: map.l3ColorPrefix, block };
    const body = `const DATA = ${js(DATA)};\nconst PLAN = ${js({ screens, opt })};\n${src}`;
    // Compressed but NOT mangled: every name stays readable (reviewable), one top-level statement per line (copies reliably)
    const out = squeeze(body);
    new vm.Script(`(async () => {\n${out}\nreturn await run()\n})`); // syntax check only — never run here
    return `// L3 kit ${VERSION} · ${screens.map((x) => x[1].name).join(' · ')} — paste this whole file as use_figma \`code\`\n${out}\nreturn await run()\n`;
}
// paths are relative to where the user ran npm (INIT_CWD), not the repo
const here = (f) => resolve(process.env.INIT_CWD || process.cwd(), f);
const args = process.argv.slice(2);
const cmd = args[0], file = args[1] && !args[1].startsWith('--') ? here(args[1]) : args[1];
const flag = (n) => { const k = args.indexOf('--' + n); return k < 0 ? undefined : args[k + 1]; };
const has = (n) => args.includes('--' + n);
if (cmd === 'lint' || cmd === 'build') {
    if (!file)
        throw new Error(`node scripts/kit.mjs ${cmd} <flow.jsx>`);
    const C = createCompiler();
    const only = flag('only')?.split(',').map((x) => x.trim());
    let p;
    try {
        p = C.plan(readFileSync(file, 'utf8'), { only });
    }
    catch (e) {
        console.log('✖ ' + e.message);
        process.exit(1);
    }
    for (const n of p.used.icons)
        if (!icons[n])
            p.errors.push(`icon "${n}" isn't in docs/agent/icons.json${near(n, Object.keys(icons)).length ? ' — try ' + near(n, Object.keys(icons)).join(' / ') : ''}`);
    console.log(`${p.names.length} screens · ${p.errors.length} errors · ${p.warnings.length} warnings · ${p.fixes.length} auto-fixes`);
    for (const e of p.errors)
        console.log('✖ ' + e);
    for (const w of p.warnings)
        console.log('⚠ ' + w);
    for (const f of p.fixes)
        console.log('✓ ' + f);
    if (p.errors.length && !has('force'))
        process.exit(1);
    if (cmd === 'build') {
        const parent = flag('parent') || p.flow.parent;
        if (!parent) {
            console.log('✖ pass --parent <page or section id> (or <Flow parent="…">)');
            process.exit(1);
        }
        const snap = flag('snap');
        const opt = { parent, flow: p.flow, ...(snap ? { snap: snap === 'false' ? false : Number(snap) } : {}), ...(has('no-check') ? { check: false } : {}) };
        // split into files that fit one use_figma call (a screen with base="…" stays after its base)
        const files = [];
        let batch = [];
        const flush = () => { if (!batch.length)
            return; const el = new Set(); for (const s of batch)
            JSON.stringify(s).replace(/\["([A-Z]\w*)"/g, (_, t) => { el.add(t); return ''; }); for (const e of p.used.el)
            if (/^[a-z]/.test(e))
                el.add(e); files.push(bundle(p, batch, opt, el)); batch = []; };
        for (const s of p.screens) {
            const el = new Set();
            JSON.stringify([...batch, s]).replace(/\["([A-Z]\w*)"/g, (_, t) => { el.add(t); return ''; });
            for (const e of p.used.el)
                if (/^[a-z]/.test(e))
                    el.add(e);
            if (batch.length && bundle(p, [...batch, s], opt, el).length > LIMIT)
                flush();
            batch.push(s);
        }
        flush();
        const stem = file.replace(/\.jsx?$/, '');
        const out = files.map((f, k) => { const name = files.length > 1 ? `${stem}.${k + 1}.figma.js` : `${stem}.figma.js`; writeFileSync(name, f); return { name, chars: f.length, screens: f.split('\n')[0].split(' — ')[0].split(' · ').slice(1).join(' · ') }; });
        for (const o of out)
            console.log(`→ ${basename(o.name)} · ${o.chars.toLocaleString()} chars (~${Math.round(o.chars / 3.2 / 100) / 10}k tokens) · ${o.screens}`);
        console.log(`Paste ${out.length > 1 ? 'each file, in order, as one use_figma call each' : 'the file as one use_figma call'} (fileKey of the target file). Result: screens + issues + snapshots.`);
    }
}
else if (cmd === 'outline') {
    // read-only intake for redesigns: node ids (or Figma URLs) → outline.figma.js to paste as one use_figma call
    const ids = process.argv.slice(3).filter((a) => !a.startsWith('--') && a !== flag('depth') && a !== flag('out')).map((a) => { const m = /node-id=([\d]+)[-:]([\d]+)/.exec(a); return m ? `${m[1]}:${m[2]}` : a.replace('-', ':'); });
    if (!ids.length)
        throw new Error('node scripts/kit.mjs outline <node id or URL> [...] [--depth 9]');
    const src = read('outline');
    const min = { code: squeeze(`const IDS = ${JSON.stringify(ids)};\nconst OPT = ${js({ depth: flag('depth') ? Number(flag('depth')) : undefined })};\n${src}`) };
    const out = here(flag('out') || 'outline.figma.js');
    const code = `// L3 outline ${ids.join(' ')} — paste as use_figma \`code\` (read-only)\n${min.code}\nreturn await outline()\n`;
    new vm.Script(`(async () => {\n${code}\n})`);
    writeFileSync(out, code);
    console.log(`→ ${out} · ${code.length.toLocaleString()} chars · ${ids.length} node(s). Paste it as one use_figma call; the result is a text outline per screen.`);
}
else if (cmd === 'selftest') {
    // keeps the brief, the compiler and the runtime in step: every element documented + rendered, every example clean
    const doc = read('doc');
    const C = createCompiler();
    const structural = new Set(['Flow', 'Screen', 'ActionbarAction', 'Tab', 'BottomSheetHeader', 'BottomSheet']);
    const fails = [];
    for (const el of Object.keys(C.EL)) {
        if (!doc.includes('`' + el + '`') && !doc.includes('<' + el) && !new RegExp('\\b' + el + '\\b').test(doc))
            fails.push(`GENERATE.md never mentions ${el}`);
        if (!structural.has(el) && !regions.has(el))
            fails.push(`runtime has no //#el ${el}`);
    }
    const examples = [...doc.matchAll(/```jsx\n([\s\S]*?)```/g)].map((m, k) => [`GENERATE.md example ${k + 1}`, m[1]]);
    for (const f of ['kill-switch.jsx'])
        examples.push([f, readFileSync(join(root, FILE.examples, f), 'utf8')]);
    for (const [name, jsx] of examples) {
        const c = createCompiler();
        try {
            const p = c.plan(jsx);
            for (const e of p.errors)
                fails.push(`${name}: ${e}`);
            for (const n of p.used.icons)
                if (!icons[n])
                    fails.push(`${name}: icon ${n} has no key`);
            const el = new Set();
            JSON.stringify(p.screens).replace(/\["([A-Z]\w*)"/g, (_, t) => { el.add(t); return ''; });
            for (const e of p.used.el)
                if (/^[a-z]/.test(e))
                    el.add(e);
            bundle(p, p.screens, { parent: '0:0', flow: p.flow }, el);
            console.log(`✓ ${name}: ${p.names.length} screens, ${p.warnings.length} warnings, ${p.fixes.length} fixes`);
        }
        catch (e) {
            fails.push(`${name}: ${e.message}`);
        }
    }
    for (const f of fails)
        console.log('✖ ' + f);
    console.log(fails.length ? `${fails.length} problems` : 'selftest ok');
    process.exitCode = fails.length ? 1 : 0;
}
else if (cmd === 'icons') {
    const q = (args[1] || '').toLowerCase();
    const hits = Object.entries(icons).filter(([n]) => n.includes(q));
    for (const [n] of hits.slice(0, 60))
        console.log(n);
    console.log(`${hits.length} of ${Object.keys(icons).length}. Missing? search_design_system in "👁️ Lemonnade V3 → Icons", then add the key to icons.json (${FILE.icons}).`);
}
else if (cmd === 'jsx') {
    const raw = JSON.parse(readFileSync(file, 'utf8'));
    console.log(createCompiler().toJsx(typeof raw === 'string' ? JSON.parse(raw) : raw));
}
else {
    console.log('node scripts/kit.mjs build <flow.jsx> --parent <id> | lint <flow.jsx> | icons <query> | jsx <spec.json>');
}

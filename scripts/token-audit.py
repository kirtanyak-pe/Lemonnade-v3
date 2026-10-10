#!/usr/bin/env python3
"""Token / time / rework audit of Claude Code session transcripts (docs/agent/ALGORITHM.md §1).

Usage: token_audit.py <dir-with-jsonl> [--json out.json]
Per session and per tool: API calls, input / cache / output tokens, what tool calls cost to *emit* (tool input) and to
*carry* (tool results re-read on every later call until the next compaction), images, errors, latency, and how much
use_figma code was re-sent from earlier calls.
"""
import base64
import glob
import json
import os
import re
import struct
import sys
from collections import defaultdict
from datetime import datetime

DIR = sys.argv[1]
OUT = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
CPT = 3.5  # characters per token (code / JSON heavy)
W = {'in': 1.0, 'cw5': 1.25, 'cw1h': 2.0, 'cr': 0.1, 'out': 5.0}  # price weights relative to base input


def ts(s):
    try:
        return datetime.fromisoformat(s.replace('Z', '+00:00')).timestamp()
    except Exception:
        return None


def img_tokens(b64):
    try:
        raw = base64.b64decode(b64[:200000] + '===')
        if raw[:8] == b'\x89PNG\r\n\x1a\n':
            w, h = struct.unpack('>II', raw[16:24])
        elif raw[:2] == b'\xff\xd8':
            i = 2
            w = h = 0
            while i < len(raw) - 9:
                if raw[i] != 0xFF:
                    i += 1
                    continue
                m = raw[i + 1]
                if m in (0xC0, 0xC1, 0xC2):
                    h, w = struct.unpack('>HH', raw[i + 5:i + 9])
                    break
                i += 2 + struct.unpack('>H', raw[i + 2:i + 4])[0]
        else:
            return 1600
        # the API downsizes the long edge to <= 1568 px
        s = min(1.0, 1568 / max(w, h, 1))
        return int((w * s) * (h * s) / 750)
    except Exception:
        return 1600


def size_of_result(content):
    chars, imgs, itok = 0, 0, 0
    if isinstance(content, str):
        return len(content), 0, 0
    for c in content or []:
        t = c.get('type')
        if t == 'text':
            chars += len(c.get('text', ''))
        elif t == 'image':
            imgs += 1
            itok += img_tokens((c.get('source') or {}).get('data', ''))
        elif t == 'tool_reference':
            chars += 200
        else:
            chars += len(json.dumps(c))
    return chars, imgs, itok


def short(name):
    if name.startswith('mcp__'):
        parts = name.split('__')
        return parts[-1]
    return name


def analyse(path):
    msgs = {}          # message id -> dict(usage, ts, model, tools[])
    order = []         # message ids in order
    tool_uses = {}     # tool_use id -> info
    results = []       # (ts, tool_use_id, chars, imgs, itok, is_error, text)
    compactions = []   # timestamps of compaction boundaries
    prompts = []
    first_ts = last_ts = None
    for line in open(path, encoding='utf-8', errors='replace'):
        try:
            d = json.loads(line)
        except Exception:
            continue
        t = d.get('type')
        tt = ts(d.get('timestamp', '')) if d.get('timestamp') else None
        if tt:
            first_ts = tt if first_ts is None else min(first_ts, tt)
            last_ts = tt if last_ts is None else max(last_ts, tt)
        if t == 'system' and d.get('subtype') == 'compact_boundary':
            compactions.append(tt)
        if t == 'assistant':
            m = d.get('message') or {}
            mid = m.get('id') or d.get('uuid')
            if mid not in msgs:
                msgs[mid] = {'usage': {}, 'ts': tt, 'model': m.get('model'), 'tools': [], 'text': 0}
                order.append(mid)
            u = m.get('usage') or {}
            if u:
                msgs[mid]['usage'] = u
            for c in m.get('content') or []:
                if c.get('type') == 'tool_use':
                    inp = c.get('input') or {}
                    js = json.dumps(inp, ensure_ascii=False)
                    code = inp.get('code') if isinstance(inp.get('code'), str) else None
                    tool_uses[c['id']] = {'name': c.get('name', ''), 'ts': tt, 'in_chars': len(js), 'code': code,
                                          'mid': mid, 'desc': inp.get('description', '') if isinstance(inp.get('description'), str) else ''}
                    msgs[mid]['tools'].append(c['id'])
                elif c.get('type') == 'text':
                    msgs[mid]['text'] += len(c.get('text', ''))
        elif t == 'user':
            m = d.get('message') or {}
            content = m.get('content')
            if isinstance(content, list) and any(c.get('type') == 'tool_result' for c in content):
                for c in content:
                    if c.get('type') == 'tool_result':
                        ch, im, itok = size_of_result(c.get('content'))
                        txt = c.get('content') if isinstance(c.get('content'), str) else ' '.join(
                            x.get('text', '') for x in (c.get('content') or []) if x.get('type') == 'text')
                        results.append((tt, c.get('tool_use_id'), ch, im, itok, bool(c.get('is_error')), txt[:300]))
            elif d.get('origin', {}).get('kind') == 'human' or (d.get('promptSource') and not d.get('isMeta')):
                if not d.get('isCompactSummary') and not d.get('isMeta'):
                    prompts.append(tt)

    # per-call usage
    tot = defaultdict(float)
    calls = []
    for mid in order:
        u = msgs[mid]['usage']
        if not u:
            continue
        cc = u.get('cache_creation') or {}
        cw1h = cc.get('ephemeral_1h_input_tokens', 0) or 0
        cw5 = (u.get('cache_creation_input_tokens', 0) or 0) - cw1h
        rec = {'ts': msgs[mid]['ts'], 'in': u.get('input_tokens', 0) or 0, 'cw5': max(cw5, 0), 'cw1h': cw1h,
               'cr': u.get('cache_read_input_tokens', 0) or 0, 'out': u.get('output_tokens', 0) or 0,
               'think': ((u.get('output_tokens_details') or {}).get('thinking_tokens', 0) or 0), 'model': msgs[mid]['model']}
        rec['ctx'] = rec['in'] + rec['cw5'] + rec['cw1h'] + rec['cr']
        calls.append(rec)
        for k in ('in', 'cw5', 'cw1h', 'cr', 'out', 'think'):
            tot[k] += rec[k]
    tot['cost'] = sum(tot[k] * W[k] for k in W)
    tot['calls'] = len(calls)

    # how many later API calls re-read a block added at time t (until the next compaction)
    call_ts = sorted(c['ts'] for c in calls if c['ts'])
    comp = sorted(c for c in compactions if c)

    def carried(t0):
        if t0 is None:
            return 0
        nxt = next((c for c in comp if c > t0), None)
        return sum(1 for c in call_ts if c > t0 and (nxt is None or c < nxt))

    per = defaultdict(lambda: defaultdict(float))
    errors = defaultdict(list)
    for (tt, tid, ch, im, itok, err, txt) in results:
        tu = tool_uses.get(tid)
        if not tu:
            continue
        n = short(tu['name'])
        p = per[n]
        p['calls'] += 1
        p['emit_tok'] += tu['in_chars'] / CPT
        rtok = ch / CPT + itok
        p['result_tok'] += rtok
        p['imgs'] += im
        p['img_tok'] += itok
        k = carried(tt)
        p['carry_tok'] += (rtok + tu['in_chars'] / CPT) * k  # re-read as cache reads
        if err:
            p['errors'] += 1
            errors[n].append(txt.strip().split('\n')[0][:160])
        if tu['ts'] and tt:
            p['secs'] += max(0, tt - tu['ts'])
    # use_figma code reuse: share of lines already sent in an earlier call
    seen_lines = set()
    sent = resent = 0
    figma_sizes = []
    for tid, tu in tool_uses.items():
        if tu['code'] is None:
            continue
        lines = [l.strip() for l in tu['code'].split('\n') if len(l.strip()) > 25]
        figma_sizes.append(len(tu['code']))
        for l in lines:
            sent += len(l)
            if l in seen_lines:
                resent += len(l)
            seen_lines.add(l)
    # model generation time = gap between the previous event and an assistant message (rough)
    return {
        'session': os.path.basename(path)[:8], 'bytes': os.path.getsize(path), 'prompts': len(prompts),
        'hours': round(((last_ts or 0) - (first_ts or 0)) / 3600, 1), 'compactions': len(comp), 'tot': dict(tot),
        'peak_ctx': max((c['ctx'] for c in calls), default=0),
        'tools': {k: dict(v) for k, v in per.items()}, 'errors': {k: v for k, v in errors.items()},
        'figma_code': {'n': len(figma_sizes), 'chars': sum(figma_sizes), 'max': max(figma_sizes, default=0),
                       'resent_share': round(resent / sent, 3) if sent else 0},
        'models': sorted({c['model'] for c in calls if c['model']}),
    }


def main():
    files = sorted(glob.glob(os.path.join(DIR, '*.jsonl')), key=os.path.getsize, reverse=True)
    subs = glob.glob(os.path.join(DIR, '*', 'subagents', '*.jsonl'))
    out = {'sessions': [analyse(f) for f in files], 'subagents': [analyse(f) for f in subs]}
    if OUT:
        json.dump(out, open(OUT, 'w'), indent=1)
    agg = defaultdict(lambda: defaultdict(float))
    T = defaultdict(float)
    print(f"{'session':9} {'MB':>5} {'hrs':>5} {'prm':>4} {'calls':>5} {'out k':>7} {'think k':>7} {'cr M':>7} {'cw M':>6} {'cost M':>7} {'peak k':>6} {'figma':>5} {'resent':>6}")
    for s in out['sessions'] + out['subagents']:
        t = s['tot']
        print(f"{s['session']:9} {s['bytes']/1e6:5.1f} {s['hours']:5.1f} {s['prompts']:4} {int(t.get('calls',0)):5} "
              f"{t.get('out',0)/1e3:7.0f} {t.get('think',0)/1e3:7.0f} {t.get('cr',0)/1e6:7.1f} {(t.get('cw5',0)+t.get('cw1h',0))/1e6:6.2f} "
              f"{t.get('cost',0)/1e6:7.1f} {s['peak_ctx']/1e3:6.0f} {s['figma_code']['n']:5} {s['figma_code']['resent_share']:6.2f}")
        for k, v in t.items():
            T[k] += v
        for n, p in s['tools'].items():
            for k, v in p.items():
                agg[n][k] += v
    print('\nTOTAL', {k: round(v / 1e6, 2) for k, v in T.items()}, '(millions)')
    print(f"\n{'tool':28} {'calls':>6} {'emit k':>8} {'result k':>9} {'img':>5} {'carry M':>8} {'err':>5} {'mins':>6}")
    for n, p in sorted(agg.items(), key=lambda kv: -(kv[1]['carry_tok'] * W['cr'] + kv[1]['emit_tok'] * W['out'] + kv[1]['result_tok'] * 1.25)):
        print(f"{n[:28]:28} {int(p['calls']):6} {p['emit_tok']/1e3:8.0f} {p['result_tok']/1e3:9.0f} {int(p['imgs']):5} {p['carry_tok']/1e6:8.1f} {int(p['errors']):5} {p['secs']/60:6.0f}")


main()

// Batch verify all zh pages on dev server: HTTP 200 + Chinese not garbled
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const base = 'http://localhost:5173/hengyuan-cosmos/zh/';
const docs = 'C:/Users/Administrator/Doubao/chats/2026-09-14/new-chat/site/docs/zh';
const KWS = ['衡元宙', '锚点', '共生'];

const files = (await readdir(docs)).filter(f => f.endsWith('.md')).sort();
const urls = files.map(f => base + encodeURIComponent(f.slice(0, -3)));

const concurrency = 24;
let next = 0;
const fails = [];
const garbled = [];
let ok = 0;

async function worker() {
  while (true) {
    const i = next++;
    if (i >= urls.length) return;
    const u = urls[i];
    try {
      const resp = await fetch(u, { signal: AbortSignal.timeout(30000) });
      if (!resp.ok) { fails.push(`${files[i]} [${resp.status}]`); continue; }
      const text = await resp.text();
      const hasCn = KWS.some(k => text.includes(k));
      if (hasCn) ok++; else garbled.push(`${files[i]} [no-cn-keyword]`);
    } catch (e) {
      fails.push(`${files[i]} [ERR]`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`=== DONE: total=${files.length} ok=${ok} fail=${fails.length} garbled=${garbled.length} ===`);
console.log('=== FAIL LIST ===');
fails.sort().slice(0, 40).forEach(f => console.log(f));
console.log('=== GARBLED LIST ===');
garbled.sort().slice(0, 20).forEach(f => console.log(f));

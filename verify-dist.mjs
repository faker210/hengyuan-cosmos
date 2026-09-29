// Verify built dist: zh page count, Chinese-not-garbled, .html links present
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dist = 'C:/Users/Administrator/Doubao/chats/2026-09-14/new-chat/site/docs/.vitepress/dist';
const zh = join(dist, 'zh');
const KWS = ['衡元宙', '锚点', '共生'];

const files = (await readdir(zh)).filter(f => f.endsWith('.html'));
console.log(`zh html 页面数: ${files.length}`);

let bad = 0, ok = 0, noLink = 0, sampleLink = '';
const CONC = 32;
let next = 0;
const badList = [];

async function worker() {
  while (true) {
    const i = next++;
    if (i >= files.length) return;
    const f = files[i];
    try {
      const text = await readFile(join(zh, f), 'utf8');
      const hasCn = KWS.some(k => text.includes(k));
      if (!hasCn) { badList.push(f); bad++; continue; }
      // check sidebar .html links
      if (!text.includes('/hengyuan-cosmos/zh/') || !text.includes('.html')) {
        noLink++;
        if (!sampleLink) sampleLink = f;
      }
      ok++;
    } catch (e) { badList.push(f + ' [read-err]'); bad++; }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
console.log(`内容含中文关键词: ${ok} / 无关键词或异常: ${bad}`);
if (badList.length) console.log('异常文件样例: ' + badList.slice(0, 10).join('; '));
console.log(`未见.html链接页面数: ${noLink} ${sampleLink ? '(样例: ' + sampleLink + ')' : ''}`);

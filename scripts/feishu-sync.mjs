/**
 * 飞书知识库同步脚本
 * 用法: npm run sync
 *
 * 功能: 从飞书主文档拉取大纲，检测 revision 变更，记录同步日志。
 *       只读飞书，不修改飞书内容；不写词条正文。
 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const FEISHU_DOC_URL = 'https://my.feishu.cn/docx/JmsGd4nYco7bE3xDWSfcGdLKnSb'

console.log('=== 飞书知识库同步检查 ===\n')

let outlineJson
try {
  outlineJson = execSync(
    `lark-cli docs +fetch --doc "${FEISHU_DOC_URL}" --scope outline --max-depth 2 --as user --format json`,
    { encoding: 'utf-8', timeout: 60000 }
  )
} catch (err) {
  console.error('❌ 无法拉取飞书文档:', err.message)
  process.exit(1)
}

const outline = JSON.parse(outlineJson)
const revision = outline.data.document.revision_id
const content = outline.data.document.content
const headings = [...content.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>/g)].map((m) => m[1].trim())

console.log(`飞书文档 revision: ${revision}`)
console.log(`检测到 ${headings.length} 个章节`)
headings.slice(0, 10).forEach((h) => console.log(`  - ${h}`))

// 写同步日志
const logDir = path.join(repoRoot, 'logs')
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
const entry = {
  timestamp: new Date().toISOString(),
  feishu_revision: revision,
  sections: headings.length,
  status: 'checked',
}
const logPath = path.join(logDir, `sync-${Date.now()}.json`)
fs.writeFileSync(logPath, JSON.stringify(entry, null, 2), 'utf-8')
console.log(`\n✅ 同步日志: ${logPath}`)
console.log('下一步: npm run validate && npm run build && git push')

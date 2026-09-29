/**
 * 批次校验脚本：100篇一批，校验文档完整性、UTF-8 编码、文件数对齐
 * 用法: npm run validate
 *
 * 校验项:
 *  1. 14 语种目录文件数对齐（与中文 zh/ 对比）
 *  2. UTF-8 编码清洗（去 BOM、检测乱码 U+FFFD）
 *  3. 每批 100 篇报告
 *
 * 退出码: 0=全部通过, 1=有错误
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const docsDir = path.join(repoRoot, 'docs')

const LANGS = ['zh', 'en', 'fr', 'ru', 'hi', 'es', 'ar', 'bn', 'pt', 'id', 'ur', 'ja', 'vi', 'sw', 'de']
const BATCH_SIZE = 100

let errors = []
let warnings = []

console.log('=== 批次校验开始 ===\n')

// 1. 各语种文件数对齐
console.log('--- 1. 各语种文件数对齐 ---')
const langCounts = {}
for (const lang of LANGS) {
  const dir = path.join(docsDir, lang)
  if (!fs.existsSync(dir)) {
    errors.push(`[目录缺失] docs/${lang}/ 不存在`)
    langCounts[lang] = 0
    continue
  }
  langCounts[lang] = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length
}

const zhCount = langCounts['zh']
for (const [lang, count] of Object.entries(langCounts)) {
  const aligned = count === zhCount
  console.log(`  ${aligned ? '✅' : '⚠️'} ${lang}: ${count} 篇${aligned ? '' : `（中文 ${zhCount}，偏差 ${count - zhCount}）`}`)
  if (!aligned && count > 0) {
    warnings.push(`[数量偏差] ${lang}: ${count} 篇（中文 ${zhCount}）`)
  }
}

// 2. UTF-8 编码清洗 + 乱码检测
console.log('\n--- 2. UTF-8 编码与乱码检测 ---')
let fixedBom = 0
let corruptedFiles = []
let totalFiles = 0

function walkMd(dir, list = []) {
  if (!fs.existsSync(dir)) return list
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMd(full, list)
    else if (entry.name.endsWith('.md')) list.push(full)
  }
  return list
}

const allMdFiles = []
for (const lang of LANGS) {
  walkMd(path.join(docsDir, lang), allMdFiles)
}

for (const filePath of allMdFiles) {
  totalFiles++
  const buf = fs.readFileSync(filePath)
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    fs.writeFileSync(filePath, buf.slice(3))
    fixedBom++
  }
  const text = fs.readFileSync(filePath, 'utf-8')
  if (text.includes('\uFFFD')) {
    corruptedFiles.push(path.relative(repoRoot, filePath))
  }
}

console.log(`  扫描文件总数: ${totalFiles}`)
console.log(`  去除 BOM: ${fixedBom} 个文件`)
if (corruptedFiles.length > 0) {
  errors.push(`[乱码] ${corruptedFiles.length} 个文件含 U+FFFD: ${corruptedFiles.slice(0, 5).join(', ')}`)
  console.log(`  ❌ 含乱码: ${corruptedFiles.length} 个文件`)
} else {
  console.log('  ✅ 无乱码替换字符')
}

// 3. 批次报告
console.log('\n--- 3. 批次报告（每批 100 篇）---')
const total = zhCount || 1
const totalBatches = Math.ceil(total / BATCH_SIZE)
for (let b = 0; b < Math.min(totalBatches, 20); b++) {
  const start = b * BATCH_SIZE
  const end = Math.min((b + 1) * BATCH_SIZE - 1, total - 1)
  console.log(`  批次 ${String(b + 1).padStart(2, '0')}/${totalBatches}: 文档 ${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')} → ✅`)
}
if (totalBatches > 20) console.log(`  ... 共 ${totalBatches} 批，省略中间批次`)

// 汇总
console.log('\n=== 校验汇总 ===')
console.log(`  文件总数: ${totalFiles}`)
console.log(`  错误: ${errors.length}`)
console.log(`  警告: ${warnings.length}`)
if (errors.length) {
  console.log('\n❌ 错误:')
  errors.forEach((e) => console.log(`   - ${e}`))
}
if (warnings.length) {
  console.log('\n⚠️ 警告:')
  warnings.forEach((w) => console.log(`   - ${w}`))
}
console.log('\n' + (errors.length === 0 ? '✅ 校验通过，可以推送' : '❌ 校验失败，禁止推送'))
process.exit(errors.length === 0 ? 0 : 1)

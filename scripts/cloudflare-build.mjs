/**
 * Cloudflare Pages 构建脚本
 * 构建命令: npm run build
 * 输出目录: dist/
 */
import { execSync } from 'node:child_process'
import { rmSync, existsSync } from 'node:fs'
import path from 'node:path'

const repoRoot = process.cwd()

for (const d of ['dist', 'docs/.vitepress/dist', '.vitepress/cache']) {
  const p = path.join(repoRoot, d)
  if (existsSync(p)) rmSync(p, { recursive: true, force: true })
}

process.env.VP_OUTDIR = 'dist'
process.env.VP_BASE = '/'
// 15120 页面需要更大堆内存（Cloudflare Pages 默认 4GB，本地给 8GB）
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS || '--max-old-space-size=8192'

console.log('=== Cloudflare Pages 构建 ===')
console.log('VP_OUTDIR    =', process.env.VP_OUTDIR)
console.log('VP_BASE      =', process.env.VP_BASE)
console.log('NODE_OPTIONS =', process.env.NODE_OPTIONS)
console.log('')

try {
  execSync('npx vitepress build docs', {
    stdio: 'inherit',
    env: process.env,
  })
  console.log('\n✅ 构建完成：dist/ 已生成')
} catch (err) {
  console.error('❌ 构建失败:', err.message)
  process.exit(1)
}

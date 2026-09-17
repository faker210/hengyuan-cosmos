import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'ru', label: 'Русский' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'es', label: 'Español' },
  { code: 'ar', label: 'العربية' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'pt', label: 'Português' },
  { code: 'id', label: 'Indonesia' },
  { code: 'ur', label: 'اردو' },
  { code: 'ja', label: '日本語' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'de', label: 'Deutsch' },
]

// ── 中文分组 ──────────────────────────────────────────
const zhBaseGroups: Array<{ min: number; max: number; title: string }> = [
  { min: 0,  max: 9,  title: '总纲与核心设定' },
  { min: 10, max: 19, title: '修炼体系' },
  { min: 20, max: 29, title: '锚点与共生机制' },
  { min: 30, max: 39, title: '文明分型与社会' },
  { min: 40, max: 49, title: '律法与治理' },
  { min: 50, max: 59, title: '万族与奇异存在' },
  { min: 60, max: 69, title: '技术体系' },
  { min: 70, max: 79, title: '纪元编年' },
  { min: 80, max: 89, title: '位面与时间规则' },
  { min: 90, max: 99, title: '索引与附录' },
]

const zhModuleGroups: Array<{ min: number; max: number; title: string; index: string }> = [
  { min: 100, max: 250, title: '境界深度细化', index: '模块一-境界深度细化索引' },
  { min: 251, max: 500, title: '诸天名著对标批判', index: '模块二-诸天名著对标批判索引' },
  { min: 501, max: 700, title: '双轨时间域文明体验', index: '模块三-双轨时间域文明体验索引' },
  { min: 701, max: 900, title: '超多元超脱正统定义', index: '模块四-超多元超脱正统定义索引' },
  { min: 901, max: 1000, title: '文明终极定型典藏', index: '模块五-文明终极定型典藏索引' },
]

// ── 非中文通用分组（英文标题，适用于 en 及其他 13 语种）──
const intlBaseGroups: Array<{ min: number; max: number; title: string }> = [
  { min: 0,  max: 9,  title: 'General Principles & Core Settings' },
  { min: 10, max: 19, title: 'Cultivation Systems' },
  { min: 20, max: 29, title: 'Anchor & Symbiosis Mechanisms' },
  { min: 30, max: 39, title: 'Civilization Types & Society' },
  { min: 40, max: 49, title: 'Law & Governance' },
  { min: 50, max: 59, title: 'Myriad Races & Strange Beings' },
  { min: 60, max: 69, title: 'Technology Systems' },
  { min: 70, max: 79, title: 'Chronicle & Eras' },
  { min: 80, max: 89, title: 'Planes & Time Rules' },
  { min: 90, max: 99, title: 'Index & Appendix' },
]

const intlModuleGroups: Array<{ min: number; max: number; title: string; index: string }> = [
  { min: 100, max: 250, title: 'Deep Realm Refinement', index: '模块一-境界深度细化索引' },
  { min: 251, max: 500, title: 'Cross-Universe Classic Critique', index: '模块二-诸天名著对标批判索引' },
  { min: 501, max: 700, title: 'Dual-Track Time Domain Civilization', index: '模块三-双轨时间域文明体验索引' },
  { min: 701, max: 900, title: 'Trans-Multiverse Transcendence Orthodoxy', index: '模块四-超多元超脱正统定义索引' },
  { min: 901, max: 1000, title: 'Ultimate Civilization Compendium', index: '模块五-文明终极定型典藏索引' },
]

// ── 侧边栏构建（支持全部语种，自动扫描 docs/<lang>/ 目录）──
function buildSidebar(lang: string) {
  const dir = path.resolve('docs', lang)
  if (!fs.existsSync(dir)) return []

  const isZh = lang === 'zh'
  const baseGroups = isZh ? zhBaseGroups : intlBaseGroups
  const moduleGroups = isZh ? zhModuleGroups : intlModuleGroups

  const files = fs
    .readdirSync(dir)
    .filter((f) => /^(\d{4}-|\d{4}_).+\.md$/.test(f))
    .sort()

  const groups: any[] = []

  // 基础篇 0–99：展开为文档列表
  for (const g of baseGroups) {
    const items = files
      .filter((f) => {
        const n = parseInt(f.match(/^\d+/)[0], 10)
        return n >= g.min && n <= g.max
      })
      .map((f) => {
        const name = f.replace(/\.md$/, '')
        const text = name.replace(/^\d{4}[_-]/, '')
        return { text, link: `/${lang}/${name}.html` }
      })
    if (!items.length) continue
    groups.push({
      text: isZh
        ? `${g.title}（${g.min.toString().padStart(4, '0')}–${g.max}）`
        : `${g.title} (${g.min.toString().padStart(4, '0')}–${g.max.toString().padStart(4, '0')})`,
      collapsed: false,
      items,
    })
  }

  // 模块篇 100–1000：折叠为模块索引入口（非中文即使文档少也显示入口）
  for (const g of moduleGroups) {
    const count = files.filter((f) => {
      const n = parseInt(f.match(/^\d+/)[0], 10)
      return n >= g.min && n <= g.max
    }).length
    if (!count && isZh) continue
    const label = isZh
      ? `共 ${count} 篇 · 打开模块索引 →`
      : `${count > 0 ? count + ' translated · ' : ''}Open module index →`
    groups.push({
      text: isZh
        ? `${g.title}（${g.min}–${g.max}）`
        : `${g.title} (${g.min}–${g.max})`,
      collapsed: true,
      items: [{ text: label, link: `/${lang}/${g.index}.html` }],
    })
  }

  return groups
}

// ── 导航菜单 ──────────────────────────────────────────
const zhNav = [
  { text: '首页', link: '/zh/' },
  { text: '术语表', link: '/glossary.html' },
  { text: '宪章律法', link: '/constitution/' },
  { text: '诸天推演', link: '/multiverse/' },
  { text: '路线沙盘', link: '/sandbox/' },
  {
    text: '🌐 语言',
    items: languages.map((l) => ({ text: l.label, link: `/${l.code}/` })),
  },
]

// ── 为指定语种生成导航菜单 ────────────────────────────
function buildNav(lang: string) {
  const isZh = lang === 'zh'
  const homeLink = isZh ? '/zh/' : `/${lang}/`
  return [
    { text: isZh ? '首页' : 'Home', link: homeLink },
    { text: isZh ? '术语表' : 'Glossary', link: '/glossary.html' },
    { text: isZh ? '宪章律法' : 'Constitution', link: '/constitution/' },
    { text: isZh ? '诸天推演' : 'Multiverse', link: '/multiverse/' },
    { text: isZh ? '路线沙盘' : 'Sandbox', link: '/sandbox/' },
    {
      text: isZh ? '🌐 语言' : '🌐 Language',
      items: languages.map((l) => ({ text: l.label, link: `/${l.code}/` })),
    },
  ]
}

// ── 非中文通用 footer ─────────────────────────────────
const intlFooter = {
  message: 'The Original Cosmos of Ten Thousand Spirits and the Balanced Anchor · Anchor Symbiosis Civilization · Myriad Races Republic',
  copyright: 'Copyright © 2026 Heng Yuan Zhou Lore Team',
}

// ── 非中文通用 UI 文本 ────────────────────────────────
const intlUiLabels = {
  docFooter: { prev: 'Previous page', next: 'Next page' },
  outline: { label: 'On this page' },
  lastUpdatedText: 'Last updated',
  returnToTopLabel: 'Return to top',
  sidebarMenuLabel: 'Menu',
  darkModeSwitchLabel: 'Appearance',
}

// ── 动态生成全部语种的 locale 配置 ─────────────────────
function buildLocales() {
  const locales: any = {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: buildNav('zh'),
        sidebar: { '/zh/': buildSidebar('zh') },
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: buildNav('zh'),
        sidebar: { '/zh/': buildSidebar('zh') },
      },
    },
  }

  for (const l of languages) {
    const isEn = l.code === 'en'
    locales[l.code] = {
      label: l.label,
      lang: isEn ? 'en-US' : l.code,
      title: isEn ? 'Heng Yuan Zhou · Anchor Symbiosis Civilization' : undefined,
      description: isEn ? 'The Original Cosmos of Ten Thousand Spirits and the Balanced Anchor · Official Lore Library' : undefined,
      themeConfig: {
        nav: buildNav(l.code),
        sidebar: { [`/${l.code}/`]: buildSidebar(l.code) },
        ...intlUiLabels,
        footer: intlFooter,
      },
    }
  }

  return locales
}

export default defineConfig({
  title: '衡元宙 · 锚点共生文明',
  description: '万灵衡锚本源宙 · 锚点共生文明官方设定文库 | Hengyuan Cosmos Official Lore Library',
  base: '/hengyuan-cosmos/',
  cleanUrls: false,
  lastUpdated: false,
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { name: 'og:title', content: '衡元宙 · 锚点共生文明 官方设定文库' }],
    ['meta', { name: 'og:description', content: '万族共生、万法归锚、万界共和——锚点共生文明完整设定集' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '衡元宙',
    nav: buildNav('zh'),
    socialLinks: [{ icon: 'github', link: 'https://github.com/faker210/hengyuan-cosmos' }],
    footer: {
      message: '万灵衡锚本源宙 · 锚点共生文明 · 万族共和',
      copyright: 'Copyright © 2026 衡元宙设定组 · Hengyuan Cosmos Lore Team',
    },
    search: { provider: 'local' },
  },
  locales: buildLocales(),
})

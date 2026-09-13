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

const baseGroups: Array<{ min: number; max: number; title: string }> = [
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

const moduleGroups: Array<{ min: number; max: number; title: string; index: string }> = [
  { min: 100, max: 250, title: '境界深度细化', index: '模块一-境界深度细化索引' },
  { min: 251, max: 500, title: '诸天名著对标批判', index: '模块二-诸天名著对标批判索引' },
  { min: 501, max: 700, title: '双轨时间域文明体验', index: '模块三-双轨时间域文明体验索引' },
  { min: 701, max: 900, title: '超多元超脱正统定义', index: '模块四-超多元超脱正统定义索引' },
  { min: 901, max: 1000, title: '文明终极定型典藏', index: '模块五-文明终极定型典藏索引' },
]

function buildSidebar() {
  const dir = path.resolve('docs', 'zh')
  if (!fs.existsSync(dir)) return []

  const files = fs
    .readdirSync(dir)
    .filter((f) => /^(\d{2}-|\d{3,}_).+\.md$/.test(f))
    .sort()

  const groups: any[] = []

  for (const g of baseGroups) {
    const items = files
      .filter((f) => {
        const n = parseInt(f.match(/^\d+/)[0], 10)
        return n >= g.min && n <= g.max
      })
      .map((f) => {
        const name = f.replace(/\.md$/, '')
        const text = name.replace(/^\d{2}-/, '')
        return { text, link: `/zh/${name}/` }
      })
    if (!items.length) continue
    groups.push({
      text: `${g.title}（${g.min.toString().padStart(2, '0')}–${g.max}）`,
      collapsed: false,
      items,
    })
  }

  for (const g of moduleGroups) {
    const count = files.filter((f) => {
      const n = parseInt(f.match(/^\d+/)[0], 10)
      return n >= g.min && n <= g.max
    }).length
    if (!count) continue
    groups.push({
      text: `${g.title}（${g.min}–${g.max}）`,
      collapsed: true,
      items: [{ text: `共 ${count} 篇 · 打开模块索引 →`, link: `/zh/${g.index}/` }],
    })
  }

  return groups
}

const zhNav = [
  { text: '首页', link: '/zh/' },
  { text: '术语表', link: '/glossary' },
  { text: '宪章律法', link: '/constitution/' },
  { text: '诸天推演', link: '/multiverse/' },
  { text: '路线沙盘', link: '/sandbox/' },
  {
    text: '🌐 语言',
    items: languages.map((l) => ({ text: l.label, link: `/${l.code}/` })),
  },
]

export default defineConfig({
  title: '衡元宙 · 锚点共生文明',
  description: '万灵衡锚本源宙 · 锚点共生文明官方设定文库 | Hengyuan Cosmos Official Lore Library',
  base: '/hengyuan-cosmos/',
  cleanUrls: true,
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
    nav: zhNav,
    socialLinks: [{ icon: 'github', link: 'https://github.com/faker210/hengyuan-cosmos' }],
    footer: {
      message: '万灵衡锚本源宙 · 锚点共生文明 · 万族共和',
      copyright: 'Copyright © 2026 衡元宙设定组 · Hengyuan Cosmos Lore Team',
    },
    search: { provider: 'local' },
  },
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: zhNav,
        sidebar: { '/zh/': buildSidebar() },
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: zhNav,
        sidebar: { '/zh/': buildSidebar() },
      },
    },
  },
})

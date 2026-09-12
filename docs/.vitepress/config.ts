import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

const languages = [
  { code: 'zh', label: '中文',     lang: 'zh-CN', navHome: '首页',     navGlossary: '术语表',   navConstitution: '宪章律法', navMultiverse: '诸天推演', navSandbox: '路线沙盘' },
  { code: 'en', label: 'English',  lang: 'en',    navHome: 'Home',     navGlossary: 'Glossary', navConstitution: 'Constitution', navMultiverse: 'Multiverse', navSandbox: 'Sandbox' },
  { code: 'fr', label: 'Français', lang: 'fr',    navHome: 'Accueil',  navGlossary: 'Glossaire', navConstitution: 'Constitution', navMultiverse: 'Multivers', navSandbox: 'Bac à sable' },
  { code: 'ru', label: 'Русский',  lang: 'ru',    navHome: 'Главная',  navGlossary: 'Глоссарий', navConstitution: 'Конституция', navMultiverse: 'Мультивселенная', navSandbox: 'Песочница' },
  { code: 'hi', label: 'हिन्दी',    lang: 'hi',    navHome: 'होम',      navGlossary: 'शब्दावली', navConstitution: 'संविधान', navMultiverse: 'मल्टीवर्स', navSandbox: 'सैंडबॉक्स' },
  { code: 'es', label: 'Español',  lang: 'es',    navHome: 'Inicio',   navGlossary: 'Glosario', navConstitution: 'Constitución', navMultiverse: 'Multiverso', navSandbox: 'Arenero' },
  { code: 'ar', label: 'العربية',  lang: 'ar',    navHome: 'الرئيسية', navGlossary: 'المسرد',   navConstitution: 'الدستور', navMultiverse: 'عوالم متعددة', navSandbox: 'صندوق الرمل' },
  { code: 'bn', label: 'বাংলা',     lang: 'bn',    navHome: 'হোম',      navGlossary: 'শব্দকোষ',  navConstitution: 'সংবিধান', navMultiverse: 'মাল্টিভার্স', navSandbox: 'বালিরঘর' },
  { code: 'pt', label: 'Português',lang: 'pt',    navHome: 'Início',   navGlossary: 'Glossário', navConstitution: 'Constituição', navMultiverse: 'Multiverso', navSandbox: 'Caixa de areia' },
  { code: 'id', label: 'Indonesia',lang: 'id',    navHome: 'Beranda',  navGlossary: 'Glosarium', navConstitution: 'Konstitusi', navMultiverse: 'Multiverse', navSandbox: 'Kotak pasir' },
  { code: 'ur', label: 'اردو',      lang: 'ur',    navHome: 'ہوم',      navGlossary: 'اصطلاحات', navConstitution: 'آئین', navMultiverse: 'کائنات متعدد', navSandbox: 'سینڈ باکس' },
  { code: 'ja', label: '日本語',    lang: 'ja',    navHome: 'ホーム',   navGlossary: '用語集',    navConstitution: '憲法・律法', navMultiverse: '多元宇宙', navSandbox: 'サンドボックス' },
  { code: 'vi', label: 'Tiếng Việt',lang: 'vi',   navHome: 'Trang chủ',navGlossary: 'Bảng thuật ngữ', navConstitution: 'Hiến pháp', navMultiverse: 'Đa vũ trụ', navSandbox: 'Hộp cát' },
  { code: 'sw', label: 'Kiswahili',lang: 'sw',    navHome: 'Nyumbani', navGlossary: 'Kamusi',    navConstitution: 'Katiba', navMultiverse: 'Ulimwengu mbalimbali', navSandbox: 'Sandbox' },
  { code: 'de', label: 'Deutsch',  lang: 'de',    navHome: 'Startseite',navGlossary: 'Glossar',  navConstitution: 'Verfassung', navMultiverse: 'Multiversum', navSandbox: 'Sandkasten' },
]

const groups: Array<{ min: number; max: number; title: string }> = [
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

function buildSidebar(lang: string) {
  const dir = path.resolve('docs', lang)
  if (!fs.existsSync(dir)) return []

  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{2}-.+\.md$/.test(f))
    .sort()

  return groups
    .map((g) => {
      const items = files
        .filter((f) => {
          const n = parseInt(f.slice(0, 2), 10)
          return n >= g.min && n <= g.max
        })
        .map((f) => {
          const name = f.replace(/\.md$/, '')
          const text = name.replace(/^\d{2}-/, '')
          return { text, link: `/${lang}/${name}/` }
        })
      if (!items.length) return null
      return {
        text: `${g.title}（${g.min.toString().padStart(2, '0')}–${g.max}）`,
        collapsed: false,
        items,
      }
    })
    .filter(Boolean)
}

function buildLocale(lang: typeof languages[number]) {
  return {
    label: lang.label,
    lang: lang.lang,
    themeConfig: {
      nav: [
        { text: lang.navHome, link: `/${lang.code}/` },
        { text: lang.navGlossary, link: '/glossary' },
        { text: lang.navConstitution, link: '/constitution/' },
        { text: lang.navMultiverse, link: '/multiverse/' },
        { text: lang.navSandbox, link: '/sandbox/' },
      ],
      sidebar: { [`/${lang.code}/`]: buildSidebar(lang.code) },
      outline: { label: '本页目录', level: [2, 3] },
      lastUpdatedText: '最后更新',
    },
  }
}

const locales: Record<string, any> = {
  root: {
    label: '中文',
    lang: 'zh-CN',
    themeConfig: {
      nav: [
        { text: '首页', link: '/zh/' },
        { text: '术语表', link: '/glossary' },
        { text: '宪章律法', link: '/constitution/' },
        { text: '诸天推演', link: '/multiverse/' },
        { text: '路线沙盘', link: '/sandbox/' },
      ],
      sidebar: { '/zh/': buildSidebar('zh') },
    },
  },
}

languages.forEach((lang) => {
  locales[lang.code] = buildLocale(lang)
})

export default defineConfig({
  title: '衡元宙 · 锚点共生文明',
  description: '万灵衡锚本源宙 · 锚点共生文明官方设定文库 | Hengyuan Cosmos Official Lore Library — 15 Languages',
  base: '/hengyuan-cosmos/',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { name: 'og:title', content: '衡元宙 · 锚点共生文明 官方设定文库' }],
    ['meta', { name: 'og:description', content: '万族共生、万法归锚、万界共和——锚点共生文明完整设定集 · 15语种文库' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '衡元宙',
    socialLinks: [{ icon: 'github', link: 'https://github.com/faker210/hengyuan-cosmos' }],
    footer: {
      message: '万灵衡锚本源宙 · 锚点共生文明 · 万族共和',
      copyright: 'Copyright © 2026 衡元宙设定组 · Hengyuan Cosmos Lore Team',
    },
    search: { provider: 'local' },
  },
  locales,
})

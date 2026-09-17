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

// ── 各语种本地化分组标题（基础篇10组 + 模块篇5组）──────────
const localizedGroupTitles: Record<string, { base: string[]; module: string[] }> = {
  en: {
    base: ['General Principles & Core Settings','Cultivation Systems','Anchor & Symbiosis Mechanisms','Civilization Types & Society','Law & Governance','Myriad Races & Strange Beings','Technology Systems','Chronicle & Eras','Planes & Time Rules','Index & Appendix'],
    module: ['Deep Realm Refinement','Cross-Universe Classic Critique','Dual-Track Time Domain Civilization','Trans-Multiverse Transcendence Orthodoxy','Ultimate Civilization Compendium'],
  },
  fr: {
    base: ['Principes généraux & Paramètres centraux','Systèmes de culture','Mécanismes d\'ancrage & de symbiose','Types de civilisation & Société','Droit & Gouvernance','Races myriades & Êtres étranges','Systèmes technologiques','Chronique & Ères','Plans & Règles temporelles','Index & Annexe'],
    module: ['Raffinement des royaumes profonds','Critique des classiques inter-universels','Civilisation du domaine temporel à double voie','Orthodoxie de transcendance trans-multivers','Compendium ultime de civilisation'],
  },
  ru: {
    base: ['Общие принципы & Основные настройки','Системы культивации','Механизмы якоря & симбиоза','Типы цивилизаций & Общество','Право & Управление','Мириады рас & Странные существа','Технологические системы','Хроника & Эры','Планы & Временные правила','Индекс & Приложение'],
    module: ['Углубленное очищение царств','Критика межвселенских классиков','Цивилизация двойного временного домена','Ортодоксия транс-мультивселенского превосходства','Итоговый компендиум цивилизации'],
  },
  hi: {
    base: ['सामान्य सिद्धांत और मुख्य सेटिंग्स','साधना प्रणालियाँ','एंकर और सहजीवन तंत्र','सभ्यता के प्रकार और समाज','कानून और शासन','अनंत जातियाँ और विचित्र प्राणी','तकनीकी प्रणालियाँ','कालक्रम और युग','सतह और समय नियम','सूचकांक और परिशिष्ट'],
    module: ['गहन क्षेत्र परिशोधन','क्रॉस-यूनिवर्स क्लासिक आलोचना','दोहरी ट्रैक समय डोमेन सभ्यता','ट्रांस-मल्टीवर्स उत्कर्ष ऑर्थोडॉक्सी','अंतिम सभ्यता संग्रह'],
  },
  es: {
    base: ['Principios generales & Configuración central','Sistemas de cultivo','Mecanismos de anclaje & simbiosis','Tipos de civilización & Sociedad','Derecho & Gobernanza','Miriadas de razas & Seres extraños','Sistemas tecnológicos','Crónica & Eras','Planos & Reglas temporales','Índice & Apéndice'],
    module: ['Refinamiento de reinos profundos','Crítica de clásicos interuniversales','Civilización de dominio temporal de doble vía','Ortodoxia de trascendencia transmultiversal','Compendio último de civilización'],
  },
  ar: {
    base: ['المبادئ العامة والإعدادات الأساسية','أنظمة التنمية','آليات المرساة والتعايش','أنواع الحضارات والمجتمع','القانون والحوكمة','أعداد لا تحصى من الأعراق والكائنات الغريبة','الأنظمة التكنولوجية','السجل الزمني والعصور','المستويات وقواعد الزمن','الفهرس والملحق'],
    module: ['تنقية العوالم العميقة','نقد الكلاسيكيات عبر الأكوان','حضارة مجال الزمن ثنائي المسار','الأرثوذكسية المتعالية عبر الأكوان المتعددة','مختصر الحضارة النهائي'],
  },
  bn: {
    base: ['সাধারণ নীতি ও মূল সেটিংস','অভ্যাস পদ্ধতি','অ্যাঙ্কর ও সহজাত প্রক্রিয়া','সভ্যতার প্রকার ও সমাজ','আইন ও প্রশাসন','অসংখ্য জাতি ও অদ্ভুত প্রাণী','প্রযুক্তি পদ্ধতি','কাললিপি ও যুগ','স্তর ও সময় নিয়ম','সূচিপত্র ও পরিশিষ্ট'],
    module: ['গভীর অঞ্চল পরিশোধন','ক্রস-ইউনিভার্স ক্লাসিক সমালোচনা','ডুয়াল-ট্র্যাক টাইম ডোমেন সভ্যতা','ট্রান্স-মাল্টিভার্স ট্রান্সসেন্ডেন্স অর্থোডক্সি','আল্টিমেট সিভিলাইজেশন কমপেন্ডিয়াম'],
  },
  pt: {
    base: ['Princípios gerais & Configurações centrais','Sistemas de cultivo','Mecanismos de âncora & simbiose','Tipos de civilização & Sociedade','Direito & Governança','Miríades de raças & Seres estranhos','Sistemas tecnológicos','Crônica & Eras','Planos & Regras temporais','Índice & Apêndice'],
    module: ['Refinamento de reinos profundos','Crítica de clássicos interuniversais','Civilização de domínio temporal de via dupla','Ortodoxia de transcendência transmultiversal','Compêndio último de civilização'],
  },
  id: {
    base: ['Prinsip umum & Pengaturan inti','Sistem kultivasi','Mekanisme jangkar & simbiosis','Tipe peradaban & Masyarakat','Hukum & Tata kelola','Segudang ras & Makhluk aneh','Sistem teknologi','Kronik & Era','Bidang & Aturan waktu','Indeks & Lampiran'],
    module: ['Pemurnian alam mendalam','Kritik klasik lintas semesta','Peradaban domain waktu jalur ganda','Ortodoksi transendensi trans-multiverse','Kompendium peradaban utama'],
  },
  ur: {
    base: ['عام اصول اور بنیادی ترتیبات','مہارت کے نظام','اینکر اور سمبیوسس کے طریقہ کار','تہذیب کی اقسام اور معاشرہ','قانون اور حکمرانی','ان گنت نسلیں اور عجیب مخلوقات','ٹیکنالوجی کے نظام','تاریخ اور ادوار','مستویں اور وقت کے اصول','فہرست اور ضمیمہ'],
    module: ['گہرے دائرے کی تطہیر','کارس یونیورس کلاسک تنقید','دوہری ٹریک ٹائم ڈومین تہذیب','ٹرانس ملٹیورس ٹرانسینڈنس آرتھوڈوکسی','حتمی تہذیب کا خلاصہ'],
  },
  ja: {
    base: ['総綱とコア設定','修練体系','アンカーと共生メカニズム','文明類型と社会','律法と統治','万族と異質な存在','技術体系','紀元編年','位面と時間ルール','索引と付録'],
    module: ['境界深度精錬','諸天名著対標批判','双軌時間域文明体験','超多元超脱正統定義','文明究極定型典藏'],
  },
  vi: {
    base: ['Nguyên tắc chung & Cài đặt cốt lõi','Hệ thống tu luyện','Cơ chế neo & cộng sinh','Loại hình văn minh & Xã hội','Pháp luật & Quản trị','Vô số chủng tộc & Sinh vật kỳ lạ','Hệ thống công nghệ','Biên niên & Kỷ nguyên','Mặt phẳng & Quy tắc thời gian','Mục lục & Phụ lục'],
    module: ['Tinh luyện cõi sâu','Phê bình kinh điển liên vũ trụ','Văn minh miền thời gian song hành','Chính thống siêu việt đa vũ trụ','Tổng tuyển văn minh tối thượng'],
  },
  sw: {
    base: ['Masharti ya jumla & Mipangilio ya msingi','Mifumo ya uao','Mifumo ya nanga & ushirikisho','Aina za ustaarabu & Jamii','Sheria & Utawala','Makabila mengi & Viumbe vya ajabu','Mifumo ya teknolojia','Kumbukumbu & Enzi','Ngazi & Kanuni za wakati','Fahari & Kiambatisho'],
    module: ['Utoaji wa kina wa maeneo','Ukosoaji wa sanjo za ulimwenguni','Ustaarabu wa eneo la wakati wa njia mbili','Utamaduni wa juu wa ulimwengu mkuu','Mkusanyiko wa mwisho wa ustaarabu'],
  },
  de: {
    base: ['Allgemeine Grundsätze & Kerneinstellungen','Kultivierungssysteme','Anker- & Symbiosemechanismen','Zivilisationstypen & Gesellschaft','Recht & Governance','Myriaden von Rassen & Fremde Wesen','Technologiesysteme','Chronik & Epochen','Ebenen & Zeitregeln','Index & Anhang'],
    module: ['Tiefenreich-Verfeinerung','Klassiker-Kritik über Universen hinweg','Zivilisation der dualen Zeitdomäne','Trans-Multiversum-Transzendenz-Orthodoxie','Ultimatives Zivilisationskompendium'],
  },
}

// ── 根据语种生成分组（使用本地化标题）────────────────────
function getGroupsForLang(lang: string) {
  const loc = localizedGroupTitles[lang]
  if (!loc) return { base: intlBaseGroups, module: intlModuleGroups }
  const base = intlBaseGroups.map((g, i) => ({ ...g, title: loc.base[i] || g.title }))
  const module = intlModuleGroups.map((g, i) => ({ ...g, title: loc.module[i] || g.title }))
  return { base, module }
}

// ── 侧边栏构建（支持全部语种，自动扫描 docs/<lang>/ 目录）──
function buildSidebar(lang: string) {
  const dir = path.resolve('docs', lang)
  if (!fs.existsSync(dir)) return []

  const isZh = lang === 'zh'
  const { base: baseGroups, module: moduleGroups } = isZh
    ? { base: zhBaseGroups, module: zhModuleGroups }
    : getGroupsForLang(lang)

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
  const moduleLabel = isZh
    ? (count: number) => `共 ${count} 篇 · 打开模块索引 →`
    : (count: number) => `${count > 0 ? count + ' translated · ' : ''}Open module index →`
  for (const g of moduleGroups) {
    const count = files.filter((f) => {
      const n = parseInt(f.match(/^\d+/)[0], 10)
      return n >= g.min && n <= g.max
    }).length
    if (!count && isZh) continue
    groups.push({
      text: isZh
        ? `${g.title}（${g.min}–${g.max}）`
        : `${g.title} (${g.min}–${g.max})`,
      collapsed: true,
      items: [{ text: moduleLabel(count), link: `/${lang}/${g.index}.html` }],
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

// ── 生成全部语种的全局 sidebar（按路径前缀匹配）──────────
function buildAllSidebars() {
  const all: any = {
    '/zh/': buildSidebar('zh'),
  }
  for (const l of languages) {
    all[`/${l.code}/`] = buildSidebar(l.code)
  }
  return all
}

// ── 动态生成全部语种的 locale 配置 ─────────────────────
function buildLocales() {
  const locales: any = {
    root: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: buildNav('zh'),
      },
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: buildNav('zh'),
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
    sidebar: buildAllSidebars(),
    socialLinks: [{ icon: 'github', link: 'https://github.com/faker210/hengyuan-cosmos' }],
    footer: {
      message: '万灵衡锚本源宙 · 锚点共生文明 · 万族共和',
      copyright: 'Copyright © 2026 衡元宙设定组 · Hengyuan Cosmos Lore Team',
    },
    search: { provider: 'local' },
  },
  locales: buildLocales(),
})

import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '衡元宙 · 锚点共生文明',
  description: '万灵衡锚本源宙 · 锚点共生文明官方设定文库 | Hengyuan Cosmos Official Lore Library',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,

  head: [
    ['meta', { name: 'theme-color', content: '#0f172a' }],
    ['meta', { name: 'og:title', content: '衡元宙 · 锚点共生文明 官方设定文库' }],
    ['meta', { name: 'og:description', content: '万族共生、万法归锚、万界共和——锚点共生文明完整设定集' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: '衡元宙',

    nav: [
      { text: '总设定', link: '/core/00-衡元宙宇宙总览' },
      { text: '宪章律法', link: '/constitution/03-共生文明宪章' },
      { text: '修炼体系', link: '/cultivation/10-三百套本源修炼体系总览' },
      { text: '万族图鉴', link: '/races/50-万族谱系总览' },
      { text: '技术体系', link: '/technology/60-技术体系总览' },
      { text: '编年史', link: '/history/70-纪元划分总表' },
      { text: '位面法则', link: '/planes/80-位面理论与分类' },
      { text: '参考索引', link: '/reference/90-术语词典' },
      {
        text: '更多',
        items: [
          { text: '诸天世界观对比', link: '/worlds/index' },
          { text: '诸天角色合集', link: '/characters/index' },
          { text: '文明对比沙盘', link: 'https://hengyuan-cosmos.github.io/sandbox/' },
        ],
      },
    ],

    sidebar: {
      '/core/': [
        {
          text: '核心设定',
          collapsed: false,
          items: [
            { text: '00 衡元宙宇宙总览', link: '/core/00-衡元宙宇宙总览' },
            { text: '01 锚点共生文明宣言', link: '/core/01-锚点共生文明宣言' },
            { text: '02 锚点本源定义与本质', link: '/core/02-锚点本源定义与本质' },
            { text: '04 反掠夺主义核心论纲', link: '/core/04-反掠夺主义核心论纲' },
            { text: '05 万族共进基本纲领', link: '/core/05-万族共进基本纲领' },
            { text: '06 多劳多得分配原理', link: '/core/06-多劳多得分配原理' },
            { text: '07 自生自长进化法则', link: '/core/07-自生自长进化法则' },
            { text: '08 人人有路保障体系', link: '/core/08-人人有路保障体系' },
            { text: '09 现实为基根本立场', link: '/core/09-现实为基根本立场' },
          ],
        },
        {
          text: '锚点机制',
          collapsed: false,
          items: [
            { text: '20 锚点结构与层级', link: '/core/20-锚点结构与层级' },
            { text: '21 共生网络运作原理', link: '/core/21-共生网络运作原理' },
            { text: '22 资源分配联产承包机制', link: '/core/22-资源分配联产承包机制' },
            { text: '23 20%激活战略规划', link: '/core/23-20%激活战略规划' },
            { text: '24 锚点能量传导路径', link: '/core/24-锚点能量传导路径' },
            { text: '25 共生反馈循环机制', link: '/core/25-共生反馈循环机制' },
            { text: '26 个体与集体平衡原理', link: '/core/26-个体与集体平衡原理' },
            { text: '27 锚点校准与维护', link: '/core/27-锚点校准与维护' },
            { text: '28 跨位面锚点连接', link: '/core/28-跨位面锚点连接' },
            { text: '29 共生度评估体系', link: '/core/29-共生度评估体系' },
          ],
        },
        {
          text: '文明分型',
          collapsed: false,
          items: [
            { text: '30 五种共生文明分型总览', link: '/core/30-五种共生文明分型总览' },
            { text: '31 东亚集约型文明', link: '/core/31-东亚集约型文明' },
            { text: '32 北欧福利型文明', link: '/core/32-北欧福利型文明' },
            { text: '33 北美多元型文明', link: '/core/33-北美多元型文明' },
            { text: '34 欧洲大陆社会型文明', link: '/core/34-欧洲大陆社会型文明' },
            { text: '35 发展中赶超型文明', link: '/core/35-发展中赶超型文明' },
            { text: '36 社会结构与阶层流动', link: '/core/36-社会结构与阶层流动' },
            { text: '37 共生教育体系', link: '/core/37-共生教育体系' },
            { text: '38 共生医疗体系', link: '/core/38-共生医疗体系' },
            { text: '39 住房与环境保障', link: '/core/39-住房与环境保障' },
          ],
        },
      ],

      '/constitution/': [
        {
          text: '宪章与法律',
          collapsed: false,
          items: [
            { text: '03 共生文明宪章', link: '/constitution/03-共生文明宪章' },
            { text: '40 共生宪法总纲', link: '/constitution/40-共生宪法总纲' },
            { text: '41 共生劳动法', link: '/constitution/41-共生劳动法' },
            { text: '42 消费者保护法', link: '/constitution/42-消费者保护法' },
            { text: '43 教育保障法', link: '/constitution/43-教育保障法' },
            { text: '44 医疗保障法', link: '/constitution/44-医疗保障法' },
            { text: '45 住房保障法', link: '/constitution/45-住房保障法' },
            { text: '46 环境保护法', link: '/constitution/46-环境保护法' },
            { text: '47 反垄断法', link: '/constitution/47-反垄断法' },
            { text: '48 司法体系与裁决机制', link: '/constitution/48-司法体系与裁决机制' },
            { text: '49 治理框架与权力制衡', link: '/constitution/49-治理框架与权力制衡' },
          ],
        },
      ],

      '/cultivation/': [
        {
          text: '修炼体系',
          collapsed: false,
          items: [
            { text: '10 三百套本源修炼体系总览', link: '/cultivation/10-三百套本源修炼体系总览' },
            { text: '11 推演迭代体系详解', link: '/cultivation/11-推演迭代体系详解' },
            { text: '12 生命循环体系详解', link: '/cultivation/12-生命循环体系详解' },
            { text: '13 空间法理调度体系详解', link: '/cultivation/13-空间法理调度体系详解' },
            { text: '14 修炼境界统一划分', link: '/cultivation/14-修炼境界统一划分' },
            { text: '15 能量循环与转化法则', link: '/cultivation/15-能量循环与转化法则' },
            { text: '16 倍增果实技术化原理', link: '/cultivation/16-倍增果实技术化原理' },
            { text: '17 位面至高强者标准', link: '/cultivation/17-位面至高强者标准' },
            { text: '18 修炼资源开放机制', link: '/cultivation/18-修炼资源开放机制' },
            { text: '19 修炼伦理与边界', link: '/cultivation/19-修炼伦理与边界' },
          ],
        },
      ],

      '/races/': [
        {
          text: '万族图鉴',
          collapsed: false,
          items: [
            { text: '50 万族谱系总览', link: '/races/50-万族谱系总览' },
            { text: '51 人族定位与特质', link: '/races/51-人族定位与特质' },
            { text: '52 异族分类与共生', link: '/races/52-异族分类与共生' },
            { text: '53 奇特生命识别标准', link: '/races/53-奇特生命识别标准' },
            { text: '54 奇特生命三类处置流程', link: '/races/54-奇特生命三类处置流程' },
            { text: '55 奇异能量分类与特性', link: '/races/55-奇异能量分类与特性' },
            { text: '56 奇异能量三类处置流程', link: '/races/56-奇异能量三类处置流程' },
            { text: '57 黑暗置换体起源与本质', link: '/races/57-黑暗置换体起源与本质' },
            { text: '58 双魂伦理准则', link: '/races/58-双魂伦理准则' },
            { text: '59 黑暗置换体四类分支处置', link: '/races/59-黑暗置换体四类分支处置' },
          ],
        },
      ],

      '/technology/': [
        {
          text: '技术体系',
          collapsed: false,
          items: [
            { text: '60 技术体系总览', link: '/technology/60-技术体系总览' },
            { text: '61 倍增果实工程化应用', link: '/technology/61-倍增果实工程化应用' },
            { text: '62 空间法理技术实现', link: '/technology/62-空间法理技术实现' },
            { text: '63 复制镜技术原理', link: '/technology/63-复制镜技术原理' },
            { text: '64 隔离空间构建技术', link: '/technology/64-隔离空间构建技术' },
            { text: '65 能量标准化与计量', link: '/technology/65-能量标准化与计量' },
            { text: '66 跨位面通讯技术', link: '/technology/66-跨位面通讯技术' },
            { text: '67 锚点硬件与基础设施', link: '/technology/67-锚点硬件与基础设施' },
            { text: '68 技术伦理与安全边界', link: '/technology/68-技术伦理与安全边界' },
            { text: '69 技术开放与共享机制', link: '/technology/69-技术开放与共享机制' },
          ],
        },
      ],

      '/history/': [
        {
          text: '编年史',
          collapsed: false,
          items: [
            { text: '70 纪元划分总表', link: '/history/70-纪元划分总表' },
            { text: '71 前锚点时代', link: '/history/71-前锚点时代' },
            { text: '72 锚点觉醒纪元', link: '/history/72-锚点觉醒纪元' },
            { text: '73 共生体系建立期', link: '/history/73-共生体系建立期' },
            { text: '74 三百套体系开放事件', link: '/history/74-三百套体系开放事件' },
            { text: '75 20%激活战略实施', link: '/history/75-20%激活战略实施' },
            { text: '76 首次升维里程碑', link: '/history/76-首次升维里程碑' },
            { text: '77 万族共和成立', link: '/history/77-万族共和成立' },
            { text: '78 跨位面探索纪元', link: '/history/78-跨位面探索纪元' },
            { text: '79 星际共生时代展望', link: '/history/79-星际共生时代展望' },
          ],
        },
      ],

      '/planes/': [
        {
          text: '位面法则',
          collapsed: false,
          items: [
            { text: '80 位面理论与分类', link: '/planes/80-位面理论与分类' },
            { text: '81 位面穿梭规则', link: '/planes/81-位面穿梭规则' },
            { text: '82 时间回溯基本原则', link: '/planes/82-时间回溯基本原则' },
            { text: '83 先观测后有限干涉准则', link: '/planes/83-先观测后有限干涉准则' },
            { text: '84 考古协议总纲', link: '/planes/84-考古协议总纲' },
            { text: '85 复制镜异地考古方案', link: '/planes/85-复制镜异地考古方案' },
            { text: '86 隔离空间低污染流程', link: '/planes/86-隔离空间低污染流程' },
            { text: '87 仅回传知识原则', link: '/planes/87-仅回传知识原则' },
            { text: '88 跨位面伦理准则', link: '/planes/88-跨位面伦理准则' },
            { text: '89 时间悖论防控机制', link: '/planes/89-时间悖论防控机制' },
          ],
        },
      ],

      '/reference/': [
        {
          text: '参考索引',
          collapsed: false,
          items: [
            { text: '90 术语词典', link: '/reference/90-术语词典' },
            { text: '91 三百套修炼体系索引', link: '/reference/91-三百套修炼体系索引' },
            { text: '92 法律条文索引', link: '/reference/92-法律条文索引' },
            { text: '93 编年史简表', link: '/reference/93-编年史简表' },
            { text: '94 万族名录', link: '/reference/94-万族名录' },
            { text: '95 关键人物与组织', link: '/reference/95-关键人物与组织' },
            { text: '96 常见问题FAQ', link: '/reference/96-常见问题FAQ' },
            { text: '97 设定矛盾自查表', link: '/reference/97-设定矛盾自查表' },
            { text: '98 扩展设定建议清单', link: '/reference/98-扩展设定建议清单' },
            { text: '99 文档版本与维护说明', link: '/reference/99-文档版本与维护说明' },
          ],
        },
      ],

      '/worlds/': [
        { text: '诸天世界观规则对比总集', link: '/worlds/index' },
      ],
      '/characters/': [
        { text: '诸天角色合集', link: '/characters/index' },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hengyuan-cosmos/hengyuan-cosmos' },
    ],

    footer: {
      message: '万灵衡锚本源宙 · 锚点共生文明 · 万族共和',
      copyright: 'Copyright © 2026 衡元宙设定组 · Hengyuan Cosmos Lore Team',
    },

    search: {
      provider: 'local',
    },
  },
})

# 衡元宙 · 锚点共生文明文库 — VitePress 站点结构与 Gitee Pages 部署指南

> 本仓库已内置完整的 VitePress 静态站点。以下说明如何理解目录结构、本地构建、
> 推送代码到 Gitee 并开启 Gitee Pages（免费版）部署。

---

## 一、目录结构说明

```
wanling-hengmao-origin-universe-archive/
├─ docs/                          # VitePress 内容源目录（srcDir）
│  ├─ .vitepress/                 # 站点配置（构建配置、主题、术语数据）
│  │  ├─ config.js                # ★ 主配置：8 语种 locales、导航、侧边栏自动生成、全文搜索
│  │  ├─ glossary.js              # 术语词典（GLOSSARY + AUTO_TERMS，供悬浮弹窗使用）
│  │  ├─ theme/
│  │  │  ├─ index.js              # 主题增强：术语悬浮弹窗装饰、RTL、兜底装饰
│  │  │  ├─ Layout.vue            # 自定义布局：注入自定义语言切换器
│  │  │  ├─ LangSwitcher.vue      # ★ 自定义语言切换器（8 语种，按路由 basename 映射）
│  │  │  └─ style.css             # 弹窗样式 + 首页自定义区块 + 隐藏默认切换器
│  │  └─ ...
│  ├─ constitution/               # ★ 100 份中文宪章文档（00-99）+ 配套细则 + 术语表
│  ├─ en/ fr/ ru/ hi/ es/ ar/     # 7 语种译文（文件名与中文版一致，100 份/语种）
│  ├─ ja/                         # 日文译文（部分文档）
│  ├─ index.md                    # ★ 首页（世界观简介 + 双路线对比 + 六大特性）
│  ├─ multiverse/                 # ★ 诸天角色推演板块（带土/柱间/斑/叶凡/石昊）
│  ├─ sandbox/                    # ★ 交互沙盘入口页
│  ├─ public/                     # 静态资源（sandbox/sandbox.html 自包含沙盘等）
│  └─ law-core.md / dashboard/    # 律法核心总章 / 翻译进度看板
├─ site/                          # ★ 构建产物（VitePress 输出；Gitee Pages 免费版直接部署此目录）
│  ├─ index.html                  # 站点首页
│  ├─ constitution/ en/ fr/ …     # 编译后的 HTML 页面（与 docs 目录对应）
│  ├─ assets/                     # 静态资源（含本地全文搜索索引）
│  └─ hashmap.json                # 路由哈希表
├─ scripts/
│  ├─ sync-constitution.mjs       # 同步/校验 docs/constitution 目录（构建前自动执行）
│  └─ check-sitedata.cjs          # 校验构建产物 themeConfig 的调试脚本
├─ package.json                   # scripts: docs:dev / docs:build / docs:preview
└─ .gitignore
```

### 关键设计点

| 需求 | 实现方式 |
|---|---|
| 首页 | `docs/index.md`（home layout + 双路线对比卡片 + 统计条） |
| 侧边自动导航 | `config.js` 的 `buildSidebar()`：按 `constitution/<lang>` 目录**实际存在的 md 文件**自动生成 10 大模块分组，绝不产生死链 |
| 全文搜索 | `themeConfig.search = { provider: 'local' }`，纯前端本地索引，无需后端 |
| 8 语种切换 | 顶层 `locales`（root/en/fr/ru/hi/es/ar/ja），每语种独立 nav/sidebar；右上角自定义切换器按"同名文档 basename"映射，规避中英目录结构不对称问题 |
| 术语弹窗 | `theme/index.js` 自动扫描正文，把 `AUTO_TERMS` 词表（锚点、阿赖耶、坐三望二、虚拟增量沙盘…）包裹为 `.term-pop`，悬浮弹出释义 |
| 诸天推演 | `docs/multiverse/` 独立板块，5 个角色页 |
| 交互沙盘 | `docs/public/sandbox/sandbox.html` 自包含单文件（SVG 双曲线图 + 参数滑杆 + 20% 激活开关 + 120 纪元推演），入口在 `docs/sandbox/` |

### 两个"坑"的既有处理（勿改动）

1. **文件名含半角 `%` 的文档**（`23-20%激活战略规划.md`、`75-20%激活战略实施.md`）：
   VitePress 会把输出路由中的半角 `%` 消毒为全角 `％`。`config.js` 中 `PCT_FILES`
   已把侧边栏/沙盘链接映射到全角路由，**源文件路径保持不变**。
2. **内部链接必须相对 `.md`**：`config.js` 顶层 `ignoreDeadLinks: true` 之外，
   文档间的链接应写成 `../constitution/04-反掠夺主义核心论纲.md` 这类相对路径，
   不要写 `/constitution/xx` 绝对路径（绝对路径在子目录部署下会失效）。

---

## 二、本地构建与预览

环境要求：Node.js ≥ 18，npm。

```powershell
cd <仓库根目录>

# 1. 安装依赖（首次）
npm install

# 2. 构建（自动先同步 docs/constitution，再执行 vitepress build）
npm run docs:build
# 产物输出到仓库根 site/

# 3. 本地预览
npm run docs:preview        # 默认 http://localhost:4173/wanling-hengmao-origin-universe-archive/
```

> 预览地址带 `/wanling-hengmao-origin-universe-archive/` 前缀，与 Gitee Pages 部署后的访问路径一致。
> 若在本地想以根路径预览：`$env:VP_BASE="/"; npm run docs:build`。
---

## 三、推送到 Gitee（分步）

### 第 1 步：确认仓库地址

Gitee 仓库为 `wanling-hengmao-origin-universe-archive`，用户名 `lihanlin-wanling`。

- 仓库完整地址：`https://gitee.com/lihanlin-wanling/wanling-hengmao-origin-universe-archive.git`
- 默认分支：`main`（本地分支为 `master`，推送时用 `master:main` 映射，见第 4 步）

### 第 2 步：把本地仓库关联到 Gitee（若尚未添加 remote）

```powershell
cd <仓库根目录>

# 查看现有远程仓库
git remote -v

# 添加 Gitee 远程（一次性）
git remote add gitee https://gitee.com/lihanlin-wanling/wanling-hengmao-origin-universe-archive.git

# 若提示已存在，可改用
git remote set-url gitee https://gitee.com/lihanlin-wanling/wanling-hengmao-origin-universe-archive.git
```

### 第 3 步：确认构建产物已提交

> ⚠️ **Gitee Pages 免费版不执行构建命令**，必须把 `site/` 目录（编译后的 HTML）
> 一起提交进仓库，Pages 才能直接部署。请勿把 `site/` 加进 `.gitignore`。

```powershell
# 确认 site/ 已生成且未被忽略
git status site/ | Select-Object -First 10

# 若 site/ 不在跟踪列表，说明被 .gitignore 忽略 —— 需从 .gitignore 中移除 site/ 后重新 add
```

### 第 4 步：提交并推送

```powershell
git add -A
git commit -m "feat: 衡元宙 VitePress 文库站点（8 语种/全文搜索/术语弹窗/诸天推演/交互沙盘）"

# 本地分支当前是 master，Gitee 默认分支是 main：
# 用「本地分支:远端分支」一次性映射推送到 main
git push -u gitee master:main

# 若希望以后本地也统一叫 main（可选）：
git branch -m main
```

> 首次推送会要求输入 Gitee 用户名与密码（或私人令牌）。建议在 Gitee 后台
> 「设置 → 安全设置 → 私人令牌」生成一个令牌，用令牌作为密码推送。
> 推送成功后，稍等 1~2 分钟，打开
> `https://gitee.com/lihanlin-wanling/wanling-hengmao-origin-universe-archive` 确认文件已同步。

---

## 四、开启 Gitee Pages（分步）

1. 打开仓库主页：`https://gitee.com/lihanlin-wanling/wanling-hengmao-origin-universe-archive`
2. 顶部导航点 **「服务」** → **「Gitee Pages」**（或直接在仓库页面右侧找到
   「Gitee Pages」入口）。
3. 在部署设置页：
   - **部署分支**：选择 `main`
   - **部署目录**：填 `site`（即仓库根下的 site/ 目录，构建产物所在处）
   - 勾选「强制使用 HTTPS」（可选，推荐）
4. 点 **「启动」** 按钮，等待数秒~数分钟。
5. 部署完成后，页面会显示站点地址：
   ```
   https://lihanlin-wanling.gitee.io/wanling-hengmao-origin-universe-archive/
   ```
6. 打开该地址，应看到文库首页。若首页正常、子页面 404，多半是「部署目录」
   填错（应为 `site` 而非空或 `docs`）。

### 更新站点（以后每次修改内容后）

```powershell
npm run docs:build        # 重新构建 site/
git add -A
git commit -m "更新文案"
# 若第 4 步执行过 git branch -m main，则直接 git push gitee main；
# 否则继续用 master:main
git push gitee master:main   # 推送后进入 Gitee Pages 页面点「更新」
```

> Gitee Pages 免费版每次代码更新后需要手动点一次「更新」按钮才会重新发布。

---

## 五、常见问题

| 现象 | 原因与处理 |
|---|---|
| 首页能开，子页 404 | 部署目录填错；应填 `site`；或 base 与仓库名不一致（见 config.js 顶部 BASE） |
| 图片/样式 404 | 确认 `docs/public/` 下的资源（如 `anchor-mark.svg`、`sandbox/sandbox.html`）已随构建复制进 `site/` |
| 搜索框无结果 | 确认 `site/assets/chunks/@localSearchIndex*.js` 存在；浏览器强刷（Ctrl+F5） |
| 语言切换 404 | 切换器按文档 basename 映射，仅对 `constitution` 与 7 语种译文页有效；首页/诸天等无译文页面会跳到该语种第 00 篇文档 |
| 修改 config.js 后无变化 | 需重新 `npm run docs:build` 并推送、在 Gitee Pages 点「更新」 |
| 仓库改名 | 若 Gitee 仓库名不是 `wanling-hengmao-origin-universe-archive`，修改 `config.js` 顶部 `BASE` 常量并重新构建 |

---

## 五·二、腾讯云 EdgeOne Makers 部署（方案 A：云端自动构建）

### 为什么之前会失败（大白话）

EdgeOne 云端执行流程是：克隆仓库 → 装依赖 → 按你填的**构建命令**打包 → 把**输出目录**里的文件发布出去。

之前失败是因为三个"对不上"：

| 问题 | 原因 | 已修复 |
|---|---|---|
| 构建命令 `npm run build` 报错 | package.json 里根本没有 `build` 这条命令，只有 `docs:build` | 已新增 `build` 命令 |
| 构建完找不到产物 | 平台默认找 `dist` 目录，而 VitePress 产物在 `site/` | 已让 `build` 直接输出到 `dist/` |
| 就算打包成功页面也打不开 | 链接前缀是 `/wanling-hengmao-origin-universe-archive/`（Gitee 专用），EdgeOne 域名没有这个路径 | 已让 `build` 用根路径（BASE=/）重新构建 |

> 日志里的 `No server-handler detected, generating routes.json for pure project` 是平台把项目
> 识别为"纯静态网站"的**正常提示**，不是错误。真正的报错是它随后执行 `npm run build`
> 时找不到命令。

### 云端构建怎么配（照抄）

在 EdgeOne Makers 控制台创建项目（关联 Gitee 仓库，分支 `main`）：

| 配置项 | 填什么 |
|---|---|
| 框架预设 | 选 **Other**（下拉里没有 VitePress 就选这个） |
| 根目录 | 留空或填 `/` |
| 构建命令 | `npm run build` |
| 安装命令 | `npm install` |
| 输出目录 | `dist` |
| Node 版本 | 选 **18** 或更高（20/22 都行） |

配置完点部署。每次改完内容：本地 `npm run docs:build` 生成 Gitee 版 `site/`、
`npm run build` 生成 EdgeOne 版 `dist/`（两条命令各自独立，互不影响），
推送代码后 EdgeOne 会自动重新构建。

---

## 五·三、方案 B：本地打包，手动上传（如果云端构建还是不行）

完全绕开云端构建，把做好的网页文件直接传到 EdgeOne。

### 第 1 步：本地装 Node.js（只装一次）

1. 打开官网 <https://nodejs.org/zh-cn>，下载 **LTS（长期支持版）**，双击安装，一路"下一步"。
2. 装完打开"命令提示符"或"PowerShell"，输入下面命令回车，能显示版本号就装好了：

```powershell
node -v
```

### 第 2 步：生成网页文件

```powershell
cd C:\Users\Administrator\Desktop\anchor-release
npm install          # 装依赖（第一次要等一会儿）
npm run build        # 生成网页文件，存放在 dist/ 文件夹
```

跑完看到 `✅ EdgeOne 构建完成：dist/ 已生成` 就是成功。

### 第 3 步：把 dist 文件夹打包

1. 打开文件资源管理器，进到 `C:\Users\Administrator\Desktop\anchor-release\dist`
2. **选中 dist 文件夹里的所有内容**（Ctrl+A），右键 → 发送到 → 压缩文件夹（zip）
3. 得到 `dist.zip`

### 第 4 步：上传到 EdgeOne

1. 打开 EdgeOne Makers 控制台，新建项目
2. 选 **直接上传**（不选 Git 仓库）方式：把 `dist.zip` 拖进上传区，或点选择文件
3. 项目名称随便填，加速区域选默认，点 **开始部署**
4. 等 1~2 分钟，部署成功后会给你一个访问链接，形如
   `https://xxxx.edgeone.app/`，点开就是网站

> 以后更新内容：重新跑 `npm run build`，重新打包 dist，再上传覆盖即可。

---

## 六、本次交付物清单（对应任务要求）

| 要求 | 文件 |
|---|---|
| VitePress 完整配置文件 | `docs/.vitepress/config.js` |
| 首页 markdown 源码 | `docs/index.md` |
| 沙盘页面 HTML/JS 源码 | `docs/public/sandbox/sandbox.html`（自包含） |
| 目录结构说明 + Gitee 部署指南 | 本文档 `docs/DEPLOY_GUIDE.md` |
| 术语弹窗 | `docs/.vitepress/glossary.js` + `docs/.vitepress/theme/index.js` |
| 多语言切换 | `docs/.vitepress/theme/LangSwitcher.vue` + `docs/.vitepress/theme/Layout.vue` |
| 诸天角色推演 | `docs/multiverse/`（index + 5 个角色页） |

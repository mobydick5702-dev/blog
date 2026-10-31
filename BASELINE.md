# Firefly 博客工程基线报告（BASELINE）

> 本文件是 **moby5702 个人技术博客**（基于 CuteLeaf/Firefly）的工程事实来源，由基线勘查得出。
> 所有版本号、耗时、路径、字段均来自本机实测或仓库源码，未做推测；凡属"建议/经验"的地方都已标注。
>
> | 项 | 值 |
> |---|---|
> | 勘察时间 | 2026-10-30 22:41 +08:00 |
> | 仓库 | `D:\Program\Save\learn\web\blog` |
> | 上游 | https://github.com/CuteLeaf/Firefly （克隆时经 `https://gh-proxy.com/` 代理） |
> | 分支 / 提交 | `master` @ `4b976574`（fix(music): 支持媒体控制键系统同步…） |
> | 主题版本 | `package.json` → `firefly@6.16.9` |
> | 结论 | **可安装、可构建、可预览、可部署**（`pnpm build` 实测成功，产物 `dist/index.html` 已生成） |

**后续成员（站点定制 / 内容创作 / 验证）请优先读第 3、4、6 章。**

---

## 0. 一页速查

| 场景 | 命令（在 `blog/` 下执行） | 实测结果 |
|---|---|---|
| 安装依赖 | `pnpm install`（首次建议加 `--registry=https://registry.npmmirror.com`） | 1175 个包，2 分 40 秒 |
| 本地开发 | `pnpm dev` | http://localhost:4321 |
| **生产构建** | `pnpm build` | 3 分 11 秒，退出码 0 |
| 预览构建产物 | `pnpm preview` | http://localhost:4321 （见坑 8.7） |
| 新增文章 | `pnpm new-post <文件名>` | 生成 `src/content/posts/<文件名>.md` 骨架 |
| 新增动态 | `pnpm new-dynamic` | 生成动态页条目骨架 |
| 生成图片占位图 | `pnpm lqips` | 有新增图片时才真正处理 |
| 刷新 GitHub 卡片数据 | `pnpm github-cards` | 失败会保留旧数据，不影响构建 |
| 类型检查 | `pnpm check` / `pnpm type-check` | 基线未跑（单项约 1~2 分钟，改动后建议跑） |

构建产物：`dist/`，329 个文件 / 22.8 MB，入口 `dist/index.html`（365,381 字节）。

---

## 1. 环境与实测记录

### 1.1 环境版本

| 组件 | 版本 | 说明 |
|---|---|---|
| OS | Windows（PowerShell 控制台为 GBK，见坑 8.3） | — |
| Node.js | **v24.18.0** | `package.json` 要求 `>=22.23.0` |
| pnpm | **11.22.0** | `packageManager: pnpm@11.22.0`，**只能用 pnpm** |
| git | 2.55.0.windows.2 | — |

关键依赖（`pnpm list --depth=0` 实测）：Astro `7.3.2`、Svelte `5.57.2`、Tailwind `4.3.3`、TypeScript `6.0.3`、`@astrojs/cloudflare 14.3.1`、`wrangler 4.147.0`、`sharp 0.35.5`、`pagefind 1.5.2`、`takumi-js 2.14.0`。

强制 pnpm 的机制（别绕过）：

- `package.json` → `"preinstall": "npx only-allow pnpm"`：用 npm/yarn 装依赖会直接失败。
- `pnpm-workspace.yaml` → `allowBuilds: esbuild/workerd`：pnpm 10+ 默认拦截依赖的 `postinstall`，这两个白名单必须保留，否则 esbuild / workerd 不会被正确构建。

### 1.2 依赖安装（已完成，不要重装）

本次由队长执行，日志见工作区根 `.install.log`：

- 源：`https://registry.npmmirror.com`（官方源偏慢）
- 结果：`Packages: +1175`，`Done in 2m 40.4s`
- pnpm store：`D:\.pnpm-store\v11`（内容寻址存储，虚拟 store 在 `blog/node_modules/.pnpm`）
- 依赖已就绪：`blog/node_modules` 存在，`pnpm list --depth=0` 正常输出、无致命错误

今后如需重装：

```powershell
cd D:\Program\Save\learn\web\blog
pnpm install --registry=https://registry.npmmirror.com
```

### 1.3 构建实测（`pnpm build`）

`pnpm build` 是一条 8 段串联的流水线（详见 2.6）。**实测第一次失败、第二次成功**，两次都属于"网络抖动"，不是代码问题：

**第 1 次：失败（2 分 43 秒）**

```
[CannotFetchFontFile] An error occurred while fetching the font file from
https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/cyrillic-700-normal.woff2
Caused by: fetch failed
```

- 定位：这是 Astro Font API 在构建期下载 `fontConfig` 里 `provider: "fontsource"` 的字体文件，走 `cdn.jsdelivr.net`。
- 复测该 URL：`Invoke-WebRequest` 返回 200（1.7 s / 5336 B），`node fetch` 也返回 200（1.9 s）→ **瞬时网络抖动**，不是配置错误。
- 处理：**原样重跑即可**，不要改 `fontConfig`、不要改构建脚本。

**第 2 次：成功（3 分 10.7 秒）**

| 阶段 | 实测 |
|---|---|
| GitHub 卡片数据 | 命中缓存（`Cached 2 repositories (0 refreshed)`），API 403 限流自动回退旧数据 |
| LQIP 占位图 | 36 张图已在 `src/constants/lqips.json` 中，0 张新增 |
| VNDB 封面 | 跳过（`[VNDB] Page not enabled, skipping cover download`） |
| astro build（`--force`） | 40 个页面，1 分 21 秒；其中含 13 张 OG 分享图 |
| pio 资源裁剪 | 删掉未启用的看板娘资源，释放 15.26 MiB |
| 字体子集化 | 跳过（`No local fonts with subset: true found`） |
| 内联脚本压缩 | 40 个 HTML 中 35 个被处理，1150 段内联脚本，节省 1733 KiB |
| Pagefind 索引 | 1 种语言（zh-cn）18 个页面 / 2088 词，0.6 秒 |

首次在一台新机器上构建，**总耗时按 5~8 分钟预估**（含字体首次下载、依赖冷启动）。

字体下载缓存位置：`blog/node_modules/.astro/fonts/`（在 `node_modules` 内，不随仓库提交，CI 每次重建都要重新下载）。

### 1.4 预览实测（`pnpm preview`）

- `GET http://[::1]:4321/` → **HTTP 200**，365,381 字节，`<title>Firefly - Demo site</title>`。
- 同一时间 `http://127.0.0.1:4321/` 连不上：Astro preview 只监听了 IPv6 `::1`。浏览器里用 `http://localhost:4321/` 即可，需要强制 IPv4 时用 `pnpm preview --host 127.0.0.1`。

### 1.5 `CF_WORKERS` 模式实测（Cloudflare adapter 分支）

为了把部署方式讲清楚，单独跑了一次：

```powershell
$env:CF_WORKERS="1"; npx astro build --force --outDir dist-cf
```

结果（1 分 37 秒，退出码 0）：

```
[@astrojs/cloudflare] Enabling image processing with Cloudflare Images for production with the "IMAGES" Images binding.
[@astrojs/cloudflare] Enabling sessions with Cloudflare KV with the "SESSION" KV binding.
[build] output: "static"   [build] adapter: @astrojs/cloudflare
sitemap-index.xml created at dist-cf\client
[@astrojs/cloudflare] Injected immutable Cache-Control for /_astro/* into _headers.
```

产物布局与默认模式**不同**：

| 模式 | 产物 |
|---|---|
| 不设 `CF_WORKERS`（默认） | `dist/` 纯静态，图片在**构建期**被 sharp 压缩成 webp |
| 设 `CF_WORKERS=1` | `dist/client/`（静态）+ `dist/server/`（worker 入口），并生成 `_headers`；图片**不在构建期压缩**，交给 Cloudflare Images binding；构建还会生成一个未纳入 `.gitignore` 的 `.wrangler/` 目录 |

→ **给纯静态博客的 Cloudflare Pages 托管不要设置 `CF_WORKERS`**（理由见 6.8）。本次测试产物 `dist-cf/` 与 `.wrangler/` 已清理，`git status` 保持干净。

### 1.6 可用命令清单（与 `package.json` 一致）

| 命令 | 实现 |
|---|---|
| `pnpm dev` / `pnpm start` | `astro dev` |
| `pnpm build` | 见 2.6 的 8 段流水线 |
| `pnpm preview` | `astro preview`（预览 `dist/`） |
| `pnpm check` | `astro check` |
| `pnpm type-check` | `tsc --noEmit --isolatedDeclarations` |
| `pnpm new-post <name>` | `node scripts/new-post.js` |
| `pnpm new-dynamic`（`pnpm new-d`） | `tsx scripts/new-dynamic.js` |
| `pnpm lqips` / `pnpm github-cards` | 单独重跑对应生成脚本 |
| `pnpm lint` / `pnpm format` | Biome（**基线刻意没跑**，避免无关格式化 diff） |

---

## 2. 仓库结构要点

### 2.1 顶层

```
blog/
├── astro.config.mjs        # Astro 配置：集成、markdown 插件、CF_WORKERS 分支
├── package.json            # 8 段构建流水线 + pnpm 强制
├── pnpm-lock.yaml          # 提交（CI 用 --frozen-lockfile）
├── pnpm-workspace.yaml     # allowBuilds 白名单（esbuild/workerd）
├── .npmrc                  # manage-package-manager-versions = true
├── wrangler.jsonc          # Cloudflare Workers/静态资源部署配置（见 6.8）
├── vercel.json             # Vercel 部署配置（本项目不用，保留）
├── pagefind.yml            # Pagefind 排除选择器
├── svelte.config.js / postcss.config.mjs / tsconfig.json / biome.json
├── src/                    # 源码
├── public/                 # 原样拷贝的静态资源
├── scripts/                # 构建期脚本（见 2.6）
├── docs/                   # 上游多语言 README 与截图
└── .github/workflows/      # build.yml（check+build）、deploy.yml（GitHub Pages）、biome.yml
```

`tsconfig.json` 路径别名：`@/*` → `src/*`，`@components/*`、`@assets/*`、`@constants/*`、`@utils/*`、`@i18n/*`、`@layouts/*` 分别映射到 `src/<dir>/*`。

### 2.2 `src/config/` —— 站点全部可调项

统一通过 `src/config/index.ts`（barrel）导出，组件里写 `import { siteConfig } from "@/config"`。**所有站点的"人味"都在这个目录里**，改它就能把 demo 站变成自己的站。

### 2.3 `src/content/` —— 内容集合（Astro Content Layer / glob loader）

| 子目录 | 集合 | 读者 |
|---|---|---|
| `src/content/posts/**` | `posts`（`.md` / `.mdx`） | 博客文章，URL `/posts/<相对路径去扩展名>/` |
| `src/content/dynamic/**` | `dynamic`（`.md`） | 动态页（微博客式短内容） |
| `src/content/projects/**` | `projects` | 项目展示页 |
| `src/content/spec/**` | `spec` | 关于页 `about.md`、留言板 `guestboard.md` 等特殊页 |

`src/content/posts/images/` 是**示例文章共用的配图目录**（14 张 avif）；`src/content/posts/guide/` 是带 `index.md` 的子目录示例。

### 2.4 `src/assets/` 与 `public/` —— 静态资源的两条路

| 目录 | 处理方式 | 现有内容 |
|---|---|---|
| `src/assets/**` | 交给 Astro 图片管线，**构建期压缩/转格式**（`imageOptimization.formats: "webp"`），并生成 LQIP 占位图 | `images/avatar.avif`、`images/DesktopWallpaper/d1..d6.avif`、`images/MobileWallpaper/m1..m6.avif`、`images/logo/firefly-{light,dark}.png` |
| `public/**` | **原样拷贝**到 `dist/`，不压缩 | `assets/{css,fonts,images,js,music}`、`favicon/`（12 个图标）、`gallery/`（相册原图）、`pio/`（看板娘模型，约 15 MiB）、`anime-list.json` |

> ⚠️ **路径提醒（给站点定制成员）**：壁纸的真实目录是 **`src/assets/images/DesktopWallpaper/`** 与 **`src/assets/images/MobileWallpaper/`**（`images/` 这一层不能省），配置里写成 `assets/images/DesktopWallpaper/xxx.avif`（相对 `src/`，见 4.3）。

### 2.5 `src/` 其它目录（改行为时需要）

- `src/pages/` —— 文件式路由：首页分页 `[...page].astro`、文章页 `posts/[...slug].astro`、`archive/categories/tags/series`、`api/*.json.ts`、`rss.xml.ts`、`atom.xml.ts`、`robots.txt.ts`、`llms.txt.ts`、`og/[...slug].ts`（构建期用 takumi 生成 OG 分享图，`prerender = true`）。
- `src/components/` —— 按域分目录：`analytics/ comment/ common/ controls/ features/ layout/ misc/ pages/ widget/`。
- `src/layouts/` —— `Layout.astro`（HTML 壳、主题初始化、analytics、Swup 钩子）、`MainGridLayout.astro`（侧边栏/导航/壁纸网格）。
- `src/plugins/` —— 15 个自定义 remark/rehype 插件（Mermaid、PlantUML、KaTeX、GitHub 卡片、阅读时长、wiki 链接…）。
- `src/i18n/` —— `i18nKey.ts` + `languages/*.ts`（zh_CN / zh_TW / en / ja / ko / ru）。
- `src/utils/` —— 内容排序、加密文章、日期、图片处理、TOC 等。
- `src/constants/` —— **提交进仓库的生成物**：`lqips.json`（LQIP 数据）、`github-card-data.json`（GitHub 卡片缓存）、`icons-data.json`。

### 2.6 `scripts/` —— 构建流水线逐个说明

`pnpm build` 的 8 段（顺序不能随意改）：

| # | 脚本 | 做什么 | 需要外网？ |
|---|---|---|---|
| 1 | `generate-github-card-data.ts` | 拉 GitHub 仓库信息写 `src/constants/github-card-data.json`（给 `::github{repo=...}` 卡片用） | 是（`api.github.com`）。失败**保留旧数据**，不中断构建 |
| 2 | `generate-lqips.ts` | 扫描 `src/` 下图片，生成模糊占位图数据写 `src/constants/lqips.json` | 否 |
| 3 | `generate-vndb-covers.ts` | 下载 VNDB 封面到 `public/vndb-covers/` | 是（`api.vndb.org`）。需 `pages.vndb` 开启 + `downloadCovers: true` + `mode: "static"`，当前**跳过** |
| 4 | `astro build --force` | 真正的站点构建（含 OG 图生成、图片压缩） | 是（Astro Font API 从 `cdn.jsdelivr.net` 下载 fontsource 字体，见坑 8.1） |
| 5 | `prune-pio-assets.ts` | 从 `dist/` 删除未启用的看板娘资源（Astro 会无脑复制整个 `public/`） | 否 |
| 6 | `subset-fonts.ts` | 为 `fontConfig.subsetFonts` 里的本地字体做字符子集化 | 否（本地字体文件） |
| 7 | `minify-inline-scripts.ts` | 压缩 `dist/` 里的内联脚本 | 否 |
| 8 | `run-pagefind.ts` | 用 Pagefind 建立静态搜索索引到 `dist/pagefind/` | 否 |

补充脚本（不在流水线里）：

- `new-post.js`、`new-dynamic.js` —— 脚手架（中文文件名会转拼音做 slug）。
- `site-root.ts` —— 所有后处理脚本的产物根目录解析：**优先 `dist/client`（存在时），否则 `dist`**，用来兼容 `CF_WORKERS` 模式。
- `quarantine-bad-posts.mjs` —— 一次性排错工具：把引用了不存在图片的文章移到隔离目录，避免整站构建失败。日常不要用。

### 2.7 构建流水线图示

```
pnpm build
  → GitHub 卡片数据 → LQIP 数据 → VNDB 封面（当前跳过）
  → astro build --force
       内容同步/类型生成 → 静态路由渲染（含 /og/*.png）→ 图片压缩（webp）
  → prune-pio-assets → subset-fonts → minify-inline-scripts → pagefind
  → dist/
```

---

## 3. 可定制配置点清单

> 改配置**只需要动 `src/config/*.ts`**；改完 `pnpm dev` 热更新，构建前无需其它操作。
> 「关键字段」只列日常真会改的，完整字段看文件里的中文注释（上游注释非常全）。

### 3.1 必读的 8 个

#### ① `src/config/siteConfig.ts` —— 站点基础信息

| 字段 | 作用 |
|---|---|
| `title` / `subtitle` | 站点标题 / 副标题（`<title>` 会拼成 "标题 - 副标题"） |
| `site_url` | **站点根 URL**，驱动 canonical / og:url / sitemap / RSS / 外链判定（本项目应填 `https://blog.265702.xyz`，见 6.5） |
| `description` / `keywords` | SEO 描述与关键词 |
| `themeColor.hue` / `.defaultMode` | 主题色相（0~360）与默认亮暗模式（`light`/`dark`/`system`） |
| `pageWidth` / `card` | 内容最大宽度（rem）、卡片边框/阴影、是否跟随主题色 |
| `favicon[]` | 站点图标（`src` 指向 `public/favicon/*`） |
| `navbar.{logo,title,widthFull,menuAlign,followTheme,navbarMode}` | 导航栏 Logo（图标/本地图/远程 URL，支持 `valueDark`）、标题、模式 `static`/`fixed`/`dynamic` |
| `siteStartDate` / `timezone` | 运行天数起点、时区（`Asia/Shanghai`） |
| `categoryBar` / `categoryStyle` / `tagStyle` / `foldArticle` | 分类快捷栏、标签样式、归档折叠 |
| `postListLayout.*` | 列表/网格布局、封面方位、简介行数、元数据与统计显示、瀑布流、列宽 |
| `pagination.postsPerPage` | 每页文章数（当前 10） |
| `post.*` | `rehypeCallouts.theme`（提示框主题）、`showLastModified`、`share`、`postNavigation`、`relatedPosts`、`randomPosts`、**`generateOgImages`**（构建期 OG 图，注释明确说"不建议本地调试时开启"）、`immersiveReading.*` |
| `bilibili/bangumi/vndb/mal` | 第三方追番/游戏数据源（内置的是上游 demo 的 uid/用户名；对应 `pages.*` 开关默认全关） |
| `imageOptimization.{formats,quality,noReferrerDomains}` | 输出格式 `avif`/`webp`/`both`、质量、免 referrer 域名 |
| `feed.contentMode` | RSS 全文 / 摘要 |
| `lang`（文件顶部 `SITE_LANG`） | 站点语言，`zh_CN` / `zh_TW` / `en` / `ja` / `ko` / `ru` |
| `pages.*` | 页面开关（friends / guestbook / dynamic / projects / gallery / booknav / bilibili / bangumi / vndb / mal / sponsor），关掉会 404 并自动隐藏导航项 |

#### ② `src/config/profileConfig.ts` —— 个人资料卡

`avatar`（三条路径规则见 4.3）、`name`、`bio`、`links[]`（`name` / `icon`（Iconify 名，如 `fa7-brands:github`）/ `url` / `showName`）。

图标集已装：`fa7-brands`、`fa7-regular`、`fa7-solid`、`material-symbols`、`simple-icons`、`mdi`、`mingcute`、`svg-spinners`；要用别的图标集先 `pnpm add @iconify-json/<name>`。

#### ③ `src/config/navBarConfig.ts` —— 导航栏

- 顶部 `getDynamicNavBarConfig()` 按顺序 `links.push(...)` 组装菜单：主页 → 文章（归档/分类/标签/系列）→ 社交（友链/留言）→ 我的（动态/项目/相册/书签/追番/番组/VNDB/MAL）→ 关于（打赏/关于我）→ 链接（GitHub 等外链）。
- `LinkPresets`（文件下半部分）集中定义了每个入口的 `name` / `url` / `icon`，**改名改图标只改这里**。
- 带 `pageKey` 的条目会跟随 `siteConfig.pages` 开关自动隐藏。
- `navBarSearchConfig.method = PageFind`（搜索用构建期索引）。

#### ④ `src/config/backgroundWallpaper.ts` —— 背景壁纸

| 字段 | 作用 |
|---|---|
| `mode` | `banner` 横幅 / `fullscreen` 全屏 / `overlay` 覆盖透明 / `none` 纯色 |
| `playerEnable` + `src.playerUrl` | 背景视频（当前是远程 mp4，**建议替换或关闭**） |
| `src.desktop` / `src.mobile` | 单张或**数组**（每次刷新随机一张）；支持 `src/` 相对路径、`public` 绝对路径、远程 URL |
| `common.dimOpacity` | 遮罩暗度 0~1 |
| `common.homeText.*` | 首页大标题 `title`/`titleSize`、副标题 `subtitle[]`、打字机 `typewriter`、`links[]` 图标 |
| `common.carousel` | 多图轮播（`enable`/`interval`/`transitionEffect`） |
| `common.waves` / `common.gradient` | 水波纹、底部渐变（可分别按桌面/移动关） |
| `banner.{position,postInfo.mode,navbar.transparentMode,navbar.blur}` | 横幅图位置、文章页横幅信息（描述/元数据）、导航栏透明与毛玻璃 |
| `overlay.{zIndex,opacity,blur,cardOpacity}` | 覆盖模式的透明度/模糊/卡片透明度 |
| `fullscreen.{layout,position,navbar,blurRamp}` | 全屏模式布局 `classic`/`hero`、导航栏、模糊渐变（`blurRamp` 可关） |

#### ⑤ `src/config/announcementConfig.ts` —— 公告

`title`（留空用 i18n 默认）、`content`、`closable`、`link.{enable,text,url,external}`。

#### ⑥ `src/config/commentConfig.ts` —— 评论

`type` 决定用哪家：`none`（默认，即关闭）/ `twikoo` / `waline` / `giscus` / `disqus` / `artalk`，每家有自己的配置块（`twikoo.envId`、`waline.serverURL`、`giscus.repo/repoId/categoryId`、`artalk.server`、`disqus.shortname`）。评论关闭时留言板/动态评论页会回退 404（`astro.config.mjs` 的 sitemap 过滤里也这样判定）。

#### ⑦ `src/config/fontConfig.ts` —— 字体

- `fontsList[]`：字体定义（`name` / `cssVariable` / `provider`（`google`/`fontsource`/`local`/`bunny`/`fontshare`/`npm`）/ `weights` / `subsets` / `fallbacks`）。`provider: "fontsource"` 会在**构建期**从 `cdn.jsdelivr.net` 下载（坑 8.1）。
- `fontConfig.enable`：总开关；关掉则跳过 Astro Font API（`astro.config.mjs` 里 `fonts: []`）。
- `fontConfig.selected[]`：全局正文字体；`"system"` 表示纯系统字体（当前就是它）。
- 分区字段：`bannerTitleFont`、`bannerSubtitleFont`、`navbarTitleFont`、`codeFont`（填任意 `cssVariable`，留空则跟随全局）。
- `subsetFonts`：本地字体字符子集化配置（构建第 6 段处理）。

#### ⑧ `src/config/sidebarConfig.ts` —— 侧边栏

| 字段 | 作用 |
|---|---|
| `enable` / `position` | 是否启用、位置 `left`/`right`/`both` |
| `tabletSidebar` | 769~1279px 平板端显示哪一侧 |
| `hideSidebarOnPostPage` | 文章页是否隐藏整侧栏 |
| `noSidebarContentWidth` | 没有侧栏列时内容栏占比 |
| `leftComponents[]` / `rightComponents[]` / `mobileBottomComponents[]` | 组件列表，**数组顺序即渲染顺序**；每项 `type` / `enable` / `position`（`top` 固定 / `sticky` 粘性）/ `showOnPostPage` / `hideOnNonPostPage` / `specificConfig` |

可用组件 `type`：`profile`、`announcement`、`music`、`categories`、`tags`、`dynamic`、`stats`、`siteInfo`、`calendar`、`sidebarToc`、`advertisement`。

### 3.2 其它配置（按需）

| 文件 | 作用 | 关键字段 |
|---|---|---|
| `licenseConfig.ts` | 文章版权协议 | `enable`、`name`、`url` |
| `coverImageConfig.ts` | 封面图行为 | `enableInPost`、`enableInPostOverlay`、`randomCoverImage` |
| `musicConfig.ts` | 音乐播放器 | `showInNavbar`、`showInSidebar`、`mode`（`local`/`meting`）、`volume`、`playMode` |
| `pioConfig.ts` | 看板娘（Live2D / Spine） | `enable`、`model`、`position`、`size`；**默认全关**，关着时裁剪脚本会省 15 MiB |
| `sponsorConfig.ts` | 打赏页 | `methods[]`、`sponsors[]`、`showButtonInPost` |
| `dynamicConfig.ts` | 动态页 | `title`、`description`、`showComment`、`itemsPerPage`、`apiUrl` |
| `galleryConfig.ts` | 相册 | `albums[]`、`columnWidth`（图片放在 `public/gallery/<album>/`） |
| `friendsConfig.ts` | 友链 | 友链列表、页面开关、排序 |
| `booknavConfig.ts` | 书签导航 | 分组、favicon 抓取配置 |
| `expressiveCodeConfig.ts` | 代码块外观 | `darkTheme` / `lightTheme`、语言徽章/Logo、折叠 |
| `mermaidConfig.ts` / `plantumlConfig.ts` | 图表 | 主题；PlantUML 走**远程服务器** `https://www.plantuml.com/plantuml`（页面里是 `<img>` 外链，构建不需要它） |
| `effectsConfig.ts` | 樱花等特效 | `enable`、`sakuraNum`、`limitTimes` |
| `analyticsConfig.ts` | 统计 | `googleAnalyticsId`、`microsoftClarityId`、`umamiAnalytics`、`la51Analytics` |
| `displaySettingsConfig.ts` | 访客设置面板 | 面板总开关；也可用环境变量 `PUBLIC_DISPLAY_SETTINGS=true/1/on/yes` 覆盖（部署平台里设，无需改配置） |
| `FooterConfig.html` | 页脚自定义 HTML（`src/components/layout/Footer.astro` 在构建期读取该文件，HTML 注释会被剥掉） | 直接写 HTML；当前为空（只有注释），即用默认页脚 |

---

## 4. 内容规范

### 4.1 posts 的 frontmatter（来自 `src/content.config.ts`）

只有 `title` 和 `published` 是必填，其余都有默认值（下表"默认"列即 schema 的 `.default()`）：

| 字段 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `title` | string | ✅ | — | 文章标题 |
| `published` | date | ✅ | — | 发布日期（`2026-10-30` 这种写法即可） |
| `updated` | date | | — | 更新日期，缺省用 `published`；超过 `outdatedThreshold` 天才会显示"上次编辑"卡片 |
| `draft` | boolean | | `false` | `true` 不进列表、不生成页面 |
| `description` | string | | `""` | 摘要，显示在列表卡片 |
| `image` | string | | `""` | 封面图路径（规则见 4.3） |
| `tags` | string[] | | `[]` | 标签 |
| `category` | string \| null | | `""` | 分类（`""` / `null` 视为"未分类"） |
| `lang` | string | | `""` | 文章语言，和站点语言不同时才需要写 |
| `pinned` | boolean | | `false` | 置顶 |
| `author` | string | | `""` | 覆盖默认作者（显示在版权块/结构化数据） |
| `sourceLink` | string | | `""` | 原文链接 |
| `licenseName` / `licenseUrl` | string | | `""` | 覆盖默认许可证（默认取 `licenseConfig`） |
| `comment` | boolean | | `true` | 是否显示评论区 |
| `password` / `passwordHint` | string | | `""` | 设置后正文构建期 AES-256-GCM 加密，访客输入密码才可见 |
| `series` / `seriesOrder` | string / number | | `""` / — | 系列名与序号（生成"系列"页与上下篇导航） |

补充说明（实测/源码确认）：

- **`slug` 不在 schema 里**：URL 由**文件相对路径**决定（`removeFileExtension(id)`），写成 `slug: xxx` 只会被 Zod 丢弃、**不生效**。示例文章里出现的 `slug:` 与文件名一致，所以看不出差别。想改 URL 就改文件名/目录名。
- URL 实测：`src/content/posts/firefly.md` → `/posts/firefly/`；`src/content/posts/guide/index.md` → `/posts/guide/`；`src/content/posts/guide/firefly-layout-system.md` → `/posts/guide/firefly-layout-system/`（`trailingSlash: "always"`，结尾带 `/`）。
- 站点为中文，`published` 建议直接用 `2026-10-30` 格式。

### 4.2 其它集合

- `dynamic`（`src/content/dynamic/*.md`）：`published`（必填）、`pinned`、`location`。
- `projects`（`src/content/projects/*.md`）：`title`、`published`、`draft`、`order`、`description`、`image`、`tags`、`link[]`（`label`/`icon`/`value`）、`status`、`lang`。
- `spec`（`src/content/spec/*.md`）：**无 schema**，纯 Markdown，用于 `/about/`（`about.md`）等静态页。

### 4.3 图片引用约定（最容易踩的坑）

**规则一：配置里的图片路径（avatar / wallpaper / logo / cover 默认图）**

| 写法 | 解析位置 | 是否优化 |
|---|---|---|
| `assets/images/avatar.avif`（**不以 `/` 开头**） | `src/assets/...`（相对 `src/`） | ✅ 构建期转 webp + 生成 LQIP |
| `/assets/images/x.webp`（**以 `/` 开头**） | `public/...` | ❌ 原样拷贝 |
| `https://...` | 远程 | ❌ |

**规则二：文章里的图片（`image:` 封面 + 正文 `![](...)`）**

| 写法 | 解析位置 | 是否优化 |
|---|---|---|
| `./images/1.avif`、`../images/left-list.avif`、`./cover.avif` | **相对当前 md 文件** | ✅ |
| `/assets/...` | `public/` | ❌ |
| `https://...` | 远程 | ❌ |

**规则三：推荐用法**

1. **文章自带图**：在文章同目录建资源（或统一用 `src/content/posts/images/`），用相对路径引用 —— 例如现有文章 `![Firefly](./images/1.avif)`、子目录文章 `image: ../images/firefly1.avif`。好处：构建期自动压缩，仓库里也不用重复存大图。
2. **站点级图片**（头像、壁纸、Logo）：放 `src/assets/images/...`，配置里写不带前缀的相对路径。
3. **不能被处理的静态文件**（favicon、字体、音乐、相册原图、`robots.txt` 之类、下载类文件）：放 `public/`，用 `/xxx` 引用。
4. 新增 `src/` 下的图片后，跑一次 `pnpm lqips`（或直接 `pnpm build`）刷新 `src/constants/lqips.json`；否则新图没有模糊占位图。
5. 图片体积建议：单张壁纸 ≤ 300 KB、文章配图 ≤ 200 KB，`dist/` 目前 22.8 MB，其中 `_astro/` 7.1 MB、`posts/` 6.0 MB。

---

## 5. 日常操作

### 5.1 新增一篇文章

**方式 A（推荐，带骨架）：**

```powershell
cd D:\Program\Save\learn\web\blog
pnpm new-post my-first-note
```

生成 `src/content/posts/my-first-note.md`，frontmatter 骨架如下（中文文件名会自动转拼音；`.../index` 会去掉尾段）：

```yaml
---
title: my-first-note
published: 2026-10-30
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
slug: my-first-note   # ⚠️ 该字段不生效（见 4.1），保留无害
---
```

**方式 B（手写）：** 直接在 `src/content/posts/` 下新建 `.md` / `.mdx`，至少写 `title` 和 `published`。

建议写法（与站点定位一致）：

```yaml
---
title: 用 Astro 写一篇技术笔记
published: 2026-10-30
description: 记录一次实际踩坑与解决过程。
image: ./images/cover.avif
tags: [Astro, 前端, 笔记]
category: 技术笔记
lang: zh-CN
draft: false
---
```

发布前自检：`draft: false`、`image` 路径真实存在、`published` 是合法日期、`pnpm dev` 能打开 `/posts/<文件名>/`。

### 5.2 改配置

1. 只改 `src/config/*.ts`（章节 3 的清单）。
2. `pnpm dev` 下改完自动热更新；`rehypeCallouts` 等少数项需重启 dev server。
3. 改完想确认效果：`pnpm build` + `pnpm preview`。

### 5.3 本地预览

```powershell
pnpm dev        # 开发模式，按需编译，改代码即时生效
pnpm build      # 生产构建（约 3 分钟）
pnpm preview    # 预览 dist/，等价上线效果；地址 http://localhost:4321/
```

### 5.4 构建后检查清单

- `dist/index.html` 存在、`dist/pagefind/` 存在（搜索可用）
- `dist/posts/<slug>/index.html` 有你新加的文章
- 浏览器打开 `http://localhost:4321/`，检查标题/头像/封面/暗色模式
- `git status --short` 里只应有你**故意**改的文件（`dist/`、`node_modules/`、`.astro/` 已在 `.gitignore`）

---

## 6. 部署：GitHub 仓库 + Cloudflare Pages

### 6.1 两条路径的取舍（先看这个）

| 维度 | A. GitHub → Cloudflare Pages（Git 集成）**← 推荐** | B. 本地构建 + `wrangler` 上传 |
|---|---|---|
| 触发方式 | `git push` 自动构建部署 | 本地 `pnpm build` 后 `wrangler` 上传 |
| 上线一致性 | 构建环境在云端，人走机器关都不影响 | 依赖本机网络（字体 CDN 等）与 Node 版本 |
| 预览环境 | 每个非生产分支自动出预览 URL | 无 |
| 回滚 | 面板里一键回滚到任一次部署 | 需重新上传旧产物 |
| 首次配置成本 | 选仓库 + 填 3 个参数（约 2 分钟） | 装 `wrangler`、登录/token、记命令 |
| 适合 | **日常写作、持续更新（本项目）** | 应急、或不想把仓库授权给 CF |

结论：**主用 A**，把 B 当作"云端构建出问题时的应急通道"。

### 6.2 前置：准备你自己的 GitHub 仓库

当前仓库的 `origin` 指向上游 Firefly（经 gh-proxy 代理），**不能直接用它当发布仓库**。建议重命名：

```powershell
cd D:\Program\Save\learn\web\blog
git remote rename origin upstream
git remote add origin https://github.com/mobydick5702-dev/<你的仓库名>.git
git push -u origin master
```

注意：

- 本机 `git config user.name` / `user.email` **当前为空**（实测 `git config user.name` 返回非 0），第一次 commit 前先设置，否则提交会报 `Please tell me who you are`。
- 推送前确认没有把 `.env`、token、`dist/` 提上去（`.gitignore` 已覆盖 `dist/`、`node_modules/`、`.astro/`、`public/vndb-covers/`）。
- 仓库里 `.github/workflows/deploy.yml` 是**上游给 GitHub Pages 用的**：推到 `master` 会触发它，如果你没在 GitHub 仓库设置里启用 Pages，这个 workflow 会失败（不影响 Cloudflare 部署）。不需要 GitHub Pages 的话，可在仓库 Settings → Actions 里禁用它，或后续删掉该 workflow 文件。

### 6.3 Cloudflare Pages 项目配置（照抄即可）

Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → 选你的仓库。

| 配置项 | 值 | 说明 |
|---|---|---|
| Project name | 例如 `moby-blog` | 会得到 `<project>.pages.dev` |
| Production branch | `master`（或 `main`，与你推送的分支一致） | 其它分支出预览部署 |
| Framework preset | `Astro` | 只影响默认值，下面两项以手填为准 |
| **Build command** | `pnpm build` | 8 段流水线全跑，不能简化成 `astro build` |
| **Build output directory** | `dist` | 纯静态产物 |
| Root directory | 留空（仓库根就是博客根） | 如果你的博客在子目录才填 |
| **环境变量 `NODE_VERSION`** | `22.23.0`（或 ≥22.23 的 22.x） | 项目 `engines` 要求 `node >=22.23.0`；Cloudflare Pages 构建镜像 v3 默认已是 Node 22（见文末参考），显式固定最稳 |
| 环境变量 `NODE_ENV` | 不需要手动设（构建时自动 production） | — |
| **`CF_WORKERS`** | **绝对不要设** | 一旦设置，产物会变到 `dist/client` 且关掉构建期图片压缩（1.5 节实测），Pages 的输出目录就得改成 `dist/client`，得不偿失 |

关于 pnpm 的兜底：仓库 `package.json` 里写死了 `packageManager: pnpm@11.22.0`，`.npmrc` 开了 `manage-package-manager-versions = true`，pnpm ≥9.7 会自动切到该版本；`preinstall: npx only-allow pnpm` 意味着**用 npm 装依赖会直接失败**。如果某次构建日志显示 pnpm 版本过低或缺失，把 Build command 改成：

```bash
npm i -g pnpm@11.22.0 && pnpm install --frozen-lockfile && pnpm build
```

其它可调项（可选）：

| 环境变量 | 作用 |
|---|---|
| `PUBLIC_DISPLAY_SETTINGS=true` | 无需改代码即开启访客设置面板（`src/config/README.md` 记录的官方开关） |
| `NODE_OPTIONS=--max-old-space-size=4096` | 内容量很大导致构建 OOM 时加（当前 40 页不需要） |

构建时间参考：本机 3 分 11 秒（不含 `pnpm install`）；云端首次约 5~8 分钟。Pages 单次构建上限 20 分钟，够用。

### 6.4 绑定自定义域 `blog.265702.xyz`

前提：`265702.xyz` 的 DNS 已经托管在同一个 Cloudflare 账号下（用户已确认）。

1. Pages 项目 → **Custom domains** → **Set up a custom domain** → 输入 `blog.265702.xyz` → **Continue**。
2. Cloudflare 会**自动**在 `265702.xyz` 区域里创建一条 `CNAME` 记录：`blog` → `<project>.pages.dev`（代理状态开启），并自动签发/续期 SSL 证书。一般不需要手动加记录。
3. 如果提示记录冲突（该名称已有 A/AAAA/CNAME 记录），先到 **DNS → Records** 删掉冲突记录，再回到 Custom domains 重试。
4. 状态从 `Initializing` 变 `Active`（通常几分钟）后，打开 `https://blog.265702.xyz/` 验证。
5. SSL/TLS 建议：**SSL/TLS → Overview → Full (strict)**；**Edge Certificates → Always Use HTTPS** 打开。
6. 建议关闭 **Speed → Optimization → Rocket Loader**（它会改写脚本加载方式，容易影响 Svelte 水合与 Swup 页面过渡）。
7. 主域 `265702.xyz` 本身的记录不受影响：博客是子域，独立解析。

### 6.5 `siteConfig.site_url` 该填什么

**填 `https://blog.265702.xyz`**（协议 + 域名，**不带结尾斜杠、不带子路径**）。

依据（`astro.config.mjs` → `site: siteConfig.site_url`，实测产物）：

| 影响面 | 实测证据 |
|---|---|
| canonical | `dist/index.html` 里 `<link rel="canonical" href="https://firefly.cuteleaf.cn/">` |
| `og:url` / `og:image` | `https://firefly.cuteleaf.cn/og/firefly.png` |
| sitemap `dist/sitemap-0.xml` | 用 `site_url` 拼接 |
| RSS / Atom / `robots.txt` / `llms.txt` | 同上 |
| 文章内绝对外链判定（`rehypeExternalLinks`） | 用 `site_url` 判断"是否站内" |

所以 **`site_url` 必须在构建前改对**，否则 sitemap、RSS、分享卡片全都指向错域名。改了以后重新 `pnpm build` 才会生效。

### 6.6 产物与缓存

- `dist/` 329 个文件 / 22.8 MB，无单文件超限（Pages 限额：单文件 25 MiB、站点 20,000 文件）。
- 默认模式不会生成 `_headers`。如需给 `/_astro/*` 加长缓存，可在 `public/_headers` 里写规则（会被原样拷进 `dist/`，Pages 自动识别）：

  ```
  /_astro/*
    Cache-Control: public, max-age=31536000, immutable
  ```

- 404：`dist/404.html` 已生成，Pages 默认会用它。
- 搜索：`dist/pagefind/` 是构建期生成的静态索引，不需要服务端。

### 6.7 常见坑（部署侧）

| 现象 | 原因 | 处理 |
|---|---|---|
| 构建失败在 `CannotFetchFontFile` | 云端/本地到 `cdn.jsdelivr.net` 抖动 | **重跑一次构建**（Retry deployment）；连续失败再考虑换网 |
| 构建失败在 `only-allow pnpm` | 构建命令走了 `npm install` | Build command 用 `pnpm build`；必要时用 6.3 的兜底命令 |
| 站点能开但样式/图片全挂 | Build output 填成了 `dist/client` 或根目录 | 纯静态模式必须是 `dist` |
| 分享卡片/canonical 还是旧域名 | `site_url` 没改或改了没重新构建 | 改 `siteConfig.site_url` 后重新构建部署 |
| 文章 URL 404 | URL 由文件名决定（4.1），不是 `slug` 字段 | 检查实际 `dist/posts/<文件名>/` |
| GitHub Actions 红叉 | 上游的 GitHub Pages workflow 在跑 | 不需要就禁用该 workflow |
| 自定义域一直 `Initializing` | 同名 DNS 记录冲突 / 证书签发中 | 删冲突记录后重试，等 5~10 分钟 |

### 6.8 与 Workers 方式的对比（`wrangler.jsonc` / `CF_WORKERS`）

`wrangler.jsonc` 当前内容：

```jsonc
{
  "name": "firefly",
  "compatibility_date": "2025-01-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./dist" }
}
```

它描述的是 **Workers + 静态资源（Workers Assets）** 部署：把 `dist/` 作为静态资源挂到 Worker 上，没有 `main` 入口。配合 `astro.config.mjs` 里的开关：

```js
const adapter = process.env.CF_WORKERS ? cloudflare({ prerenderEnvironment: "node" }) : undefined;
```

| | Cloudflare Pages（推荐） | Cloudflare Workers + `wrangler` |
|---|---|---|
| 是否需要 adapter | **不需要**（`CF_WORKERS` 不设） | 若走适配器则需 `CF_WORKERS=1` |
| 产物目录 | `dist/` | 适配器模式：`dist/client`（静态）+ `dist/server`；纯静态模式：`dist/` |
| 图片优化 | **构建期** sharp 压缩成 webp | 适配器模式交给 Cloudflare Images（需 `IMAGES` binding），构建期不压缩 |
| 配置成本 | 浏览器里点几下 | 需 `wrangler login` 或 `CLOUDFLARE_API_TOKEN` + `account_id` |
| 适合本项目的度 | ✅ 高（纯静态博客） | 中（除非以后要 SSR/边缘逻辑） |

如果确实想用 Workers：

```powershell
# 纯静态资源方式（与现有 wrangler.jsonc 的 ./dist 匹配）
pnpm build
npx wrangler deploy                 # 需先 npx wrangler login

# 或者不建 Pages 项目，直接上传 Pages 产物
npx wrangler pages deploy dist --project-name=moby-blog
```

注意：若设置 `CF_WORKERS=1` 用适配器构建，`wrangler.jsonc` 的 `assets.directory` 需要改成 `./dist/client`，并按适配器产物补上 worker 入口；同时构建会生成 `.wrangler/`（未被 `.gitignore` 覆盖，别提交）。**本项目不需要走到这一步。**

### 6.9 上线后自检

1. `https://blog.265702.xyz/` 打开，标题/头像/壁纸是新的（不是 Firefly demo）
2. `/posts/<你的文章>/` 能开，图片不裂
3. `/archive/`、`/tags/`、`/search/` 能开，搜索能出结果（说明 Pagefind 索引存在）
4. 查看页面源码：`<link rel="canonical">`、`og:url` 都是 `https://blog.265702.xyz`
5. `/rss.xml`、`/sitemap-index.xml` 可访问
6. 手机端打开一次，确认移动壁纸与布局正常

---

## 7. 同步上游 Firefly 更新

当前 `origin` 指向上游（gh-proxy 代理地址），按 6.2 重命名成 `upstream` 后，日常同步：

```powershell
cd D:\Program\Save\learn\web\blog
git fetch upstream
git log --oneline HEAD..upstream/master      # 先看上游更新了什么
git merge upstream/master                    # 或 git rebase upstream/master
pnpm install                                 # 依赖可能变了（package.json/pnpm-lock.yaml）
pnpm build                                   # 必跑，确认没被上游改坏
```

只想拿某几个提交：`git cherry-pick <commit>`。

**冲突高发文件**（定制越深越容易撞）：

| 文件 | 原因 | 降低冲突的做法 |
|---|---|---|
| `src/config/*.ts` | 所有个性化都在这里（标题、头像、壁纸、导航） | 尽量只改"值"，不改结构；不新增文件 |
| `src/content/posts/**` | 上游会更新示例文章，我们也会加自己的文章 | 自己的文章用**独立文件名/子目录**，不要改上游示例（确需删示例时集中一次提交） |
| `package.json` / `pnpm-lock.yaml` | 依赖升级 | 不要手动改 lock；冲突时 `git checkout --theirs pnpm-lock.yaml` 后重新 `pnpm install` |
| `astro.config.mjs` | 集成与插件链调整 | 非必要不改；要改就单独小提交 |
| `src/constants/lqips.json`、`github-card-data.json` | 生成物，双方都会变 | 冲突时直接用**自己重新生成的那份**（`pnpm lqips` / `pnpm github-card-data.ts`） |
| `src/i18n/languages/*.ts`、`README.md`、`.github/workflows/**` | 文案/CI 变动 | 与站点无关的接受上游版本 |

长期策略：**把"定制"限制在 `src/config/**` + `src/content/**` + `src/assets/**`**，组件层（`src/components`、`src/layouts`、`src/utils`、`src/plugins`）尽量不动 —— 上游升级时基本可以 `git merge` 无痛通过。

---

## 8. 已知坑与规避

| # | 现象 | 原因 | 处理 |
|---|---|---|---|
| 8.1 | `pnpm build` 报 `CannotFetchFontFile ... cdn.jsdelivr.net` | Astro Font API 在构建期下载 fontsource 字体，网络瞬断 | **原样重跑**（本次实测第 2 次即成功）；首次构建必须能连 `cdn.jsdelivr.net`；缓存位于 `node_modules/.astro/fonts/`，重装依赖会清 |
| 8.2 | 构建日志 `[GITHUB-CARD] Failed to refresh ... 403 rate limit exceeded` | `api.github.com` 匿名限流 | 非致命，脚本保留 `src/constants/github-card-data.json` 旧数据，构建继续 |
| 8.3 | 用 PowerShell 看中文文件是乱码；用 `Set-Content`/`Out-File` 写文件后 Astro 解析失败 | Windows 控制台是 GBK（只是**显示**乱码，文件本身是 UTF-8）；`Set-Content -Encoding utf8` 在 PowerShell 5.1 会写 **BOM** | 读文件用 `read` 工具；写文件用 `write`/`edit`（UTF-8 无 BOM）；不要用重定向写含中文的源码 |
| 8.4 | Node 版本过低时报错/语法不支持 | `engines.node >= 22.23.0`，Astro 7 要求现代 Node | 用 Node 22.23+ 或 24；CI/Pages 里显式设 `NODE_VERSION` |
| 8.5 | 用 `npm install` 装依赖直接失败 | `preinstall: npx only-allow pnpm` | 只用 pnpm |
| 8.6 | 构建慢（3 分钟起） | 8 段流水线 + 图片压缩 + OG 图生成，其中 OG 图每篇 0.2~1.8 秒 | 本地调试可在 `siteConfig.post.generateOgImages` 临时关掉；上线前记得开回来 |
| 8.7 | `pnpm preview` 后 `127.0.0.1:4321` 打不开 | preview 只监听 IPv6 `::1` | 用 `http://localhost:4321/`，或 `pnpm preview --host 127.0.0.1` |
| 8.8 | `dist/`、`node_modules/`、`.astro/` 出现在 `git status` 里 | 它们**已**在 `.gitignore` 中，正常不会出现；若出现说明被强制加过 | 别提交构建产物；`src/constants/*.json` 这类**生成物是要提交的**，注意区分 |
| 8.9 | 文章引用的图片不存在导致整站构建失败 | Astro 图片管线对缺失文件是硬错误 | 先用 `scripts/quarantine-bad-posts.mjs` 定位（把坏文章挪到隔离目录），再修路径 |
| 8.10 | 页面里的 PlantUML 图裂 | 图片地址是 `https://www.plantuml.com/plantuml/svg/...` 外链（构建期不下载） | 需要时可自建 PlantUML 服务并改 `plantumlConfig.server`；或不用 PlantUML |
| 8.11 | 首页背景视频加载慢/无法播放 | `backgroundWallpaper.src.playerUrl` 是远程 mp4（`bed.twoleaf.cn`） | 换成自己的视频（放 `public/assets/videos/`）或 `playerEnable: false` |
| 8.12 | `CF_WORKERS` 构建后多出 `.wrangler/` 目录 | Cloudflare adapter 生成 | 不要提交；考虑把它加进 `.gitignore` |
| 8.13 | 上游 GitHub Pages workflow 报错 | `.github/workflows/deploy.yml` 在 push `master` 时触发 | 不需要就在仓库 Settings → Actions 禁用 |

---

## 9. 本次基线的验收自检记录

| 检查项 | 命令 / 方法 | 结果 |
|---|---|---|
| 仓库完整性 | `git status --short`、`git log --oneline -1` | 干净；`master` @ `4b976574` |
| 关键文件齐全 | 目录/文件存在性检查 | `src/config`（26 项）、`src/content`（4 集合）、`package.json`、`pnpm-lock.yaml` ✅ |
| 依赖可用 | `pnpm list --depth=0` | 正常输出，无致命错误；1175 个包 |
| 构建 | `pnpm build` | **退出码 0**，3 分 10.7 秒 |
| 产物 | `Test-Path dist/index.html` | ✅ 365,381 字节；`dist/` 共 329 文件 / 22.8 MB |
| 预览 | `pnpm preview` + `GET http://[::1]:4321/` | **HTTP 200** |
| adapter 分支 | `CF_WORKERS=1 npx astro build --outDir dist-cf` | 退出码 0，产物 `dist-cf/client` + `dist-cf/server`（测试后已清理） |
| 业务代码未被改动 | `git status --short`（构建后） | 空输出 —— 只有新增本文件 `BASELINE.md` |

---

## 参考

- 上游仓库：https://github.com/CuteLeaf/Firefly ｜ 文档：https://docs-firefly.cuteleaf.cn/
- Astro 部署指南：https://docs.astro.build/zh-cn/guides/deploy/
- `@astrojs/cloudflare`（SSR adapter，本项目静态托管不需要）：https://docs.astro.build/en/guides/integrations-guide/cloudflare/
- Cloudflare Pages 构建镜像与 Node 版本（构建镜像 v3 默认 Node.js v22）：https://developers.cloudflare.com/pages/configuration/build-image/
- 仓库内文档：`README.md`（快速开始/部署）、`src/config/README.md`（配置目录说明）、`CLAUDE.md`（架构与构建流水线）、`AGENTS.md`（代码风格与命令）

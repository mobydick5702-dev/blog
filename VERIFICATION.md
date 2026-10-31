# VERIFICATION.md — 整合结果独立验证报告（t4 / reviewer）

> **复审轮次 2（最新，2026-10-31）：F1 / F3 / F5 / F6 全部修复且无回归 → 最终结论 PASS。详见文末《第二轮（复审）· t7》章节。**
> 本文件第一章「第一轮」保留原样（含当时判定的 NEEDS_FIX 与 F1–F8 编号），以便追溯问题从发现到关闭的过程。

> 第一轮验证对象：`blog/` 工作区当前状态（t1 基线 + t2 站点定制 + t3 内容创作 的合并结果）
> 验证者：reviewer（独立验证，未参与上述任何一个实现任务）
> 第一轮验证时间：2026-10-30 23:10 ~ 23:46（本机时钟）
> 验证方式：重新跑生产构建 + 静态审阅 git diff + 直接解析 `dist/` 产物 + 反向解析图片血缘 + 无头 Chrome 渲染/取计算样式
> 第一轮结论：**NEEDS_FIX**（阻塞项 1 个 F1；1 条占位值必须由用户提供 F2；3 条低风险优化 F3–F5；3 条提示 F6–F8）

---

## 0. 结论速查

| # | 检查项 | 结果 | 一句话 |
|---|---|---|---|
| 1 | 生产构建（`pnpm build`） | **PASS** | 退出码 0，`dist/index.html` 存在；产物规模与 t2 记录逐字节吻合，可复现 |
| 2.1 | 站点已是 moby5702 的个人博客（标题/副标题/描述/作者/头像/背景/横幅文字） | **PASS** | 6 类全部换新，无 demo 值 |
| 2.2 | 头像来自 `picture/moby5702.jpg`、背景来自 `picture/background2.jpg`、备选壁纸在库且有切换注释 | **PASS** | 逐像素比对 meanAbsDiff 1.14 / 1.23（≈JPEG 重编码噪声） |
| 2.3 | `site_url = https://blog.265702.xyz` | **PASS** | canonical / og:url / sitemap / RSS / robots 全部指向它 |
| 2.4 | 文章覆盖 技术 3 + 生活 1 + 文学 1，≥5 篇，无占位内容，图片可解析 | **PASS** | 5 篇 775~1496 中文字，图片 0 缺失 |
| 2.5 | 被改文件都有 `[CUSTOM]` 标记 | **PASS** | 19 个被改文件里 18 个源码文件 100% 有标记、共 57 处；唯一例外是构建派生 JSON（不可加注释，文档已说明） |
| 2.6 | `CUSTOMIZATION.md` 与 `git diff` 一一对应、可据此还原 | **PASS** | 19 个文件逐个对上；抽查 20+ 个"原值"回查 git HEAD 全部一致 |
| 2.7 | `BASELINE.md` 覆盖安装/构建/配置点/新增文章/同步上游 + GitHub→Cloudflare Pages（含 `blog.265702.xyz` 自定义域） | **PASS** | 9 章 723 行，§6.3/§6.4 可照抄执行 |
| 3 | 部署可行性（纯静态产物 + CF Pages 参数 + 自定义域步骤） | **PASS** | `dist/` 无任何服务端产物；参数与仓库实际一致 |
| 4 | 产物抽查与死链扫描 | **PASS** | 缺图 0（394 处 img/srcset 引用、44 个本地路径）、站内死链 0/40、canonical 39/39 |
| 5 | **demo 残留扫描** | **FAIL** | `Demo site`、`firefly.cuteleaf.cn` 仍在 5 个渲染页 + RSS/Atom 全文 + sitemap 里（来源是主题 demo 文章/项目） |
| 6 | 配置一致性（移动壁纸、暗色 logo、其余静态资源） | **PASS** | 所有被引用的图片/音频/图标文件均真实存在，暗色 logo 在产物里且有独立 source |

**因此：整体结论 NEEDS_FIX。** 唯一需要改代码的是第 5 项（主题 demo 内容上线）：最小修复是给 15 个 demo 内容文件（13 篇文章 + 2 个项目）各加一行 `draft: true`（或删除）后重新构建，详见 §8/§9。其余：1 条占位邮箱必须由用户提供值（F2），3 条低风险优化（F3–F5），3 条提示（F6–F8，不影响交付）。

---

## 1. 验证环境与口径（先说清楚适用范围）

| 项 | 值 |
|---|---|
| 平台 | Windows（PowerShell 5.1） |
| Node / pnpm | `v24.18.0` / `11.22.0`（= `package.json` 的 `packageManager: pnpm@11.22.0`） |
| 工作目录 | `D:\Program\Save\learn\web\blog` |
| 构建命令 | `pnpm build`（8 段流水线，见 §4） |
| 验证产物 | `blog/dist/`（本次重新构建生成，`dist/` 已在 `.gitignore`） |
| 临时脚本 | `blog/.verify/*.mjs`（验证完成后已删除，要点见附录 A） |

三条口径说明，避免误读证据：

1. **控制台中文乱码不是问题**：这台机器的 PowerShell 控制台是 GBK，`Get-Content` 回显中文会乱码；文件本身是 UTF-8。本报告里所有中文字符串证据都来自 Node 脚本按 UTF-8 解析，不是控制台回显。
2. **本机只有 Node 24**：项目 `engines` 要求 `node >=22.23.0`，本机 24.18.0 满足；但**没有**在恰好 22.23.0 上复测过构建。Cloudflare Pages 侧按 BASELINE §6.3 显式设 `NODE_VERSION=22.23.0` 即可，属环境差异而非代码问题。
3. **`npx astro preview` 在本会话启动失败**：`--port 4399` 等待 30 秒仍未监听端口，且无 error 输出（进程活着、日志只有一行 npm warn）。改用一次性静态服务器托管 `dist/`（`127.0.0.1:4400`）完成渲染验证与截图 —— 这步同时反证了 `dist/` 不需要 Astro/Node 运行时即可对外服务（见 §4 第 1 条）。

---

## 2. 构建验证 —— PASS

```
$ cd blog && pnpm build
...
✨ Minified 1211 inline scripts in 39/45 HTML files, saved 1038.0 KiB
Running Pagefind v1.5.2 (Extended)
  Indexed 23 pages
  Indexed 3092 words
[exit=0]
```

| 指标 | 本次实测 | t2 记录值 | 判定 |
|---|---|---|---|
| 退出码 | **0** | 0 | 一致 |
| `dist/index.html` | 存在，**306,242 B** | 306,242 B | 逐字节一致 |
| `dist/` 文件数 | **352** | 352 | 一致 |
| `dist/` 体积 | 22.39 MB（22,926 KB） | 22,926 KB | 一致 |
| HTML 页数 | **45** | 45 | 一致 |
| Pagefind | 23 页 / 3,092 词 | 23 页 / 3,092 词 | 一致 |

**可复现性结论**：同一台机器上两次独立构建（t2 一次、本次一次）产出完全相同，说明构建不是"碰运气跑过"，且 `src/constants/lqips.json` 这类派生产物已经稳定（本次 `generate-lqips.ts` 报 `Processed 0/0 new images. Total: 47`）。

**非致命噪声（与代码无关，不需修）**：

- `[GITHUB-CARD] Failed to refresh CuteLeaf/Firefly; ... 403 rate limit exceeded` → 脚本自动回退本地缓存 `src/constants/github-card-data.json`，构建继续。
- `(!) Some chunks are larger than 500 kB after minification` → 主题自带的体积告警，上游行为。
- `6 pages found without an <html> element`（Pagefind）→ 那 6 个是禁用页面的重定向桩，见 §5.4。

---

## 3. 需求覆盖逐条核对

### 3.1 站点是 moby5702 的个人博客（不再是 Firefly demo）—— PASS

| 站点元素 | 当前值 | 证据位置 |
|---|---|---|
| 标题 | `Moby's Blog` | `dist/index.html` `<title>Moby&#39;s Blog - 技术笔记 · 生活随笔</title>` |
| 副标题 | `技术笔记 · 生活随笔` | 同上 + `og:title` |
| 描述 | `Moby5702 的个人技术博客：以编程与技术笔记为主，也记录生活随笔、读书与文学分享。` | `meta[name=description]`、`og:description`、`llms.txt` |
| 关键词 | `Moby5702, 技术笔记, 编程, 生活随笔, 文学, Astro, 静态博客, 个人博客` | `meta[name=keywords]` |
| 作者名 | `Moby5702` | `meta[name=author]`，首页 HTML 内出现 12 次（侧边栏/关于卡/JSON-LD） |
| 头像 | `/_astro/avatar-moby.*.webp` | 首页与关于页 `<img>`/`<picture>` |
| 背景 | `/_astro/moby-desktop.*.webp`（桌面）+ `/_astro/moby-mobile.*.webp`（移动） | 首页 `picture source` |
| 横幅文字 | 标题 `Moby's Blog`；副标题打字机 4 条中文标语 | 首页 `.banner-title` / `#banner-subtitle` |
| 语言 | `<html lang="zh-CN">` | `dist/index.html` 第 1 行 |
| 页脚/版本卡 | 仍显示 `Astro & Firefly` 与"博客版本"链接 | **属主题版权/致谢，按任务要求保留** |

> 唯一"看起来还是 demo"的地方是**文章与项目内容**（首页第一张卡片是主题自荐文），这不属于站点信息层面，单独记为问题 F1（§6）。

### 3.2 头像 / 背景 / 备选壁纸 —— PASS

做法：把 `picture/` 里的源图按目标尺寸缩放后与仓库内资产**逐像素**比较（`meanAbsDiff`，越小越像；<3 视为同一张图，JPEG 重编码通常 1~2）。

| 源图（`picture/`） | 仓库资产 | 比对方式 | meanAbsDiff | 判定 |
|---|---|---|---|---|
| `moby5702.jpg` 1080×1080 | `src/assets/images/avatar-moby.jpg` 512×512 | 缩放到 512 后比对 | **1.14** | 同一张 ✔ |
| `moby5702.jpg` | `public/assets/images/avatar.jpg` 512×512 | 同上 | **1.14** | 同一张 ✔（与上一行 SHA256 完全相同，是"稳定 URL 副本"） |
| `background2.jpg` 5925×3528 | `src/assets/images/DesktopWallpaper/moby-desktop.jpg` 2560×1524 | 缩放到 2560×1524 后比对 | **1.23** | 同一张 ✔ |
| `background.png`（实为 WebP 容器）942×530 | `.../moby-desktop-alt1.webp` 942×530 | 同尺寸比对 | **0.00** | 同一张 ✔ |
| `background3.jpg` 1603×901 | `.../moby-desktop-alt2.jpg` 1600×899 | 缩放后比对 | **1.67** | 同一张 ✔ |
| `background2.jpg` | `src/assets/images/MobileWallpaper/moby-mobile.jpg` 1080×1620 | 模板匹配（滑动 2:3 窗口） | **17.65**（最佳） | **未能复现裁切** → 见问题 F3 |

配置侧证据（`src/config/backgroundWallpaper.ts:43-63`）：

```ts
desktop: ["assets/images/DesktopWallpaper/moby-desktop.jpg"],   // ← 来自 picture/background2.jpg
mobile: ["assets/images/MobileWallpaper/moby-mobile.jpg"],
// 备选壁纸同样已在仓库内，如需更换改这里的路径即可：
//   desktop: ["assets/images/DesktopWallpaper/moby-desktop-alt1.webp"]  // 来自 picture/background.png（该文件实际是 WebP）
//   desktop: ["assets/images/DesktopWallpaper/moby-desktop-alt2.jpg"]   // 来自 picture/background3.jpg
```

→ "背景默认用 background2" ✔；"备选壁纸也进仓库 + 有切换注释" ✔（文件已在库、注释给了具体路径、`CUSTOMIZATION.md` §四还给了 `extract` 一行命令）。
→ 移动壁纸文件本身真实存在且被正确引用（1080×1620、188,850 B，与文档标注 184 KB 吻合），但"它是 background2 的 2:3 裁切"这一**说法**无法通过像素比对复现（F3，低风险，不影响功能）。

### 3.3 `site_url` —— PASS

`src/config/siteConfig.ts:60` → `site_url: "https://blog.265702.xyz"`。产物侧实测：

| 产物 | 值 |
|---|---|
| `dist/index.html` canonical | `https://blog.265702.xyz/` |
| `dist/index.html` og:url | `https://blog.265702.xyz/` |
| `dist/posts/night-window/index.html` canonical | `https://blog.265702.xyz/posts/night-window/` |
| `dist/sitemap-0.xml` | 38 条 `<loc>`，全部 `https://blog.265702.xyz/...` |
| `dist/robots.txt` | `Sitemap: https://blog.265702.xyz/sitemap-index.xml` |
| `dist/rss.xml` | `<link>https://blog.265702.xyz/</link>` |
| `dist/llms.txt` | 全部指向 `blog.265702.xyz` |

45 个 HTML 中 39 个都带正确的 canonical + og:url；剩下 6 个是禁用页面重定向桩，见 §5.4。

### 3.4 文章覆盖（技术 3 + 生活 1 + 文学 1，无占位，图片可解析）—— PASS

| 文件 | 标题 | 分类 | 中文字数 | published | 封面 | 产物页 |
|---|---|---|---|---|---|---|
| `build-blog-with-firefly.md` | 用 Firefly 搭建自己的技术博客 | 技术笔记 | 1049 | 2026-10-24 | `picture-1.webp` | `/posts/build-blog-with-firefly/` ✔ |
| `astro-build-pipeline-notes.md` | Astro 博客的构建流水线笔记 | 技术笔记 | 1496 | 2026-10-26 | `picture-2.webp` | `/posts/astro-build-pipeline-notes/` ✔ |
| `git-workflow-notes.md` | Git 日常清单：在一份开源主题上做自己的博客 | 技术笔记 | 1198 | 2026-10-28 | `picture-3.webp` | `/posts/git-workflow-notes/` ✔ |
| `a-weekend-afternoon-of-building.md` | 周六下午，等一次构建 | 生活随笔 | 891 | 2026-10-27 | `picture-4.webp` | `/posts/a-weekend-afternoon-of-building/` ✔ |
| `night-window.md` | 夜里的窗 | 文学随笔 | 775 | 2026-10-29 | `picture-5.webp` | `/posts/night-window/` ✔ |

- frontmatter 5 篇齐全：`title/published/description/tags(3)/category/lang:"zh-CN"/draft:false/image`，构建期间 content schema **零报错**（Astro 7 对 collection 有 schema 校验，能构建成功即合法）。
- 占位内容扫描：`TODO|Lorem|FIXME|待补充|XXX` 在 5 篇里**无命中**（命中的"占位"一词均指 LQIP"模糊占位图"，是正常叙述）。套话扫描 `总之|综上所述|在当今时代` 也无命中。
- 内容质量抽查：`a-weekend-afternoon-of-building.md` 全篇是具体场景（报亭改的咖啡店、银杏半黄、晒被子、排队解锁快递柜、柴犬），无空泛说教。
- 图片：5 张封面均来自 `picture/1.jpg~5.png`（血缘 1.52~2.04），产物里 `picture-1..5.*.webp` 全部存在，正文/卡片引用 0 缺失。
- 首页第一屏 10 张卡片里 5 张是新文章 ✔（另外 5 张是 demo 文章 → F1）。

### 3.5 `[CUSTOM]` 标记覆盖 —— PASS

```
$ git -C blog diff --name-only | 共 19 个文件
$ 逐文件统计 "[CUSTOM" 出现次数
```

| 文件 | 标记数 | 文件 | 标记数 |
|---|---|---|---|
| `src/config/siteConfig.ts` | 14 | `src/config/sponsorConfig.ts` | 6 |
| `src/config/profileConfig.ts` | 5 | `src/config/navBarConfig.ts` | 4 |
| `src/config/backgroundWallpaper.ts` | 9 | `src/config/booknavConfig.ts` | 3 |
| `src/config/commentConfig.ts` | 3 | `src/config/dynamicConfig.ts` | 2 |
| `src/types/dynamicConfig.ts` | 2 | `src/config/announcementConfig.ts` | 1 |
| `src/config/friendsConfig.ts` | 1 | `src/config/galleryConfig.ts` | 1 |
| `src/config/musicConfig.ts` | 1 | `src/content/spec/about.md` | 1 |
| `src/content/spec/friends.mdx` | 1 | `src/pages/rss.xml.ts` | 1 |
| `src/plugins/remark-wiki-link.js` | 1 | `src/utils/memos-adapter.ts` | 1 |
| **合计** | **57 处 / 18 个文件** | | |

- 19 个被改文件中，**18 个源码文件 100% 至少一处标记**，无遗漏。
- 唯一无标记的是 `src/constants/lqips.json` —— 它是 `scripts/generate-lqips.ts` 每次构建整份重写的派生产物，JSON 不支持注释，`CUSTOMIZATION.md` §七 已明确说明"无法加标记、请连同改动一起提交"。**判定为合理例外，不是缺失。**

### 3.6 `CUSTOMIZATION.md` 与 `git diff` 一一对应、能否据此还原 —— PASS

- 文件 459 行；`git diff` 19 个文件 → 文档 §二.1~14 覆盖 14 个、§二.16 覆盖 4 个超范围最小改动、§七覆盖 `lqips.json`，**19/19 全部有对应条目**，无漏记、无错记。
- **原值回查**（`git show HEAD:<file>` 与文档"原值"列逐条比对，抽查 20+ 项全部命中）：
  `title: "Firefly"`、`subtitle: "Demo site"`、`site_url: "https://firefly.cuteleaf.cn"`、`navbar.title: "Firefly Blog"`、`siteStartDate: "2025-01-01"`、`bilibili.uid: "38932988"`、`bangumi.userId: "1143164"`、`vndb.userId: "u358128"`、`mal.username: "cuteleaf"`、`mal.clientId: "\t0ef3437..."`（连前导制表符都对）、`avatar: "assets/images/avatar.avif"`、`name: "XiaYe"`、`bio: "Hello, I'm XiaYe."`、`links[0]: https://github.com/CuteLeaf`、`links[1]: mailto:xiaye@msn.com`、`giscus.repo/repoId/categoryId`、`disqus.shortname: "firefly"`。
- **还原可用**：每个文件都给了 `git -C blog checkout -- <文件>`；§九给了一次性还原（`git checkout -- .` + `git clean -fd src/assets public/assets CUSTOMIZATION.md`），命令语法可用（`git clean -fd <path>` 支持文件路径）。
- 新增素材表（§二.15）的尺寸/体积与实际文件一致：头像 512×512/31 KB、桌面壁纸 2560×1524/305 KB、alt1 942×530/46 KB、alt2 1600×899/145 KB、移动 1080×1620/184 KB（实测 188,850 B）。
- 已知保留项 §八 确实如实登记了 demo 文章/项目（这点对判定很重要：它说明残留是**被记录过的**，不是漏改）。

### 3.7 `BASELINE.md` 覆盖度 —— PASS

| 要求 | BASELINE 章节 | 内容评价 |
|---|---|---|
| 安装 | §1.2 `pnpm install`（1175 包 / npmmirror / 2m40s） | 有 |
| 构建 | §1.3 实测（退出码/耗时/产物/失败复盘）、§2.6 八段脚本逐个说明 | 有，且解释 `CannotFetchFontFile` 属网络抖动 |
| 配置点 | §3.1「必读的 8 个」+ §3.2 其它配置 + §2.2/2.3/2.4 目录地图 | 有 |
| 新增文章 | §5.1（`pnpm new-post` 骨架 + 手写模板 + 发布前自检）、§4.1 frontmatter 规范、§4.3 图片引用约定 | 有 |
| 同步上游 | §7（`origin`→`upstream` 后 `fetch/log/merge`+`install`+`build`） | 有 |
| GitHub → Cloudflare Pages | §6.1 两条路径取舍、§6.2 准备仓库、**§6.3 参数表**、§6.6 产物与缓存、§6.7 常见坑 | 有，参数可直接照抄 |
| 绑定 `blog.265702.xyz` | **§6.4** 七步（Custom domains → 自动 CNAME → 冲突处理 → Active → SSL Full strict/Always HTTPS → 关 Rocket Loader） | 有，可执行 |
| `site_url` 该填什么 | §6.5（含"构建前必须改对"的原理说明） | 有 |

小瑕疵（不影响使用）：§6.5 的证据表里 canonical 样本仍是改前的 `https://firefly.cuteleaf.cn/`、§6.6 写的产物规模是 329 文件/22.8 MB —— 这是基线快照的**历史值**，与当前 352 文件/22.9 MB 不同；读者照 §6.5 正文结论（填 `blog.265702.xyz`）执行即可。

---

## 4. 部署可行性核对 —— PASS

1. **`dist/` 是可直接托管的纯静态产物** ✔
   - 不存在 `dist/server/`、`dist/client/`、`dist/_worker.js`、`dist/_routes.json`、`dist/functions/`（逐项 `Test-Path` 均为 False）。
   - 顶层只有 `index.html / 404.html / rss.xml / atom.xml / sitemap-*.xml / robots.txt / llms.txt / anime-list.json` + 路由目录 + `_astro/` + `pagefind/` + `favicon/` + `og/`。
   - 反证：本次用**一次性静态文件服务器**（不跑 Astro、不跑任何 SSR）托管 `dist/`，首页/关于页/文章页均 HTTP 200、图片与样式正常渲染（截图见 §5.5）。
2. **Cloudflare Pages 参数与仓库实际一致** ✔

   | CF Pages 配置项 | BASELINE §6.3 写的 | 仓库实测 | 一致性 |
   |---|---|---|---|
   | Build command | `pnpm build` | `package.json` `scripts.build` 就是那 8 段命令链 | ✔ |
   | Build output directory | `dist` | `astro build` 默认 `outDir` → `dist/`（日志/build 信息确认 `directory: ...\dist\`） | ✔ |
   | Node 版本 | `NODE_VERSION=22.23.0`（或 ≥22.23 的 22.x） | `package.json` `engines.node: ">=22.23.0"`；仓库**没有** `.nvmrc`/`.node-version`，所以必须靠环境变量 | ✔ 且必需 |
   | `CF_WORKERS` | **绝对不要设** | `astro.config.mjs:62` `const adapter = process.env.CF_WORKERS ? cloudflare(...) : undefined` | ✔ 与代码逻辑一致 |
   | 包管理器 | pnpm；`preinstall: npx only-allow pnpm` | `packageManager: pnpm@11.22.0`、`.npmrc` `manage-package-manager-versions = true`、`pnpm-lock.yaml` 11,123 行在库 | ✔ |
3. **自定义域步骤可执行** ✔：`blog.265702.xyz` 与主域同账号时，Pages → Custom domains → 输入域名 → Cloudflare 自动建 `blog` CNAME → 等 Active；冲突/证书/SSL/Always HTTPS/Rocket Loader 的处置都写在 §6.4。
4. **上线前必须先做的事（不是缺陷，是顺序问题）**：
   - 工作区**尚未提交**：`git status --short` 是 19 个已跟踪文件被改 + 19 项未跟踪（6 个新增素材 + 5 篇文章 + 5 张配图 + BASELINE/CUSTOMIZATION/VERIFICATION 三份文档）。云构建只认 push 上去的提交。
   - 本机 `git config user.name` 为空（BASELINE §6.2 已记录），首次 commit 会报 `Please tell me who you are`。
   - `.github/workflows/deploy.yml` 存在，推到 `master` 会触发上游给 GitHub Pages 用的 workflow；不用 GitHub Pages 就在仓库 Settings → Actions 里禁用（BASELINE §6.2 已提示）。
   - `wrangler.jsonc` 的 `assets.directory: "./dist"` 与纯静态模式匹配；走 `CF_WORKERS=1` 才需要改成 `./dist/client`（本项目不需要）。

---

## 5. 产物检查与死链扫描 —— PASS

### 5.1 缺图扫描（0 缺失）

- 扫描范围：`dist/**/*.html` 共 45 个文件里的 `<img src>` + `srcset`。
- 结果：**394 处引用、44 个去重后的本地路径、缺图 0**；外链/data URI 已排除。
- 抽查确认以下关键图都在产物里：`avatar-moby.*.webp`、`moby-desktop.*.webp`、`moby-mobile.*.webp`、`picture-1..5.*.webp`、`firefly-light/dark.*.webp`、`favicon/firefly-32.png`、`/assets/images/avatar.jpg`、`/assets/images/ad/ad1.webp`、`/assets/images/sponsor/{alipay,wechat}.png`、`/gallery/**`。

### 5.2 站内死链扫描（0 死链）

- 扫描范围：45 个 HTML 里所有 `href="/..."`（排除外链、锚点、query）；对 `/x/`、`/x`、`/x.html`、目录 `index.html` 四种映射都认。
- 结果：**40 个去重站内链接、死链 0**。
- 顺带确认 `/rss/`、`/atom/`、`/search/`、`/archive/`、`/categories/`、`/tags/`、`/series/`、`/booknav/`、`/friends/`、`/about/`、`/guestbook/`、`/dynamic/`、`/gallery/`、`/projects/` 都能落到实际文件。

### 5.3 元信息抽查（canonical / og:url / og:image）

| 页面 | `<title>` | canonical | og:type | og:image |
|---|---|---|---|---|
| `/` | `Moby's Blog - 技术笔记 · 生活随笔` | `https://blog.265702.xyz/` | website | `/_astro/firefly-light.*.png`（192×192，主题默认兜底 → F4） |
| `/about/` | `关于我 - Moby's Blog` | `.../about/` | — | 同上 |
| `/posts/night-window/` | `夜里的窗 - Moby's Blog` | `.../posts/night-window/` | article | `https://blog.265702.xyz/og/night-window.png`（1200×630）✔ |
| 其余 4 篇新文章 | 各自标题 + ` - Moby's Blog` | 各自 URL | article | 各自 `/og/<slug>.png` ✔ |

`dist/og/` 共 17 个产物（含 5 篇新文章的 OG 图）。

### 5.4 6 个"没有 canonical/og:url"的页面是重定向桩（不是缺陷）

`/bangumi/ /bilibili/ /myanimelist/ /vndb/ /sponsor/ /dynamic/comments/` 这 6 个页面在 `pages` 里是 `false`，Astro 生成的是重定向桩：

```html
<!doctype html><title>Redirecting to: /404/</title>
<meta http-equiv="refresh" content="2;url=/404/"><meta name="robots" content="noindex">
<link rel="canonical" href="https://blog.265702.xyz/404/">
```

它们**有** canonical（指向 `/404/`）且带 `noindex`，没有 `og:url` 是合理的（不是可分享页面）。Pagefind 也是因此报"6 pages found without an `<html>` element"。

### 5.5 视觉抽查（无头 Chrome 渲染 + OCR + 计算样式）

| 检查 | 方法 | 结果 |
|---|---|---|
| 首页桌面端 | Chrome headless 1440×900 截图 | 侧边栏显示 `Moby's Blog` / `写代码，也写字：技术笔记为主，也收藏生活与文学。`（OCR 读到）；导航 主页/文章/社交/我的/关于我/链接 |
| 首页移动端 | 390×844 截图 + OCR | 横幅标题可读、壁纸为竖版；**首屏第一张文章卡片是 demo 文章**（→ F1 的直观证据） |
| 关于页 | 1440×1400 截图 + OCR/文本解析 | 含 `Moby5702`、`写代码，也写字`；**不含** `夏叶/XiaYe` |
| 横幅标题 | CDP `Runtime.evaluate` 读计算样式 | `.banner-title` = `Moby's Blog`，`72px/700`，`rgb(255,255,255)`，`opacity:1`，rect `y=160 h=90`，`text-shadow rgba(0,0,0,.6) 0 4px 24px` → **确实渲染**（不是丢失） |
| 横幅对比度 | 取标题框内壁纸平均色 `rgb(170,182,187)` → WCAG | `2.08:1`，低于 AA 大字 3:1（→ F5） |
| 暗色模式 | CDP 置 `localStorage.theme=dark` 后 reload | `data-theme="one-dark-pro"`、`html.dark` 生效；logo 的 `<picture>` 同时含 `firefly-light.*.webp` 与 `firefly-dark.*.webp`，两组产物文件都存在（→ §7） |

---

## 6. demo 残留扫描 —— **FAIL**（本报告唯一失败项）

### 6.1 扫描结果

| 字符串 | 源码（`src/**`，排除明令保留项） | 产物（`dist/**/*.html`） | 结论 |
|---|---|---|---|
| `XiaYe` / `夏夜` | **0** | **0** | ✔ 已彻底清除 |
| `xiaye@msn.com` / `msn.com` | **0** | **0** | ✔ 已彻底清除 |
| `Demo site` | 1（`src/content/posts/firefly.md`） | **1 个页面**：`posts/firefly/` ×1 | ✘ 仍在产物里 |
| `firefly.cuteleaf.cn` | 4 个文件 | **5 个页面**：`posts/firefly/` ×4、`posts/guide/firefly-layout-system/` ×3、`projects/example-project/` ×2、`projects/firefly/` ×1、`projects/index` ×1 | ✘ 仍在产物里 |
| `docs-firefly.cuteleaf.cn` | 4 个文件 | **5 个页面**（同上） | ✘ 仍在产物里 |
| `CuteLeaf` | 见下 | **39 个页面** | 需分类看 ↓ |

`CuteLeaf` 的 39 个页面拆开看是两类：

- **主题版权/致谢（按要求保留，可接受）**：几乎每页 3 处 —— 页脚 `Astro & Firefly` 链接（`src/components/layout/Footer.astro:84`）、侧边栏"博客版本"卡片链到主题仓库（`src/components/widget/SiteInfo.astro:105`）；`rss.xml` 的 `<templateThemeUrl>` 也是主题地址。关于页额外有 1 个 `::github{repo="CuteLeaf/Firefly"}` 致谢卡（`CUSTOMIZATION.md` §13 明示保留）。
- **主题 demo 内容（应清理）**：`posts/firefly`(12)、`posts/markdown-extended`(9)、`projects/firefly`(9)、`posts/guide/firefly-layout-system`(7)、`posts/git-workflow-notes`(7，其中 3 是正常的"真实 remote 输出"引用)、`posts/katex-math-example`(4)、`posts/mdx-example`(4)、`projects/example-project`(7)、`projects/index`(5)。

### 6.2 影响面（为什么这条不能只当"文档里写了"就放过）

| 面向用户的位置 | 现状 |
|---|---|
| **首页第一张卡片** | 是 `pinned: true` 的 `posts/firefly`《Firefly 一款清新美观的 Astro 博客主题模板》，含"🖥️在线预览：Firefly - Demo site"外链 |
| 首页 10 张卡片构成 | 5 张新文章 + **5 张 demo 文章**（`code-examples`、`guide`、`guide/firefly-layout-system`、`guide/firefly-wiki-link` 等） |
| **RSS / Atom 订阅** | `dist/rss.xml` 17 条、`dist/atom.xml` 18 条；RSS 为全文模式（`siteConfig.feed.contentMode="full"`），**demo 文章正文（含 `cuteleaf` 链接、`localhost:4321` 示例）整段进订阅源**，`rss.xml` 内 `cuteleaf` 命中 12 处 |
| **sitemap** | `dist/sitemap-0.xml` 38 条，含 `/posts/firefly/`、`/posts/guide/firefly-layout-system/`、`/projects/firefly/`、`/projects/example-project/` —— 会被搜索引擎收录为主题 demo 页 |
| `llms.txt` | "Recent Posts" 第一条就是主题自荐文 |
| `/projects/` 项目页 | 2 个项目全是主题自己的（`firefly`、`示例项目`） |
| Pagefind 搜索 | 索引 23 页里含全部 demo 文章页 |
| 归档/分类/标签页 | 分类「文章示例」下挂着这些 demo 文（产物里 demo 文章页共 13 篇） |

### 6.3 归因（这是计划造成的，不是谁偷懒）

- t2 的"不要碰"清单**明确包含** `src/content/posts/**`、`src/content/projects/**`；
- t3 的"不要碰"里**明确写了"不要删除仓库自带示例文章"**，且其作用域只有 `src/content/posts/**` 新增；
- 于是仓库自带的 demo 内容（14 个文章源文件，其中 `draft.md` 已是 `draft: true`，故产物里 13 篇 demo 文章页；外加 2 个 demo 项目）无人清理，`CUSTOMIZATION.md` §八 如实登记为"已知保留项"。

**但**：从用户视角看，这块是"我的个人博客首页第一张卡是主题广告"，且 `Demo site`、`firefly.cuteleaf.cn` 确实出现在渲染产物与订阅源里 —— 与"站点不再是 Firefly demo"的交付目标冲突。因此本报告判定 **#5 检查项 FAIL**，并给出改动量极小的修复（§9 P0）。

---

## 7. 配置一致性（移动壁纸 / 暗色 logo / 其它静态资源）—— PASS

逐项 `Test-Path` 校验所有被配置或模板引用的资源（不留空路径）：

| 引用位置 | 路径 | 文件存在 | 产物存在 |
|---|---|---|---|
| `siteConfig.ts:129-130` 导航 logo | `assets/images/logo/firefly-light.png` / `firefly-dark.png` | ✔ / ✔ | ✔ `_astro/firefly-light.*`, `_astro/firefly-dark.*` |
| `siteConfig.ts:106` favicon | `/favicon/firefly-32.png` | ✔ | ✔ `dist/favicon/firefly-32.png` |
| `profileConfig.ts:12` 头像 | `assets/images/avatar-moby.jpg` | ✔ | ✔ `_astro/avatar-moby.*.webp` |
| `backgroundWallpaper.ts:51` 桌面壁纸 | `assets/images/DesktopWallpaper/moby-desktop.jpg` | ✔ | ✔ `_astro/moby-desktop.*.webp` |
| `backgroundWallpaper.ts:56` **移动壁纸** | `assets/images/MobileWallpaper/moby-mobile.jpg` | ✔（1080×1620, 188,850 B） | ✔ `_astro/moby-mobile.*.webp`（两张响应式） |
| `backgroundWallpaper.ts:62` 背景视频 | `""`（空） | 空即"不启用"，`playerEnable: false`，**不是坏路径** ✔ | — |
| 备选壁纸 ×2 | `moby-desktop-alt1.webp` / `moby-desktop-alt2.jpg` | ✔ / ✔ | ✔（同时在 `_astro/`） |
| `friends.mdx:18` 友链卡头像 | `https://blog.265702.xyz/assets/images/avatar.jpg` | ✔（`public/`，SHA256 与 src 头像一致） | ✔ |
| `booknavConfig.ts:83` 书签图标 | `/favicon/firefly-32.png` | ✔ | ✔ |
| `sponsorConfig.ts:33,42` 收款码（页面关闭） | `/assets/images/sponsor/{alipay,wechat}.png` | ✔ | ✔ |
| `sidebarConfig.ts:191` 广告位 | `/assets/images/ad/ad1.webp` | ✔ | ✔ |
| `musicConfig.ts:56-57`（播放器关闭） | `/assets/music/*.mp3`、`cover/*.webp` | ✔ 目录在库 | ✔ `dist/assets/music/` |

**暗色 logo 专项**：`firefly-dark.png` 真实存在（4,269 B），构建产出 `firefly-dark.*.webp`（596 B / 1,440 B / 2,596 B 三个尺寸）；CDP 实测把主题切到 `one-dark-pro` 后 `<picture>` 里的 dark source 依然可用。→ 不存在"暗色配置指向空路径"的情况。

---

## 8. 问题清单

| 编号 | 严重度 | 位置 | 问题 | 建议修复 |
|---|---|---|---|---|
| **F1** | **高（阻塞上线）** | `src/content/posts/firefly.md:4`（`pinned: true`）+ `src/content/posts/{code-examples,encrypted-demo,firefly,katex-math-example,markdown-extended,markdown-mermaid,markdown-plantuml,markdown-tutorial,video}.md` + `src/content/posts/mdx-example.mdx` + `src/content/posts/guide/{index,firefly-layout-system,firefly-wiki-link}.md` + `src/content/projects/{firefly,example-project}.md`（共 15 个文件；`draft.md` 本来就是 `draft: true`，不在此列） | 主题 demo 文章与 demo 项目仍以 `draft: false` 参与生产构建，导致：首页首卡为主题自荐文、`Demo site`/`firefly.cuteleaf.cn` 出现在 5 个渲染页、RSS/Atom 全文订阅源含 demo 正文、sitemap 收录 demo 页 | 给这些文件加 `draft: true`（生产构建过滤逻辑见 `src/utils/content-utils.ts:9`：`import.meta.env.PROD ? data.draft !== true : true`），或直接删除。改完重新 `pnpm build` |
| **F2** | 中（必须由用户提供值） | `src/config/profileConfig.ts:39`、`src/config/backgroundWallpaper.ts:117`、`src/content/spec/about.md:26`、`src/content/spec/friends.mdx:19` | 占位邮箱 `your-email@example.com` 已渲染到线上页面（`/about/` 可见文本、`/friends/` 本站信息卡、页脚/横幅 Email 图标）。上线后访客点"Email"会发到不存在的地址 | 用户给出真实邮箱后四处替换；或先把 Email 链接与关于页该行去掉，等有了再填（`CUSTOMIZATION.md` §一 已列为 🔴 必须替换） |
| **F3** | 低 | `CUSTOMIZATION.md:218`、`CUSTOMIZATION.md:279` | 文档称移动壁纸是 `picture/background2.jpg` 的"2:3 竖屏裁切"，但像素级无法复现：对 background2 做 2:3 滑窗模板匹配，最佳 meanAbsDiff ≈ **17.65**/255（同一张图的 JPEG 重编码约 1~2），不同裁切宽度/位置均未命中。调色板与结构高度相似（cyan 41.7% vs 43.5%），说明是同场景素材，但**不是**同一裁切的像素级产物 | 确认该文件真实来源后修正文档措辞（例如"同场景竖屏版本"），或按文档 §四 给出的 sharp 命令重新从 background2 生成一张，使描述与实物一致。功能不受影响 |
| **F4** | 低（可选） | `src/layouts/Layout.astro:149`（`ogImageUrl = siteLogo.url`） | 非文章页（首页/关于页等）的 `og:image` 兜底为主题 logo（`firefly-light.*.png`，192×192），分享卡片会是一张小方图 | 可选：为首页/关于页指定 1200×630 的 OG 图（如复用 `og/` 生成能力或补一张 `public/og/site.png`）。属主题默认行为，不影响功能 |
| **F5** | 低（观感） | `src/config/backgroundWallpaper.ts:67`（`dimOpacity: 0.2`）+ `src/components/layout/BannerHomeTextOverlay.astro:22`（`text-white`） | 首页横幅标题是 72px 白字，压在 `background2` 的亮部（实测标题框内背景均色 `rgb(170,182,187)`），对比度仅 **2.08:1**（WCAG AA 大字要求 ≥3:1）；有 24px 模糊深色投影缓解，OCR 在桌面截图里读不出标题、在移动端可读 | `CUSTOMIZATION.md` §七已给出方案：把 `dimOpacity` 调到 `0.35 ~ 0.5`，或把 `banner.position` 挪到画面较暗处。属"用户可自行决定的观感项" |
| **F6** | 提示 | `blog/.gitignore` | `.wrangler/` 未被忽略（只在走 `CF_WORKERS` 时才会产生）。本次纯静态构建未产生 | 若以后试 Workers 方式，记得别提交；可顺手把 `.wrangler/` 加进 `.gitignore` |
| **F7** | 提示 | 仓库根 | 改动**尚未提交**（19 个已跟踪文件被改 + 19 项未跟踪），且本机 `git config user.name` 为空；`origin` 仍指向上游 gh-proxy 地址 | 按 `BASELINE.md` §6.2：设 `user.name/email` → `git remote rename origin upstream` → `git remote add origin <你的仓库>` → commit + push |
| **F8** | 提示（已声明保留） | `src/config/booknavConfig.ts:81`、`src/assets/images/DesktopWallpaper/d1-d6.*`、`MobileWallpaper/m1-m6.*`、`avatar.avif`、`public/gallery/**`、`public/assets/music/**`、`public/assets/images/sponsor/*` | 主题示例资源仍在库：书签页保留 1 条主题仓库、相册仍是主题示例图、示例壁纸/头像/音频未删（其中壁纸 d1-d6/m1-m6 与 `avatar.avif` 已不被配置引用） | `CUSTOMIZATION.md` §八 已逐条登记，属"故意保留"；愿意清理可删未引用文件（删前确认无配置引用） |

---

## 9. 最小修复清单（按优先级）

### P0 — 必须做，否则不算"个人博客"（15 个文件各加 1 行 + 1 次构建，~4 分钟）

给主题 demo 内容加 `draft: true`（保留文件、随时可恢复；生产构建会自动排除 `draft: true`，对应页面也不再生成）：

```text
src/content/posts/firefly.md                     # 顺手把 pinned: true 一并处理（draft 后置顶自然失效）
src/content/posts/code-examples.md
src/content/posts/encrypted-demo.md
src/content/posts/katex-math-example.md
src/content/posts/markdown-extended.md
src/content/posts/markdown-mermaid.md
src/content/posts/markdown-plantuml.md
src/content/posts/markdown-tutorial.md
src/content/posts/video.md
src/content/posts/mdx-example.mdx
src/content/posts/guide/firefly-layout-system.md
src/content/posts/guide/firefly-wiki-link.md
src/content/posts/guide/index.md
src/content/projects/firefly.md
src/content/projects/example-project.md
```

（`src/content/posts/draft.md` 本来就是 `draft: true`，本次已验证它不出现在产物里 —— 不必改。）

改完重新构建并复查：

```powershell
cd D:\Program\Save\learn\web\blog
pnpm build
# 复查 1：产物里不应再出现 demo 域名
Get-ChildItem dist -Recurse -Filter *.html | Select-String -Pattern 'Demo site|firefly\.cuteleaf\.cn'
# 复查 2：sitemap 不应再含 /posts/firefly/、/posts/guide/...、/projects/firefly/
Select-String -Path dist\sitemap-0.xml -Pattern 'posts/firefly/|posts/guide/|projects/firefly/'
# 复查 3：首页前 10 张卡片应全部是 5 篇新文章（可 grep dist\index.html 的 /posts/ 链接）
```

预期变化（按当前产物实测基数推算）：`dist/` 里文章页从 **18 → 5**、HTML 从 **45 → 30**（减少 13 篇 demo 文章页 + 2 个项目详情页）；`rss.xml` 条目 17 → 约 5~6；`sitemap-0.xml` 38 → 23；`dist/og/` 里 demo 文章的 OG 图（17 个条目中的大部分）不再生成。
（若队长希望**连文件一起删**而不是 `draft: true`，注意同步更新 `CUSTOMIZATION.md` §八 的"已知保留项"表述。）

### P1 — 用户必须提供（不阻塞代码，阻塞上线）

替换 4 处 `your-email@example.com`（`profileConfig.ts:39`、`backgroundWallpaper.ts:117`、`about.md:26`、`friends.mdx:19`）为真实邮箱；在拿到邮箱前，建议先把 Email 入口撤掉，避免上线即暴露占位值。

### P2 — 低风险收尾（建议做，10 分钟内）

1. `CUSTOMIZATION.md` §二.15 / §四 的"移动壁纸来源"措辞与实物对齐（F3）。
2. 横幅观感：`dimOpacity` 0.2 → 0.35~0.5（F5，一行）。
3. `.gitignore` 加 `.wrangler/`（F6，一行）。

### P3 — 可选

1. 非文章页 OG 图（F4）。
2. 清理已不被引用的示例壁纸 `d1-d6/m1-m6`、`avatar.avif`、示例相册/音乐（F8）。

---

## 10. 复现方法（命令清单）

```powershell
cd D:\Program\Save\learn\web\blog

# 1) 构建
pnpm build                                                  # 退出码 0
Get-Item dist\index.html                                    # 306,242 B
(Get-ChildItem dist -Recurse -File).Count                   # 352

# 2) 产物扫描（脚本逻辑见附录 A，脚本已在验证后删除）
node -e "..."                                               # 缺图/死链/canonical/残留
# 3) 图片血缘
#    源图按目标尺寸缩放后逐像素 meanAbsDiff 比较
# 4) 渲染验证
#    静态托管 dist → Chrome --headless=new --screenshot
#    CDP Runtime.evaluate 读 .banner-title 计算样式 / 切暗色主题
```

---

## 附录 A：临时验证脚本（`blog/.verify/`，验证完成后已删除）

| 脚本 | 作用 | 关键逻辑 |
|---|---|---|
| `verify-dist.mjs` | 缺图 / 死链 / canonical / demo 残留 | 把 `href="/x/"` 映射成 `x/index.html` 等 3 种候选；`<img src>` 与 `srcset` 逐条 `fs.existsSync` |
| `image-lineage.mjs` | 图片血缘 | sharp 把源图缩放到目标尺寸（或按目标比例居中裁切）后逐像素求平均差 |
| `mobile-match.mjs` | 移动壁纸来源判定 | 灰度缩到 480 宽，按多档 2:3 窗口滑窗 + 最近邻采样到 54×81 求最小平均差 |
| `spot-check.mjs` | 首页/文章/关于页关键元素 | 正则取 `<title>`/canonical/`h1`/封面图/正文字数 |
| `content-and-leaks.mjs` | 新文章字数/frontmatter + 产物本地路径泄漏 | CJK 字符计数；扫描 `D:\`、`C:\Users`、`localhost`、`127.0.0.1` |
| `static-server.mjs` | 临时静态托管 `dist/` | 15 行 Node `http`，`127.0.0.1:4400` |
| `contrast.mjs` | 横幅标题对比度 | 取标题 rect 内像素均色 → 相对亮度 → WCAG 对比度 |
| `cdp-banner.mjs` / `cdp-dark.mjs` | 渲染层断言 | Chrome `--remote-debugging-port` + 全局 `WebSocket` 调 CDP，读计算样式/切暗色主题 |

删除原因：保持 `git status` 干净（这些是验证脚手架，不进交付物）。需要重跑时按上表逻辑可原样重建，或让 reviewer 重新生成。

## 附录 B：本次验证中被推翻/确认的几个"想当然"

| 猜想 | 实测 | 结论 |
|---|---|---|
| "构建成功过就一定能复现" | 两次构建产物逐字节相同（306,242 B） | 确认 |
| "首页横幅标题没渲染出来"（截图上读不到） | CDP 读到 `.banner-title` 72px 白字、opacity 1、rect 正常 | 是**对比度**问题（F5），不是渲染问题 |
| "6 个页面缺 canonical 是 bug" | 它们是禁用页的 `/404/` 重定向桩，canonical 指向 `/404/` + `noindex` | 不是 bug |
| "`lqips.json` 没有 `[CUSTOM]` 是漏标记" | 构建每次整份重写的 JSON，无法注释，文档 §七 已说明 | 合理例外 |
| "移动壁纸就是 background2 的裁切" | 滑窗模板匹配最佳 17.65/255，调色板相符但像素不符 | 说法待确认（F3） |
| "`astro preview` 能验一遍" | 本会话未监听端口，改用静态服务器 | dist 纯静态特性反而得到更强证据 |

> 其中 F3 那一条在第二轮已被**推翻**：是我的模板匹配脚本精度问题，移动壁纸确实可由文档命令逐字节复现。见《第二轮（复审）· t7》§R-3。

---
---

# 第二轮（复审）· t7 — 修复验证与回归检查

> 复审触发：t5 修复 F1（demo 内容下线）、t6 修复 F3/F5/F6（壁纸文档、横幅对比度、.gitignore）
> 复审者：reviewer（与第一轮同一人，未参与任何修复）
> 复审时间：2026-10-30 23:58 ~ 2026-10-31 00:32（本机时钟）
> 复审判定：**PASS** —— F1 / F3 / F5 / F6 全部关闭，无回归；剩余项均属"需用户输入 / 可选优化 / 已知保留"，不阻断交付

## R-0. 第二轮结论速查

| # | 检查项 | 结果 | 一句话 |
|---|---|---|---|
| R-1 | 构建复测（`pnpm build`） | **PASS** | 退出码 0；**29** 页（预期 ~30）；`dist/` 295 文件 / **13,616 KB**；Pagefind 8 页 / 1,692 词 |
| R-2 | F1 复验（demo 内容清零） | **PASS** | `Demo site` / `firefly.cuteleaf.cn` / `docs-firefly.cuteleaf.cn` / `XiaYe` / 旧分类旧系列 **全部 0 命中**；rss/atom/sitemap/llms/Pagefind 均无 demo URL；首页只剩 5 张卡片，首卡＝夜里的窗；dist/posts＝5；4 条 demo 动态不再渲染 |
| R-3 | F3 复验（移动壁纸文档与实物一致） | **PASS（并推翻第一轮误报）** | 我按文档命令独立重跑：**sha256 完全相同、字节数完全相同**（188,850 B）→ 第一轮的"无法复现"是我脚本窗口精度问题 |
| R-4 | F5 复验（横幅对比度 ≥3:1 + 视觉不崩） | **PASS** | 同法复测 **2.08:1 → 3.41:1**（中位 3.28、含字形最不利块 3.44、全部块背景 p90 3.19 / max 3.13）；OCR 首次能读出横幅标题；首页/文章页/移动端布局正常 |
| R-5 | F6 复验（`.wrangler/` 忽略） | **PASS** | `.gitignore:30` 有 `.wrangler/`（带 `[CUSTOM]` 注释）；`git check-ignore -v .wrangler/x` 命中；`git status` 里 0 条 wrangler |
| R-6 | 回归（文章/封面/死链/canonical/[CUSTOM]） | **PASS** | 5 篇文章字节未变；缺图 0（866 处引用）；死链 0（22 个链接）；canonical/og:url 0 异常；`[CUSTOM]` 66 处 / 20 文件无退化 |
| — | 仍需用户/队长决定的事项 | 5 项 | 见 §R-7（均不阻断，PASS 前提是它们被接受） |

## R-1. 构建复测 —— PASS

```
$ cd blog && pnpm build
00:25:56 [build] directory: ...\blog\dist\
00:26:14 [build] 29 page(s) built in 28.56s
00:26:14 [build] Complete!
✨ Minified 673 inline scripts in 23/29 HTML files, saved 601.3 KiB
Running Pagefind v1.5.2 (Extended)
  Indexed 8 pages
  Indexed 1692 words
[exit=0]
```

| 指标 | 第一轮（45 页版） | 本轮复测 | 期望 | 判定 |
|---|---|---|---|---|
| 退出码 | 0 | **0** | 0 | ✔ |
| HTML 页数 | 45 | **29** | ~30 | ✔ |
| `dist/` 文件数 / 体积 | 352 / 22,926 KB | **295 / 13,616 KB** | 变小 | ✔ |
| `dist/index.html` | 306,242 B | **251,031 B** | 变小 | ✔ |
| `dist/posts/` 文章页 | 18 | **5** | 5 | ✔ |
| `dist/og/` 条目 | 17 | **5** | 5 | ✔ |
| Pagefind | 23 页 / 3,092 词 | **8 页 / 1,692 词** | 明显减少 | ✔ |
| 首页分页 `/2/` | 存在 | **已消失**（文章 5 篇 < postsPerPage 10） | 消失 | ✔ |

**构建期非致命输出（均可解释，不需改代码）**：

1. `[GITHUB-CARD] ... 403 rate limit exceeded; keeping cached data` → 沿用缓存，设计如此。
2. `[WARN] [content] The collection "dynamic" does not exist or is empty.` → **4 条 demo 动态删除后 `dynamic` 集合为空**（只剩 `.gitkeep`）。功能无影响（`/dynamic/` 正常渲染"0 动态"、`/api/dynamic.json` = `[]`），将来写第一条动态即消失。见 §R-7 第 5 条。
3. `6 pages found without an <html> element`（Pagefind）→ 仍是那 6 个禁用页 `/404/` 重定向桩，与第一轮一致。

## R-2. F1 复验（demo 内容下线）—— PASS

### R-2.1 字符串扫描（`dist/**/*.html`，29 个文件）

| 模式 | 第一轮 | 本轮 | 判定 |
|---|---|---|---|
| `Demo site` | 1 个页面 | **0 处 / 0 文件** | ✔ 关闭 |
| `firefly.cuteleaf.cn` | 5 个页面 | **0 处 / 0 文件** | ✔ 关闭 |
| `docs-firefly.cuteleaf.cn` | 5 个页面 | **0 处 / 0 文件** | ✔ 关闭 |
| `XiaYe` | 0 | **0** | ✔ |
| `xiaye@msn.com` | 0 | **0** | ✔ |
| `示例项目`（demo 项目标题） | 有 | **0** | ✔ |
| `Firefly 主题模版`（demo 项目标题） | 有 | **0** | ✔ |
| `文章示例`（demo 分类） | 有 | **0** | ✔ |
| `博客指南`（demo 分类） | 有 | **0** | ✔ |
| `CuteLeaf` | 39 页 / 75 处 | 23 页 / **81 处** | 见下（全部正当） |

`CuteLeaf` 的 81 处逐条归类——**没有一处 demo 内容**：

- **57 处 = 3 处/页 × 19 页**：页脚 `Astro & Firefly` 署名链接 + 侧边栏/移动抽屉的"博客版本"卡（`Footer.astro:84`、`SiteInfo.astro:105`）——主题版权署名，按任务要求保留。
- **`about/index.html` ×7**：上述 3 处 + 关于页致谢段的 Firefly 仓库链接 + `::github{repo="CuteLeaf/Firefly"}` 卡片（`CUSTOMIZATION.md` §13 明示保留）。
- **`booknav/index.html` ×4**：上述 3 处 + 书签里保留的"Firefly 主题仓库"条目（方便查上游文档）。
- **`posts/build-blog-with-firefly/index.html` ×6**：上述 3 处 + 正文里的 `git clone https://github.com/CuteLeaf/Firefly.git` 等 3 处真实命令。**这是本轮唯一还能看到主题仓库地址的地方，且是技术教程的必要内容。**
- **`posts/git-workflow-notes/index.html` ×7**：上述 3 处 + 正文引用的 `origin https://gh-proxy.com/https://github.com/CuteLeaf/Firefly.git`（真实 remote 输出）。

### R-2.2 订阅源 / 站点地图 / AI 摘要 / 搜索索引

| 产物 | 本轮 | 判定 |
|---|---|---|
| `dist/rss.xml` | 5 条 `<item>`，5 条均指向 5 篇新文章；cuteleaf 命中 5（= 频道级 `<templateThemeUrl>` 1 处 + 正文引用 4 处） | ✔ |
| `dist/atom.xml` | 5 条 `<entry>`，同上 | ✔ |
| `dist/sitemap-0.xml` | **22** 条 `<loc>`（第一轮 38），`/posts/firefly/`、`/posts/guide/…`、`/projects/firefly/`、`/projects/example-project/` 命中 **0** | ✔ |
| `dist/llms.txt` | Recent Posts 只剩 5 篇新文；cuteleaf 0 命中 | ✔ |
| `dist/api/allPostMeta.json` | cuteleaf 0 命中 | ✔ |
| `dist/pagefind/**` | 4 个 demo slug（`firefly-layout-system` / `markdown-tutorial` / `encrypted-demo` / `example-project`）命中 **0** | ✔ |

> **一处需要澄清的"假阳性"**：我第一轮用的正则 `/posts\/(firefly|guide)\/|projects\/(firefly|example-project)\//` 在 rss.xml / atom.xml 里各命中 1 次。逐字符核对后确认**不是 demo URL**：那是《用 Firefly 搭建自己的技术博客》正文里解释"放进子目录 `guide/index.md` 就是 `/posts/guide/`"的示例文字。→ 不计入残留。

### R-2.3 首页与列表

- 首页文章卡片 **5 个**，顺序：`夜里的窗` → `Git 日常清单…` → `周六下午，等一次构建` → `Astro 博客的构建流水线笔记` → `用 Firefly 搭建自己的技术博客`。
- 首卡 = `/posts/night-window/`（按发布时间倒序），**不再是** pinned 的《Firefly 一款清新美观的 Astro 博客主题模板》。`firefly.md` 的 `pinned` 已一并改为 `false`。
- `/archive/`：5 篇文章；`/categories/`：技术笔记 3 / 生活随笔 1 / 文学随笔 1；`/tags/`：14 个标签（5 篇 × 3 标签去重），**没有** `文章示例`/`博客指南` 这类 demo 分类标签。

### R-2.4 4 条 demo 动态

- `dist/dynamic/index.html` 可见文本：`动态 … 0 动态 …`（空态），页面内**没有**任何 demo 动态条目。
- `dist/api/dynamic.json` = `[]`。
- 4 个源文件 `src/content/dynamic/2026-07-15-*.md` 已删除（`git status` 显示 4 个 `D`），并新增 `src/content/dynamic/.gitkeep` 保目录。

## R-3. F3 复验（移动壁纸文档 vs 实物）—— PASS（第一轮误报已纠正）

**我独立重跑了 `CUSTOMIZATION.md` §四 记录的那条 sharp 命令**（输出写到临时路径，不动仓库文件）：

```
src 5925x3528  crop w=2352  left=2260
sha256  3488D48706A8986119A882B78F129DDFC7C917A087B080281240123421E295B0  .verify2/mobile-regen.jpg
sha256  3488D48706A8986119A882B78F129DDFC7C917A087B080281240123421E295B0  src/assets/images/MobileWallpaper/moby-mobile.jpg
sizes: 188850 vs 188850
```

→ **输出与仓库文件逐字节相同**。文档现在的措辞是「`picture/background2.jpg` 的 2:3 竖窗裁切（left=2260，取 2352×3528）后缩放到 1080×1620；可由 §四 的命令逐字节复现（sha256 `3488d487…`）」——与实物一致，且**可复现**。

**第一轮为什么判它 FAIL（我的错）**：我用的滑窗模板匹配把源图缩到 480 宽再扫窗口，档位只有 80/100/…/180/220 等，而正确窗口宽度 2352 对应 480 宽工作图上的 **190.5 px** —— 我的档位表**根本没有覆盖这个宽度**，于是永远匹配不到最佳裁切，最小平均差停在 17.65。这是**验证脚本的精度缺陷**，不是文档错误。已在 §R-8 记录并撤回该条。

## R-4. F5 复验（横幅白字对比度 + 视觉）—— PASS

方法与第一轮完全一致：静态托管 `dist/` → Chrome headless 1440×900 → CDP 读 `.banner-title` 的 `getBoundingClientRect()` → 截图取样 → WCAG 相对亮度算对比度。

| 项 | 实测 |
|---|---|
| `.banner-title` | `Moby's Blog`，**72px / 700**，`rgb(255,255,255)`，`opacity: 1`，`text-shadow rgba(0,0,0,.6) 0 4px 24px` |
| rect | `x=204 y=191 w=1032 h=90` |
| **整块平均色（第一轮同法）** | `rgb(131,141,144)`，L=0.258 → **3.41:1** ✔（第一轮同法 2.08:1） |
| 分块中位（12×4 分块） | 3.28:1 ✔ |
| 含字形像素的最不利块（剔除近白字素后取背景） | **3.44:1** ✔ |
| 全部块背景亮度 p90 / max | 0.279 → 3.19:1 / 0.286 → 3.13:1 ✔（所有块都 ≥3:1） |

> **顺便纠正第一轮的方法学问题**：第一轮那个 2.08:1 是把标题矩形**整块平均色**当成背景，而矩形里约 1/3 的像素其实是**白色字形本身**，会把"背景"算亮、把对比度算低。本轮同样给出整块口径（3.41:1，可直接与第一轮对比）并补了"剔除字形像素"的更严谨口径（3.44:1），两个口径都 ≥3:1，所以 F5 的修复真实有效、且比第一轮数字看起来的改善更扎实。
> 另一个曾被误判的信号：第一轮 OCR 读不出横幅标题，我怀疑过"是不是没渲染/对比度太差"。本轮 OCR **能读出** `Moby's Blog`（373×73 px 的识别框），与计算样式证据一致——0.4 的遮罩确实解决了可读性。

**视觉抽查（3 张截图，均无崩坏）**：

| 截图 | 分辨率 | 观察 |
|---|---|---|
| 首页 | 1440×900 | 导航 主页/文章/归档/分类/标签/社交/我的/关于我/链接；横幅标题与副标题清晰可读；首卡《夜里的窗》；侧边栏 Moby5702 + 签名 + 公告 + 分类/标签/归档卡；**无"最新动态"卡** |
| 文章页 | 1440×1100 | 文章标题《夜里的窗》43px 可读；面包屑、正文、标签正常；右栏"文章目录 · 当前页面没有目录"（该文无标题，属正常空态）；壁纸变暗后正文对比更舒服 |
| 移动端 | 390×844 | 横幅标题可读、壁纸为竖版 2:3；卡片列表正常；无溢出/错位 |

## R-5. F6 复验（`.wrangler/` 忽略）—— PASS

```powershell
$ git diff .gitignore        # + 3 行（含 [CUSTOM] 注释）
+# [CUSTOM] Cloudflare Workers/wrangler 本地构建产物（仅当以 CF_WORKERS=1 走 Workers 方式时产生，
+# 纯静态 Pages 部署不会生成），加到忽略列表避免误提交。
+.wrangler/

$ git check-ignore -v .wrangler/x
.gitignore:30:.wrangler/        .wrangler/x
$ git status --short | Select-String wrangler   # 0 条
```

## R-6. 回归检查 —— PASS

| 回归项 | 结果 |
|---|---|
| 5 篇新文章仍在 | `dist/posts/` 恰好 5 个目录；源文件字节数与第一轮**完全一致**（3371 / 7438 / 6225 / 6485 / 2962 B）——正文没被动过 |
| 封面图仍可解析 | 5 篇各自挂 `picture-1..5.*.webp`（含响应式副本）；`<img src>`+`srcset` 共 **866 处引用、缺图 0** |
| 站内死链 | 去重站内链接 **22 个、死链 0**（第一轮 40 个链接 0 死链；链接变少是因为 demo 页消失） |
| canonical / og:url | 29 个 HTML 中，除 6 个 `/404/` 重定向桩外**全部指向 `https://blog.265702.xyz`**（异常 0）；文章页 og:image 仍为 `/og/<slug>.png` |
| `[CUSTOM]` 覆盖 | 20 个可标记文件 / **66 处**（第一轮 18 / 57）。增量来自 t6：`navBarConfig` 4→7、`siteConfig` 14→16、`backgroundWallpaper` 9→10、新增 `sidebarConfig` 2、新增 `.gitignore` 1。**无退化**；`src/constants/lqips.json` 仍是构建重写的 JSON（不加标记，文档 §七 已说明） |
| 导航与空入口 | 导航文本：`主页 文章 归档 分类 标签 社交 友链 留言 我的 相册 书签导航 关于我 链接 GitHub RSS 订阅 Atom 订阅`；`/series/` `/dynamic/` `/projects/` 在导航与首页里 **0 处链接**；侧边栏「最新动态」卡已移除 |
| 邮箱 | 全产物 `your-email@example.com` **0 处**；`moby5702@qq.com` 已落地（首页/横幅为 base64 编码的 `mailto:` 链接防爬虫，关于页/友链页为明文） |
| 分类与标签 | 技术笔记 3 / 生活随笔 1 / 文学随笔 1；14 个标签，无 demo 标签 |
| 构建产物稳定性 | `dist/` 无 `server/`、`client/`、`_worker.js`、`_routes.json` → 仍是纯静态，Cloudflare Pages 参数（`pnpm build` + `dist` + `NODE_VERSION=22.23.0` + 不设 `CF_WORKERS`）不变 |
| 文档与实物 | `CUSTOMIZATION.md` §十一 记录的 295 文件 / 13,616 KB / 29 HTML / sitemap 22 / rss 5 / Pagefind 8 页 1,692 词 / F5 3.49:1 / F3 逐字节一致 —— **与我独立复测的数字全部吻合**（F5 我测 3.41，属同一量级的取样差异） |

## R-7. 仍未解决 / 需用户或队长决定的事项（均不阻断，故不影响 PASS）

| 编号 | 类型 | 事项 | 建议 |
|---|---|---|---|
| **U1** | **需用户确认** | 邮箱被填成 `moby5702@qq.com`（t6 落地）。这个地址**不是用户在本对话里直接提供的**，是由昵称推断的 | 请用户确认是否本人邮箱；若不是，改 4 处：`profileConfig.ts:39`、`backgroundWallpaper.ts:124`、`about.md`、`friends.mdx`（改完重新构建） |
| U2 | 已知保留（第一轮 F8） | **主题示例相册仍在渲染**：`/gallery/encrypted-test/`、`/gallery/firefly-2026/` 两个 demo 相册页（含 sitemap 收录、`public/gallery/` 示例图） | `CUSTOMIZATION.md` §八 已声明"未处理"。要彻底去 demo 化：把 `galleryConfig` 里两个相册删空（或 `pages.gallery=false`）后重建 |
| U3 | 低（t6 取舍的副作用） | `/series/`、`/projects/`、`/dynamic/` 三个**空页面**仍被 sitemap 收录（22 条里有 3 条）；`/projects/` 显示"0 项目 / 暂无项目"、`/dynamic/` 显示"0 动态"、`/series/` 显示"找不到相关结果"；`llms.txt` 的 Key Pages 也仍列出 动态/项目 | 三选一：① 保持现状（页面可访问、导航无入口，对访客几乎不可见）；② 给三个页面加 `<meta name="robots" content="noindex">`；③ 干脆 `pages.*=false`（会变成 `/404/` 重定向桩）。当前选择是队长拍板的"隐藏入口、保留页面"，从访客视角可接受 |
| U4 | 低（可选） | 15 个 demo 内容文件只加了 `draft: true`，**没有行内 `# [CUSTOM]` 注释**（改动意图只在 `CUSTOMIZATION.md` §十二 记录） | 若严格执行"所有修改加注释"，可在这 15 个文件 frontmatter 各加一行 `# [CUSTOM] 下线主题 demo 内容（见 CUSTOMIZATION.md §十二）`；YAML 注释不影响解析 |
| U5 | 低（文档小瑕疵） | `CUSTOMIZATION.md` §七 第 1 行把 `2.08:1` 写成"第二轮验证实测"，实际是**第一轮**验证结果 | 改成"第一轮验证"即可（一句话，不影响结论） |
| U6 | 提示（第一轮 F7） | 改动仍未提交（**20 项未跟踪** + **40 个已跟踪文件被改**，其中 4 个是删除的 demo 动态）；本机 `git config user.name` 为空；`origin` 仍指向上游 gh-proxy | 按 `BASELINE.md` §6.2 处理后再推 GitHub → Cloudflare Pages |

## R-8. 本轮我对第一轮结论的自我更正

| 第一轮结论 | 本轮复核 | 处理 |
|---|---|---|
| **F3**「移动壁纸不是 background2 的 2:3 裁切，文档措辞待确认（低）」 | 按文档命令重跑，**sha256 逐字节相同** → 文档正确，我的滑窗模板匹配档位没覆盖 2352px 窗口宽度 | **撤回 F3**，改判"文档正确且可复现"；在第一轮附录 B 对应行加了更正批注 |
| 第一轮 F5 用"矩形整块平均色"算对比度（2.08:1） | 该方法把白色字形像素也算进"背景"，会把对比度算低；本轮补了剔除字形的口径（3.44:1） | 数值口径已在本轮说明；F5 的**存在性**不受影响（0.2 遮罩下确实偏亮），修复后两个口径都 ≥3:1 |
| 第一轮"首页横幅标题 OCR 读不出 ⇒ 可能对比度不足" | 0.4 遮罩后 OCR 能读出 `Moby's Blog`；计算样式也证明一直有渲染 | 结论一致（是观感问题，非渲染缺失），已在 R-4 补充 |

## R-9. 复审用到的命令与临时脚本（已删除）

```powershell
cd D:\Program\Save\learn\web\blog
pnpm build                                        # exit 0 → 29 pages / 295 files / 13,616 KB
node .verify2/round2-verify.mjs                   # 规模/残留/缺图/死链/canonical/首页卡片/页面抽查
node .verify2/empty-pages.mjs                     # /projects/ /dynamic/ /archive/ /categories/ /tags/ 空态
node .verify2/nav-email.mjs                       # 导航入口、侧边栏卡、邮箱渲染
node .verify2/static-server.mjs                   # 127.0.0.1:4401 托管 dist（截图用）
node .verify2/cdp-contrast.mjs                    # CDP 取 banner-title rect + 截图 + 对比度
node .verify2/contrast-refine.mjs                 # 12×4 分块、剔除字形像素后的背景对比度
node -e "...sharp 重生成 mobile 壁纸..."            # F3 逐字节复现（输出写临时文件）
git check-ignore -v .wrangler/x                   # F6
```

> 临时目录 `blog/.verify2/`（脚本 + 3 张截图 + 取样数据）与本轮构建日志已在复审判定后删除；截图结论与具体数值已写入本报告。仓库 `git status` 只应剩业务改动 + 三份文档（BASELINE / CUSTOMIZATION / VERIFICATION）。

## R-10. 最终结论

**PASS** —— 可以进入交付/部署阶段。

- 第一轮的**唯一阻塞项 F1 已关闭**：产物里 `Demo site` / `firefly.cuteleaf.cn` / `docs-firefly.cuteleaf.cn` / `XiaYe` 全部 0 命中；订阅源、站点地图、AI 摘要、搜索索引都不再含 demo URL；首页首卡不再是主题自荐文；4 条 demo 动态不再渲染。
- **F3 是我的误报**，已撤回并确认文档正确可复现。
- **F5 达标**：同法复测 2.08:1 → **3.41:1**（更严格口径 3.44:1），且视觉抽查无崩坏、横幅标题 OCR 已可读。
- **F6 达标**：`.gitignore` 生效、无 `.wrangler/` 残留。
- **无回归**：5 篇文章与封面原封不动、缺图 0、死链 0、canonical 全对、`[CUSTOM]` 覆盖 66 处 / 20 文件。
- 交付前仍需用户参与的只有 **U1（确认邮箱）** 与 **U6（提交 + 推送）**；U2/U3/U4/U5 是可选优化或已声明的保留项。

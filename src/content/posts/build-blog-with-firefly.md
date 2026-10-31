---
title: 用 Firefly 搭建自己的技术博客
published: 2026-10-24
description: 从克隆仓库、改几处配置、写第一篇文章，到推上 Cloudflare Pages 的完整记录，附我实际踩过的坑。
image: ./images/picture-1.webp
tags: [Firefly, Astro, 博客搭建]
category: 技术笔记
lang: "zh-CN"
draft: false
---

这个站点本身就是一个用来验证流程的样本：主题是开源的 [Firefly](https://github.com/CuteLeaf/Firefly)，底座是 Astro 7，部署在 Cloudflare Pages 上。下面这份记录按我实际的操作顺序写，命令和路径都能直接照着敲——容易写错的地方我都在旁边标注了。

## 先看它是什么

Firefly 基于 Astro 和 Fuwari 模板扩展而来，前端交互用 Svelte 5 写，样式走 Tailwind 4。它输出的是纯静态站点：没有数据库，没有服务端进程，构建完成就是一堆 HTML、CSS、JS 和图片。对个人技术博客来说，这个形态的好处很直接——便宜、快、几乎不会被拖垮，唯一的成本是每次更新都要重新构建一次。

仓库对运行环境有明确要求：

| 项目 | 要求 |
|---|---|
| Node.js | `>=22.23.0` |
| 包管理器 | 只能用 pnpm（版本写死在 `packageManager` 字段里） |
| 输出目录 | `dist/` |

## 安装依赖

```bash
git clone https://github.com/CuteLeaf/Firefly.git my-blog
cd my-blog
pnpm install --registry=https://registry.npmmirror.com
pnpm dev
```

`pnpm dev` 起来之后打开 `http://localhost:4321`，能看到默认的示例站点就说明环境没问题。首次安装大概 1175 个包，国内源两分半左右。

> [!NOTE] 为什么必须是 pnpm
> 项目的 `preinstall` 脚本里写着 `npx only-allow pnpm`，用 npm 或 yarn 装依赖会直接失败。`pnpm-workspace.yaml` 里还有一份 `allowBuilds` 白名单，把 `esbuild` 和 `workerd` 放行——pnpm 10 以后默认拦截依赖的 `postinstall`，这两个不放行的话构建会以奇怪的方式挂掉。别删。

## 认路：只需要记住三层

新仓库文件很多，但日常真正会碰的只有三层：

- `src/config/` —— 站点的全部“人味”都在这里。站点标题、头像、壁纸、导航、评论、字体、侧边栏全是独立文件，最后统一从 `src/config/index.ts` 导出。
- `src/content/` —— 内容。`posts/` 是文章，`dynamic/` 是短动态，`projects/` 是项目展示，`spec/` 放关于页这类特殊页面。
- `src/assets/` 和 `public/` —— 静态资源的两种待遇。`src/assets/` 交给 Astro 图片管线，构建期会压缩转格式；`public/` 原样拷进产物，不处理。

剩下的 `src/components`、`src/layouts`、`src/plugins` 属于主题实现，除非要改功能，不用打开。

## 改配置：其实只要动三个文件

1. `src/config/siteConfig.ts`：`title`、`subtitle`、`description`、`site_url`，还有主题色相 `themeColor.hue` 和默认明暗模式。
2. `src/config/profileConfig.ts`：头像 `avatar`、名字 `name`、签名 `bio`，以及 `links` 里的社交入口。图标用 Iconify 名，比如 `fa7-brands:github`，想用别的图标集得先 `pnpm add @iconify-json/<名称>`。
3. `src/config/backgroundWallpaper.ts`：背景模式（`banner` / `fullscreen` / `overlay` / `none`）和图片地址，`desktop` 和 `mobile` 都可以给数组，刷新时随机取一张。

> [!WARNING] `site_url` 一定要在构建前改对
> 它不是“显示用的地址”，而是驱动 canonical、`og:url`、sitemap、RSS、Atom、robots.txt 的那根钉子，连文章里的外链判定都靠它。填错或者改完忘记重新构建，搜索结果和分享卡片会一直指向旧域名。写站点根地址即可，协议加域名，结尾不要带斜杠。

## 新增一篇文章

```bash
pnpm new-post my-first-note
```

会生成 `src/content/posts/my-first-note.md`，骨架里的 frontmatter 长这样：

```yaml
---
title: my-first-note
published: 2026-10-24
description: ''
image: ''
tags: []
category: ''
draft: false
lang: ''
slug: my-first-note
---
```

只有 `title` 和 `published` 是必填，其余都有默认值。有两件事特别容易搞混：

- **`slug` 字段不存在。** 骨架里那个 `slug` 是历史遗留，schema 里没有，写了也不生效。文章的 URL 由文件路径决定：`src/content/posts/my-first-note.md` 就是 `/posts/my-first-note/`，放进子目录 `guide/index.md` 就是 `/posts/guide/`。想改 URL 就改文件名或目录名。
- **`draft: true` 的文章不会出现在列表里，也不会生成页面。** 本地调试想先看效果，把它改成 `false`。

图片建议统一放 `src/content/posts/images/`，在 frontmatter 和正文里都用相对当前 md 文件的路径引用：

```yaml
image: ./images/picture-1.webp
```

```markdown
![配图说明](./images/picture-1.webp)
```

这样构建时会自动压缩成 webp、生成模糊占位图。往 `src/` 下加了新图之后跑一次 `pnpm lqips`，或者直接 `pnpm build`，占位图数据才会更新。

## 推到线上

先把你自己的仓库接上。克隆下来的 `origin` 指向上游作者，直接推会出事：

```bash
git remote rename origin upstream
git remote add origin https://github.com/<你的账号>/<你的仓库>.git
git push -u origin master
```

然后在 Cloudflare Dashboard 里建一个 Pages 项目，连接这个仓库，填三项：

| 配置项 | 值 |
|---|---|
| Build command | `pnpm build` |
| Build output directory | `dist` |
| 环境变量 `NODE_VERSION` | `22.23.0` |

**不要设 `CF_WORKERS`。** 一旦设了，Astro 会切到 Cloudflare 适配器分支，产物变成 `dist/client` 加 `dist/server`，构建期也不再压缩图片，纯静态托管反而多出一堆麻烦。构建命令也不要简化成 `astro build`——`pnpm build` 是一条八段流水线，少了后面几段就没有搜索索引和占位图。

最后挂上自己的域名，Pages 会自动建好 CNAME 并签发证书。等状态从 `Initializing` 变成 `Active`，打开页面看一眼：标题、头像、壁纸都是新的，`/posts/` 能进，`/search/` 能搜到东西，源码里的 canonical 是你自己的域名。到这一步，这个博客才算是你的。

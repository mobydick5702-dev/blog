---
title: Astro 博客的构建流水线笔记
published: 2026-10-26
description: 一个 pnpm build 背后串了八段脚本：卡片数据、模糊占位图、图片压缩、看板娘裁剪、字体子集、内联脚本压缩、静态搜索索引。逐段记下它们各自在解决什么问题。
image: ./images/picture-2.webp
tags: [Astro, 构建流水线, 性能优化]
category: 技术笔记
lang: "zh-CN"
draft: false
---

第一次跑这个博客的 `pnpm build`，我以为它只是“把 Markdown 渲染成 HTML”。看构建日志才发现，一条命令里串了八段脚本，跑了三分多钟，最后的产物是 329 个文件、22.8 MB。这篇把每一段拆开，写清楚它在干什么、为什么值得花这个时间。

## 八段流水线

`package.json` 里 `build` 的原貌就是这样一条用 `&&` 串起来的长链：

```bash
npx tsx scripts/generate-github-card-data.ts \
  && npx tsx scripts/generate-lqips.ts \
  && npx tsx scripts/generate-vndb-covers.ts \
  && astro build --force \
  && npx tsx scripts/prune-pio-assets.ts \
  && npx tsx scripts/subset-fonts.ts \
  && npx tsx scripts/minify-inline-scripts.ts \
  && npx tsx scripts/run-pagefind.ts
```

顺序不能随便调。前四段准备数据，第五段才是真正渲染页面，后面四段都是对 `dist/` 的二次加工——必须在产物已经存在之后才能跑。

| # | 脚本 | 做什么 | 要外网吗 |
|---|---|---|---|
| 1 | `generate-github-card-data.ts` | 抓仓库信息，写 GitHub 卡片缓存 | 是 |
| 2 | `generate-lqips.ts` | 为 `src/` 下图片生成模糊占位色，写 `src/constants/lqips.json` | 否 |
| 3 | `generate-vndb-covers.ts` | 下载 VNDB 封面（页面没开就跳过） | 是 |
| 4 | `astro build --force` | 渲染全部静态路由、生成 OG 分享图、压缩图片 | 是 |
| 5 | `prune-pio-assets.ts` | 删掉没启用的看板娘资源 | 否 |
| 6 | `subset-fonts.ts` | 本地字体做字符子集化 | 否 |
| 7 | `minify-inline-scripts.ts` | 压缩产出 HTML 里的内联脚本 | 否 |
| 8 | `run-pagefind.ts` | 建静态搜索索引到 `dist/pagefind/` | 否 |

## 第 1 段：卡片数据是缓存，不是依赖

文章里写 `::github{repo="..."}` 会渲染成一张仓库卡片。这些信息只在构建时抓一次，落盘到 `src/constants/github-card-data.json`，页面运行时完全不碰 GitHub API。

值得学的是它的失败方式：匿名调用 `api.github.com` 很容易撞上 403 限流，脚本遇到错误不会中断构建，而是**保留上一次的缓存数据继续跑**。构建日志里会出现一行 `[GITHUB-CARD] Failed to refresh ... 403 rate limit exceeded`，看着吓人，其实无害。

> [!TIP] 这类“外部数据 + 本地缓存”的脚本，判断标准只有一条
> 它失败的时候，产物是变旧了还是变坏了？变旧可以接受，构建继续；变坏就必须中断。卡片数据属于前者，所以允许降级。

## 第 2 段：LQIP，用 18 个字符换掉一次白屏

LQIP（Low Quality Image Placeholder）的思路是：图片还没下载完时，先画一块从原图里采样出来的模糊色块，等真图加载完成再淡出。

这个仓库把占位色压缩到了极致。`src/constants/lqips.json` 里每张图的值是一个 18 字符的十六进制串，比如 `6e3b38ae7472af7574`，浏览器端这样还原：

```ts
// src/utils/lqip-utils.ts（节选）
const c1 = `#${compact.slice(0, 6)}`;
const c2 = `#${compact.slice(6, 12)}`;
const c3 = `#${compact.slice(12, 18)}`;
return `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
```

三个色标、一个 135 度渐变，18 字节的数据量。取不到数据时也不报错，直接退回一条固定的灰阶渐变；外部图片则干脆不参与。所以新加了图片却忘了重新生成 `lqips.json`，页面不会坏，只是少了一个过渡效果——这就是“可以降级”的设计。

## 第 4 段：`astro build --force` 里的三件事

这一段最重，官方的一条命令干了三件事：

1. **同步内容集合、生成类型。** `src/content.config.ts` 里的 Zod schema 就是在这里被校验的，字段写错或图片路径不存在会直接构建失败。
2. **渲染静态路由。** 四十来个页面，其中包括 `/og/[...slug]` 生成的分享图——OG 图是构建期用 takumi 画出来的 PNG，不是运行时截图。这部分占了相当一部分耗时。
3. **压缩图片。** 交给 sharp，按配置转 webp，能在构建期压的都不留到运行时。

`--force` 的意思是忽略缓存，全量重建。代价是慢，好处是不会有“上次构建的幽灵文件”混进产物。

## 第 5 段：删掉那 15 MiB

Astro 会把整个 `public/` 原样拷进 `dist/`，不管你到底用不用。仓库里的看板娘模型资源（Live2D / Spine）就住在 `public/pio/` 下，十来个 MiB。看板娘功能默认是关的，这些文件就成了纯粹的负担。

`prune-pio-assets.ts` 在构建后按配置决定删哪些：两个模型都关就整段删掉，只关一个就删对应的子目录。实测一次能省下 15.26 MiB——**比任何图片压缩技巧都划算**，因为它是把“根本不该上传的东西”拿掉。

## 第 6 段：字体子集化，条件不满足就跳过

`fontConfig.subsetFonts` 里列了本地字体之后，这段脚本会用 `subset-font` 按页面实际用到的字符裁剪字体文件，中文字体动辄几 MiB，子集化收益很可观。

当前站点没有本地字体（全局字体用的是 `"system"`），所以这段是空的，日志里只有一句 `No local fonts with subset: true found`。空跑不报错、不阻塞——这是我对流水线脚本的一个基本要求：**跳过也是一种正常状态，要有明确日志。**

## 第 7 段：内联脚本压缩

主题里有不少为了首屏性能内联在 HTML 里的脚本（主题初始化、LQIP 淡入这些），它们的优点是免掉一次请求，缺点是会跟着 HTML 走。这段脚本把产出的 HTML 逐个过一遍，压缩其中的内联脚本。

实测数字：40 个 HTML 里 35 个被处理，一共 1150 段内联脚本，省下 1733 KiB。纯字符串级的收益，风险为零。

## 第 8 段：Pagefind，静态站也能搜索

静态站点没有服务端，搜索怎么办？Pagefind 的做法是在构建期扫一遍产物，把正文切成索引分片存到 `dist/pagefind/`，浏览器端按需下载。第一次实测的索引是 18 个页面、2088 个词，耗时 0.6 秒。

这段必须排在最后，因为它依赖前面所有渲染结果。索引是纯静态文件，托管平台不需要任何额外配置。

## 几句总结

回头看这条流水线，很多段都在做同一件事：**把能在构建期算完的东西，全部搬到构建期**。占位色、图片压缩、OG 图、搜索索引、字体子集，全都符合这个模式。代价是三分多钟的构建时间和一些调试复杂度，换来的是访问时更少的请求、更小的体积和零服务端依赖。

对个人博客来说这笔账是划算的：构建一天最多跑几次，页面一天要被打开很多次。

> [!NOTE] 本地调试的省时开关
> 如果只是改文章、看排版，`pnpm dev` 就够了，它按需编译，不跑这八段。改动涉及 OG 图或搜索索引时才需要完整构建；`siteConfig.post.generateOgImages` 也可以在本地临时关掉，能明显缩短构建时间。

---
title: 用 Firefly 搭建自己的技术博客
published: 2026-10-31
description: 从 clone 到 Cloudflare 部署，以及中间踩的几个坑。
image: ./images/picture-1.webp
tags: [Firefly, Astro, 博客搭建]
category: 技术笔记
lang: "zh-CN"
draft: true
---

Firefly 是基于 Astro 和 Fuwari 的博客主题，纯静态，对于新手十分的友好


## 准备

| 东西 | 要求 |
| --- | --- |
| Node | ≥ 22.23.0 |
| pnpm | ≥ 11.22.0（项目 `preinstall` 强制） |
| Git | 任意新版 |

pnpm 一行装：

```
npm install -g pnpm
```

装完 `node -v` 和 `pnpm -v` 各自看一眼，版本对得上再往下走。

## 下载


```
git clone https://github.com/CuteLeaf/Firefly.git blog
```

## 装依赖

必须用 pnpm，仓库的 `preinstall` 强制了。

```
pnpm install --registry=https://registry.npmmirror.com
```

1175 个包，两分半。官方源会更慢，建议直接走镜像。

## 改配置

配置全在 `src/config/` 下，一个文件管一块：

| 文件 | 管什么 |
| --- | --- |
| siteConfig.ts | 站点标题、描述、域名、导航栏 |
| profileConfig.ts | 头像、昵称、社交链接 |
| backgroundWallpaper.ts | 壁纸、首页横幅文字 |
| musicConfig.ts | 音乐播放器 |

`site_url` 记得填对，canonical、sitemap、RSS 全靠它生成。

## 本地看效果

```
pnpm dev
```

打开 `http://localhost:4321`。第一次启动要编译，白屏十几秒正常，改配置会热更新。

## 写文章

文章是 Markdown，放 `src/content/posts/`，文件名决定 URL。也可以走脚手架：

```
pnpm new-post hello-world
```

frontmatter：

```yaml
---
title: 文章标题
published: 2026-10-31
description: 列表页显示的摘要
image: ./images/cover.webp
tags: [标签]
category: 分类名
draft: false
---
```

`category` 随便写，`/categories/` 会自动按它聚合。`draft: true` 只在 dev 下可见。

## 清掉 demo 内容

主题自带一堆示例文章、示例动态、示例项目等。

文章是 markdown，直接删，或者把 frontmatter 改成 `draft: true`。

注意：**draft 的文章在构建时照样会被解析**。我修改时把示例文章引用的图片删了，构建直接报 `ImageNotFound`。建议不要随便动文件（）

## 构建

```
pnpm build
```

三分钟左右。中间会从 `cdn.jsdelivr.net` 拉字体，网络不好会报 `CannotFetchFontFile`，重跑就行。

产物在 `dist/`。

## 部署

推到 GitHub，然后 Cloudflare Pages 连仓库：

| 配置项 | 值 |
| --- | --- |
| 构建命令 | `pnpm build` |
| 输出目录 | `dist` |
| 环境变量 | `NODE_VERSION=22.23.0` |

**别设 `CF_WORKERS`**，设了会切成 Workers 模式，产物变成 `dist/client` 加 `dist/server`。

自定义域名在 Pages 里加，DNS 已经在 Cloudflare 了，点一下就好。

## 几个坑

**安全头写错了地方**。主题仓库里有个 `vercel.json` 写了 `X-Content-Type-Options` 之类的头，但 Cloudflare Pages 根本不读它，只认 `public/_headers`。不写的话线上一个安全头都没有。

**静态资源默认不缓存**。`_astro/` 下的资源响应头是 `max-age=0, must-revalidate`，浏览器每次打开都要挨个问服务器一遍，网络抖一下就明显卡。在 `public/_headers` 里加：

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

文件名本来就带内容哈希，放心加一年。

**robots.txt 别屏蔽 `/_astro/`**。主题默认写了 `Disallow: /_astro/`，那里放的是全站 CSS 和 JS，搜索引擎拿不到样式，收录质量会掉。


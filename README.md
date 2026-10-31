# Moby's Blog

> 写代码，也写字：技术笔记为主，也收藏生活与文学。

个人技术博客 · <https://blog.265702.xyz>

基于开源主题 [Firefly](https://github.com/CuteLeaf/Firefly) 二次定制（Astro 7 + Svelte 5 + Tailwind CSS 4）。
所有定制改动都在源码里用 `[CUSTOM]` 标注，完整清单见 [CUSTOMIZATION.md](./CUSTOMIZATION.md)。

![站点首页](docs/images/moby-blog-home.jpg)

## 本地开发

需要 Node.js >= 22.23 与 pnpm 11（仓库的 `preinstall` 会强制使用 pnpm）。

```bash
pnpm install
pnpm dev                         # 本地预览 http://localhost:4321
pnpm build                       # 构建到 dist/
pnpm preview --host 127.0.0.1    # 预览构建产物（不加 --host 时默认只监听 IPv6）
```

## 写新文章

文章放在 `src/content/posts/`，**URL 由文件路径决定**：`my-post.md` → `/posts/my-post/`，`guide/index.md` → `/posts/guide/`（frontmatter 里没有 `slug` 字段）。

```yaml
---
title: 文章标题
published: 2026-10-30
description: 一句话摘要，用于列表页与 SEO
image: ./images/cover.webp
tags: [标签一, 标签二]
category: 技术笔记
lang: "zh-CN"
draft: false
---
```

- 配图放 `src/content/posts/images/`，正文与 `image` 字段用 `./images/xxx.webp` 引用
- `draft: true` 的文章只在 `pnpm dev` 时可见，生产构建会隐藏
- 连载可用 `series` + `seriesOrder`；单篇加密可用 `password`
- 也可以走脚手架：`pnpm new-post <文件名>`

## 目录结构速览

| 路径 | 内容 |
| --- | --- |
| `src/config/` | 全部站点配置（站点信息、个人资料、导航、壁纸、评论、字体等） |
| `src/content/posts/` | 文章（md / mdx） |
| `src/content/spec/` | 关于、友链、留言板等特殊页 |
| `src/assets/images/` | 头像、壁纸等参与构建优化的图片 |
| `public/` | 原样复制的静态资源 |
| `scripts/` | 构建脚本（LQIP、字体子集、Pagefind 等） |

## 部署：GitHub → Cloudflare Pages

构建产物是纯静态文件，可直接托管在任意静态服务器上。

- 构建命令：`pnpm build`
- 输出目录：`dist`
- 环境变量：`NODE_VERSION=22.23.0`，**不要设 `CF_WORKERS`**（设了会变成 Workers 模式）
- 自定义域：`blog.265702.xyz`

首次推送前，需要把镜像地址的 `origin` 改名并添加自己的仓库：

```bash
git remote rename origin upstream
git remote add origin https://github.com/mobydick5702-dev/<你的仓库名>.git
git push -u origin master
```

完整步骤（含 Cloudflare 绑定自定义域、同步上游 Firefly 更新）见 [BASELINE.md](./BASELINE.md)。

## 文档

| 文档 | 说明 |
| --- | --- |
| [BASELINE.md](./BASELINE.md) | 环境、构建、部署、日常操作、同步上游 |
| [CUSTOMIZATION.md](./CUSTOMIZATION.md) | 全部定制改动（原值 → 新值 → 还原）、换头像 / 壁纸 / 站点信息 |
| [VERIFICATION.md](./VERIFICATION.md) | 两轮独立验证记录 |

## 许可与致谢

- 主题：[Firefly](https://github.com/CuteLeaf/Firefly)，基于 [Fuwari](https://github.com/saicaca/fuwari) 二次开发，MIT License
- 本站内容与定制部分同样遵循 MIT，原始版权声明见 [LICENSE](./LICENSE)（© 2024 saicaca、© 2025 CuteLeaf）
- 保留侧栏与页脚的主题署名，是对上游开源工作的致谢

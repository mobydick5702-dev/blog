---
title: 用 Firefly 搭建自己的技术博客
published: 2026-10-31
description: 从 博客搭建 到 Cloudflare 部署，如何几乎0成本地部署自己的个人博客
image: ./images/picture-1.webp
tags: [Firefly, Astro, 博客搭建, Cloudflare, AI]
category: 技术笔记
lang: "zh-CN"
draft: false
---

> Firefly 是基于 Astro 和 Fuwari 的博客主题，纯静态，对于新手十分的友好。
> 当有了AI的加入，我们可以绕过大部分的问题，即使是0基础小白也能自己搭建一个属于自己的博客

~~AI还是太好用了~~

## 一.准备

### 1.1软件安装

| 软件 | 版本要求 | 用途 | 官网 |
| :--- | :--- | :--- | :--- |
| Node.js | ≥ 22.23.0 | 构建运行环境 | https://nodejs.org/zh-cn |
| git | 最新版 | 代码版本管理、推送 GitHub | https://git-scm.com/download/win |
| 任意Agent | 最新版 | AI助手 | 自行选择 |
| VS Code（可选） | 最新版 | 编辑器，用于手动更改配置	 | https://code.visualstudio.com/ |

#### 注意：
+ Node.js: 打开Powershell输入
```bash 
node -v
```
显示` v22.x.x `即达标
+ pnpm：在 PowerShell 里执行
```bash 
pnpm -v
```
显示 11.x.x 即达标
并且可以直接执行
```bash 
npm install -g pnpm
```
进行安装
+ 如果觉得麻烦，可以直接让AI帮你安装（）

### 1.2账号注册

| 账号 | 网址 |
| :--- | :--- |
| Github | https://github.com/signup |
| Cloudflare | https://dash.cloudflare.com/sign-up |

## 二.复制Firefly官方仓库
首先你需要将Firefly项目完整复制一份到自己的 GitHub 账号下。修改项目和部署博客都是在你自己的仓库里进行。
> 这里也有些人推荐Fork，请自行选择
- 1.浏览器打开 Firefly 官方仓库：https://github.com/CuteLeaf/Firefly
- 2.点击右上角的Use this template -> Create a new repository
- 3.在Repository name填上仓库名，点最下面的Create repository

## 三.下载并更改项目
> AI大人要开始发力了

- 1.在刚才你创造的仓库中点击**code**，复制**https**开头的那个地址
- 2.创造一个文件夹（如`D:/blog`），把AI Agent的工作区设立在该文件夹里
- 3.把在这段话复制给AI Agent：
```text
请帮我把我 GitHub 上的仓库 (此处替换成你的仓库地址) 克隆到当前文件夹。
```
- 4.有任何需要修改的地方直接询问AI
- 5.更改完毕后可以告诉AI
```text
请启动博客开发服务器，并告诉我预览地址。
```
然后再浏览器进入AI发给你的地址进行预览
- 6.更改完成后，告诉AI：
```text
请帮我把当前所有改动提交到 Git 并推送到 GitHub。
```
> p.s.上述步骤全部都可以手动执行，步骤也不算太复杂，直接问AI就好

### 配置文件速查
> 当然，要是你想要手动修改，也是可以的

所有配置都在 `src/config/` 下，一个文件管一块：

| 文件 | 管什么 | 常改项 |
| :--- | :--- | :--- |
| `siteConfig.ts` | 站点全局 | 标题、副标题、描述、域名、关键词、导航栏标题、主题色 |
| `profileConfig.ts` | 博主信息 | 头像、昵称、一句话简介、社交链接 |
| `backgroundWallpaper.ts` | 背景与横幅 | 壁纸图、首页横幅标题与副标题、遮罩浓度 |
| `navBarConfig.ts` | 顶部导航 | 菜单条目、顺序、下拉分组 |
| `musicConfig.ts` | 音乐播放器 | 开关、歌单、封面 |
| `commentConfig.ts` | 评论系统 | 类型（默认关闭）、服务地址 |
| `fontConfig.ts` | 字体 | 全局字体、各区域字体 |

其他内容：

| 位置 | 放什么 |
| :--- | :--- |
| `src/content/posts/` | 文章，文件名决定 URL |
| `src/content/posts/images/` | 文章配图 |
| `src/content/spec/about.md` | 关于页 |
| `public/` | 原样复制的静态资源（favicon、音乐等） |

## 四.部署上线

这里我使用的是Cloudflare，也可以用其他的平台

- 1.打开 https://dash.cloudflare.com 登录你的账号
- 2.左侧菜单Compute -> Workers & Pages -> Create application -> Continue with Git
- 3.授权 GitHub 后选中刚才那个仓库，点下一步
- 4.构建配置按下表填：

| 配置项 | 填什么 |
| :--- | :--- |
| 项目名称 | 随意，决定 `xxx.pages.dev` 的二级域名 |
| 生产分支 | 仓库的默认分支（一般是 `main` 或 `master`） |
| 构建命令 | `pnpm build` |
| 构建输出目录 | `dist` |

> 确保 pnpm-lock.yaml 已提交；如构建失败，在 Cloudflare Pages 设置环境变量 NODE_VERSION=22，并确认构建命令为 pnpm build、输出目录为 dist。

## 五.总结:这套项目的优点
- 1.上手门槛低
Firefly 基于 Astro 和 Fuwari，纯静态、模板完整，复制官方仓库后改配置就能跑，对新手友好。
- 2.AI 辅助大幅降低操作成本
克隆仓库、改配置、启动预览、提交推送都可以直接让 AI Agent 执行，零基础也能按提示完成大部分流程。
- 3.配置集中，查找方便
站点信息、博主资料、背景、导航、音乐、评论、字体都集中在 src/config/，文章和图片位置也明确，维护成本较低。
- 4.纯静态，部署简单且成本低
构建产物是 dist，可直接部署到 Cloudflare Pages 等平台，配合 Git 推送自动构建，免费额度通常够个人博客使用。

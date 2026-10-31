---
title: Git 日常清单：在一份开源主题上做自己的博客
published: 2026-10-28
description: 把“借用开源主题做个人站”这类仓库的 Git 习惯整理成一张清单：先认清 remote，再谈提交与同步上游。
image: ./images/picture-3.webp
tags: [Git, 工作流, 版本管理]
category: 技术笔记
lang: "zh-CN"
draft: false
---

用开源主题搭博客，Git 的用法和普通项目不太一样：仓库里同时住着别人的上游代码和你自己的内容与配置，还要能跟着上游升级。这类仓库我踩过两次坑，一次差点把自己的改动推进上游地址，一次在同步上游时被一份生成物冲突卡住。下面这张清单是那之后留下来的习惯。

## 第一件事：先认 remote

在任何“克隆来的”仓库里动手改东西之前，先看一眼：

```bash
git remote -v
```

这个博客刚克隆下来时是这样的：

```text
origin  https://gh-proxy.com/https://github.com/CuteLeaf/Firefly.git (fetch)
origin  https://gh-proxy.com/https://github.com/CuteLeaf/Firefly.git (push)
```

`origin` 指向的是**上游作者**的仓库。名字叫 `origin`，实际身份是 `upstream`。这时候一次 `git push` 会尝试推到别人的仓库：要么被权限挡回来，要么在某个配置松散的托管平台上真的推出去。正确的第一步是把它改回它该有的身份：

```bash
git remote rename origin upstream
git remote add origin https://github.com/<你的账号>/<你的仓库>.git
git push -u origin master
```

> [!WARNING] 别省这一步
> 后面所有“同步上游”的命令都依赖 `upstream` 这个名字。先改名字，命令才有意义。反过来做——先按旧习惯写 `git push`——就得花时间收拾。

## 第二件事：把身份配好

新机器上第一次 commit 最常见的报错是 `Please tell me who you are`。这次仓库的 `git config user.name` 返回非零值，说明本机确实没配过：

```bash
git config --global user.name  "你的名字"
git config --global user.email "you@example.com"
```

顺手把换行符也定掉，Windows 上建议 `git config --global core.autocrlf true`，免得因为行尾差异让 diff 满屏变红。

## 每天要看的三个输出

我不背命令，只记三条要看的东西：

| 命令 | 我要从里面知道什么 |
|---|---|
| `git status --short` | 现在有哪些改动、哪些是**我以为改了但其实没改**的 |
| `git log --oneline -1` | 我现在站在哪个提交上，出问题时能不能回得去 |
| `git diff --stat` | 改动规模是否符合预期——说好只改一篇文章，不该出现八个文件 |

第三条最能救命。`git diff --stat` 出现意料之外的文件名，通常意味着某条命令改了你没打算改的东西。

## 分支：给“实验”留一条退路

静态博客的内容更新直接在 `master` 上提交没什么问题，但有两类操作我会先开分支：

```bash
git switch -c chore/upgrade-upstream
```

一是**同步上游**（合并结果不确定），二是**改主题实现**（`src/components` 之类的目录）。分支上搞砸了，`git switch master` 就回来了，比分文件回滚省心得多。

## 同步上游

博客用的是别人的主题，上游一直在动。日常同步的完整流程：

```bash
git fetch upstream
git log --oneline HEAD..upstream/master   # 先看上游多了哪些提交
git merge upstream/master                  # 或 git rebase upstream/master
pnpm install                               # 依赖可能变了
pnpm build                                 # 必跑：确认没被上游改坏
```

`pnpm install` 和 `pnpm build` 这两行不能省。上游动了 `package.json` 或 `pnpm-lock.yaml` 的时候，光合并代码是看不出问题的，得真的构建一次。

如果只想要上游的某一个修复，不用整包合并：

```bash
git cherry-pick <commit>
```

## 冲突高发区，提前有心理准备

定制越深，冲突越密。实测下来这几个文件最容易撞：

| 文件 | 原因 | 降低冲突的做法 |
|---|---|---|
| `src/config/*.ts` | 所有个性化配置都在这里 | 只改值，不改结构，不新增文件 |
| `src/content/posts/**` | 上游会更新示例文章 | 自己的文章用独立文件名，不动示例 |
| `package.json` / `pnpm-lock.yaml` | 依赖升级 | 不手改 lock，冲突时重装再生成 |
| `src/constants/lqips.json` | 生成物，双方都会变 | 直接用自己重新生成的那份 |

最后一行值得单独说：`lqips.json` 和 `github-card-data.json` 是**构建生成物，但要提交进仓库**。它们必然冲突，处理原则是“不手工合，重新生成”。而 `dist/`、`node_modules/`、`.astro/` 已经在 `.gitignore` 里，压根不该出现——如果 `git status` 里冒出来，说明被强制加过。

## 提交信息：写给人看的那一行

这个仓库的历史基本是 Conventional Commits 风格：

```text
fix(music): 支持媒体控制键系统同步、支持滑轨拖动并修复无障碍焦点圈裁切 (#697)
chore(deps): bump the patch-updates group across 1 directory with 23 updates (#696)
feat: 增强对 MDX 时间线组件的支持……
```

`type(scope): 一句话说清改了什么`。`fix` / `feat` / `chore` / `refactor` 这几个前缀足够用。好处不是好看，是半年后翻 `git log` 时能一眼筛出“哪次改动引入了这个问题”。

## 一个容易被忽略的锁：包管理器

这个项目的依赖只能用 pnpm 装，三道锁：`package.json` 里的 `preinstall: npx only-allow pnpm`、`packageManager: pnpm@11.22.0`，以及 `.npmrc` 里的 `manage-package-manager-versions = true`。

所以不要把 `pnpm-lock.yaml` 换成别的包管理器生成的锁文件，也不要为了“先让构建过”而临时改用 npm。真遇到 pnpm 版本不对，正确做法是显式装回那个版本，而不是绕开它。

## 要点总结

- 克隆来的仓库，先 `git remote -v`，把上游改名为 `upstream` 再接自己的 `origin`。
- 每天看三个输出：`status --short`、`log --oneline -1`、`diff --stat`。
- 同步上游后必须 `pnpm install` + `pnpm build`，别只看合并结果。
- 生成物冲突不手合，重新生成。
- 提交信息用 `type(scope): 做了什么`，一句话。
- 包管理器、Node 版本这些“基础设施”写进仓库，别靠口头约定。

Git 本身没什么难的，难的是先搞清楚“这个仓库是谁的”。

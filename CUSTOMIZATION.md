# CUSTOMIZATION.md — 本站定制说明与改动清单

> 本文档记录把 Firefly 主题 demo 站改造成「Moby's Blog」的**全部改动**，以及站点信息默认值、换图改资料的方法和还原方式。
> 所有被改动的源文件里都留了统一标记：TS/JS 用 `// [CUSTOM] 说明`，Markdown/MDX 用 `<!-- [CUSTOM] 说明 -->` 或 `{/* [CUSTOM] 说明 */}`。
> 部署相关（Cloudflare Pages / 域名 / 构建命令）请见 [BASELINE.md](./BASELINE.md) 的 Cloudflare 章节。

> **改动规模**：修改 **21 个源码文件**（13 个 `src/config/*` + `src/content/spec/about.md`、`friends.mdx` + `src/pages/rss.xml.ts`、`src/pages/llms.txt.ts`、`src/plugins/remark-wiki-link.js`、`src/types/dynamicConfig.ts`、`src/utils/memos-adapter.ts`、`astro.config.mjs`）+ `blog/.gitignore` + 1 个构建派生产物（`src/constants/lqips.json`，自动生成、非手改）+ 15 个 demo 内容的注释行；新增 **6 个素材文件** + 本文档，删除 4 个 demo 相册静态文件。共 **83 处 `[CUSTOM]` 标记 / 37 个文件**。

---

## 一、需要你确认/替换的值（先看这里）

| 优先级 | 项目 | 当前值 | 需要出现/维护的地方 |
| --- | --- | --- | --- |
| ✅ 已完成 | 邮箱 | `moby5702@qq.com`（用户提供的公开联系邮箱） | ① `src/config/profileConfig.ts` 的 Email 链接 ② `src/config/backgroundWallpaper.ts` 首页横幅的 Email 图标 ③ `src/content/spec/about.md` 联系方式 ④ `src/content/spec/friends.mdx` 的 `site.email` —— 四处已统一替换 |
| ✅ 已完成 | GitHub 主页 | `https://github.com/mobydick5702-dev`（用户确认的 GitHub ID） | `src/config/profileConfig.ts`、`src/config/navBarConfig.ts`、`src/config/backgroundWallpaper.ts` |
| 🟡 建议确认 | 站点起始日 | `2026-10-30`（用于"已运行 N 天"） | `src/config/siteConfig.ts` 的 `siteStartDate` |
| 🟢 可选 | 个人简介 / 关于页 | 见下方默认值表 | `profileConfig.bio`、`src/content/spec/about.md` |
| 🟢 可选 | 打赏页 | 默认关闭 | 换掉示例收款码后再开启，见「七、功能开关」 |
| 🟢 可选 | 动态 / 项目 / 系列 | 默认关闭（内容为 0） | 见「七、功能开关 → 首版空栏目处理」 |

> 邮箱是"到处都有"的值：以后要换，用编辑器全局搜索 `moby5702@qq.com` 一次性替换这 4 处即可。

---

## 二、改动清单（与 `git diff` 一一对应）

图例：**原值 → 新值**；「还原」一列统一可用 `git -C blog checkout -- <文件>` 单独回退，或在《九、整体还原》里一次性回退。

### 1. `src/config/siteConfig.ts` — 站点基础信息

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头（`export const siteConfig` 上方） | 无 | 新增 `// [CUSTOM]` 头注释 | 说明整块配置为何被定制 |
| `title` | `"Firefly"` | `"Moby's Blog"` | 站点标题（浏览器标题、SEO、RSS 都用它） |
| `subtitle` | `"Demo site"` | `"技术笔记 · 生活随笔"` | 站点副标题 |
| `site_url` | `"https://firefly.cuteleaf.cn"` | `"https://blog.265702.xyz"` | 正式域名。canonical / og:url / sitemap / RSS **全部由它派生**，迁站只改这一处 |
| `description` | 主题模板介绍长文 | `"Moby5702 的个人技术博客：以编程与技术笔记为主，也记录生活随笔、读书与文学分享。"` | 覆盖技术笔记/生活/文学三类内容 |
| `keywords` | `["Firefly","Fuwari","Astro","ACGN","博客","技术博客","静态博客"]` | `["Moby5702","技术笔记","编程","生活随笔","文学","Astro","静态博客","个人博客"]` | 按本人内容方向重写，去掉模板名与二次元标签 |
| `pages` 定义块 | 无 | 新增 `// [CUSTOM]` 说明注释 | 说明哪些 demo 栏目保留、哪些关闭 |
| `pages.sponsor` | `true` | `false` | 打赏页里是主题作者的示例收款码，开着会误导访客（导航入口会自动隐藏） |
| `navbar.title` | `"Firefly Blog"` | `"Moby's Blog"` | 导航栏站点名 |
| `navbar.logo` | 主题 logo（未改） | 同左 + 注释说明 | 视觉沿用 Firefly 默认风格；想换自己的 logo 见《四、素材》 |
| `siteStartDate` | `"2025-01-01"` | `"2026-10-30"` | 运行天数从建站日算起，别显示"已经运行 600 多天" |
| `bilibili.uid` | `"38932988"` | `""` | 主题 demo 账号（对应页面本就关闭） |
| `bangumi.userId` | `"1143164"` | `""` | 同上 |
| `vndb.userId` | `"u358128"` | `""` | 同上；为空时构建期不会下载 VNDB 封面 |
| `mal.username` | `"cuteleaf"` | `""` | 同上 |
| `mal.clientId` | `"0ef34371450f9c6c809deaadec6aa8f3"`（原值前面还有个制表符） | `""` | 主题 demo 的 API 凭据，不应沿用 |
| `lang` / `themeColor` / `pageWidth` / 分页 / 动画等 | — | **未改动** | 按任务要求保持主题默认 |

> 还原：`git -C blog checkout -- src/config/siteConfig.ts`

### 2. `src/config/profileConfig.ts` — 个人资料

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明资料已换成本人信息 |
| `avatar` | `"assets/images/avatar.avif"` | `"assets/images/avatar-moby.jpg"` | 用 `picture/moby5702.jpg` 生成的新头像（512×512） |
| `name` | `"XiaYe"` | `"Moby5702"` | 本人昵称 |
| `bio` | `"Hello, I'm XiaYe."` | `"写代码，也写字：技术笔记为主，也收藏生活与文学。"` | 一句自然的中文简介 |
| `links[0].url`（GitHub） | `https://github.com/CuteLeaf` | `https://github.com/mobydick5702-dev` | 主题作者 → 本人 |
| `links[1].url`（Email） | `mailto:xiaye@msn.com` | `mailto:moby5702@qq.com` | 主题作者的邮箱 → 用户公开联系邮箱 |
| `links[2] / links[3]`（RSS / Atom） | `/rss/`、`/atom/` | **未改动** | 站点自带订阅源 |

> 还原：`git -C blog checkout -- src/config/profileConfig.ts`

### 3. `src/config/backgroundWallpaper.ts` — 背景壁纸

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明壁纸来源与"效果参数不动"的原则 |
| `playerEnable` | `true` | `false` | 默认播放地址是主题作者的演示视频（第三方 CDN），本站不沿用 |
| `src.desktop` | `d1.avif` ~ `d6.avif` 六张轮播 | `["assets/images/DesktopWallpaper/moby-desktop.jpg"]` | 桌面壁纸默认用 `picture/background2.jpg` |
| `src.mobile` | `m1.avif` ~ `m6.avif` 六张轮播 | `["assets/images/MobileWallpaper/moby-mobile.jpg"]` | 同一张图按 2:3 竖窗裁切（left=2260）后缩放到 1080×1620，避免横图在手机上被裁成窄缝；可用 §四 的命令逐字节复现 |
| `src.playerUrl` | `https://bed.twoleaf.cn/file/1785658612716_firefly.mp4` | `""` | 第三方演示视频地址移除 |
| `common.homeText.title` | `"Lovely firefly!"` | `"Moby's Blog"` | 主题 demo 标语 → 站点名 |
| `common.homeText.subtitle` | 6 条英文句子 | `技术笔记 · 生活随笔` / `把复杂的问题讲清楚` / `代码与文字之间` / `读书 · 写字 · 造轮子` | 打字机循环标语换成中文 |
| `common.homeText.links` | GitHub→主题仓库、Email→作者邮箱、Sponsor→作者打赏页、RSS | GitHub→本人、Email→`moby5702@qq.com`、RSS；**删除 Sponsor** | 去掉指向主题作者的 demo 入口；邮箱换成用户公开联系邮箱 |
| `common.dimOpacity` | `0.2` | `0.4` | **[F5 可读性修复]** 本站壁纸偏亮，首页 72px 白字标题实测对比度仅 **2.08:1**，低于 WCAG AA 大字要求的 3:1；调到 0.4 后实测 **3.5:1**（字形背后最不利小块也从 1.87:1 提到 3.3:1）。该项由 banner / fullscreen 两种模式、桌面与移动端共用，改一处全端生效 |
| `mode` / `carousel` / `waves` / `gradient` / `banner.position` / `overlay.*` / `fullscreen.*` | — | **未改动** | 轮播、模糊、模糊渐变等性能相关参数全部保持主题默认 |

> 还原：`git -C blog checkout -- src/config/backgroundWallpaper.ts`
> 备选壁纸的位置与切换方法见《四、素材与图片 → 换壁纸》。

### 4. `src/config/navBarConfig.ts` — 导航栏

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `getDynamicNavBarConfig` 上方 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明导航结构与 demo 栏目的处理方式 |
| 「我的」子菜单上方 | 无 | 新增 `// [CUSTOM]` 注释 | 说明项目/相册/书签保留、动漫类已由 `pages` 关闭 |
| 「链接」菜单 `GitHub` | `https://github.com/CuteLeaf/Firefly` | `https://github.com/mobydick5702-dev` | 换成本人入口 |
| 「链接」菜单 `Gitee` | `https://gitee.com/CuteLeaf/Firefly` | **整条删除** | 主题作者的镜像仓库，与本博客无关 |
| 「链接」菜单 `Firefly文档` | `https://docs-firefly.cuteleaf.cn` | **整条删除** | demo 链接（原地址存档见《六、已替换项》） |
| 「链接」菜单新增 | — | `RSS 订阅` `/rss/`、`Atom 订阅` `/atom/` | 补两个对读者有用的入口 |
| 文件末尾注释掉的「文档」链接 | `https://docs-firefly.cuteleaf.cn` | **删除该注释块** + 新增说明 | 清理 demo 残留 |
| 「文章」子菜单 `系列` | `LinkPresets.Series`（有效行） | **注释掉** | 已发布文章都没有 `series` 字段，入口会点进「暂无系列」（[F5 同批] 空栏目处理） |
| 「我的」子菜单 `动态` | `LinkPresets.Dynamic`（有效行） | **注释掉** | 动态数量为 0，入口会点进「还没有发布动态」 |
| 「我的」子菜单 `项目` | `LinkPresets.Projects`（有效行） | **注释掉** | 项目数量为 0（两个 demo 项目已置 draft） |

> 首页 / 文章（归档、分类、标签）/ 社交（友链、留言）/ 我的（相册、书签导航）/ 关于（关于我）这些入口保留；打赏入口因 `pages.sponsor=false` 自动隐藏。
> 三个被注释的入口**页面本身仍然可访问**（显示主题自带的得体空状态），恢复方法见《七、首版空栏目处理》。
> 还原：`git -C blog checkout -- src/config/navBarConfig.ts`

### 4-附. `src/config/sidebarConfig.ts` — 侧边栏「最新动态」组件（F5 同批）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `rightComponents` 里的 `type: "dynamic"` 组件 | `enable: true` | `enable: false` | 动态为 0 时右侧栏那张卡片会先转圈再空着，底部还挂着「更多 → /dynamic/」入口；关掉后首页/文章页右栏干净 |
| 移动端抽屉组件列表里的 `type: "dynamic"` 组件 | `enable: true` | `enable: false` | 同上（窄屏抽屉版） |

> 两处都加了 `// [CUSTOM]` 注释与恢复方法；有动态后把 `enable` 改回 `true`，同时取消 `navBarConfig.ts` 里 `LinkPresets.Dynamic` 的注释。
> 还原：`git -C blog checkout -- src/config/sidebarConfig.ts`

### 5. `src/config/friendsConfig.ts` — 友链

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `friendsConfig` 上方 | 无 | 新增 `// [CUSTOM]` 注释 + 新增友链模板 | 告知如何加自己的友链 |
| 友链项 `夏夜流萤` | `https://blog.cuteleaf.cn` + 作者头像/描述 | **整条删除** | 主题作者的博客，属于 demo 数据 |
| 友链项 `Firefly Docs` | `https://docs-firefly.cuteleaf.cn` | **整条删除** | 同上 |
| 友链项 `Astro` | `https://github.com/withastro/astro` | **保留** | 通用、与本站技术栈相关 |

> 现在友链页只剩 1 条 Astro，请按注释里的模板添加你自己的友链。
> 还原：`git -C blog checkout -- src/config/friendsConfig.ts`

### 6. `src/config/booknavConfig.ts` — 书签导航

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `booknavConfig` 上方 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明书签页内容来源与关闭方式 |
| 「资源」组 `Firefly Docs` | `https://docs-firefly.cuteleaf.cn` | `Astro 文档` → `https://docs.astro.build` | demo 链接 → 通用文档站 |
| 「资源」组 `夏夜流萤` | `https://blog.cuteleaf.cn` | `Can I use` → `https://caniuse.com` | demo 链接 → 通用工具站 |
| 「项目」组 `Firefly` | `https://github.com/CuteLeaf/Firefly` | **保留** | 主题仓库，便于查文档/跟进上游更新 |

> 还原：`git -C blog checkout -- src/config/booknavConfig.ts`

### 7. `src/config/commentConfig.ts` — 评论系统

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明当前不启用评论、如何启用 |
| `giscus.repo` | `"CuteLeaf/Firefly"` | `"your-name/your-repo"` | 主题作者的仓库，不能沿用 |
| `giscus.repoId` | `"R_kgD2gfdFGd"` | `""` | 同上的配套 ID |
| `giscus.categoryId` | `"DIC_kwDOKy9HOc4CegmW"` | `""` | 同上 |
| `disqus.shortname` | `"firefly"` | `""` | 主题 demo 的 shortname |
| `type` | `"none"` | **未改动** | 评论默认关闭；留言板在配置评论系统前不显示评论框 |

> 还原：`git -C blog checkout -- src/config/commentConfig.ts`

### 8. `src/config/sponsorConfig.ts` — 打赏（默认关闭）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明"页面默认关闭 + 开启前要换收款码" |
| `methods[*].enabled`（支付宝/微信/ko-fi/爱发电） | 全部 `true` | 全部 `false` | 二维码图仍是主题的示例图，不该对外收款 |
| ko-fi `link` | `https://ko-fi.com/cuteleaf` | `""` | 主题作者主页 |
| ko-fi `description` | `"Buy a Coffee for Firefly"` | `"Buy me a Coffee"` | 去掉主题名 |
| 爱发电 `link` | `https://ifdian.net/a/cuteleaf` | `""` | 同上 |
| `sponsors` | 2 条示例打赏记录（含"夏叶"） | `[]` | demo 数据，清空后按注释里的格式自行添加 |

> 还原：`git -C blog checkout -- src/config/sponsorConfig.ts`

### 9. `src/config/musicConfig.ts` — 音乐播放器

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 文件头 | 无 | 新增 `// [CUSTOM]` 头注释 | 说明关闭原因与启用方法 |
| `showInNavbar` | `true` | `false` | 主题自带曲目是第三方版权音乐，不适合直接公开 |
| `showInSidebar` | `true` | `false` | 同上 |
| `local.playlist` 等其余配置 | — | **未改动** | 换成自己的音频后改回来即可 |

> 还原：`git -C blog checkout -- src/config/musicConfig.ts`

### 10. `src/config/dynamicConfig.ts` — 动态页

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `apiUrl` 上方注释 | 示例地址是主题作者域名 | 改为占位 `https://your-domain.com/api/dynamic.json` + `// [CUSTOM]` 说明 | 清 demo 域名 |
| `memos.parent` | `"users/xiaye"` | `"users/yourname"` | 主题作者的示例账号 |

> `apiUrl`（`/api/dynamic.json`）、`itemsPerPage` 等实际值**未改动**。
> 还原：`git -C blog checkout -- src/config/dynamicConfig.ts`

### 11. `src/config/announcementConfig.ts` — 公告

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `content` | `"欢迎来到我的博客！这是一则示例公告。"` | `"欢迎来到 Moby's Blog ✨ 这里主要写技术笔记，也会更新生活随笔与读书、文学分享。"` | 去掉"示例公告"字样 |

> 还原：`git -C blog checkout -- src/config/announcementConfig.ts`

### 12. `src/config/galleryConfig.ts` — 相册（demo 相册已下线）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `galleryConfig` 上方 | 无 | 新增 `// [CUSTOM]` 注释（含自己加相册的完整模板） | 说明示例相册已下线、以后怎么加自己的相册 |
| `albums` | 2 个示例相册：`firefly-2026`（"可爱流萤"，动漫示意图）+ `encrypted-test`（"加密相册示例"，密码 123456） | **清空为 `[]`** | 主题 demo 相册会直接展示给访客，且会进 sitemap；清空后 `/gallery/` 显示主题自带的「暂无相册」空状态 |

> 配套删除：`public/gallery/firefly-2026/`（`1.avif`、`cover.avif`、`urls.txt`）与 `public/gallery/encrypted-test/`（`urls.txt`）共 4 个静态文件。
> 相册页与导航入口**保留**（用户以后会放自己的照片）；加相册的步骤写在 `galleryConfig.ts` 注释里。
> 还原：`git -C blog checkout -- src/config/galleryConfig.ts public/gallery/`

### 13. `src/content/spec/about.md` — 关于页

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| 全文件 | 主题作者的自我介绍（"我是夏叶"）+ 主题 demo 站/文档链接 + 两个 GitHub 卡片 | 重写为 Moby5702 的自我介绍：简介 / 三类内容 / 关于本站 / 关于留言，保留 Firefly 开源地址与一个 GitHub 卡片（致谢） | 关于页是访客最常看的"我是谁"，不能留主题作者信息 |

> 文中带「可按需修改」的地方是内容占位（可随时补充）；联系方式已填写用户公开邮箱 `moby5702@qq.com`。
> 还原：`git -C blog checkout -- src/content/spec/about.md`

### 14. `src/content/spec/friends.mdx` — 友链页里的"本站信息"卡片

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `site` 对象上方 | 无 | 新增 `{/* [CUSTOM] */}` 注释 | 说明这块已被替换 |
| `site.name` | `"夏夜流萤"` | `"Moby's Blog"` | 友链交换用的本站名 |
| `site.desc` | 作者博客描述 | `"技术笔记 · 生活随笔"` | 本站描述 |
| `site.url` | `"https://blog.cuteleaf.cn"` | `"https://blog.265702.xyz"` | 本站地址 |
| `site.avatar` | weavatar 的作者头像 | `"https://blog.265702.xyz/assets/images/avatar.jpg"` | 指向 `public/` 里的固定头像 URL，方便别人复制 |
| `site.email` | `"xiaye@msn.com"` | `"moby5702@qq.com"` | 主题作者的邮箱 → 用户公开联系邮箱 |

> 该页其余布局/文案**未改动**。这是唯一一处改动 `src/content/spec/` 下非 about.md 文件的地方，原因：这张卡片会把作者信息直接展示给访客。
> 还原：`git -C blog checkout -- src/content/spec/friends.mdx`

### 15. 新增素材文件（`git status` 里的 `??`）

| 文件 | 尺寸 / 体积 | 来源 | 说明 |
| --- | --- | --- | --- |
| `src/assets/images/avatar-moby.jpg` | 512×512 / 31 KB | `picture/moby5702.jpg`（1080×1080） | 头像（会被 Astro 优化成 webp/avif 输出） |
| `public/assets/images/avatar.jpg` | 512×512 / 31 KB | 同上 | 头像的"稳定 URL"副本，给友链页/交换友链用 |
| `src/assets/images/DesktopWallpaper/moby-desktop.jpg` | 2560×1524 / 305 KB | `picture/background2.jpg`（5925×3528） | 默认桌面壁纸 |
| `src/assets/images/DesktopWallpaper/moby-desktop-alt1.webp` | 942×530 / 46 KB | `picture/background.png` | 备选壁纸 1（**该源文件实际是 WebP 容器，只是扩展名写成 .png**） |
| `src/assets/images/DesktopWallpaper/moby-desktop-alt2.jpg` | 1600×899 / 145 KB | `picture/background3.jpg` | 备选壁纸 2 |
| `src/assets/images/MobileWallpaper/moby-mobile.jpg` | 1080×1620 / 184 KB | `picture/background2.jpg` 的 2:3 竖窗裁切（left=2260，取 2352×3528）后缩放到 1080×1620；可由 §四 的命令逐字节复现（sha256 `3488d487…`） | 默认移动端壁纸 |

> 删除某个新素材前，先确认 `backgroundWallpaper.ts` / `profileConfig.ts` / `friends.mdx` 里没有引用它。

### 16. 超出配置目录的 4 处最小必要修改（请复核）

这 4 个文件不在"只改 `src/config/**` 等目录"的作用域里，但包含必须清理的 demo 痕迹，改动量合计 5 行，全部是注释或字符串，无逻辑变更：

| 文件 | 改动 | 为什么 |
| --- | --- | --- |
| `src/types/dynamicConfig.ts` | 2 处注释里的 demo 域名 / 用户名换成占位写法，并加 `// [CUSTOM]` | 与 `src/config/dynamicConfig.ts` 的注释保持一致，避免文档里又冒出主题作者域名 |
| `src/plugins/remark-wiki-link.js` | 文件头 `@author CuteLeaf <xiaye@msn.com>` → `@author CuteLeaf` + `[CUSTOM]` 注释 | 去掉作者个人邮箱；**作者署名与上游 LICENSE 保留** |
| `src/utils/memos-adapter.ts` | 同上 | 同上 |
| `src/pages/rss.xml.ts` | `site: context.site ?? "https://firefly.cuteleaf.cn"` → `site: context.site ?? siteConfig.site_url` | 去掉硬编码的 demo 兜底域名，统一走 `site_url` 单一真源 |

> 如果复核后认为不该动这 4 个文件，`git -C blog checkout -- <文件>` 即可单独还原，不影响其他改动。

### 17. `astro.config.mjs` — sitemap 排除空栏目（t8）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `sitemap({ filter })` 开头 | 只按 `siteConfig.pages.*` 过滤（`/dynamic/` 因为 pages 仍为 true 而不会被排掉；`/projects/`、`/series/` 则根本没有对应判断） | 新增一段显式排除：当 pathname 是 `/dynamic/`、`/projects/`、`/series/` 三者之一时 `return false`，带 `// [CUSTOM]` 说明 | 这三页当前内容为 0，页面保留但不应被搜索引擎收录空页面。有内容后删掉这几行即可 |

> 结果：`dist/sitemap-0.xml` 从 22 条 → **17 条**，三个空栏目命中均为 0。
> 还原：`git -C blog checkout -- astro.config.mjs`

### 18. `src/pages/llms.txt.ts` — llms.txt 同步排除空栏目（t8，作用域外但任务要求"一并处理"）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `KEY_PAGES` 前的过滤逻辑 | 只按 `siteConfig.pages[pageKey]` 判断，故 `/dynamic/`、`/projects/` 会出现在 llms.txt 的 Key Pages 里 | 新增常量 `LLMS_EXCLUDED_PATHS = new Set(["/dynamic/", "/projects/"])`，过滤时一并跳过（带 `// [CUSTOM]`） | 让 AI 爬虫索引与 sitemap 保持一致，不再指向空栏目 |

> 说明：任务把 llms 生成位置写成 `scripts/` 或 `config`，实际这里是 Astro 路由 `src/pages/llms.txt.ts`（`blog/scripts/` 里没有 llms 相关脚本），所以这 1 个文件严格说在书面作用域之外；改动仅 3 行、只影响 llms.txt 一个产物的内容。
> 还原：`git -C blog checkout -- src/pages/llms.txt.ts`

### 19. `README.md` / `README.en.md` — 重写为本站说明（交付阶段）

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `README.md` | 上游 Firefly 主题的中文 README（主题宣传、功能清单、多语言 README 链接、贡献者与 Star History 图） | 本站项目说明：站点信息、本地开发、写文章规范、目录速览、GitHub → Cloudflare Pages 部署、三份文档索引、许可与致谢 | 仓库首页要说明「这个站是什么、怎么用」，而不是主题介绍页 |
| `README.en.md` | 上游主题英文 README（330 行） | 对应的简短英文版（与中文版同结构） | 保持一致，不再保留主题宣传页 |
| `docs/images/moby-blog-home.jpg` | 无 | 新增：站点首页截图（1200×1833，约 198 KB，由验收截图经 sharp 压缩生成） | README 配图 |

> 说明：README 属文档，不计入 `[CUSTOM]` 标记数。上游主题的多语言文档 `docs/README.*.md` 未删除（在 `docs/` 内，不影响仓库首页）。
> 还原：`git -C blog checkout -- README.md README.en.md`，再删除 `docs/images/moby-blog-home.jpg`

### 20. AUDIT.md 第一批修复（安全与部署卫生，2026-10-31）

对应 `AUDIT.md` 的 P0-1 / P0-2 / P0-3 / P1-8 / P1-9 / P2-12，共 6 项，全部是配置级改动，不碰组件逻辑。

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `public/_headers` | 不存在 | 新增：安全响应头（nosniff / Referrer-Policy / Permissions-Policy / COOP）+ 缓存策略（`/_astro/*` immutable、`/assets/*`、`/og/*`、`/pagefind/*`） | Cloudflare Pages 只读 `_headers`，不读 `vercel.json`；此前线上零安全头、零长缓存 |
| `.github/workflows/deploy.yml` | 存在（push master 触发 GitHub Pages 部署） | 删除 | 与 Cloudflare Pages 重复部署，且可能产生 github.io 双站副本 |
| `src/pages/robots.txt.ts` | 含 `Disallow: /_astro/` | 删除该行（保留三条 `/archive/?*` 参数页屏蔽） | `/_astro/` 放的是全站 CSS/JS，屏蔽后搜索引擎拿不到样式，影响收录与页面体验评估 |
| `.github/FUNDING.yml` | `ko_fi: cuteleaf` + 爱发电链接 | 删除文件 | 仓库 Sponsor 按钮指向主题作者，属品牌错位 |
| `src/config/commentConfig.ts` | twikoo/waline/artalk 三个 demo 端点 | 清空为 `""`，并加 `[CUSTOM] 启用前必须填自己的地址` 注释 | 防止将来随手把 `type` 改成 waline 时，访客评论/邮箱/IP 被提交到陌生人维护的服务器 |
| `.nvmrc` | 不存在 | 新增 `22.23.0` | 与 `package.json` 的 `engines` 对齐，固定 Node 版本 |

> 说明：`_headers` 不含 HSTS（改在 Cloudflare 面板 SSL/TLS → HSTS 开启，避免两套策略），也不含 CSP 强制版（首页有 33 段内联脚本，强制 CSP 会白屏）。
> 还原：`git -C blog checkout -- src/pages/robots.txt.ts src/config/commentConfig.ts .github/workflows/deploy.yml .github/FUNDING.yml`，再删除 `public/_headers` 与 `.nvmrc`。

### 21. AUDIT.md 第二批修复（产物精简 / 分享图 / 加密 / CI 卫生，2026-10-31）

对应 `AUDIT.md` 的 P1-4 / P1-5 / P1-6 / P1-7 / P2-10 / P2-11 / P2-13 / P2-15。

| 位置 | 原值 | 新值 | 为什么改 |
| --- | --- | --- | --- |
| `src/components/common/ImageWrapper.astro` | `import.meta.glob("../../**/*.{png,jpg,jpeg,webp,avif}")`（覆盖整个 `src/`） | 两条显式 glob：`../../assets/**` 与 `../../content/**` | 治本：任何丢进 `src/` 的图片都会被 Vite 打进产物，与是否被引用无关（P1-4） |
| `src/assets/images/` 素材 | `d1–d6.avif`、`m1–m6.avif`、`avatar.avif`（约 1.02 MB） | 删除 | 配置已改用 `moby-*` 壁纸与 `avatar-moby.jpg`，这些是主题 demo 壁纸集与默认头像 |
| `public/assets/music/` | 版权 mp3（915 KB）+ 封面图 | 删除整个目录 | 播放器已关闭；第三方版权曲目不应挂在站点上可直下 |
| `public/assets/images/sponsor/` | `wechat.png` + `alipay.png`（129 KB） | 删除整个目录 | 打赏页已关闭，收款码是主题作者的 |
| `public/assets/images/ad/` | `ad1.webp`（72 KB） | 删除整个目录 | 侧栏广告组件 `enable: false` |
| `public/assets/images/effects/sakura.png` | 43 KB | 删除 | 樱花特效是 canvas 程序化绘制（且 `enable: false`），此图无引用 |
| `public/assets/fonts/GreatVibes-Regular-2.otf` | 52 KB | 删除 | `fontConfig.selected` 只有 `"system"`，该字体从未加载 |
| `public/assets/js/highlight.min.js`、`marked.min.js` | 119 + 39 KB | 删除 | 代码高亮由 expressive-code 负责，这两个库在 `src` 里零引用 |
| `public/favicon/` | 12 个图标 | 保留 `firefly-32/180/192`，删除 light/dark 全套与 `firefly-128` | 只保留实际使用的尺寸 |
| `src/content/posts/` 的 14 篇主题示例文章 | `draft: true`（仍参与构建期内容解析，其配图全部被打包） | 移动到 `docs/legacy-posts/`（文件保留，移出 content 集合） | 彻底清除约 1 MB demo 配图；需要时移回即可重新参与构建 |
| `public/_redirects` | 不存在 | 新增：6 个已关闭栏目的真 404 规则 | 原产物是 200 + meta-refresh 的软 404（P1-5） |
| `public/og/home.jpg` | 不存在 | 新增 1200×630 站点分享图（由首页截图经 sharp 裁切压缩，76 KB） | 非文章页分享卡片不再用 192×192 的 logo（P1-6） |
| `src/layouts/Layout.astro` | 非文章页回退 `siteLogo`（192×192） | 新增 `SITE_OG_IMAGE = "/og/home.jpg"` 分支（1200×630） | P1-6 |
| `src/utils/crypto-utils.ts` | 确定性 salt/IV（`HMAC(password, slug)`）+ PBKDF2 10 万次 | 随机 salt/IV（`randomBytes`）+ PBKDF2 60 万次 | AES-GCM nonce 复用是致命弱点（P1-7）。已用 node 脚本验证：两次密文不同、解密还原一致、错误密码失败 |
| `src/components/features/EncryptedContent.astro` | `var ITERATIONS = 100000` | `600000` | 必须与加密端一致，否则解密失败 |
| `src/config/siteConfig.ts` favicon | 只有 32×32 | 补 180×180 / 192×192 条目 | iOS 主屏 / PWA 清晰度（P2-13）；`apple-touch-icon` 仍由主题取第一个图标（32），属主题逻辑未改 |
| `.github/workflows/build.yml` | Node 22/23 双矩阵（每次 push 4 个 job）+ 无 paths 过滤 | 单 Node 22 + paths 过滤（src / public / scripts / 依赖 / 构建配置） | 个人博客无需双版本矩阵（P2-10） |
| `.github/dependabot.yml` | npm `daily` | `weekly` | 每天开 PR 没必要（P2-11） |
| `vercel.json` | 存在（含安全头，但 CF Pages 不读） | 删除 | 安全头已由 `_headers` 承担（P2-15） |
| `wrangler.jsonc` | 存在且无说明 | 保留并加注释：仅 Workers 模式使用，本站用 Pages | 避免再次误判（P2-15） |

**效果**：`dist/` 从 12.7 MB / 289 文件 → **9.31 MB / 245 文件**；零引用二进制资源从 **3.49 MB / 46 个 → 0.25 MB / 3 个**（剩余为两张备选壁纸 `moby-desktop-alt1/alt2` 与一个 logo 优化变体，均属有意保留）。

> 还原：素材与文章可用 `git -C blog checkout -- <路径>` 恢复；`docs/legacy-posts/` 里的文章移回 `src/content/posts/` 即可重新参与构建。

---

## 三、`[CUSTOM]` 标记索引

| 文件 | 标记数 | 主要位置（行号以提交时为准，搜 `[CUSTOM]` 最准） |
| --- | --- | --- |
| `src/config/siteConfig.ts` | 16 | 站点信息块、pages 块与 dynamic/projects 说明、sponsor、navbar.logo、navbar.title、siteStartDate、bilibili/bangumi/vndb/mal |
| `src/config/profileConfig.ts` | 5 | 文件头、avatar、bio、GitHub 链接、Email 链接 |
| `src/config/backgroundWallpaper.ts` | 10 | 文件头、playerEnable、src 壁纸块（桌面/移动/playerUrl）、dimOpacity、homeText.title、homeText.subtitle、homeText.links（含 Email） |
| `src/config/navBarConfig.ts` | 7 | 文件头、「文章」子菜单（系列）、「我的」子菜单（动态/项目）、「链接」菜单、文件末尾注释 |
| `src/config/sidebarConfig.ts` | 2 | 右栏「最新动态」组件、窄屏抽屉「最新动态」组件（均关闭并注明恢复方法） |
| `src/config/friendsConfig.ts` | 1 | 友链数组上方（含新增友链模板） |
| `src/config/booknavConfig.ts` | 3 | 文件头、「资源」组两条书签 |
| `src/config/commentConfig.ts` | 3 | 文件头、giscus 块、disqus 块 |
| `src/config/sponsorConfig.ts` | 6 | 文件头、4 个打赏方式、sponsors 列表 |
| `src/config/musicConfig.ts` | 1 | 文件头 |
| `src/config/dynamicConfig.ts` | 2 | apiUrl 注释、memos.parent |
| `src/config/announcementConfig.ts` | 1 | content |
| `src/config/galleryConfig.ts` | 1 | 文件头 |
| `src/content/spec/about.md` | 1 | 文件第 1 行 HTML 注释 |
| `src/content/spec/friends.mdx` | 1 | `site` 对象上方 |
| `src/types/dynamicConfig.ts` | 2 | 两处注释 |
| `src/plugins/remark-wiki-link.js` | 1 | 文件头 |
| `src/utils/memos-adapter.ts` | 1 | 文件头 |
| `src/pages/rss.xml.ts` | 1 | RSS 兜底地址 |
| `src/pages/llms.txt.ts` | 1 | `LLMS_EXCLUDED_PATHS` 常量上方（见《二.18》） |
| `astro.config.mjs` | 1 | `sitemap({ filter })` 里新增的空栏目排除段（见《二.17》） |
| 13 篇 demo 文章 + 2 个 demo 项目 | 15 | 每个文件 frontmatter 末尾 1 行 YAML 注释 `# [CUSTOM] 主题示例内容，已下线（恢复：draft: false）`（见《十二》） |
| `blog/.gitignore` | 1 | 新增 `.wrangler/` 忽略规则处 |
| **合计** | **83 处 / 37 个文件** | 每个被改动的源码文件、`.gitignore` 与 15 个 demo 内容文件都至少有一处标记 |

> `src/constants/lqips.json` 是构建自动生成的派生产物，**不加**标记（JSON 不支持注释），详见《七》。

---

## 四、素材与图片：以后怎么换

### 换头像

1. 准备一张**正方形**图片（建议 ≥512×512），放到 `blog/src/assets/images/`，例如 `avatar-moby.jpg` 覆盖同名文件；
2. 如果换了文件名，改 `src/config/profileConfig.ts` 的 `avatar`（相对 `src/` 的路径，**不要**以 `/` 开头）；
3. 想同步友链页那张"可复制的头像链接"，再把同一张图复制到 `blog/public/assets/images/avatar.jpg`。

### 换壁纸

当前配置（`src/config/backgroundWallpaper.ts`）：

```ts
desktop: ["assets/images/DesktopWallpaper/moby-desktop.jpg"],  // 来自 picture/background2.jpg
mobile: ["assets/images/MobileWallpaper/moby-mobile.jpg"],     // 同一张图的 2:3 竖窗裁切
```

仓库里已经放好的备选图：

| 备选 | 路径 | 来源 |
| --- | --- | --- |
| 备选 1 | `assets/images/DesktopWallpaper/moby-desktop-alt1.webp` | `picture/background.png` |
| 备选 2 | `assets/images/DesktopWallpaper/moby-desktop-alt2.jpg` | `picture/background3.jpg` |
| 主题自带示例 | `assets/images/DesktopWallpaper/d1.avif` ~ `d6.avif`、`MobileWallpaper/m1.avif` ~ `m6.avif` | 主题 demo 图（未删） |

**切换到备选图**：只改 `src/config/backgroundWallpaper.ts` 里对应的那行，例如

```ts
desktop: ["assets/images/DesktopWallpaper/moby-desktop-alt1.webp"],
// 想多张随机显示就并列写：
// desktop: [
//   "assets/images/DesktopWallpaper/moby-desktop.jpg",
//   "assets/images/DesktopWallpaper/moby-desktop-alt2.jpg",
// ],
```

**放一张自己的新图**：把图片放进 `blog/src/assets/images/DesktopWallpaper/`（或 `MobileWallpaper/`），
`desktop` / `mobile` 里写相对 `src/` 的路径即可（不要以 `/` 开头，否则不会被 Astro 优化）。
建议宽度 ≤2560px，体积控制在 500 KB 以内 —— Astro 构建时会把 `src/` 下被引用的图片转成 webp/avif 并生成响应式尺寸。

> **移动端竖屏图的可复现生成命令**（在 `blog/` 目录下执行；这条命令就是 `moby-mobile.jpg` 的实际来源）：
>
> ```bash
> node -e "const s=require('sharp');(async()=>{const m=await s('../picture/background2.jpg').metadata();const w=Math.round(m.height*2/3);const left=Math.round(m.width*0.58-w/2);await s('../picture/background2.jpg').extract({left,top:0,width:w,height:m.height}).resize(1080,1620,{fit:'cover'}).jpeg({quality:85,mozjpeg:true}).toFile('src/assets/images/MobileWallpaper/moby-mobile.jpg')})()"
> ```
>
> 语义：从 `background2.jpg`（5925×3528）里取一个**宽:高 = 2:3 的竖直窗口**（宽 = 3528×2/3 = 2352，水平起点 left = 2260，即宽度 58% 处居中），再缩放到 1080×1620。
> 实测可**逐字节复现**仓库里的文件：生成结果 188,850 B、sha256 `3488d48706a8986119a882b78f129ddfc7c917a087b080281240123421e295b0`，与 `src/assets/images/MobileWallpaper/moby-mobile.jpg` 完全一致（`Buffer.compare === 0`，缩样后 meanAbsDiff = 0.000）。
> 换自己的源图时按同样思路改 `0.58`（取景水平位置）和目标尺寸即可，目标比例保持 2:3。

### 换 favicon / 导航 logo

- favicon：目前仍是主题的萤火虫图标（`public/favicon/firefly-32.png`，与导航栏 logo 视觉一致）。
  想换：把自己的图标放入 `public/favicon/`，改 `src/config/siteConfig.ts` 的 `favicon[0].src`。
  注意：开了 OpenGraph 图片生成时，`favicon` 数组里必须有 **png** 格式的图标。
- 导航 logo：`src/config/siteConfig.ts` 的 `navbar.logo`，可换成 `{ type: "image", value: "assets/images/logo/xxx.png" }`（放 `src/assets/images/logo/`）。

---

## 五、站点信息默认值总表

| 项目 | 当前值 | 位置 |
| --- | --- | --- |
| 站点标题 | `Moby's Blog` | `siteConfig.title` |
| 站点副标题 | `技术笔记 · 生活随笔` | `siteConfig.subtitle` |
| 站点 URL | `https://blog.265702.xyz` | `siteConfig.site_url`（sole source of truth） |
| 站点描述 | `Moby5702 的个人技术博客：以编程与技术笔记为主，也记录生活随笔、读书与文学分享。` | `siteConfig.description` |
| 站点关键词 | `Moby5702 / 技术笔记 / 编程 / 生活随笔 / 文学 / Astro / 静态博客 / 个人博客` | `siteConfig.keywords` |
| 语言 | `zh_CN` | `siteConfig.ts` 顶部 `SITE_LANG` |
| 导航栏标题 | `Moby's Blog` | `siteConfig.navbar.title` |
| 导航栏 logo | 主题萤火虫 logo（亮/暗两版） | `siteConfig.navbar.logo`（未改） |
| favicon | `/favicon/firefly-32.png` | `siteConfig.favicon`（未改） |
| 站点起始日 | `2026-10-30` | `siteConfig.siteStartDate` |
| 时区 | `Asia/Shanghai` | `siteConfig.timezone`（未改） |
| 姓名 | `Moby5702` | `profileConfig.name` |
| 个人签名 | `写代码，也写字：技术笔记为主，也收藏生活与文学。` | `profileConfig.bio` |
| 头像 | `assets/images/avatar-moby.jpg` | `profileConfig.avatar` |
| GitHub | `https://github.com/mobydick5702-dev` | `profileConfig.links[0]` 等 3 处 |
| 邮箱 | `moby5702@qq.com`（用户公开联系邮箱，已填写） | `profileConfig` / `backgroundWallpaper` / `about.md` / `friends.mdx` |
| 订阅 | `/rss/`、`/atom/` | `profileConfig.links[2..3]` |
| 默认壁纸 | 桌面 `moby-desktop.jpg` / 移动 `moby-mobile.jpg` | `backgroundWallpaper.src` |
| 壁纸遮罩暗度 `dimOpacity` | `0.4`（主题默认 0.2；为保证横幅白字 ≥3:1 而调大） | `backgroundWallpaper.common.dimOpacity` |
| 首页横幅标题 | `Moby's Blog` | `backgroundWallpaper.common.homeText.title` |
| 壁纸模式 | `banner`（横幅） | `backgroundWallpaper.mode`（未改） |
| 主域名 | `265702.xyz`，博客子域 `blog` | DNS/A 记录与 Pages 自定义域，见 BASELINE.md |

---

## 六、已替换项（原 demo 值存档）

> 下面这些是**已被替换掉的原文**，留档是为了：① 需要时能把某些上游链接加回来；② 让 review 能核对"确实换过"。

| 原值 | 出现位置（改前） | 处理 |
| --- | --- | --- |
| `https://firefly.cuteleaf.cn` | `siteConfig.site_url` | 换成 `https://blog.265702.xyz` |
| `Firefly - Demo site` / `Demo site` | `siteConfig.subtitle`、`about.md` | 换成 `技术笔记 · 生活随笔` |
| `XiaYe` / `Hello, I'm XiaYe.` / `夏叶` | `profileConfig.name/bio`、`about.md`、`sponsorConfig.sponsors` | 换成本人信息 / 清空 |
| `xiaye@msn.com` | `profileConfig.links[1]`、`backgroundWallpaper.homeText.links`、`friends.mdx`、`sponsorConfig.sponsors[].avatar` | 换成用户公开邮箱 `moby5702@qq.com`（占位 `your-email@example.com` 已在 t6 一并替换） |
| `https://github.com/CuteLeaf`、`https://github.com/CuteLeaf/Firefly`（导航/横幅/profile 处） | 3 处 | 换成 `https://github.com/mobydick5702-dev` |
| `https://gitee.com/CuteLeaf/Firefly` | `navBarConfig` 的「链接」菜单 | 删除 |
| `https://docs-firefly.cuteleaf.cn`（主题官方文档） | 导航「链接」菜单与注释、`booknavConfig`、`friendsConfig`、`about.md` | 删除/替换。需要查主题文档时可自行访问：`https://docs-firefly.cuteleaf.cn`（Firefly 上游文档站） |
| `https://blog.cuteleaf.cn`、`https://blog.cuteleaf.cn/sponsor/` | `friendsConfig`、`booknavConfig`、`backgroundWallpaper` 横幅 | 删除/替换 |
| `https://ko-fi.com/cuteleaf`、`https://ifdian.net/a/cuteleaf` | `sponsorConfig.methods` | 链接清空（默认关闭） |
| `repo: "CuteLeaf/Firefly"` + 配套 repoId/categoryId、disqus `"firefly"` | `commentConfig` | 换成占位/清空 |
| `https://bed.twoleaf.cn/file/1785658612716_firefly.mp4` | `backgroundWallpaper.src.playerUrl` | 清空（默认关闭） |
| `users/xiaye` | `dynamicConfig.memos.parent` | 换成 `users/yourname` |
| UID/账号：`38932988`(bilibili)、`1143164`(bangumi)、`u358128`(vndb)、`cuteleaf`(mal)、`0ef3437…`(mal clientId) | `siteConfig` | 清空 |
| 头像 `assets/images/avatar.avif`（主题示例头像） | `profileConfig.avatar` | 改用新头像；旧文件仍在仓库中未删 |

---

## 七、功能开关与派生产物

### 页面开关一览（`src/config/siteConfig.ts` 的 `pages`）

| 页面 | 状态 | 说明 |
| --- | --- | --- |
| 首页 / 文章 / 归档 / 分类 / 标签 | 开（非开关项） | 路由决定，5 篇已发布文章均有内容 |
| 系列 `/series/` | 页面开、**导航入口关** | 已发布文章都没有 `series` 字段（demo 连载已下线）。页面本身仍在（主题自带「暂无系列」空状态），只是从「文章」子菜单移除，见下方《首版空栏目处理》 |
| 友链 `friends` | 开 | 内容请自行补充（现只剩 Astro 一条） |
| 留言板 `guestbook` | 开 | 评论区需先配置评论系统（`commentConfig.type`） |
| 动态 `dynamic` | 开（**导航入口隐藏**） | 内容为 0（demo 动态已删除），页面显示「还没有发布动态」空状态；入口在 `navBarConfig.ts` 注释掉 |
| 项目 `projects` | 开（**导航入口隐藏**） | 内容为 0（两个 demo 项目已置 draft），页面显示「暂无项目」；入口在 `navBarConfig.ts` 注释掉 |
| 相册 `gallery` | 开（页面与入口保留） | 主题 demo 相册已下线，当前显示「暂无相册」空状态；加自己的照片见 `galleryConfig.ts` 注释 |
| 书签导航 `booknav` | 开 | 通用开发者书签 |
| 打赏 `sponsor` | **关** | 示例收款码，换掉后再开 |
| 哔哩哔哩 / 番组计划 / VNDB / AnimeList | **关**（主题默认） | 与本站定位无关，保持关闭 |

#### 首版空栏目处理（F5 同批修复）

主题 demo 内容下线（见《十二》）后，有三个导航入口会点进"暂无内容"的页面。处理方式与恢复方法：

| 栏目 | 首版处理 | 页面是否可访问 | 怎么恢复 |
| --- | --- | --- | --- |
| 我的 → 动态 | 导航入口注释掉（`navBarConfig.ts` 的 `LinkPresets.Dynamic`）；`siteConfig.pages.dynamic` 仍为 `true` | 可以：显示主题自带「还没有发布动态」空状态，不是死链 | 在 `src/content/dynamic/` 写动态（或启用 `dynamicConfig.memos`）后，取消那行注释 |
| 我的 → 项目 | 导航入口注释掉（`LinkPresets.Projects`）；`siteConfig.pages.projects` 仍为 `true` | 可以：显示「暂无项目」 | 在 `src/content/projects/` 添加项目（或把已有项目 `draft` 改回 `false`）后，取消那行注释 |
| 文章 → 系列 | 导航入口注释掉（`LinkPresets.Series`，主题没有对应页面开关） | 可以：显示「暂无系列」 | 给文章加 `series: "系列名"` 后，取消那行注释 |

**为什么选"隐藏入口"而不是"关掉页面（pages.* = false）"**：关页面会让该 URL 变成 404 重定向桩；而主题的 sitemap 过滤器（`astro.config.mjs`）只覆盖了 `dynamic`，**没有 `projects`** 这一项，关掉 projects 会在 `sitemap-0.xml` 里留下一条指向 404 的链接（实测确认）。保持页面开启 + 隐藏导航入口，既不让人点进空页面，也不产生死链或 sitemap 噪音，三个栏目处理方式也统一。

> 三处改动都带 `// [CUSTOM]` 注释（注释里同样写了恢复步骤）。当前「我的」子菜单实际只剩「相册」「书签导航」，「文章」子菜单只剩「归档」「分类」「标签」。

### 构建时自动生成的派生产物

- `src/constants/lqips.json` —— **不要手改**。`pnpm build` 第一步（`scripts/generate-lqips.ts`）会扫描 `src/` 与 `public/` 下的图片并整份重新生成。
  本次运行构建后自动新增的记录包括：
  - 本站素材：`src:assets/images/avatar-moby.jpg`、`public:assets/images/avatar.jpg`、`src:assets/images/DesktopWallpaper/moby-desktop.jpg`、`.../moby-desktop-alt1.webp`、`.../moby-desktop-alt2.jpg`、`src:assets/images/MobileWallpaper/moby-mobile.jpg`
  - 内容任务新增的配图：`src:content/posts/images/picture-1..5.webp`（由内容作者放入，构建时一并被扫描）
  它是 JSON、不支持注释，所以**无法**加 `[CUSTOM]` 标记；请连同其它改动一起提交（否则下次构建又会出现同样的 diff）。

### 关于首页横幅文字的对比度（已调优，可继续微调）

当前壁纸（`background2.jpg`）偏亮，而 Firefly 的首页横幅标题是 72px 白色文字 + 深色投影。
第一轮验证（`blog/VERIFICATION.md` F5）实测该标题对比度只有 **2.08:1**，低于 WCAG AA 对大字（≥24px 或 ≥18.66px 粗体）要求的 **3:1**。

**已修复**：`src/config/backgroundWallpaper.ts` 的 `common.dimOpacity` 由 `0.2` 调到 **`0.4`**。
该项由 `banner` / `fullscreen` 两种壁纸模式、桌面端与移动端**共用**（读取点：`src/utils/banner-visibility-utils.ts` 的 `dimOpacity` → `src/components/layout/WallpaperSection.astro` 的 `.banner-dim-overlay`），所以只改一处即可全端生效。

实测（同一台机器、同一 1440 宽视口、同一套测量脚本，改前/建议值/最终值三档对比）：

| dimOpacity | 标题矩形均色 | 标题上方背景带 | 矩形小块中位 | 字形背后最不利小块 | 字形背后 p10 | 字形背后中位 |
| --- | --- | --- | --- | --- | --- | --- |
| `0.2`（改前） | 2.18:1 | 2.21:1 | **2.08:1** | 1.87:1 | 2.46:1 | 3.70:1 |
| `0.35`（任务建议值） | 3.07:1 | 3.27:1 | 3.07:1 | 2.81:1 ⚠️ | 3.51:1 | 5.01:1 |
| **`0.4`（最终采用）** | **3.49:1** | **3.79:1** | **3.57:1** | **3.28:1** | **3.91:1** | **5.41:1** |

> 口径：均色口径 = 标题矩形内像素平均色对白字的 WCAG 对比度；「字形背后」= 用纯白像素定位文字包围盒，外扩 8px 后切 16×16 小块、剔除字形像素再统计。
> **为什么取 0.4 而不是任务建议的 0.35**：0.35 已能让主口径达标（2.08 → 3.07），但字形背后最不利的小块仍只有 2.81:1；0.4 让所有口径都 ≥3.2:1，代价只是壁纸再暗 5%。想要更亮的壁纸可以回调到 0.35。

如果日后换了更亮的壁纸导致对比度又不足，两个可调项：
1. 继续调大 `common.dimOpacity`（`0.4 → 0.45 ~ 0.5`，壁纸整体更暗一点）；
2. 或把 `banner.position` 挪到画面较暗的位置（例如 `"center"` / `"50% 60%"`）。

> 复测方法：`node` 起静态服务器托管 `dist/` → Chrome `--headless=new` + CDP 取 `.banner-title` 的 `getBoundingClientRect()` → 截图后按上表口径求均色与 WCAG 对比度（第一轮验证的脚本逻辑见 `VERIFICATION.md` 附录 A 的 `contrast.mjs`；本次还额外加了「字形背后」口径）。

---

## 八、已知保留项 / 本次未处理

| 内容 | 位置 | 为什么不在这轮改 |
| --- | --- | --- |
| 主题 demo 文章（含原域名、demo 站链接、`Demo site` 字样） | `src/content/posts/firefly.md`、`src/content/posts/guide/*.md` 等 13 篇 | 属于**内容任务**范围（本任务的"不要碰"清单明确列出 `src/content/posts/**`）。**已由 t5 全部置 `draft: true` 下线**，见《十二》 |
| 主题 demo 项目 | `src/content/projects/firefly.md`、`example-project.md` | 同上（`src/content/projects/**`）。**已由 t5 置 `draft: true`**，见《十二》 |
| 主题自带 README / 多语言文档 | `blog/README.md`、`README.en.md`、`docs/README.*.md` | 上游主题文档与致谢内容，等同"版权与 LICENSE 文案"，按任务要求保留 |
| 团队勘察/验证报告 | `blog/BASELINE.md`、`blog/VERIFICATION.md` | 前序任务产出，其中引用了改前的 demo 值作为证据 |
| 主题示例图 / 音频 | `src/assets/images/DesktopWallpaper/d1-d6.*`、`MobileWallpaper/m1-m6.*`、`src/assets/images/avatar.avif`、`public/assets/music/`、`public/pio/` | 未删：体积不大、方便对照，且删文件会让 diff 变大；不需要时可直接删除（删前确认没有配置引用） |
| ~~主题示例相册图~~ | ~~`public/gallery/`~~ | **已在 t8 删除**（`firefly-2026`、`encrypted-test` 两个 demo 相册，共 4 个文件），见《二.12》 |
| 看板娘（live2d / spine） | `src/config/pioConfig.ts` | 主题默认已是关闭，无需改动 |

---

## 九、整体还原

```powershell
# 在仓库根目录（D:\Program\Save\learn\web）
# 1) 还原所有已跟踪文件的改动
git -C blog checkout -- .

# 2) 删除新增的素材与本文档（如不需要保留）
git -C blog clean -fd src/assets public/assets CUSTOMIZATION.md
```

只想还原某一个方面：按《二、改动清单》里每个文件末尾给出的单文件命令执行即可。

---

## 十、部署

- 构建命令、产物目录、`NODE_VERSION`、Cloudflare Pages 配置、自定义域 `blog.265702.xyz` 的接法 → 见 **[BASELINE.md](./BASELINE.md) 的 Cloudflare 章节**。
- 搬站/换域名：只改 `src/config/siteConfig.ts` 的 `site_url`，再把 `src/content/spec/friends.mdx` 与 `src/content/spec/about.md` 里写死的 `blog.265702.xyz` 一并替换，然后重新构建。
- 注意：**纯静态 Cloudflare Pages 不要设置 `CF_WORKERS`**（该变量会切到 Workers/SSR 产物）。

---

## 十一、本次验证记录

<!-- [CUSTOM] 验证记录：构建命令、产物检查、残留检查的结果，供 review 复核 -->

| 检查项 | 命令 / 方法 | 结果 |
| --- | --- | --- |
| 生产构建（最新，t8 收尾清理后） | `pnpm build`（在 `blog/` 下） | **退出码 0**。产出 `dist/` 289 个文件 / 13,004 KB；27 个 HTML；`sitemap-0.xml` 17 条 `<loc>`；`rss.xml` 5 条 item / `atom.xml` 5 条 entry；Pagefind 索引 8 页 / 1,692 词 |
| 生产构建（上一轮，t6 修复后） | `pnpm build` | **退出码 0**。产出 `dist/` 295 个文件 / 13,616 KB；29 个 HTML；`sitemap-0.xml` 22 条 `<loc>`（差值为两个 demo 相册页下线，见《二.12》） |
| 生产构建（首版，t2 阶段） | `pnpm build` | **退出码 0**。产出 `dist/` 352 个文件 / 22,926 KB；45 个 HTML；Pagefind 索引 23 页 / 3,092 词（差值为 demo 内容下线所致，见《十二》） |
| 类型检查 | `pnpm type-check`（`tsc --noEmit --isolatedDeclarations`） | **退出码 0** |
| 预览可访问 | `pnpm preview --host 127.0.0.1` → `curl http://127.0.0.1:4321/` | HTTP **200** |
| 首页标题 | 解析 `dist/index.html` 的 `<title>` | `<title>Moby&#39;s Blog - 技术笔记 · 生活随笔</title>` |
| 站点 URL | `<link rel="canonical">` / `<meta property="og:url">` | `https://blog.265702.xyz/` |
| og:site_name / og:title | 同文件 | `Moby's Blog` / `Moby's Blog - 技术笔记 · 生活随笔` |
| 头像已生效 | 首页 HTML 里的头像引用 | `/_astro/avatar-moby.DnfF7AOl_Z2jNODn.webp` 等（源图 `src/assets/images/avatar-moby.jpg`，512×512） |
| 壁纸已生效 | 首页 HTML 里的壁纸引用 | `/_astro/moby-desktop.*.webp`、`/_astro/moby-mobile.*.webp` |
| 邮箱已生效 | 首页 / 关于页 / 友链页 HTML | `moby5702@qq.com` 出现 6 / 7 / 6 次（含 `mailto:` 的 base64 混淆副本，防爬虫） |
| **F5 横幅对比度** | CDP 取 `.banner-title`（72px 白字）rect → 截图取样 → WCAG 对比度 | 改前 **2.08:1** → `dimOpacity 0.4` 后 **3.49:1**（标题上方背景带 3.57:1；字形背后最不利小块 1.87 → 3.28:1），全部 ≥3:1 |
| **F3 移动壁纸来源** | 按文档命令用 sharp 重新生成并逐字节比对 | **逐字节一致**：188,850 B，sha256 `3488d487…`，`Buffer.compare === 0`（F3 判定为下游匹配脚本精度问题，文档已改为可复现描述 + 附命令） |
| **F6** | `git check-ignore -v blog/.wrangler/x` | 命中 `.gitignore` 的 `.wrangler/` 规则 |
| **U2 demo 相册下线** | 扫描 `dist/gallery/` 与全量 `dist/**` | `dist/gallery/` 只剩 `index.html`；全量 `Get-ChildItem dist -Recurse -File \| Select-String 'encrypted-test\|firefly-2026'` 命中 **0**；`/gallery/` 页命中「暂无相册」空状态 |
| **U3 sitemap 排除空栏目** | 解析 `dist/sitemap-0.xml` | 17 条 `<loc>`，其中 `/series/`、`/projects/`、`/dynamic/` 命中 **各 0**；`/gallery/` 只剩 1 条（相册首页）；三个页面本身仍可访问（非 404 桩，219/215/206 KB） |
| **U3b llms.txt** | 扫描 `dist/llms.txt` | Key Pages 里已无「动态」「项目」（只保留相册/友链/留言/书签等） |
| 首版空栏目（导航） | 扫描 `dist/**/*.html` 里 `href="/dynamic/"`、`/projects/`、`/series/`、`/sponsor/` | 均为 **0 处**；三个页面本身仍可访问且显示「还没有发布动态 / 暂无项目 / 暂无系列」空状态 |
| 关于页已生效 | 无头浏览器截图 + OCR `dist` 预览 | 读到「关于我 / 你好，我是 Moby5702 / 写代码，也写字：技术笔记为主，也收藏生活与文学。」 |
| demo 字符串残留（源码） | `Select-String 'XiaYe\|xiaye@msn.com\|Demo site\|firefly.cuteleaf.cn'` over `src/**` | 仅剩 8 处，全部在**已置 draft** 的 `src/content/posts/**`、`src/content/projects/**`（不参与构建，见《八》《十二》） |
| demo 字符串残留（构建产物） | 同模式 + `encrypted-test\|firefly-2026` 扫描 `dist/**/*.html,*.xml,*.json` | **0 处** |
| 改动范围 | `git -C blog status --short` | 见《二》各文件末尾的还原命令；内容目录的改动来自内容任务（t5 置 draft / t8 仅补注释行） |

> 说明：内容任务会在同一工作区新增文章（`src/content/posts/*.md`、`src/content/posts/images/picture-*.webp` 等 `??` 项），
> 它们不是本任务的改动；`git status` 里出现属正常现象。



---

## 十二、demo 内容下线记录（F1 修复，由内容任务 t5 完成）

> 本节的改动**不在** `src/config/**` 里，由内容任务（t5）执行；这里只做记录，方便日后要"回看/恢复"时有个索引。

### 做了什么

| 动作 | 数量 | 文件 |
| --- | --- | --- |
| 文章置 `draft: true`（下线主题 demo 文章） | 13 篇 | `src/content/posts/`：`firefly.md`（同时 `pinned: true → false`）、`code-examples.md`、`encrypted-demo.md`、`katex-math-example.md`、`markdown-extended.md`、`markdown-mermaid.md`、`markdown-plantuml.md`、`markdown-tutorial.md`、`video.md`、`mdx-example.mdx`、`guide/index.md`、`guide/firefly-layout-system.md`、`guide/firefly-wiki-link.md` |
| 项目置 `draft: true`（下线主题 demo 项目） | 2 个 | `src/content/projects/firefly.md`（原本没有 `draft` 字段，新增）、`example-project.md`（`draft: false → true`） |
| 删除主题 demo 动态 | 4 条 | `src/content/dynamic/2026-07-15-{010756,020613,021127,161529}.md` |
| 新增占位文件（保持空目录存在） | 1 个 | `src/content/dynamic/.gitkeep` |
| 给上述 15 个内容文件补行内标记（t8 追加） | 15 行 | 每个文件的 frontmatter 末尾一行：`# [CUSTOM] 主题示例内容，已下线（恢复：draft: false）`（YAML 注释，不影响解析） |

正文内容**一字未改**，只改了 frontmatter 的 `draft`（和 firefly.md 的 `pinned`），外加上述 15 行 YAML 注释，所以随时可以原样恢复。

### 效果（构建产物对照）

| 指标 | 下线前 | t5 下线后 | t8 收尾清理后（含 demo 相册下线 + sitemap 排除空栏目） |
| --- | --- | --- | --- |
| HTML 页面数 | 45 | **29** | **27** |
| `dist/posts/` 文章页 | 18 | **5**（只剩本站 5 篇） | **5** |
| `sitemap-0.xml` 的 `<loc>` | 38 | **22** | **17** |
| `rss.xml` / `atom.xml` 条目 | 17 / 18 | **5 / 5** | **5 / 5** |
| OG 图（`dist/og/`） | 13 张 | **5 张** | **5 张** |
| Pagefind 索引 | 23 页 / 3,092 词 | **8 页 / 1,686 词** | **8 页 / 1,692 词** |
| `dist/` 体积 | 352 文件 / 22.9 MB | 295 文件 / 13.49 MB | **289 文件 / 13.00 MB** |

> 副作用：原先在产物里残留的 `XiaYe` / `Demo site` / `firefly.cuteleaf.cn` 也随之清零（这些字符串只存在于 demo 文章正文里）；t8 再清掉两个 demo 相册后，`encrypted-test` / `firefly-2026` 在 `dist/` 里也是 0 命中。

### 怎么恢复某一条

```powershell
# ① 恢复某篇被下线的文章/项目：把该文件 frontmatter 里的 draft: true 改回 draft: false（或直接删掉 draft 行）
#    例如：
#    git -C blog checkout -- src/content/posts/firefly.md
# ② 恢复被删除的 demo 动态：
git -C blog checkout -- src/content/dynamic/
# ③ 恢复后记得重新构建：pnpm build
```

> 注意：恢复 demo 文章会同时把 `Demo site` / `firefly.cuteleaf.cn` 等字样带回产物 —— 只在需要参考主题写法时临时这么做。

import {
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/navBarConfig";

// ============================================================================
// 导航栏配置 - 根据顺序动态生成导航栏链接
// NavBar Configuration - Dynamically generate navigation bar links based on order
// ============================================================================
// [CUSTOM] 本站导航结构沿用主题默认（首页 / 文章 / 社交 / 我的 / 关于 / 链接）：
// 归档、分类、标签、友链、留言板、关于我都在下面，覆盖了技术博客常用入口。
// 动漫/追番类入口（哔哩哔哩、番组计划、VNDB、MyAnimeList）由 siteConfig.pages 关闭，菜单会自动隐藏。
const getDynamicNavBarConfig = (): NavBarConfig => {
	// 基础导航栏链接
	const links: NavBarLink[] = [];

	// 主页
	links.push(LinkPresets.Home);

	// 文章及其子菜单
	links.push({
		name: "文章",
		url: "#",
		icon: "material-symbols:article",
		children: [
			// 归档
			LinkPresets.Archive,

			// 分类
			LinkPresets.Categories,

			// 标签
			LinkPresets.Tags,

			// 系列
			// [CUSTOM] 暂时隐藏：当前 5 篇已发布文章都没有 `series` 字段（demo 的"Firefly 功能示例"系列已随内容下线），
			// 留着入口只会点进"暂无系列"。等你开始写连载时，把下面这行 LinkPresets.Series 的注释去掉即可恢复；
			// /series/ 页面本身仍然可用（主题自带「暂无系列」空状态），只是不在导航里露出。
			// LinkPresets.Series,
		],
	});

	//社交及其子菜单
	links.push({
		name: "社交",
		url: "#",
		icon: "material-symbols:group",
		children: [
			// 友链
			LinkPresets.Friends,

			// 留言
			LinkPresets.Guestbook,
		],
	});

	// 我的及其子菜单
	// [CUSTOM] 首版实际只露出「相册」「书签导航」：
	//   - 动态 / 项目 / 系列 三个入口对应页面当前内容为 0（demo 内容已下线），
	//     为了不让人点进"暂无内容"，这里把入口注释掉；**页面本身仍然可访问**且显示主题自带的
	//     得体空状态（"还没有发布动态" / "暂无项目"），所以不算死链，也不会在 sitemap 里产生 404。
	//   - 动漫类（Bilibili / 番组计划 / VNDB / AnimeList）由 siteConfig.pages 关闭，自动隐藏。
	// 恢复方法：等有内容后，取消下面对应 LinkPresets.* 那行的注释即可。
	links.push({
		name: "我的",
		url: "#",
		icon: "material-symbols:person",
		children: [
			// 动态
			// [CUSTOM] 暂时隐藏：动态数量为 0。有动态后在 src/content/dynamic/ 写入即可，然后取消注释。
			// LinkPresets.Dynamic,

			// 项目
			// [CUSTOM] 暂时隐藏：项目数量为 0（两个 demo 项目已置 draft）。添加项目后取消注释。
			// LinkPresets.Projects,

			// 相册
			LinkPresets.Gallery,

			// 书签导航
			LinkPresets.Booknav,

			// 哔哩哔哩追番
			LinkPresets.Bilibili,

			// 番组计划
			LinkPresets.Bangumi,

			// VNDB
			LinkPresets.VNDB,

			// MyAnimeList
			LinkPresets.MAL,
		],
	});

	// 关于及其子菜单
	links.push({
		name: "关于",
		url: "#",
		icon: "material-symbols:info",
		children: [
			// 打赏
			LinkPresets.Sponsor,

			// 关于页面
			LinkPresets.About,
		],
	});

	// 自定义导航栏链接
	// [CUSTOM] 原来这里是主题作者的 GitHub / Gitee / 主题文档地址，统一换成本人的入口
	// （主题文档等原地址记在 CUSTOMIZATION.md 的「已替换项」表里，需要时可自行加回）。
	links.push({
		name: "链接",
		url: "#",
		icon: "material-symbols:link",
		// 子菜单
		children: [
			{
				name: "Bilibili",
				external: true,	
				url: "https://space.bilibili.com/484011958",
				icon: "fa7-brands:bilibili",
			},
			{
				name: "GitHub",
				url: "https://github.com/mobydick5702-dev",
				external: true,
				icon: "fa7-brands:github",
			},
			{
				name: "RSS 订阅",
				url: "/rss/",
				external: false,
				icon: "fa7-solid:rss",
			},
			{
				name: "Atom 订阅",
				url: "/atom/",
				external: false,
				icon: "fa7-solid:atom",
			},
		],
	});

	// [CUSTOM] 原示例里还注释着一条"文档"导航（指向主题官方文档），已随 demo 链接一并移除，
	// 需要时按 CUSTOMIZATION.md「已替换项」里的地址自行恢复。

	return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

// ============================================================================
// 链接预设 - 可自由自定义导航栏链接的名称、图标和URL
// Link Presets - Allows free customization of the name, icon, and URL of navigation bar links
// ============================================================================
export const LinkPresets: Record<string, NavBarLink> = {
	Home: {
		name: "主页",
		url: "/",
		icon: "material-symbols:home",
	},
	Archive: {
		name: "归档",
		url: "/archive/",
		icon: "material-symbols:archive",
	},
	Categories: {
		name: "分类",
		url: "/categories/",
		icon: "material-symbols:folder-open-rounded",
	},
	Tags: {
		name: "标签",
		url: "/tags/",
		icon: "material-symbols:tag-rounded",
	},
	Series: {
		name: "系列",
		url: "/series/",
		icon: "material-symbols:layers",
	},
	Friends: {
		name: "友链",
		url: "/friends/",
		icon: "material-symbols:link-2-rounded",
		pageKey: "friends",
	},
	Guestbook: {
		name: "留言",
		url: "/guestbook/",
		icon: "material-symbols:chat",
		pageKey: "guestbook",
	},
	Dynamic: {
		name: "动态",
		url: "/dynamic/",
		icon: "material-symbols:forum-rounded",
		pageKey: "dynamic",
	},
	Projects: {
		name: "项目",
		url: "/projects/",
		icon: "material-symbols:rocket-launch",
		pageKey: "projects",
	},
	Gallery: {
		name: "相册",
		url: "/gallery/",
		icon: "material-symbols:photo-library",
		pageKey: "gallery",
	},
	Booknav: {
		name: "书签导航",
		url: "/booknav/",
		icon: "material-symbols:bookmarks",
		pageKey: "booknav",
	},
	Bilibili: {
		name: "哔哩哔哩",
		url: "/bilibili/",
		icon: "fa7-brands:bilibili",
		pageKey: "bilibili",
	},
	Bangumi: {
		name: "番组计划",
		url: "/bangumi/",
		icon: "material-symbols:movie",
		pageKey: "bangumi",
	},
	VNDB: {
		name: "VNDB",
		url: "/vndb/",
		icon: "material-symbols:chrome-reader-mode-rounded",
		pageKey: "vndb",
	},
	MAL: {
		name: "AnimeList",
		url: "/myanimelist/",
		icon: "material-symbols:menu-book",
		pageKey: "mal",
	},
	Sponsor: {
		name: "打赏",
		url: "/sponsor/",
		icon: "material-symbols:favorite",
		pageKey: "sponsor",
	},
	About: {
		name: "关于我",
		url: "/about/",
		icon: "material-symbols:person",
	},
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();

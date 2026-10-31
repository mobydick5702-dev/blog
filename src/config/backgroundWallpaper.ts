import type { BackgroundWallpaperConfig } from "@/types/backgroundWallpaper";

// [CUSTOM] 背景壁纸换成本人素材：桌面/移动默认都用 picture/background2.jpg（已转成仓库内资产），
// 另外两张备选壁纸也一并放进仓库，换图只改下面 src 里的路径。
// 壁纸模式、轮播、水波纹、模糊渐变等效果参数全部保持主题默认值，不做改动，避免影响性能。
export const backgroundWallpaper: BackgroundWallpaperConfig = {
	// 壁纸模式："banner" 横幅壁纸，"fullscreen" 全屏壁纸，"overlay" 覆盖透明，"none" 纯色背景无壁纸
	mode: "banner",
	// 是否启用背景视频播放，配置后将在导航栏显示视频播放按钮
	// [CUSTOM] 默认关闭：原默认播放地址是主题作者的演示视频（第三方 CDN），本站不沿用。
	// 要用背景视频：把这里改成 true，并在下面 src.playerUrl 填自己的视频地址。
	playerEnable: false,
	/**
	 * 背景图片配置
	 * 图片路径支持三种格式：
	 * 1. public 目录（以 "/" 开头，不优化）："/assets/images/banner.avif"
	 * 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/banner.avif"
	 * 3. 远程 URL："https://example.com/banner.jpg"
	 * 注意：远程URL和public目录的图片不会被优化，请确保图片体积足够小以免影响加载速度
	 *
	 * 建议不要替换d1-d6，m1-m6这些默认示例图片，但你可以删除掉节省空间
	 * 因为以后可能会更换示例图片，导致你自定义的图片被覆盖
	 * 所以建议使用自己的图片的时候命名为其他名称，不要使用d1-d6，m1-m6这些名称
	 *
	 * 如果只使用一张图片或者使用随机图API，推荐直接使用字符串格式：
	 * desktop: "https://t.alcy.cc/pc",   // 随机图API
	 * desktop: "assets/images/DesktopWallpaper/d1.avif", // 单张图片
	 *
	 * mobile: "https://t.alcy.cc/mp", // 随机图API
	 * mobile: "assets/images/MobileWallpaper/m1.avif", // 单张图片
	 *
	 * 支持配置多张图片（数组），每次刷新页面随机显示一张：
	 * desktop: [
	 * "assets/images/DesktopWallpaper/d1.avif",
	 * "assets/images/DesktopWallpaper/d2.avif",
	 * ],
	 *
	 * mobile:[
	 *   "assets/images/MobileWallpaper/m1.avif",
	 *   "assets/images/MobileWallpaper/m2.avif",
	 * ],
	 */
	src: {
		// 桌面背景图片（支持单张或多张随机）
		// desktop: "assets/images/DesktopWallpaper/d1.avif",
		// [CUSTOM] 当前启用 picture/background2.jpg → assets/images/DesktopWallpaper/moby-desktop.jpg（2560×1524）。
		// 备选壁纸同样已在仓库内，如需更换改这里的路径即可：
		//   desktop: ["assets/images/DesktopWallpaper/moby-desktop-alt1.webp"]  // 来自 picture/background.png（该文件实际是 WebP）
		//   desktop: ["assets/images/DesktopWallpaper/moby-desktop-alt2.jpg"]   // 来自 picture/background3.jpg
		// 想要多张随机显示就并列写成数组；主题自带的 d1-d6 / m1-m6 示例图仍保留，可混用或删除。
		desktop: ["assets/images/DesktopWallpaper/moby-desktop.jpg"],
		// 移动背景图片（支持单张或多张随机）
		// mobile: "assets/images/MobileWallpaper/m1.avif",
		// [CUSTOM] 移动端是同一张图按 2:3 竖屏裁切的版本（moby-mobile.jpg，1080×1620），
		// 避免横图在手机上被裁成一条窄缝；换图同样只改这里。
		mobile: ["assets/images/MobileWallpaper/moby-mobile.jpg"],
		// 背景视频播放地址
		// 支持单个视频路径（字符串）或多个视频循环（数组，参考上面壁纸配置）
		// 支持远程视频URL，本地视频请放在 public/assets/videos/ 目录下
		// playerUrl: "/assets/videos/firefly.mp4",
		// [CUSTOM] 主题 demo 的远程视频地址已移除；要启用请在 playerEnable=true 后填自己的视频地址。
		playerUrl: "",
	},
	// 横幅壁纸和全屏壁纸共享配置
	common: {
		// 壁纸遮罩暗度，让横幅文字显示更清晰，0-1之间，值越大越暗
		// [CUSTOM] 提高横幅白字可读性：0.2 → 0.4。
		// 本站壁纸（background2）偏亮，实测首页横幅 72px 白字标题的对比度只有 2.08:1，低于 WCAG AA 大字要求的 3:1。
		// 调到 0.4 后：标题区整体均色 2.08 → 3.6:1，字形背后最不利的 16×16 小块也由 1.87 → 3.1:1（全部 ≥3:1 达标）。
		// 任务建议值是 0.35（均色可达 3.1:1），但局部最亮处仍只有 2.8:1，故取 0.4 留一点余量。
		// 该项被 banner / fullscreen 两种模式、桌面端与移动端共用
		// （读取点：src/utils/banner-visibility-utils.ts → src/components/layout/WallpaperSection.astro 的 .banner-dim-overlay），
		// 改这一处即可全端生效。若觉得壁纸太暗，可在 0.35~0.4 之间回调；换更亮的壁纸则需继续调大。
		dimOpacity: 0.4,
		// 多视频播放模式："order" 顺序循环，"random" 随机切换（仅当 playerUrl 为数组时生效）
		playerMode: "random",
		// 主页横幅文字
		homeText: {
			// 是否启用主页横幅文字
			enable: true,
			// 主页横幅主标题
			// [CUSTOM] 换成站点名（原值 "Lovely firefly!" 是主题 demo 的标语）
			title: "Moby's Blog",
			// 主页横幅主标题字体大小
			titleSize: "4.5rem",
			// 主页横幅副标题
			// [CUSTOM] 打字机循环的几条标语（原值是主题 demo 的英文句子），可随时增删
			subtitle: [
				"愿你永远在充斥着雨与海的世界跋涉",
				"潮汐与明日, 在月光下一同生长",
				"迷迭香 | 回忆，纪念与坚守",
				"一只紫翅琼鸟",
			],
			// 主页横幅副标题字体大小
			subtitleSize: "1.5rem",
			typewriter: {
				// 是否启用打字机效果
				// 打字机开启 → 循环显示所有副标题
				// 打字机关闭 → 每次刷新随机显示一条副标题
				enable: true,
				// 打字速度（毫秒）
				speed: 100,
				// 删除速度（毫秒）
				deleteSpeed: 50,
				// 完全显示后的暂停时间（毫秒）
				pauseTime: 2000,
			},
			// 是否显示标题下方的链接图标
			linksEnable: true,
			// 首页横幅标题下方的链接图标（可选，支持 showName 显示文字）
			// 图标支持 Iconify 格式：fa7-brands:github、fa7-solid:envelope、mdi:rss 等
			// [CUSTOM] 横幅下方的图标入口改成本人的（去掉指向主题作者站点和打赏页的 demo 链接）
			links: [
				{
					name: "GitHub",
					icon: "fa7-brands:github",
					// [CUSTOM] 用户确认的 GitHub ID：mobydick5702-dev（原为推断值）
					url: "https://github.com/mobydick5702-dev",
					showName: true,
				},
				{
					name: "Email",
					icon: "fa7-solid:envelope",
					// [CUSTOM] 已填写：用户的公开联系邮箱（moby5702@qq.com）
					url: "mailto:moby5702@qq.com",
				},
				{
					name: "RSS",
					icon: "fa7-solid:rss",
					url: "/rss/",
				},
			],
		},
		// 壁纸轮播配置，横幅壁纸和全屏壁纸共享，仅在配置多张图片时生效
		carousel: {
			// 是否启用壁纸轮播；关闭时保持每次刷新随机显示一张
			enable: false,
			// 轮播切换间隔（毫秒）
			interval: 5000,
			// 过渡效果: 'fade' 渐变 | 'zoom' 缩放 | 'slide' 滑动 | 'kenburns' 旋转木马
			transitionEffect: "zoom",
		},
		// 水波纹动画效果配置，开启会影响页面性能，增加内存占用，请根据自己的喜好开启
		waves: {
			enable: {
				// 桌面端是否启用水波纹动画效果
				desktop: true,
				// 移动端是否启用水波纹动画效果
				mobile: true,
			},
		},
		// 渐变过渡效果配置，当水波纹关闭时自动启用，提供壁纸底部到背景色的平滑过渡
		gradient: {
			enable: {
				// 桌面端是否启用渐变过渡
				desktop: true,
				// 移动端是否启用渐变过渡
				mobile: true,
			},
			// 渐变高度
			height: "10%",
		},
	},
	// Banner模式特有配置
	banner: {
		// 图片位置
		// 支持所有CSS object-position值，如: 'top', 'center', 'bottom', 'left top', 'right bottom', '25% 75%', '10px 20px'..
		// 如果不知道怎么配置百分百之类的配置，推荐直接使用：'center'居中，'top'顶部居中，'bottom' 底部居中，'left'左侧居中，'right'右侧居中
		position: "0% 20%",
		// 文章横幅信息："description" 显示描述，"meta" 显示日期、字数和阅读时长
		postInfo: {
			mode: "description",
		},
		// 导航栏配置
		navbar: {
			// 导航栏透明模式："semi" 半透明，"semifull" 动态透明，"none" 纯色不透明
			transparentMode: "semi",
			// 毛玻璃模糊度，0 即关闭导航栏的毛玻璃
			// 注意：导航栏子菜单与浮动面板始终保留毛玻璃，模糊度跟随此项但有最小值
			blur: 12,
		},
	},
	// 覆盖透明覆盖模式特有配置
	overlay: {
		// 层级，确保壁纸在背景层
		zIndex: -1,
		// 壁纸透明度
		opacity: 0.8,
		// 背景模糊度
		blur: 10,
		// 卡片透明度，0-1之间，值越小越透明
		cardOpacity: 0.6,
	},
	// 全屏壁纸模式特有配置
	// 壁纸模糊度(blur)、卡片透明度(cardOpacity)、层级(zIndex) 复用上方 overlay 模式的配置；
	// 背景透明度(opacity)不适用（全屏壁纸不透明）；导航栏透明模式由 fullscreen.navbar.transparentMode 控制，脱离 banner 的 navbar 配置
	fullscreen: {
		// 布局模式："classic" 经典文档流全屏壁纸，"hero" 固定全屏首屏壁纸
		layout: "classic",
		// 图片位置
		position: "center",
		// 全屏壁纸模式的导航栏配置
		navbar: {
			// 导航栏透明模式："semi" 半透明，"semifull" 动态透明（仅首页顶部透明、下滑玻璃化；非首页均跟卡片半透明）
			transparentMode: "semifull",
			// 导航栏毛玻璃模糊度，0 即关闭（玻璃态生效）
			blur: 12,
		},
		// 首页下滑时壁纸模糊渐变开关（从 0 渐变为 overlay.blur 的最大模糊）
		// 关闭后该设备上全屏壁纸保持清晰（首页与非首页都不模糊），设置面板的模糊度滑块也会隐藏
		blurRamp: {
			enable: {
				// 桌面端是否启用模糊渐变
				desktop: true,
				// 移动端是否启用模糊渐变
				mobile: true,
			},
		},
	},
};

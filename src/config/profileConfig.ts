import type { ProfileConfig } from "../types/profileConfig";

// [CUSTOM] 个人资料：姓名 / 头像 / 简介 / 社交链接全部换成本人信息（原值为主题 demo 的作者信息）。
// 头像来源：工作区 picture/moby5702.jpg（1080×1080 正方形），已压成 512×512 的 avatar-moby.jpg。
export const profileConfig: ProfileConfig = {
	// 头像
	// 图片路径支持三种格式：
	// 1. public 目录（以 "/" 开头，不优化）："/assets/images/avatar.webp"
	// 2. src 目录（不以 "/" 开头，自动优化但会增加构建时间，推荐）："assets/images/avatar.webp"
	// 3. 远程 URL："https://example.com/avatar.jpg"
	// [CUSTOM] 换头像：把新图（建议正方形）放进 src/assets/images/，然后只改下面这一行。
	avatar: "assets/images/avatar-moby.jpg",

	// 名字
	name: "Moby5702",

	// 个人签名
	// [CUSTOM] 一句自然的中文简介，显示在侧边栏 / 关于卡片等处，可随手修改。
	bio: "愿你永远在充斥着雨与海的世界跋涉。",

	// 链接配置
	// 已经预装的图标集：fa7-brands，fa7-regular，fa7-solid，material-symbols，simple-icons
	// 访问https://icones.js.org/ 获取图标代码，
	// 如果想使用尚未包含相应的图标集，则需要安装它
	// `pnpm add @iconify-json/<icon-set-name>`
	// showName: true 时显示图标和名称，false 时只显示图标
	links: [
		{
			name: "GitHub",
			icon: "fa7-brands:github",
			// [CUSTOM] 本人的 GitHub 主页（原值是主题作者的仓库主页；ID 由用户确认为 mobydick5702-dev）
			url: "https://github.com/mobydick5702-dev",
			showName: false,
		},
		{
			name: "Email",
			icon: "fa7-solid:envelope",
			// [CUSTOM] 已填写：用户的公开联系邮箱（moby5702@qq.com）；需要更换时只改这一行。
			url: "mailto:moby5702@qq.com",
			showName: false,
		},
		{
			name: "RSS",
			icon: "fa7-solid:rss",
			url: "/rss/",
			showName: false,
		},
		{
			name: "Atom",
			icon: "fa7-solid:atom",
			url: "/atom/",
			showName: false,
		},
	],
};

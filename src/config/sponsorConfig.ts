import type { SponsorConfig } from "../types/sponsorConfig";

// [CUSTOM] 打赏页在 siteConfig.pages 里默认关闭（页面里展示的是主题作者的示例收款码）。
// 想开启：先把下面的收款方式换成自己的（二维码图片放 public/assets/images/sponsor/），
// 再把 siteConfig.pages.sponsor 改回 true。
export const sponsorConfig: SponsorConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "投喂开发者",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "如果我的内容对你有帮助，欢迎通过以下方式打赏我，你的支持是我持续创作的动力ovo",

	// 打赏用途说明
	usage:
		"您的打赏将用于服务器维护、内容创作和功能开发等，帮助我持续提供优质内容。",

	// 是否显示打赏者列表
	showSponsorsList: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否在文章详情页底部显示打赏按钮
	showButtonInPost: true,

	// 打赏方式列表
	methods: [
		{
			name: "支付宝",
			icon: "fa7-brands:alipay",
			// 收款码图片路径（需要放在 public 目录下）
			// [CUSTOM] public/assets/images/sponsor/alipay.png 目前仍是主题的示例图，换成自己的收款码后再启用
			qrCode: "/assets/images/sponsor/alipay.png",
			link: "",
			description: "使用 支付宝 扫码打赏",
			enabled: false,
		},
		{
			name: "微信",
			icon: "fa7-brands:weixin",
			// [CUSTOM] 同上，wechat.png 也是示例图，换成自己的后把 enabled 改回 true
			qrCode: "/assets/images/sponsor/wechat.png",
			link: "",
			description: "使用 微信 扫码打赏",
			enabled: true,
		},
		{
			name: "ko-fi",
			icon: "simple-icons:kofi",
			qrCode: "",
			// [CUSTOM] 原链接是主题作者的 ko-fi 主页，改成自己的（没有就保持空串 + enabled: false）
			link: "",
			description: "Buy me a Coffee",
			enabled: false,
		},
		{
			name: "爱发电",
			icon: "simple-icons:afdian",
			qrCode: "",
			// [CUSTOM] 原链接是主题作者的爱发电主页，改成自己的
			link: "",
			description: "通过 爱发电 进行打赏",
			enabled: false,
		},
	],

	// 打赏者列表（可选）
	// [CUSTOM] 原示例里是主题作者的示例打赏记录，已清空；有真实打赏后按下面格式自行添加：
	// { name: "昵称", avatar: "https://example.com/avatar.png", amount: "¥50", date: "2026-10-30" },
	sponsors: [],
};

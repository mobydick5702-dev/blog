import type { AnnouncementConfig } from "../types/announcementConfig";

export const announcementConfig: AnnouncementConfig = {
	// 公告标题，留空则走i18n默认标题
	title: "",

	// 公告内容
	// [CUSTOM] 原来是"这是一则示例公告"，改成一句真实的站点欢迎语，可随时按需替换。
	content: "欢迎来到 Moby's Blog ✨ 这里主要写技术笔记，也会更新生活随笔与读书、文学分享。",

	// 是否允许用户关闭公告
	closable: true,

	link: {
		// 启用链接
		enable: true,
		// 链接文本
		text: "了解更多",
		// 链接 URL
		url: "/about/",
		// 内部链接
		external: false,
	},
};

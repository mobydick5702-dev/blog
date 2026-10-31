import type { GalleryConfig } from "@/types/galleryConfig";

// 相册配置
// [CUSTOM] 主题自带的两个示例相册（"可爱流萤" firefly-2026、"加密相册示例" encrypted-test）已下线：
// 相册列表清空 + public/gallery/ 下的示例图片目录已删除，/gallery/ 现在显示主题自带的
// 「暂无相册」空状态。相册页与导航入口都保留，等你放自己的照片。
// 加自己的相册：把图片放进 public/gallery/<相册id>/（封面可选 cover.*），再在下面 albums 数组里加一项，例如：
// {
// 	id: "my-trip-2026",              // 唯一标识，同时是目录名与 URL 路径
// 	name: "旅行照片",
// 	description: "2026 年夏天的一次长途旅行",
// 	location: "云南",
// 	date: "2026-08-01",
// 	tags: ["旅行"],
// 	// password: "123456",          // 需要密码才能查看时填（可选）
// 	// passwordHint: "常用密码",      // 密码提示（可选，需配合 password）
// },
export const galleryConfig: GalleryConfig = {
	// 相册列表
	albums: [
		// 支持jpg/png/webp/avif/gif格式
		// id: 相册唯一标识符（用于目录命名和URL路径），比如设置：id: "firefly-2026", 对应 public/gallery/firefly-2026/目录
		// cover: 手动指定封面图（可选，不填会把cover.*文件作为封面图，如果没有cover.*文件，则使用第一张图片作为封面图）
		// name: 相册名称
		// description: 相册描述
		// location: 相册拍摄地点
		// date: 相册日期，格式为 YYYY-MM-DD，用于排序和显示
		// tags: 相册标签，用于分类和过滤
		// password: 访问密码，设置后需要输入密码才能查看相册内容（可选）
		// passwordHint: 密码提示，设置后在输入密码错误时显示（可选，需配合password使用）
		// 每添加一个数组项就相当于添加了一个相册，记得在 public/gallery/ 目录下创建对应的子目录并放入图片
	],

	// 瀑布流最小列宽(px)，浏览器根据容器宽度自动计算列数，默认 240
	// 值越小列数越多，值越大列数越少
	columnWidth: 240,
};

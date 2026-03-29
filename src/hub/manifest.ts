/**
 * 应用清单定义
 */

/** 应用清单结构 */
export interface AppManifest {
  /** 应用唯一标识（URL 友好） */
  slug: string;
  /** 应用显示名称 */
  name: string;
  /** 应用图标（emoji 或 URL） */
  icon: string;
  /** 应用描述 */
  description: string;
  /** 订阅的事件类型列表 */
  events: string[];
}

/** 汇率换算应用清单 */
export const manifest: AppManifest = {
  slug: "currency",
  name: "汇率换算",
  icon: "💱",
  description: "实时汇率查询与换算，支持全球主要货币",
  events: ["command"],
};

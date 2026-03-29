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
  /** 配置表单 JSON Schema */
  config_schema?: Record<string, unknown>;
  /** 安装引导说明（Markdown） */
  guide?: string;
}

/** 汇率换算应用清单 */
export const manifest: AppManifest = {
  slug: "currency",
  name: "汇率换算",
  icon: "💱",
  description: "实时汇率查询与换算，支持全球主要货币",
  events: ["command"],
  config_schema: { type: "object", properties: {} },
  guide: "## 汇率换算\n无需配置，直接安装即可使用。\n\n数据来源：[Frankfurter](https://frankfurter.dev/)（欧央行汇率数据）",
};

/**
 * Hub Bot API 客户端
 */

import type { ToolDefinition } from "./types.js";

/** Hub API 响应基础结构 */
interface HubResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** 发送消息请求参数 */
export interface SendMessageParams {
  /** 目标用户 ID */
  userId: string;
  /** 消息内容（文本） */
  text: string;
  /** 链路追踪 ID */
  traceId?: string;
}

/** 发送消息响应 */
export interface SendMessageResult {
  /** 消息 ID */
  messageId: string;
}

/**
 * Hub Bot API 客户端
 */
export class HubClient {
  private hubUrl: string;
  private appToken: string;

  constructor(hubUrl: string, appToken: string) {
    this.hubUrl = hubUrl.replace(/\/+$/, "");
    this.appToken = appToken;
  }

  /** 发送文本消息 */
  async sendMessage(params: SendMessageParams): Promise<SendMessageResult> {
    return await this.request<SendMessageResult>("/api/bot/message", {
      method: "POST",
      body: { user_id: params.userId, text: params.text, trace_id: params.traceId },
    });
  }

  /** 发送 typing 状态 */
  async sendTyping(userId: string): Promise<void> {
    await this.request("/api/bot/typing", { method: "POST", body: { user_id: userId } });
  }

  /** 上报工具定义 */
  async registerTools(tools: ToolDefinition[]): Promise<void> {
    await this.request("/api/bot/tools", { method: "PUT", body: { tools } });
  }

  /** 回复工具执行结果 */
  async replyToolResult(traceId: string, result: string): Promise<void> {
    await this.request("/api/bot/tool-result", {
      method: "POST",
      body: { trace_id: traceId, result },
    });
  }

  /**
   * 同步工具定义到 Hub（PUT /bot/v1/app/tools）
   */
  async syncTools(tools: ToolDefinition[]): Promise<void> {
    const url = `${this.hubUrl}/bot/v1/app/tools`;
    const resp = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.appToken}`,
      },
      body: JSON.stringify({ tools }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`[hub-client] syncTools 失败 [${resp.status}]: ${errText}`);
    }
  }

  /** 发送 HTTP 请求到 Hub API */
  private async request<T = unknown>(
    path: string,
    opts: { method: string; body?: unknown },
  ): Promise<T> {
    const url = `${this.hubUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.appToken}`,
    };

    const resp = await fetch(url, {
      method: opts.method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });

    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Hub API 请求失败 [${resp.status}] ${path}: ${errText}`);
    }

    const contentType = resp.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return undefined as T;
    }

    const json = (await resp.json()) as HubResponse<T>;
    if (!json.ok) {
      throw new Error(`Hub API 业务错误 ${path}: ${json.error || "未知错误"}`);
    }

    return json.data as T;
  }
}

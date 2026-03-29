/**
 * Router 命令路由器测试
 */
import { describe, it, expect, vi } from "vitest";
import { Router } from "../src/router.js";
import type { HubEvent, ToolDefinition, ToolHandler } from "../src/hub/types.js";

function mockStore() {
  return { getInstallation: vi.fn(), saveInstallation: vi.fn(), getAllInstallations: vi.fn(), close: vi.fn() } as any;
}

function createTestTools() {
  const definitions: ToolDefinition[] = [
    { name: "convert_currency", description: "换算", command: "convert_currency" },
    { name: "list_currencies", description: "列表", command: "list_currencies" },
  ];
  const handlers = new Map<string, ToolHandler>();
  handlers.set("convert_currency", vi.fn().mockResolvedValue("100 USD = 725.50 CNY"));
  handlers.set("list_currencies", vi.fn().mockResolvedValue("USD, CNY, EUR"));
  return { definitions, handlers };
}

function makeCommandEvent(command: string, args: Record<string, unknown> = {}): HubEvent {
  return {
    v: "1", type: "event", trace_id: "trace-001", installation_id: "inst-001", bot: { id: "bot-001" },
    event: { type: "command", id: "evt-001", timestamp: "2025-01-01T00:00:00Z", data: { command, args, user_id: "user-001" } },
  };
}

describe("Router", () => {
  it("正确路由到处理函数", async () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    const result = await router.handleCommand(makeCommandEvent("convert_currency", { amount: 100 }));
    expect(result).toBe("100 USD = 725.50 CNY");
  });

  it("传递正确的 ToolContext", async () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    await router.handleCommand(makeCommandEvent("convert_currency", { amount: 100 }));
    const ctx = (handlers.get("convert_currency") as any).mock.calls[0][0];
    expect(ctx.installationId).toBe("inst-001");
    expect(ctx.args).toEqual({ amount: 100 });
  });

  it("未知命令返回提示", async () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    const result = await router.handleCommand(makeCommandEvent("unknown"));
    expect(result).toContain("未知命令");
  });

  it("非 event 类型返回 undefined", async () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    const result = await router.handleCommand({ v: "1", type: "challenge", trace_id: "t1", installation_id: "i1", bot: { id: "b1" } });
    expect(result).toBeUndefined();
  });

  it("处理函数异常时返回错误消息", async () => {
    const defs: ToolDefinition[] = [{ name: "broken", description: "坏的", command: "broken" }];
    const h = new Map<string, ToolHandler>();
    h.set("broken", vi.fn().mockRejectedValue(new Error("服务不可用")));
    const router = new Router({ definitions: defs, handlers: h, store: mockStore() });
    const result = await router.handleCommand(makeCommandEvent("broken"));
    expect(result).toContain("命令执行失败");
  });

  it("getDefinitions 返回所有定义", () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    expect(router.getDefinitions()).toHaveLength(2);
  });

  it("handleAndReply 回传结果", async () => {
    const { definitions, handlers } = createTestTools();
    const router = new Router({ definitions, handlers, store: mockStore() });
    const mockHub = { replyToolResult: vi.fn().mockResolvedValue(undefined) } as any;
    await router.handleAndReply(makeCommandEvent("convert_currency"), mockHub);
    expect(mockHub.replyToolResult).toHaveBeenCalledWith("trace-001", "100 USD = 725.50 CNY");
  });
});

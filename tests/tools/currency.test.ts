/**
 * 汇率工具测试 — convert_currency / get_exchange_rate / list_currencies
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { currencyTools } from "../../src/tools/currency.js";
import type { ToolContext } from "../../src/hub/types.js";

function makeCtx(args: Record<string, unknown>): ToolContext {
  return { installationId: "inst-001", botId: "bot-001", userId: "user-001", traceId: "trace-001", args };
}

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

describe("currencyTools", () => {
  it("定义了 3 个工具", () => {
    expect(currencyTools.definitions).toHaveLength(3);
    expect(currencyTools.definitions.map((d) => d.name)).toEqual([
      "convert_currency", "get_exchange_rate", "list_currencies",
    ]);
  });

  describe("convert_currency", () => {
    it("成功换算并返回格式化结果", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          amount: 100, base: "USD", date: "2025-06-01",
          rates: { CNY: 725.5 },
        }),
      });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("convert_currency")!;
      const result = await handler(makeCtx({ amount: 100, from: "USD", to: "CNY" }));

      expect(result).toContain("100 USD");
      expect(result).toContain("725.5 CNY");
      expect(result).toContain("汇率");
    });

    it("缺少参数返回错误", async () => {
      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("convert_currency")!;
      const result = await handler(makeCtx({}));
      expect(result).toContain("错误");
    });

    it("API 异常时返回错误", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404, text: () => Promise.resolve("Not Found") });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("convert_currency")!;
      const result = await handler(makeCtx({ amount: 100, from: "USD", to: "XYZ" }));
      expect(result).toContain("汇率换算失败");
    });
  });

  describe("get_exchange_rate", () => {
    it("成功查询汇率", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          base: "USD", date: "2025-06-01",
          rates: { CNY: 7.25, EUR: 0.92, JPY: 157.3 },
        }),
      });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("get_exchange_rate")!;
      const result = await handler(makeCtx({ base: "USD", symbols: "CNY,EUR,JPY" }));

      expect(result).toContain("USD");
      expect(result).toContain("CNY");
      expect(result).toContain("7.25");
    });

    it("默认使用 USD 作为基准货币", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ base: "USD", date: "2025-06-01", rates: { EUR: 0.92 } }),
      });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("get_exchange_rate")!;
      await handler(makeCtx({}));

      const callUrl = vi.mocked(globalThis.fetch).mock.calls[0][0] as string;
      expect(callUrl).toContain("base=USD");
    });

    it("API 异常时返回错误", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("Error") });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("get_exchange_rate")!;
      const result = await handler(makeCtx({ base: "XYZ" }));
      expect(result).toContain("查询汇率失败");
    });
  });

  describe("list_currencies", () => {
    it("成功列出货币", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          USD: "United States Dollar",
          CNY: "Chinese Yuan",
          EUR: "Euro",
        }),
      });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("list_currencies")!;
      const result = await handler(makeCtx({}));

      expect(result).toContain("USD");
      expect(result).toContain("United States Dollar");
      expect(result).toContain("3 种货币");
    });

    it("API 异常时返回错误", async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 });

      const handlers = currencyTools.createHandlers();
      const handler = handlers.get("list_currencies")!;
      const result = await handler(makeCtx({}));
      expect(result).toContain("获取货币列表失败");
    });
  });
});

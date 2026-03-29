/**
 * 汇率工具模块 — 汇率换算、查询汇率、列出支持的货币
 */

import type { ToolModule, ToolDefinition, ToolHandler } from "../hub/types.js";

/** Frankfurter API 基础 URL */
const API_BASE = "https://api.frankfurter.dev/v1";

/** 工具定义 */
const definitions: ToolDefinition[] = [
  {
    name: "convert_currency",
    description: "汇率换算，将指定金额从一种货币转换为另一种货币",
    command: "convert_currency",
    parameters: {
      amount: { type: "number", description: "金额", required: true },
      from: { type: "string", description: "源货币代码（如 USD）", required: true },
      to: { type: "string", description: "目标货币代码（如 CNY）", required: true },
    },
  },
  {
    name: "get_exchange_rate",
    description: "查询指定基准货币的汇率，支持筛选特定目标货币",
    command: "get_exchange_rate",
    parameters: {
      base: { type: "string", description: "基准货币代码，默认 USD" },
      symbols: { type: "string", description: "目标货币代码，逗号分隔（如 CNY,EUR,JPY）" },
    },
  },
  {
    name: "list_currencies",
    description: "列出所有支持的货币及其名称",
    command: "list_currencies",
  },
];

/**
 * 汇率换算
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<string> {
  const url = `${API_BASE}/latest?amount=${amount}&from=${from.toUpperCase()}&to=${to.toUpperCase()}`;
  const resp = await fetch(url);

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Frankfurter API 请求失败 [${resp.status}]: ${errText}`);
  }

  const data = await resp.json() as any;
  const targetCode = to.toUpperCase();
  const converted = data.rates[targetCode];

  if (converted == null) {
    throw new Error(`未找到目标货币 ${targetCode} 的汇率`);
  }

  const rate = converted / amount;
  return `💱 ${amount} ${from.toUpperCase()} = ${converted} ${targetCode}（汇率: ${rate.toFixed(4)}）`;
}

/**
 * 查询汇率
 */
export async function getExchangeRate(
  base: string,
  symbols?: string,
): Promise<string> {
  let url = `${API_BASE}/latest?base=${base.toUpperCase()}`;
  if (symbols) {
    url += `&symbols=${symbols.toUpperCase()}`;
  }

  const resp = await fetch(url);
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Frankfurter API 请求失败 [${resp.status}]: ${errText}`);
  }

  const data = await resp.json() as any;
  const lines: string[] = [];
  lines.push(`📊 基准货币: ${data.base}（${data.date}）`);
  lines.push("");

  const rates = data.rates as Record<string, number>;
  for (const [currency, rate] of Object.entries(rates)) {
    lines.push(`  ${currency}: ${rate}`);
  }

  return lines.join("\n");
}

/**
 * 列出支持的货币
 */
export async function listCurrencies(): Promise<string> {
  const url = `${API_BASE}/currencies`;
  const resp = await fetch(url);

  if (!resp.ok) {
    throw new Error(`Frankfurter API 请求失败: ${resp.status}`);
  }

  const data = await resp.json() as Record<string, string>;
  const lines: string[] = [];
  lines.push("🌍 支持的货币列表:");
  lines.push("");

  for (const [code, name] of Object.entries(data)) {
    lines.push(`  ${code} — ${name}`);
  }

  lines.push("");
  lines.push(`共 ${Object.keys(data).length} 种货币`);

  return lines.join("\n");
}

/** 创建处理函数 */
function createHandlers(): Map<string, ToolHandler> {
  const handlers = new Map<string, ToolHandler>();

  handlers.set("convert_currency", async (ctx) => {
    try {
      const { amount, from, to } = ctx.args;
      if (amount == null || !from || !to) {
        return "错误：请提供 amount、from、to 参数";
      }
      return await convertCurrency(Number(amount), String(from), String(to));
    } catch (err: any) {
      return `汇率换算失败：${err.message}`;
    }
  });

  handlers.set("get_exchange_rate", async (ctx) => {
    try {
      const base = String(ctx.args.base || "USD");
      const symbols = ctx.args.symbols ? String(ctx.args.symbols) : undefined;
      return await getExchangeRate(base, symbols);
    } catch (err: any) {
      return `查询汇率失败：${err.message}`;
    }
  });

  handlers.set("list_currencies", async () => {
    try {
      return await listCurrencies();
    } catch (err: any) {
      return `获取货币列表失败：${err.message}`;
    }
  });

  return handlers;
}

export const currencyTools: ToolModule = { definitions, createHandlers };

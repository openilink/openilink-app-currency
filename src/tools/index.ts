/**
 * 工具注册中心 — 汇总所有汇率工具模块
 */

import type { ToolDefinition, ToolHandler } from "../hub/types.js";
import { currencyTools } from "./currency.js";

/** 所有工具模块 */
const allModules = [currencyTools];

/**
 * 收集所有工具定义和处理函数（纯 fetch，不需要 client 参数）
 */
export function collectAllTools(): {
  definitions: ToolDefinition[];
  handlers: Map<string, ToolHandler>;
} {
  const definitions: ToolDefinition[] = [];
  const handlers = new Map<string, ToolHandler>();

  for (const mod of allModules) {
    definitions.push(...mod.definitions);
    const moduleHandlers = mod.createHandlers();
    for (const [name, handler] of moduleHandlers) {
      handlers.set(name, handler);
    }
  }

  return { definitions, handlers };
}

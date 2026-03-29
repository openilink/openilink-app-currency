/**
 * 应用清单测试
 */
import { describe, it, expect } from "vitest";
import { manifest } from "../../src/hub/manifest.js";

describe("manifest", () => {
  it("slug 为 currency", () => {
    expect(manifest.slug).toBe("currency");
  });

  it("名称为汇率换算", () => {
    expect(manifest.name).toBe("汇率换算");
  });

  it("包含图标", () => {
    expect(manifest.icon).toBeTruthy();
  });

  it("包含描述", () => {
    expect(manifest.description).toContain("汇率");
  });

  it("订阅了 command 事件", () => {
    expect(manifest.events).toContain("command");
  });

  it("events 是字符串数组", () => {
    expect(Array.isArray(manifest.events)).toBe(true);
    for (const e of manifest.events) {
      expect(typeof e).toBe("string");
    }
  });
});

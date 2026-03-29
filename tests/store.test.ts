/**
 * Store 持久化层测试
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Store } from "../src/store.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("Store", () => {
  let store: Store;
  let dbPath: string;

  beforeEach(() => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "currency-store-test-"));
    dbPath = path.join(tmpDir, "test.db");
    store = new Store(dbPath);
  });

  afterEach(() => {
    store.close();
    const dir = path.dirname(dbPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("保存并读取安装记录", () => {
    store.saveInstallation({
      id: "inst-001", hubUrl: "https://hub.test", appId: "app-001",
      botId: "bot-001", appToken: "t1", webhookSecret: "s1",
    });
    const result = store.getInstallation("inst-001");
    expect(result).toBeDefined();
    expect(result!.id).toBe("inst-001");
    expect(result!.appToken).toBe("t1");
  });

  it("查询不存在的安装记录返回 undefined", () => {
    expect(store.getInstallation("nonexistent")).toBeUndefined();
  });

  it("更新已有的安装记录", () => {
    store.saveInstallation({
      id: "inst-001", hubUrl: "https://hub.test", appId: "app-001",
      botId: "bot-001", appToken: "old", webhookSecret: "old",
    });
    store.saveInstallation({
      id: "inst-001", hubUrl: "https://hub.test", appId: "app-001",
      botId: "bot-001", appToken: "new", webhookSecret: "new",
    });
    expect(store.getInstallation("inst-001")!.appToken).toBe("new");
  });

  it("获取所有安装记录", () => {
    store.saveInstallation({
      id: "inst-001", hubUrl: "https://hub.test", appId: "a1",
      botId: "b1", appToken: "t1", webhookSecret: "s1",
    });
    store.saveInstallation({
      id: "inst-002", hubUrl: "https://hub.test", appId: "a2",
      botId: "b2", appToken: "t2", webhookSecret: "s2",
    });
    expect(store.getAllInstallations()).toHaveLength(2);
  });

  it("空数据库返回空数组", () => {
    expect(store.getAllInstallations()).toEqual([]);
  });
});

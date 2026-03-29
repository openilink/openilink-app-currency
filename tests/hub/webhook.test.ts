/**
 * Webhook 处理器测试
 */
import { describe, it, expect, vi } from "vitest";
import { createHmac } from "node:crypto";
import { handleWebhook, type EventHandler } from "../../src/hub/webhook.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { EventEmitter } from "node:events";

function mockRequest(method: string, body: string, headers: Record<string, string> = {}): IncomingMessage {
  const emitter = new EventEmitter() as any;
  emitter.method = method;
  emitter.url = "/hub/webhook";
  emitter.headers = headers;
  process.nextTick(() => { emitter.emit("data", Buffer.from(body)); emitter.emit("end"); });
  return emitter as IncomingMessage;
}

function mockResponse(): ServerResponse & { _statusCode: number; _body: string } {
  const res = {
    _statusCode: 0, _body: "", _headers: {} as Record<string, string>, headersSent: false,
    writeHead(s: number, h?: Record<string, string>) { res._statusCode = s; if (h) Object.assign(res._headers, h); return res; },
    end(b?: string) { res._body = b || ""; res.headersSent = true; },
  };
  return res as any;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function mockStore(installations: Record<string, any> = {}) {
  return {
    getInstallation: vi.fn((id: string) => installations[id]),
    saveInstallation: vi.fn(), getAllInstallations: vi.fn(() => Object.values(installations)), close: vi.fn(),
  } as any;
}

describe("handleWebhook", () => {
  const webhookSecret = "test-secret";
  const instId = "inst-001";
  const installations = {
    [instId]: { id: instId, hubUrl: "https://hub.test", appId: "a1", botId: "b1", appToken: "t1", webhookSecret },
  };

  it("拒绝非 POST（405）", async () => {
    const res = mockResponse();
    await handleWebhook(mockRequest("GET", ""), res, { store: mockStore(installations) });
    expect(res._statusCode).toBe(405);
  });

  it("无效 JSON（400）", async () => {
    const res = mockResponse();
    await handleWebhook(mockRequest("POST", "{bad"), res, { store: mockStore(installations) });
    expect(res._statusCode).toBe(400);
  });

  it("未知安装实例（404）", async () => {
    const body = JSON.stringify({ type: "event", installation_id: "unknown", trace_id: "t1", bot: { id: "b1" } });
    const res = mockResponse();
    await handleWebhook(mockRequest("POST", body), res, { store: mockStore(installations) });
    expect(res._statusCode).toBe(404);
  });

  it("签名失败（401）", async () => {
    const body = JSON.stringify({ type: "event", installation_id: instId, trace_id: "t1", bot: { id: "b1" } });
    const res = mockResponse();
    await handleWebhook(mockRequest("POST", body, { "x-hub-signature": "bad" }), res, { store: mockStore(installations) });
    expect(res._statusCode).toBe(401);
  });

  it("challenge 握手", async () => {
    const body = JSON.stringify({ type: "challenge", installation_id: instId, challenge: "val", trace_id: "t1", bot: { id: "b1" } });
    const res = mockResponse();
    await handleWebhook(mockRequest("POST", body, { "x-hub-signature": sign(body, webhookSecret) }), res, { store: mockStore(installations) });
    expect(res._statusCode).toBe(200);
    expect(JSON.parse(res._body).challenge).toBe("val");
  });

  it("分发业务事件（200）", async () => {
    const onEvent = vi.fn<EventHandler>();
    const body = JSON.stringify({
      type: "event", installation_id: instId, trace_id: "t1", bot: { id: "b1" },
      event: { type: "command", id: "e1", timestamp: "2025-01-01T00:00:00Z", data: { command: "convert" } },
    });
    const res = mockResponse();
    await handleWebhook(mockRequest("POST", body, { "x-hub-signature": sign(body, webhookSecret) }), res, { store: mockStore(installations), onEvent });
    expect(res._statusCode).toBe(200);
    expect(onEvent).toHaveBeenCalledOnce();
  });
});

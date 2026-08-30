import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const originalToken = process.env.API_TOKEN;

afterEach(() => {
  if (originalToken === undefined) delete process.env.API_TOKEN;
  else process.env.API_TOKEN = originalToken;
});

function post(path: string) {
  return new NextRequest(`http://localhost${path}`, { method: "POST" });
}

function get(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

describe("proxy auth", () => {
  it("lets mutating POSTs through when no token is configured (dev)", async () => {
    delete process.env.API_TOKEN;
    const res = await proxy(post("/api/review"));
    expect(res.status).toBe(200); // NextResponse.next() passes through
  });

  it("returns 401 for a missing token on mutating POST when configured", async () => {
    process.env.API_TOKEN = "sekrit";
    const res = await proxy(post("/api/review"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 401 for a wrong token on mutating POST when configured", async () => {
    process.env.API_TOKEN = "sekrit";
    const req = post("/api/review");
    req.headers.set("x-api-token", "wrong");
    const res = await proxy(req);
    expect(res.status).toBe(401);
  });

  it("passes through with the correct token", async () => {
    process.env.API_TOKEN = "sekrit";
    const req = post("/api/review");
    req.headers.set("x-api-token", "sekrit");
    const res = await proxy(req);
    expect(res.status).toBe(200);
  });

  it("does not gate read-only or non-target routes", async () => {
    process.env.API_TOKEN = "sekrit";
    expect((await proxy(get("/api/review/queue?type=vocab&level=N5"))).status).toBe(200);
    expect((await proxy(post("/api/quiz"))).status).toBe(200);
  });
});
